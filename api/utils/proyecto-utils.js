/* eslint-disable no-unused-vars */
const { Op, fn, col, literal } = require('sequelize');
const { Proyecto, Usuario } = require('../models/index');
const {
  Persona, DirectorProyecto, Patrocinador, Departamento,
  TipoProyecto, Empresa,
} = require('../models/index');
const DateUtils = require("./date-utils");
const { getNombreApellidoFromStr } = require('./string-utils');
const { saveLog } = require('./log-service');
const { getAllowedModos } = require('../constants/plan-licencia');
const PlanLicenciaUtils = require('./plan-licencia-utils');

// ─────────────────────────────────────────────
// 🔹 CONSTANTE COMPARTIDA: includes base para proyectos
// Antes estaba duplicada en getAllProyecto, getActiveProyecto,
// getProyectoById, getFilteredProjects y updateProyecto
// ─────────────────────────────────────────────
const BASE_PROYECTO_INCLUDES = [
  {
    model: DirectorProyecto,
    as: 'DirectorProyecto',
    include: { model: Persona, as: 'Persona' },
  },
  {
    model: Patrocinador,
    as: 'Patrocinador',
    include: { model: Persona, as: 'Persona' },
  },
  { model: Empresa, as: 'Empresa' },
  { model: Departamento, as: 'Departamento' },
  { model: TipoProyecto, as: 'TipoProyecto' },
];

// 🔹 CONSTANTE COMPARTIDA: orden por estado
const ORDER_BY_ESTADO = [
  [literal(`CASE 
    WHEN estado = 'X' THEN 1
    WHEN estado = 'P' THEN 2
    WHEN estado = 'S' THEN 3
    WHEN estado = 'C' THEN 4
    WHEN estado = 'E' THEN 5
    ELSE 6 END`), 'ASC']
];

// ─────────────────────────────────────────────
// 🔹 HELPER: include de Usuarios para filtrar por usuarioId
// ─────────────────────────────────────────────
const usuarioInclude = (usuarioId, required = false) => ({
  model: Usuario,
  as: 'Usuarios',
  required,
  through: { attributes: [] },
  attributes: ['id'],
  ...(required ? { where: { id: usuarioId } } : {}),
});

// ─────────────────────────────────────────────
// 🔹 HELPER: condición OR para creador o asignado
// ─────────────────────────────────────────────
const usuarioOrCondition = (usuarioId) => ({
  [Op.or]: [
    { usuario_creador: usuarioId },
    { '$Usuarios.id$': usuarioId },
  ],
});

// ─────────────────────────────────────────────
// 🔹 HELPER: comparar y acumular cambios para logs
// Soporta primitivos y objetos/arrays (JSONB)
// ─────────────────────────────────────────────
const collectChanges = (proyecto, data, fieldsToIgnore = []) => {
  const changes = {};
  const defaultIgnore = ['id', 'numero', 'fecha_creacion', 'DirectorProyecto', 'Patrocinador', 'Departamento'];
  const ignored = [...defaultIgnore, ...fieldsToIgnore];

  Object.keys(data).forEach(key => {
    if (ignored.includes(key) || !proyecto.dataValues.hasOwnProperty(key)) return;

    const oldValue = proyecto[key];
    const newValue = data[key];

    if (typeof oldValue === 'object' && oldValue !== null) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    } else if (oldValue != newValue && newValue !== undefined) {
      changes[key] = { old: oldValue, new: newValue };
    }
  });

  return changes;
};

// ─────────────────────────────────────────────
// 🔹 HELPER: convertir camelCase a snake_case
// ─────────────────────────────────────────────
const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key.replace(/([A-Z])/g, '_$1').toLowerCase()] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// ═════════════════════════════════════════════
// QUERIES
// ═════════════════════════════════════════════

// 🔹 Obtiene todos los proyectos del usuario (creador o asignado)
const getAllProyecto = async (usuarioId) => {
  return Proyecto.findAll({
    where: usuarioOrCondition(usuarioId),
    include: [
      usuarioInclude(usuarioId, false),
      ...BASE_PROYECTO_INCLUDES,
    ],
    order: ORDER_BY_ESTADO,
  });
};

// 🔹 Obtiene proyectos activos (sin filtro de usuario — uso interno)
const getActiveProyecto = async () => {
  return Proyecto.findAll({
    where: { activo: true },
    include: BASE_PROYECTO_INCLUDES,
  });
};

