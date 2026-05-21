/* eslint-disable no-param-reassign */
const { Op } = require('sequelize');
const db = require('../db');
const {
    Usuario,
    Persona,
    Empresa,
    ChatConversacion,
    ChatMensaje,
    ChatLectura,
} = require('../models/index');

// ======================================================================
// Constantes
// ======================================================================
const MAX_TEXTO = 2000;
const MAX_MENSAJES_POR_PAGINA = 50;
const RATE_LIMIT_WINDOW_MS = 10 * 1000; // 10 s
const RATE_LIMIT_MAX = 10; // 10 mensajes por ventana
const USERNAMES_RESERVADOS = ['admin@goru.com', 'admin@grupogonzalez.ec'];

// ======================================================================
// Rate limit en memoria (suficiente para 1 instancia EC2 free).
// Si en el futuro se escala horizontal, mover a Redis o usar tabla auxiliar.
// ======================================================================
const _rateBuckets = new Map();

const _checkRateLimit = (usuarioId) => {
    const now = Date.now();
    const bucket = _rateBuckets.get(usuarioId) || [];
    const recent = bucket.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) {
        return false;
    }
    recent.push(now);
    _rateBuckets.set(usuarioId, recent);
    return true;
};

// Limpia buckets antiguos cada 5 minutos para no crecer indefinidamente.
setInterval(() => {
    const now = Date.now();
    for (const [k, v] of _rateBuckets.entries()) {
        const recent = v.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
        if (recent.length === 0) _rateBuckets.delete(k);
        else _rateBuckets.set(k, recent);
    }
}, 5 * 60 * 1000).unref();

// ======================================================================
// Helpers
// ======================================================================
const _orderPair = (a, b) => {
    const x = parseInt(a, 10);
    const y = parseInt(b, 10);
    return x < y ? [x, y] : [y, x];
};

const _toDisplayName = (usuario) => {
    if (!usuario) return '';
    const u = usuario.get ? usuario.get({ plain: true }) : usuario;
    const persona = u.Persona || {};
    const nombre = (persona.nombre || '').trim();
    const apellido = (persona.apellido || '').trim();
    const completo = `${nombre} ${apellido}`.trim();
    return completo || u.username || `Usuario #${u.id}`;
};

const _serializeUsuarioBasico = (usuario) => {
    if (!usuario) return null;
    const u = usuario.get ? usuario.get({ plain: true }) : usuario;
    return {
        id: u.id,
        username: u.username,
        nombre: _toDisplayName(usuario),
        empresa_id: u.empresa,
        empresa_nombre: u.Empresa ? u.Empresa.nombre : null,
    };
};

// ======================================================================
// Carga del usuario autenticado (incluye empresa y es_super_admin)
//
// Importante: NO filtramos por suspendido/eliminado === false porque en BD
// la mayoría de usuarios legacy tienen NULL en esos campos y PostgreSQL
// excluye NULL en una comparación con `= false`. Aceptamos cualquier valor
// que NO sea explícitamente `true`.
// ======================================================================
const getUsuarioAuth = async (usuarioId) => {
    return Usuario.findOne({
        where: {
            id: usuarioId,
            suspendido: { [Op.not]: true },
            eliminado: { [Op.not]: true },
        },
        attributes: ['id', 'username', 'empresa', 'es_super_admin'],
        include: [{ model: Empresa, as: 'Empresa', attributes: ['id', 'nombre'] }],
    });
};

