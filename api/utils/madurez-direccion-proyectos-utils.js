const { MadurezDireccionProyectos } = require('../models');
const {
    DIMENSIONES,
    PUNTAJE_MAXIMO_TOTAL,
    TOTAL_PREGUNTAS,
    getNivelPorPorcentaje,
} = require('./madurez-direccion-proyectos-data');

const GORU_NOTIFICACION_EMAIL = 'esproproyectos@dipromacom.net';

const calcularResultados = (respuestas) => {
    if (!Array.isArray(respuestas) || respuestas.length !== TOTAL_PREGUNTAS) {
        throw new Error('Respuestas inválidas');
    }

    const valores = respuestas.map((r) => Number(r));
    valores.forEach((v, i) => {
        if (!Number.isInteger(v) || v < 1 || v > 5) {
            throw new Error(`Respuesta inválida en la pregunta ${i + 1}`);
        }
    });

    const puntajesDimension = DIMENSIONES.map((dim, dimIndex) => {
        const inicio = dimIndex * 5;
        const slice = valores.slice(inicio, inicio + 5);
        return slice.reduce((sum, v) => sum + v, 0);
    });

    const puntajeTotal = puntajesDimension.reduce((sum, p) => sum + p, 0);
    const porcentajeMadurez = Math.round((puntajeTotal / PUNTAJE_MAXIMO_TOTAL) * 10000) / 100;
    const nivel = getNivelPorPorcentaje(porcentajeMadurez);

    const dimensionesDetalle = DIMENSIONES.map((dim, i) => ({
        id: dim.id,
        titulo: dim.titulo,
        puntaje: puntajesDimension[i],
        puntajeMaximo: 25,
        porcentaje: Math.round((puntajesDimension[i] / 25) * 100),
    }));

    const ordenadas = [...dimensionesDetalle].sort((a, b) => a.puntaje - b.puntaje);
    const debiles = ordenadas.slice(0, 3).map((d) => d.titulo);
    const fuertes = [...dimensionesDetalle].sort((a, b) => b.puntaje - a.puntaje).slice(0, 3).map((d) => d.titulo);

    const lecturaEjecutiva = `La empresa presenta un nivel de madurez ${nivel.nombre.toLowerCase()} en Dirección de Proyectos (${porcentajeMadurez}%). Esto significa que actualmente sus proyectos se gestionan principalmente mediante ${nivel.modoGestion}. Las principales fortalezas identificadas son: ${fuertes.join(', ')}. Las principales oportunidades de mejora se encuentran en: ${debiles.join(', ')}.`;

    const proximosPasos = [
        'Fortalecer las dimensiones con menor puntaje.',
        'Definir una hoja de ruta de madurez a 6, 12 y 18 meses.',
        'Implementar prácticas de gobierno, metodología, indicadores y desarrollo de capacidades.',
        'Evaluar si la empresa requiere una PMO, mejora de procesos, capacitación, certificación, herramientas tecnológicas o gestión de portafolio.',
    ];

    return {
        puntajesDimension,
        puntajeTotal,
        porcentajeMadurez,
        nivelMadurez: nivel.nivel,
        nivelNombre: nivel.nombre,
        interpretacion: {
            nivel,
            dimensionesDetalle,
            debiles,
            fuertes,
            lecturaEjecutiva,
            proximosPasos,
        },
    };
};

const getByUsuarioId = async (usuarioId) => {
    const id = parseInt(usuarioId, 10);
    return MadurezDireccionProyectos.findOne({ where: { usuario_id: id } });
};