// 🔹 Obtiene un proyecto por ID con todas sus relaciones
const getProyectoById = async (id) => {
  return Proyecto.findOne({
    where: { id },
    include: BASE_PROYECTO_INCLUDES,
  });
};

// 🔹 Obtiene proyectos filtrados por query params
// FIX: Antes era una función completamente separada de getAllProyecto
// con includes y lógica duplicada. Ahora unificada y limpia.
const getFilteredProjects = async (query, usuarioId) => {
  const { startDateFrom, startDateTo, responsable, status, name, modo } = query;

  const tipoLicenciaId = await PlanLicenciaUtils.getTipoLicenciaIdUsuario(usuarioId);
  const modosPermitidos = getAllowedModos(tipoLicenciaId);

  // Construir filtros dinámicos
  const where = { ...usuarioOrCondition(usuarioId) };

  if (modo) {
    if (!modosPermitidos.includes(modo)) {
      const err = new Error('Su plan no permite listar proyectos de este tipo.');
      err.statusCode = 403;
      throw err;
    }
    where.modo = modo;
  } else {
    where.modo = { [Op.in]: modosPermitidos };
  }

  if (startDateFrom && startDateTo) {
    where.fecha_inicio = {
      [Op.ne]: null,
      [Op.between]: [startDateFrom, startDateTo],
    };
  }
  if (status) where.estado = status;
  if (name) where.nombre = { [Op.iLike]: `%${name}%` };

  // Filtro de persona (director) si viene responsable
  const filterPersona = responsable
    ? {
      [Op.or]: [
        { nombre: { [Op.iLike]: `%${responsable}%` } },
        { apellido: { [Op.iLike]: `%${responsable}%` } },
      ],
    }
    : {};

  if (responsable) {
    where['$DirectorProyecto.id$'] = { [Op.ne]: null };
  }

  return Proyecto.findAll({
    where,
    include: [
      usuarioInclude(usuarioId, false),
      {
        model: DirectorProyecto,
        as: 'DirectorProyecto',
        include: { model: Persona, as: 'Persona', where: filterPersona },
      },
      {
        model: Patrocinador,
        as: 'Patrocinador',
        include: { model: Persona, as: 'Persona' },
      },
      { model: Empresa, as: 'Empresa' },
      { model: Departamento, as: 'Departamento' },
      { model: TipoProyecto, as: 'TipoProyecto' },
    ],
    order: ORDER_BY_ESTADO,
  });
};

// ═════════════════════════════════════════════
// CREATES
// ═════════════════════════════════════════════

// 🔹 Creación simple de proyecto (sin datos completos)
const createProyecto = async (data, usuarioId) => {
  await PlanLicenciaUtils.assertUsuarioPuedeCrearProyecto(usuarioId, data.modo);

  const proyecto = await Proyecto.create({
    ...data,
    estado: 'C',
    activo: true,
    fecha_creacion: DateUtils.getLocalDate(),
    modo: data.modo,
    usuario_creador: usuarioId,
  });

  await saveLog({
    userId: usuarioId,
    actionType: 'PROJECT_CREATED',
    resourceType: 'Proyecto',
    resourceId: proyecto.id,
    details: { nombre: proyecto.nombre, modo: proyecto.modo, estado: 'C' },
  });

  return proyecto;
};