// ======================================================================
// Lista de usuarios disponibles para chatear
//   - Super admin: todos los usuarios activos (excepto sí mismo).
//   - Usuario normal: solo los de su misma empresa (excepto sí mismo).
//
// Mismo razonamiento que arriba sobre suspendido/eliminado: usamos
// Op.not: true para incluir filas con valor NULL/false (usuarios legacy).
// Tampoco filtramos por `confirmado` porque la mayoría nunca pasó por
// ese flujo y siguen siendo activos en la app.
// ======================================================================
const listarUsuariosDisponibles = async (usuarioAuth, q) => {
    const where = {
        id: { [Op.ne]: usuarioAuth.id },
        suspendido: { [Op.not]: true },
        eliminado: { [Op.not]: true },
        username: { [Op.notIn]: USERNAMES_RESERVADOS },
    };

    if (!usuarioAuth.es_super_admin) {
        if (!usuarioAuth.empresa) {
            // Sin empresa asignada: no puede chatear con nadie por defecto.
            return [];
        }
        where.empresa = usuarioAuth.empresa;
    }

    let personaWhere;
    if (q && String(q).trim()) {
        const term = `%${String(q).trim()}%`;
        where[Op.or] = [
            { username: { [Op.iLike]: term } },
            { '$Persona.nombre$': { [Op.iLike]: term } },
            { '$Persona.apellido$': { [Op.iLike]: term } },
        ];
        personaWhere = undefined;
    }

    const items = await Usuario.findAll({
        where,
        attributes: ['id', 'username', 'empresa'],
        include: [
            { model: Persona, as: 'Persona', attributes: ['id', 'nombre', 'apellido'], required: false, where: personaWhere },
            { model: Empresa, as: 'Empresa', attributes: ['id', 'nombre'], required: false },
        ],
        order: [['username', 'ASC']],
        limit: 200,
    });

    return items.map(_serializeUsuarioBasico);
};

// ======================================================================
// Validar que el usuario autenticado puede chatear con otroUsuarioId.
// ======================================================================
const puedeChatearCon = async (usuarioAuth, otroUsuarioId) => {
    if (!otroUsuarioId || otroUsuarioId === usuarioAuth.id) return false;

    const otro = await Usuario.findOne({
        where: {
            id: otroUsuarioId,
            suspendido: { [Op.not]: true },
            eliminado: { [Op.not]: true },
        },
        attributes: ['id', 'empresa', 'username'],
    });

    if (!otro) return false;
    if (USERNAMES_RESERVADOS.includes(otro.username)) return false;
    if (usuarioAuth.es_super_admin) return true;
    if (!usuarioAuth.empresa) return false;
    return otro.empresa === usuarioAuth.empresa;
};

// ======================================================================
// Obtener o crear conversación entre dos usuarios.
// ======================================================================
const obtenerOCrearConversacion = async (usuarioAuthId, otroUsuarioId) => {
    const [a, b] = _orderPair(usuarioAuthId, otroUsuarioId);

    let conv = await ChatConversacion.findOne({
        where: { usuario_a_id: a, usuario_b_id: b },
    });

    if (!conv) {
        conv = await ChatConversacion.create({ usuario_a_id: a, usuario_b_id: b });
        // Inicializa filas de lectura en 0 para ambos.
        await ChatLectura.bulkCreate(
            [
                { conversacion_id: conv.id, usuario_id: a, ultimo_mensaje_leido_id: 0 },
                { conversacion_id: conv.id, usuario_id: b, ultimo_mensaje_leido_id: 0 },
            ],
            { ignoreDuplicates: true }
        );
    }

    return conv;
};

// ======================================================================
// Asegura que el usuario participa en la conversación.
// ======================================================================
const _esParticipante = (conversacion, usuarioId) => {
    return (
        parseInt(conversacion.usuario_a_id, 10) === parseInt(usuarioId, 10) ||
        parseInt(conversacion.usuario_b_id, 10) === parseInt(usuarioId, 10)
    );
};