const guardarResultado = async (usuarioId, payload) => {
    const existente = await getByUsuarioId(usuarioId);
    if (existente) {
        throw new Error('El usuario ya completó este assessment');
    }

    const {
        nombreContacto,
        empresa,
        celular,
        correoContacto,
        respuestas,
        pdfBase64,
    } = payload;

    const resultados = calcularResultados(respuestas);
    const respuestasNormalizadas = respuestas.map((r) => Number(r));

    const registro = await MadurezDireccionProyectos.create({
        usuario_id: usuarioId,
        nombre_contacto: nombreContacto,
        empresa,
        celular,
        correo_contacto: correoContacto,
        respuestas: respuestasNormalizadas,
        puntajes_dimension: resultados.puntajesDimension,
        puntaje_total: resultados.puntajeTotal,
        porcentaje_madurez: resultados.porcentajeMadurez,
        nivel_madurez: resultados.nivelMadurez,
        nivel_nombre: resultados.nivelNombre,
        interpretacion: resultados.interpretacion,
    });

    const asunto = 'Resultado - Assessment de Madurez en Dirección de Proyectos';
    const cuerpo = [
        `Estimado/a ${nombreContacto},`,
        '',
        'Adjunto encontrará el resultado completo de su Assessment de Madurez en Dirección de Proyectos.',
        '',
        `Empresa: ${empresa}`,
        `Puntaje: ${resultados.puntajeTotal} de ${PUNTAJE_MAXIMO_TOTAL}`,
        `Porcentaje de madurez: ${resultados.porcentajeMadurez}%`,
        `Nivel: ${resultados.nivelMadurez} – ${resultados.nivelNombre}`,
        '',
        'Atentamente,',
        'GORU',
    ].join('\n');

    const adjunto = {
        filename: 'Assessment-Madurez-Direccion-Proyectos.pdf',
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf',
    };

    // Carga diferida: evita que aws-sdk bloquee el GET al importar mail-utils
    const { enviarMailConAdjunto } = require('./mail-utils');

    await enviarMailConAdjunto(correoContacto, asunto, cuerpo, [adjunto]);
    await enviarMailConAdjunto(
        GORU_NOTIFICACION_EMAIL,
        `[GORU] Nuevo assessment madurez DP - ${empresa}`,
        [
            `Se registró un nuevo Assessment de Madurez en Dirección de Proyectos.`,
            '',
            `Contacto: ${nombreContacto}`,
            `Empresa: ${empresa}`,
            `Celular: ${celular}`,
            `Correo: ${correoContacto}`,
            `Puntaje: ${resultados.puntajeTotal}/${PUNTAJE_MAXIMO_TOTAL} (${resultados.porcentajeMadurez}%)`,
            `Nivel: ${resultados.nivelMadurez} – ${resultados.nivelNombre}`,
        ].join('\n'),
        [adjunto]
    );

    return registro;
};

const formatResultado = (row) => {
    if (!row) return null;
    const plain = row.get ? row.get({ plain: true }) : row;
    const porcentajeMadurez = Number(plain.porcentaje_madurez);
    const nivel = getNivelPorPorcentaje(porcentajeMadurez);
    const interpretacionBase = plain.interpretacion && typeof plain.interpretacion === 'object'
        ? plain.interpretacion
        : {};
    return {
        id: plain.id,
        usuarioId: plain.usuario_id,
        nombreContacto: plain.nombre_contacto,
        empresa: plain.empresa,
        celular: plain.celular,
        correoContacto: plain.correo_contacto,
        respuestas: plain.respuestas,
        puntajesDimension: plain.puntajes_dimension,
        puntajeTotal: plain.puntaje_total,
        porcentajeMadurez,
        nivelMadurez: nivel.nivel,
        nivelNombre: nivel.nombre,
        interpretacion: { ...interpretacionBase, nivel },
        fechaCompletado: plain.createdAt,
    };
};

const parseFechaFiltro = (fecha, finDeDia = false) => {
    if (!fecha) return null;
    const d = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    if (finDeDia) d.setHours(23, 59, 59, 999);
    return d;
};

const listAll = async ({ fechaDesde, fechaHasta } = {}) => {
    const { Op } = require('sequelize');
    const { Usuario } = require('../models');

    const where = {};
    const desde = parseFechaFiltro(fechaDesde, false);
    const hasta = parseFechaFiltro(fechaHasta, true);

    if (desde && hasta) {
        where.createdAt = { [Op.between]: [desde, hasta] };
    } else if (desde) {
        where.createdAt = { [Op.gte]: desde };
    } else if (hasta) {
        where.createdAt = { [Op.lte]: hasta };
    }

    const rows = await MadurezDireccionProyectos.findAll({
        where,
        order: [['createdAt', 'DESC']],
        include: [{
            model: Usuario,
            as: 'Usuario',
            attributes: ['id', 'username'],
            required: false,
        }],
    });
    return rows.map((row) => {
        const formatted = formatResultado(row);
        const plain = row.get ? row.get({ plain: true }) : row;
        return {
            ...formatted,
            usuarioEmail: plain.Usuario ? plain.Usuario.username : null,
        };
    });
};

module.exports = {
    calcularResultados,
    getByUsuarioId,
    guardarResultado,
    formatResultado,
    listAll,
    GORU_NOTIFICACION_EMAIL,
};