// 🔹 Creación de proyecto con datos generales completos (wizard)
// FIX: corregido bug — al actualizar patrocinador usaba 
// directorProyectoDetails en lugar de patrocinadorProyectoDetails
const createProyectoGeneralData = async (data, usuarioId) => {
  const {
    nombreProyecto,
    directorProyecto: directorProyectoDetails,
    patrocinadorProyecto: patrocinadorProyectoDetails,
    departamento: departamentoNombre,
    informacionBreve,
    tipoProyecto,
    modo,
    ...rest
  } = data;

  let directorProyecto, patrocinador, persona, departamento;

  if (directorProyectoDetails) {
    const { nombre, apellido } = getNombreApellidoFromStr(directorProyectoDetails);
    persona = await Persona.create({
      nombre, apellido,
      fecha_creacion: DateUtils.getLocalDate(),
      activo: true,
    });
    directorProyecto = await persona.createDirectorProyecto({
      fecha_creacion: DateUtils.getLocalDate(),
      activo: true,
    });
  }

  if (patrocinadorProyectoDetails) {
    // Si el patrocinador es distinto al director, crear nueva persona
    if (
      !directorProyectoDetails ||
      patrocinadorProyectoDetails.toLowerCase() !== directorProyectoDetails.toLowerCase()
    ) {
      const { nombre, apellido } = getNombreApellidoFromStr(patrocinadorProyectoDetails);
      persona = await Persona.create({
        nombre, apellido,
        fecha_creacion: DateUtils.getLocalDate(),
        activo: true,
      });
    }
    patrocinador = await persona.createPatrocinador({
      fecha_creacion: DateUtils.getLocalDate(),
      activo: true,
    });
  }

  if (departamentoNombre) {
    departamento = await Departamento.create({
      nombre: departamentoNombre,
      fecha_creacion: DateUtils.getLocalDate(),
      activo: true,
    });
  }

  await PlanLicenciaUtils.assertUsuarioPuedeCrearProyecto(usuarioId, modo);

  const proyecto = await Proyecto.create({
    nombre: nombreProyecto,
    informacion: informacionBreve,
    tipo_proyecto: tipoProyecto,
    estado: 'C',
    activo: true,
    fecha_creacion: DateUtils.getLocalDate(),
    usuario_creador: usuarioId,
    modo,
    director: directorProyecto?.id || null,
    patrocinador: patrocinador?.id || null,
    departamento: departamento?.id || null,
    ...toSnakeCase(rest),
  });

  await proyecto.addUsuario(usuarioId);

  await saveLog({
    userId: usuarioId,
    actionType: 'PROJECT_CREATED_FULL',
    resourceType: 'Proyecto',
    resourceId: proyecto.id,
    details: {
      nombre: proyecto.nombre,
      modo: proyecto.modo,
      tipo_proyecto: proyecto.tipo_proyecto,
      has_director: !!proyecto.director,
      has_patrocinador: !!proyecto.patrocinador,
    },
  });

  return proyecto;
};

// ═════════════════════════════════════════════
// UPDATES
// ═════════════════════════════════════════════

// 🔹 Actualización de datos técnicos/económicos del proyecto
const updateProyecto = async (data, id, usuarioId) => {
  const proyecto = await Proyecto.findOne({
    where: { id },
    include: [
      { model: Departamento, as: 'Departamento' },
      {
        model: DirectorProyecto, as: 'DirectorProyecto',
        include: { model: Persona, as: 'Persona' },
      },
      {
        model: Patrocinador, as: 'Patrocinador',
        include: { model: Persona, as: 'Persona' },
      },
    ],
  });

  if (!proyecto) throw new Error('Proyecto no encontrado');

  await PlanLicenciaUtils.assertPuedeAsignarProgramaId(usuarioId, data.programa_id);
  await PlanLicenciaUtils.assertUsuarioPuedeUsarModoEnActualizacion(usuarioId, data.modo);

  // Validación de programa_id si viene en los datos
  if (data.programa_id !== undefined) {
    if (data.programa_id !== null) {
      const programa = await Proyecto.findOne({
        where: { id: data.programa_id, modo: 'PR' },
      });
      if (!programa) throw new Error(`El ID ${data.programa_id} no corresponde a un programa válido.`);
      if (proyecto.programa_id && proyecto.programa_id !== parseInt(data.programa_id)) {
        throw new Error(`El proyecto ya pertenece al programa ID ${proyecto.programa_id}. Desasignelo primero.`);
      }
    }
  }

  const changes = collectChanges(proyecto, data);

  await proyecto.update(data);

  if (Object.keys(changes).length > 0) {
    await saveLog({
      userId: usuarioId,
      actionType: 'PROJECT_DETAIL_UPDATED',
      resourceType: 'Proyecto',
      resourceId: id,
      details: { message: 'Cambio en detalles técnicos/económicos', changed_fields: changes },
    });
  }

  return proyecto;
};