// ======================================================================
// Listar conversaciones del usuario con info del otro participante,
// último mensaje, y conteo de no leídos. Una sola query SQL.
// ======================================================================
const listarConversacionesDelUsuario = async (usuarioAuthId) => {
    const uid = parseInt(usuarioAuthId, 10);

    const [rows] = await db.query(
        `
    SELECT
      c.id                         AS conversacion_id,
      CASE WHEN c.usuario_a_id = :uid THEN c.usuario_b_id ELSE c.usuario_a_id END AS otro_id,
      c.ultimo_mensaje_id,
      c.ultimo_mensaje_fecha,
      m.texto                      AS ultimo_mensaje_texto,
      m.usuario_id                 AS ultimo_mensaje_usuario_id,
      COALESCE(l.ultimo_mensaje_leido_id, 0) AS ultimo_leido_id,
      (
        SELECT COUNT(1)
        FROM chat_mensaje mm
        WHERE mm.conversacion_id = c.id
          AND mm.usuario_id <> :uid
          AND mm.id > COALESCE(l.ultimo_mensaje_leido_id, 0)
      ) AS no_leidos,
      u.username                   AS otro_username,
      u.empresa                    AS otro_empresa_id,
      e.nombre                     AS otro_empresa_nombre,
      p.nombre                     AS otro_nombre,
      p.apellido                   AS otro_apellido
    FROM chat_conversacion c
    LEFT JOIN chat_mensaje m   ON m.id = c.ultimo_mensaje_id
    LEFT JOIN chat_lectura l   ON l.conversacion_id = c.id AND l.usuario_id = :uid
    LEFT JOIN usuario u        ON u.id = (CASE WHEN c.usuario_a_id = :uid THEN c.usuario_b_id ELSE c.usuario_a_id END)
    LEFT JOIN persona p        ON p.id = u.persona
    LEFT JOIN empresa e        ON e.id = u.empresa
    WHERE (c.usuario_a_id = :uid OR c.usuario_b_id = :uid)
    ORDER BY c.ultimo_mensaje_fecha DESC NULLS LAST, c.id DESC
    LIMIT 100
    `,
        { replacements: { uid } }
    );

    return rows.map((r) => {
        const nombre = `${(r.otro_nombre || '').trim()} ${(r.otro_apellido || '').trim()}`.trim();
        return {
            conversacion_id: Number(r.conversacion_id),
            otro: {
                id: Number(r.otro_id),
                username: r.otro_username,
                nombre: nombre || r.otro_username || `Usuario #${r.otro_id}`,
                empresa_id: r.otro_empresa_id,
                empresa_nombre: r.otro_empresa_nombre,
            },
            ultimo_mensaje: r.ultimo_mensaje_id
                ? {
                    id: Number(r.ultimo_mensaje_id),
                    texto: r.ultimo_mensaje_texto,
                    usuario_id: Number(r.ultimo_mensaje_usuario_id),
                    fecha: r.ultimo_mensaje_fecha,
                    es_propio: Number(r.ultimo_mensaje_usuario_id) === uid,
                }
                : null,
            no_leidos: Number(r.no_leidos) || 0,
        };
    });
};

// ======================================================================
// Obtener mensajes de una conversación.
//   - Sin params: últimas N (más nuevas al final).
//   - desde_id: solo mensajes con id > desde_id (para polling incremental).
//   - antes_id: paginación hacia atrás (más antiguos), id < antes_id.
// ======================================================================
const obtenerMensajes = async (conversacionId, { desdeId, antesId, limite }) => {
    const lim = Math.min(Math.max(parseInt(limite, 10) || MAX_MENSAJES_POR_PAGINA, 1), MAX_MENSAJES_POR_PAGINA);
    const where = { conversacion_id: conversacionId };

    if (desdeId !== undefined && desdeId !== null) {
        where.id = { [Op.gt]: parseInt(desdeId, 10) };
    } else if (antesId !== undefined && antesId !== null) {
        where.id = { [Op.lt]: parseInt(antesId, 10) };
    }

    const orderById = desdeId !== undefined && desdeId !== null ? 'ASC' : 'DESC';

    const items = await ChatMensaje.findAll({
        where,
        order: [['id', orderById]],
        limit: lim,
    });

    // Devolvemos siempre en orden ascendente (más antiguos primero).
    const arr = items.map((m) => m.get({ plain: true }));
    if (orderById === 'DESC') arr.reverse();

    return arr.map((m) => ({
        id: Number(m.id),
        conversacion_id: Number(m.conversacion_id),
        usuario_id: Number(m.usuario_id),
        texto: m.texto,
        fecha: m.fecha_creacion,
    }));
};

// ======================================================================
// Conteo global de no leídos por conversación + total.
// Endpoint barato para mostrar el badge global cuando el chat está cerrado.
// ======================================================================
const contarNoLeidosGlobales = async (usuarioAuthId) => {
    const uid = parseInt(usuarioAuthId, 10);
    const [rows] = await db.query(
        `
    SELECT
      c.id AS conversacion_id,
      (
        SELECT COUNT(1)
        FROM chat_mensaje m
        WHERE m.conversacion_id = c.id
          AND m.usuario_id <> :uid
          AND m.id > COALESCE(l.ultimo_mensaje_leido_id, 0)
      ) AS no_leidos
    FROM chat_conversacion c
    LEFT JOIN chat_lectura l ON l.conversacion_id = c.id AND l.usuario_id = :uid
    WHERE (c.usuario_a_id = :uid OR c.usuario_b_id = :uid)
    `,
        { replacements: { uid } }
    );

    let total = 0;
    const por_conversacion = {};
    for (const r of rows) {
        const n = Number(r.no_leidos) || 0;
        if (n > 0) {
            por_conversacion[Number(r.conversacion_id)] = n;
            total += n;
        }
    }
    return { total, por_conversacion };
};