// 🔹 Actualización de datos generales del proyecto (nombre, director, patrocinador, etc.)
// FIX: corregido bug — el bloque de actualización de patrocinador
// usaba directorProyectoDetails en su condición en lugar de patrocinadorProyecto
const updateProyectoGeneralData = async (data, id, usuarioId) => {
  const proyecto = await Proyecto.findOne({
    where: { id },
    include: [
      { model: Departamento, as: 'Departamento' },
      {
        model: DirectorProyecto, as: 'DirectorProyecto',
        include: { model: Persona, as: 'Persona' },
      },
      {
        model: Patrocinador, as: 'Patrocinador',
        include: { model: Persona, as: 'Persona' },
      },
    ],
  });

  if (!proyecto) throw new Error('Proyecto no encontrado');

  const changes = {};

  const trackChange = (path, oldVal, newVal) => {
    if (oldVal !== newVal && newVal !== undefined) {
      changes[path] = { old: oldVal, new: newVal };
    }
  };

  trackChange('nombre', proyecto.nombre, data.nombreProyecto);
  trackChange('informacion', proyecto.informacion, data.informacionBreve);
  trackChange('tipo_proyecto', proyecto.tipo_proyecto, data.tipoProyecto);

  if (data.departamento && proyecto.Departamento) {
    trackChange('departamento', proyecto.Departamento.nombre, data.departamento);
  }

  if (data.directorProyecto && proyecto.DirectorProyecto?.Persona) {
    const { nombre, apellido } = getNombreApellidoFromStr(data.directorProyecto);
    const oldName = `${proyecto.DirectorProyecto.Persona.nombre} ${proyecto.DirectorProyecto.Persona.apellido}`.trim();
    trackChange('director', oldName, `${nombre} ${apellido}`.trim());
  }

  if (data.patrocinadorProyecto && proyecto.Patrocinador?.Persona) {
    const { nombre, apellido } = getNombreApellidoFromStr(data.patrocinadorProyecto);
    const oldName = `${proyecto.Patrocinador.Persona.nombre} ${proyecto.Patrocinador.Persona.apellido}`.trim();
    trackChange('patrocinador', oldName, `${nombre} ${apellido}`.trim());
  }

  // Ejecutar actualizaciones
  await proyecto.update({
    nombre: data.nombreProyecto,
    informacion: data.informacionBreve,
    tipo_proyecto: data.tipoProyecto,
  });

  if (data.departamento && proyecto.Departamento) {
    await proyecto.Departamento.update({ nombre: data.departamento });
  }

  if (data.directorProyecto && proyecto.DirectorProyecto?.Persona) {
    const { nombre, apellido } = getNombreApellidoFromStr(data.directorProyecto);
    await proyecto.DirectorProyecto.Persona.update({ nombre, apellido });
  }

  // FIX: antes usaba directorProyectoDetails en la condición — ahora usa patrocinadorProyecto
  if (data.patrocinadorProyecto && proyecto.Patrocinador?.Persona) {
    const { nombre, apellido } = getNombreApellidoFromStr(data.patrocinadorProyecto);
    await proyecto.Patrocinador.Persona.update({ nombre, apellido });
  }

  await saveLog({
    userId: usuarioId,
    actionType: 'PROJECT_UPDATED_GENERAL',
    resourceType: 'Proyecto',
    resourceId: id,
    details: { message: 'Actualización de datos generales', changed_fields: changes },
  });

  return proyecto;
};

// ═════════════════════════════════════════════
// OTROS
// ═════════════════════════════════════════════

// 🔹 Asigna el creador del proyecto a la tabla pivote usuario_proyecto
const assignCreatorToProject = async (projectId, usuarioId) => {
  const proyecto = await Proyecto.findByPk(projectId);
  if (!proyecto) throw new Error(`Proyecto con ID ${projectId} no encontrado.`);
  await proyecto.addUsuario(usuarioId);
};

// 🔹 Actualiza estado del proyecto y registra el cambio en logs
const logUpdateEstadoProyecto = async (projectId, newStatus, userId, extraFields = {}, actionType) => {
  const proyecto = await Proyecto.findByPk(projectId);
  if (!proyecto) throw new Error(`Proyecto con ID ${projectId} no encontrado.`);

  const oldStatus = proyecto.estado;

  await proyecto.update({ estado: newStatus, ...extraFields });

  await saveLog({
    userId,
    actionType,
    resourceType: 'Proyecto',
    resourceId: projectId,
    details: {
      status: { old: oldStatus, new: newStatus },
      ...extraFields,
    },
  });

  return proyecto;
};

module.exports = {
  getAllProyecto,
  getActiveProyecto,
  getProyectoById,
  createProyecto,
  createProyectoGeneralData,
  updateProyecto,
  updateProyectoGeneralData,
  getFilteredProjects,
  assignCreatorToProject,
  logUpdateEstadoProyecto,
};