// ======================================================================
// Crear mensaje + actualizar puntero de "ultimo_mensaje" de la conversación
// y la lectura del propio remitente. Todo en una transacción corta.
// ======================================================================
const crearMensaje = async ({ conversacionId, usuarioId, texto }) => {
    const limpio = String(texto || '').trim();
    if (!limpio) {
        const err = new Error('El mensaje no puede estar vacío.');
        err.statusCode = 400;
        throw err;
    }
    if (limpio.length > MAX_TEXTO) {
        const err = new Error(`El mensaje supera ${MAX_TEXTO} caracteres.`);
        err.statusCode = 400;
        throw err;
    }

    if (!_checkRateLimit(usuarioId)) {
        const err = new Error('Estás enviando mensajes demasiado rápido. Espera unos segundos.');
        err.statusCode = 429;
        throw err;
    }

    return db.transaction(async (t) => {
        const mensaje = await ChatMensaje.create(
            {
                conversacion_id: conversacionId,
                usuario_id: usuarioId,
                texto: limpio,
            },
            { transaction: t }
        );

        await ChatConversacion.update(
            {
                ultimo_mensaje_id: mensaje.id,
                ultimo_mensaje_fecha: mensaje.fecha_creacion,
            },
            { where: { id: conversacionId }, transaction: t }
        );

        // El propio mensaje cuenta como leído por su autor.
        await ChatLectura.upsert(
            {
                conversacion_id: conversacionId,
                usuario_id: usuarioId,
                ultimo_mensaje_leido_id: mensaje.id,
                fecha_actualizacion: new Date(),
            },
            { transaction: t }
        );

        return {
            id: Number(mensaje.id),
            conversacion_id: Number(mensaje.conversacion_id),
            usuario_id: Number(mensaje.usuario_id),
            texto: mensaje.texto,
            fecha: mensaje.fecha_creacion,
        };
    });
};

// ======================================================================
// Marcar mensajes como leídos hasta cierto id (o el último de la conv).
// ======================================================================
const marcarLeidoHasta = async ({ conversacionId, usuarioId, hastaId }) => {
    let hasta = parseInt(hastaId, 10);
    if (!hasta || Number.isNaN(hasta)) {
        const ultimo = await ChatMensaje.findOne({
            where: { conversacion_id: conversacionId },
            order: [['id', 'DESC']],
            attributes: ['id'],
        });
        hasta = ultimo ? Number(ultimo.id) : 0;
    }

    // Solo avanzamos el puntero, nunca retrocedemos.
    await db.query(
        `
    INSERT INTO chat_lectura (conversacion_id, usuario_id, ultimo_mensaje_leido_id, fecha_actualizacion)
    VALUES (:cid, :uid, :hasta, NOW())
    ON CONFLICT (conversacion_id, usuario_id)
    DO UPDATE SET
      ultimo_mensaje_leido_id = GREATEST(chat_lectura.ultimo_mensaje_leido_id, EXCLUDED.ultimo_mensaje_leido_id),
      fecha_actualizacion = NOW()
    `,
        { replacements: { cid: conversacionId, uid: usuarioId, hasta } }
    );

    return { conversacion_id: conversacionId, ultimo_mensaje_leido_id: hasta };
};

const cargarConversacion = async (conversacionId) => {
    return ChatConversacion.findByPk(conversacionId);
};

module.exports = {
    MAX_TEXTO,
    MAX_MENSAJES_POR_PAGINA,
    getUsuarioAuth,
    listarUsuariosDisponibles,
    puedeChatearCon,
    obtenerOCrearConversacion,
    cargarConversacion,
    esParticipante: _esParticipante,
    listarConversacionesDelUsuario,
    obtenerMensajes,
    contarNoLeidosGlobales,
    crearMensaje,
    marcarLeidoHasta,
};
