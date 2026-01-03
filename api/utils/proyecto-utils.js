/* eslint-disable no-unused-vars */
const {
  Op, fn, col, literal
} = require('sequelize');
const { Proyecto, Usuario } = require('../models/index');
const {
  Persona, DirectorProyecto, Patrocinador, Departamento,
  TipoProyecto, Empresa,
} = require('../models/index');
const DateUtils = require("./date-utils");
const { getNombreApellidoFromStr } = require('./string-utils');

// otras importaciones para logs
const { saveLog } = require('./log-service'); // 💡 IMPORTAR SERVICIO DE LOGS

const getAllProyecto = async (usuarioId) => {
  const items = await Proyecto.findAll({
    where: {
      [Op.or]: [
        { usuario_creador: usuarioId },
        { '$Usuarios.id$': usuarioId } // <-- Acceso a través de la tabla pivote
      ]
    },
    include: [
      {
        model: Usuario,
        as: 'Usuarios',
        required: false, // Usar 'required: true' si solo quieres proyectos compartidos
        through: { attributes: [] },
        attributes: ['id'] // Solo necesitamos el ID para el WHERE
      },
      {
        model: DirectorProyecto,
        as: 'DirectorProyecto',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
      {
        model: Patrocinador,
        as: 'Patrocinador',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
      {
        model: Empresa,
        as: 'Empresa',
      },
      {
        model: Departamento,
        as: 'Departamento',
      },
      {
        model: TipoProyecto,
        as: 'TipoProyecto',
      },
    ],
    order: [
      [literal(`CASE 
        WHEN estado = 'X' THEN 1
        WHEN estado = 'P' THEN 2
        WHEN estado = 'S' THEN 3
        WHEN estado = 'C' THEN 4
        WHEN estado = 'E' THEN 5
        ELSE 6 END`), 'ASC']
    ]
  });
  return items;
};

const getActiveProyecto = async () => {
  const items = await Proyecto.findAll({
    where: {
      activo: true,
    },
    include: [
      {
        model: DirectorProyecto,
        as: 'DirectorProyecto',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
      {
        model: Patrocinador,
        as: 'Patrocinador',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
      {
        model: Empresa,
        as: 'Empresa',
      },
      {
        model: Departamento,
        as: 'Departamento',
      },
      {
        model: TipoProyecto,
        as: 'TipoProyecto',
      },
    ],
  });
  return items;
};

const getProyectoById = async (id) => {
  const item = await Proyecto.findOne({
    where: {
      id,
    },
    include: [
      {
        model: DirectorProyecto,
        as: 'DirectorProyecto',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
      {
        model: Patrocinador,
        as: 'Patrocinador',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
      {
        model: Empresa,
        as: 'Empresa',
      },
      {
        model: Departamento,
        as: 'Departamento',
      },
      {
        model: TipoProyecto,
        as: 'TipoProyecto',
      },
    ],
  });

  return item;
};

const createProyecto = async (data, usuarioId) => {
  /* const {
    numero, nombre, informacion, tipoProyecto, empresa, departamento,
    directorProyecto, patrocinador,
    pendienteAsignacion,
    documentacionAdjunta,
    contrato,
    casoNegocio,
    portafolio,
    programa,
    justificacion,
    descripcion,
    analisisViabilidad,
    objetivoCosto,
    objetivoPlazo,
    objetivoDesempeno,
    alcanceEntregables,
    tiempoDuracion,
    tiempoFechasCriticas,
    costoEntregable,
    costoGanancia,
    costoReservaContingencia,
    costoReservaGestion,
    calidadObjetivos,
    calidadMetricas,
    capacitacionObjetivos,
    capacitacionMetricas,
  } = data; */

  /* const proyecto = await Proyecto.create({
    nombre,
    informacion,
    tipo_proyecto: tipoProyecto,
    empresa,
    departamento,
    director: directorProyecto,
    patrocinador,
    fecha_creacion: DateUtils.getLocalDate(),
    estado: 'C',
    activo: true,
    pendiente_asignacion: pendienteAsignacion ,
    documentacion_adjunta: documentacionAdjunta,
    contrato: contrato,
    caso_negocio : casoNegocio,
    portafolio: portafolio,
    programa: programa,
    justificacion: justificacion,
    descripcion : descripcion,
    analisis_viabilidad : analisisViabilidad,
    objetivo_costo : objetivoCosto,
    objetivo_plazo : objetivoPlazo,
    objetivo_desempeno : objetivoDesempeno,
    alcance_entregables : alcanceEntregables,
    tiempo_duracion : tiempoDuracion,
    tiempo_fechas_criticas: tiempoFechasCriticas,
    costo_entregable : costoEntregable,
    costo_ganancia : costoGanancia,
    costo_reserva_contingencia  : costoReservaContingencia,
    costo_reserva_gestion: costoReservaGestion,
    calidad_objetivos : calidadObjetivos,
    calidad_metricas  : calidadMetricas,
    capacitacion_objetivos : capacitacionObjetivos,
    capacitacion_metricas: capacitacionMetricas,
  }); */

  const proyecto = await Proyecto.create({
    ...data,
    estado: 'C',
    activo: true,
    fecha_creacion: DateUtils.getLocalDate(),
    modo: data.modo,
    usuario_creador: usuarioId
  })

  // Registro en Logs
  await saveLog({
    userId: usuarioId,
    actionType: 'PROJECT_CREATED',
    resourceType: 'Proyecto',
    resourceId: proyecto.id,
    details: {
      nombre: proyecto.nombre,
      modo: proyecto.modo,
      estado: 'C'
    }
  });

  return proyecto;
};

function toSnakeCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item));
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

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

  let directorProyecto;
  let patrocinador;
  let persona;
  let departamento;

  if (directorProyectoDetails) {
    const { nombre, apellido } = getNombreApellidoFromStr(directorProyectoDetails);

    persona = await Persona.create({
      nombre,
      apellido,
      fecha_creacion: DateUtils.getLocalDate(),
      activo: true,
    });

    directorProyecto = await persona.createDirectorProyecto({
      fecha_creacion: DateUtils.getLocalDate(),
      activo: true
    });
  }

  if (patrocinadorProyectoDetails) {
    if (
      !directorProyectoDetails ||
      patrocinadorProyectoDetails.toLowerCase() !== directorProyectoDetails.toLowerCase()
    ) {
      const { nombre, apellido } = getNombreApellidoFromStr(patrocinadorProyectoDetails);

      persona = await Persona.create({
        nombre,
        apellido,
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

  const restSnake = toSnakeCase(rest);

  const proyectoPayload = {
    nombre: nombreProyecto,
    informacion: informacionBreve,
    tipo_proyecto: tipoProyecto,
    estado: "C",
    activo: true,
    fecha_creacion: DateUtils.getLocalDate(),
    usuario_creador: usuarioId,
    modo,
    director: directorProyecto.id || null,
    patrocinador: patrocinador.id || null,
    departamento: departamento.id || null,
    ...restSnake,
  };

  const proyecto = await Proyecto.create(proyectoPayload);

  // Sequelize automáticamente añade la entrada en la tabla 'usuario_proyecto'
  await proyecto.addUsuario(usuarioId);

  // Registro en Logs
  await saveLog({
    userId: usuarioId,
    actionType: 'PROJECT_CREATED_FULL', // Un tipo distinto para diferenciar el wizard completo
    resourceType: 'Proyecto',
    resourceId: proyecto.id,
    details: {
      nombre: proyecto.nombre,
      modo: proyecto.modo,
      tipo_proyecto: proyecto.tipo_proyecto,
      has_director: !!proyecto.director,
      has_patrocinador: !!proyecto.patrocinador
    }
  });

  return proyecto;
};


const updateProyecto = async (data, id, usuarioId) => {
  const proyecto = await Proyecto.findOne({
    where: { id },
    include: [
      {
        model: Departamento,
        as: 'Departamento',
      },
      {
        model: DirectorProyecto,
        as: 'DirectorProyecto',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
      {
        model: Patrocinador,
        as: 'Patrocinador',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
    ]
  });

  if (!proyecto) throw new Error("Proyecto no encontrado");

  // PREPARAR EL RECOLECTOR DE CAMBIOS
  const changes = {};

  /**
   * Función auxiliar para comparar valores simples y complejos (Arrays/Objects)
   */
  const checkDifference = (key, newValue) => {
    const oldValue = proyecto[key];

    // Si el valor es un objeto o arreglo (JSONB en la DB)
    if (typeof oldValue === 'object' && oldValue !== null) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    }
    // Si es un valor primitivo (string, number, boolean)
    else if (oldValue != newValue && newValue !== undefined) {
      changes[key] = { old: oldValue, new: newValue };
    }
  };

  // ITERAR SOBRE LOS DATOS QUE VIENEN DEL FRONT
  // Esto detectará cambios en costo_entregable, alcance_entregables, hitos, etc.
  const fieldsToIgnore = ['id', 'numero', 'fecha_creacion', 'DirectorProyecto', 'Patrocinador', 'Departamento'];

  Object.keys(data).forEach(key => {
    if (!fieldsToIgnore.includes(key) && proyecto.dataValues.hasOwnProperty(key)) {
      checkDifference(key, data[key]);
    }
  });

  // CASOS ESPECIALES (Si los IDs de relaciones cambiaron)
  if (data.tipo_proyecto && proyecto.tipo_proyecto !== data.tipo_proyecto) {
    changes['tipo_proyecto'] = { old: proyecto.tipo_proyecto, new: data.tipo_proyecto };
  }

  await proyecto.update(data)

  // GUARDAR LOG SOLO SI HUBO CAMBIOS REALES
  if (Object.keys(changes).length > 0) {
    await saveLog({
      userId: usuarioId,
      actionType: 'PROJECT_DETAIL_UPDATED',
      resourceType: 'Proyecto',
      resourceId: id,
      details: {
        message: "Cambio en detalles técnicos/económicos",
        changed_fields: changes
      }
    });
  }

  return proyecto;
}

const updateProyectoGeneralData = async (data, id, usuarioId) => {
  const proyecto = await Proyecto.findOne({
    where: { id },
    include: [
      {
        model: Departamento,
        as: 'Departamento',
      },
      {
        model: DirectorProyecto,
        as: 'DirectorProyecto',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
      {
        model: Patrocinador,
        as: 'Patrocinador',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
    ]
  });

  if (!proyecto) throw new Error("Proyecto no encontrado");

  // PREPARAR EL RECOLECTOR DE CAMBIOS
  const changes = {};

  // Función auxiliar para comparar y registrar cambios
  const trackChange = (path, oldVal, newVal) => {
    if (oldVal !== newVal && newVal !== undefined) {
      changes[path] = { old: oldVal, new: newVal };
    }
  };

  // COMPARAR DATOS BÁSICOS DEL PROYECTO
  trackChange('nombre', proyecto.nombre, data.nombreProyecto);
  trackChange('informacion', proyecto.informacion, data.informacionBreve);
  trackChange('tipo_proyecto', proyecto.tipo_proyecto, data.tipoProyecto);

  // COMPARAR DEPARTAMENTO
  if (data.departamento && proyecto.Departamento) {
    trackChange('departamento', proyecto.Departamento.nombre, data.departamento);
  }

  // COMPARAR DIRECTOR (Nombre completo)
  if (data.directorProyecto && proyecto.DirectorProyecto?.Persona) {
    const { nombre, apellido } = getNombreApellidoFromStr(data.directorProyecto);
    const oldName = `${proyecto.DirectorProyecto.Persona.nombre} ${proyecto.DirectorProyecto.Persona.apellido}`.trim();
    const newName = `${nombre} ${apellido}`.trim();
    trackChange('director', oldName, newName);
  }

  // COMPARAR PATROCINADOR
  if (data.patrocinadorProyecto && proyecto.Patrocinador?.Persona) {
    const { nombre, apellido } = getNombreApellidoFromStr(data.patrocinadorProyecto);
    const oldName = `${proyecto.Patrocinador.Persona.nombre} ${proyecto.Patrocinador.Persona.apellido}`.trim();
    const newName = `${nombre} ${apellido}`.trim();
    trackChange('patrocinador', oldName, newName);
  }

  // --- EJECUCIÓN DE LAS ACTUALIZACIONES ---

  const projectData = {
    nombre: data.nombreProyecto,
    informacion: data.informacionBreve,
    tipo_proyecto: data.tipoProyecto
  }

  await proyecto.update(projectData);
  if (data.departamento && proyecto.Departamento) {
    await proyecto.Departamento.update({ nombre: data.departamento });
  }

  if (data.directorProyecto && proyecto.DirectorProyecto?.Persona) {
    const { nombre, apellido } = getNombreApellidoFromStr(data.directorProyecto);

    await proyecto.DirectorProyecto.Persona.update({
      nombre, apellido
    });
  }

  if (data.patrocinadorProyecto && proyecto.Patrocinador?.Persona) {
    const { nombre, apellido } = getNombreApellidoFromStr(data.patrocinadorProyecto);
    await proyecto.Patrocinador.Persona.update({
      nombre, apellido
    });
  }

  // GUARDAR LOG SOLO SI HUBO CAMBIOS
  //if (Object.keys(changes).length > 0) {
    await saveLog({
      userId: usuarioId,
      actionType: 'PROJECT_UPDATED_GENERAL',
      resourceType: 'Proyecto',
      resourceId: id,
      details: {
        message: "Actualización de datos generales",
        changed_fields: changes // Aquí se guarda solo lo que cambió
      }
    });
  //}

  return proyecto;
}

const getFilteredProjects = async (query, usuarioId) => {
  const {
    startDateFrom, startDateTo, responsable, status, name, modo
  } = query;
  let filter = {}
  if (startDateFrom && startDateTo) {
    filter = {
      ...filter,
      fecha_inicio: {
        [Op.ne]: null,
        [Op.between]: [startDateFrom, startDateTo],
      },
    };
  }

  if (status) {
    filter = { ...filter, estado: status };
  }

  if (modo) {
    filter = { ...filter, modo };  // 👈 filtramos por modo si llega desde el front
  }

  if (name) {
    filter = { ...filter, nombre: { [Op.iLike]: `%${name}%` } };
  }

  let filterPersona = {};
  if (responsable) {
    filter = {
      ...filter,
      '$DirectorProyecto.id$': { [Op.ne]: null },
    };
    filterPersona = {
      ...filterPersona,
      [Op.or]: [
        { nombre: { [Op.iLike]: `%${responsable}%` } },
        { apellido: { [Op.iLike]: `%${responsable}%` } }
      ]
    };
  }

  if (usuarioId) {
    //filter = { ...filter, usuario_creador: usuarioId };
    filter = {
      ...filter,
      [Op.or]: [
        { usuario_creador: usuarioId },
        // La búsqueda por asociación se manejará en el include. 
        // Aquí solo se necesita la condición del creador.
        // La condición del usuario asignado debe estar en el JOIN y el WHERE de la asociación.
      ]
    };
  }

  const items = await Proyecto.findAll({
    include: [
      {
        model: Usuario,
        as: 'Usuarios',
        required: true, // Esto actúa como un JOIN INNER
        through: { attributes: [] },
        // Filtramos la asociación para que solo coincida con el usuario logueado
        where: { id: usuarioId },
        attributes: ['id']
      },
      {
        model: DirectorProyecto,
        as: 'DirectorProyecto',
        include: {
          model: Persona,
          as: 'Persona',
          where: filterPersona
        },
      },
      {
        model: Patrocinador,
        as: 'Patrocinador',
        include: {
          model: Persona,
          as: 'Persona',
        },
      },
      {
        model: Empresa,
        as: 'Empresa',
      },
      {
        model: Departamento,
        as: 'Departamento',
      },
      {
        model: TipoProyecto,
        as: 'TipoProyecto',
      },
    ],
    //where: filter,
    where: {
      ...filter,
      // Re-aplicar la lógica de OR para el creador
      // Para simplificar, si el usuario está en la tabla pivote, ya tiene acceso.
      // Si mantenemos usuario_creador, la lógica en el JOIN es más limpia:
      // Aseguramos que el usuario es creador *O* está en la tabla pivote.
      [Op.or]: [
        { usuario_creador: usuarioId },
        { '$Usuarios.id$': usuarioId }
      ],
    },
    order: [
      [literal(`CASE 
        WHEN estado = 'X' THEN 1
        WHEN estado = 'P' THEN 2
        WHEN estado = 'S' THEN 3
        WHEN estado = 'C' THEN 4
        WHEN estado = 'E' THEN 5
        ELSE 6 END`), 'ASC']
    ]
  });

  return items;
};

const assignCreatorToProject = async (projectId, usuarioId) => {
  try {
    const proyecto = await Proyecto.findByPk(projectId);

    if (!proyecto) {
      throw new Error(`Proyecto con ID ${projectId} no encontrado.`);
    }

    // Usamos addUsuario, que añade la relación en la tabla pivote
    // 'usuario_proyecto' sin afectar a las ya existentes.
    await proyecto.addUsuario(usuarioId);

  } catch (error) {
    // En un entorno de producción, es crucial registrar este error.
    logger.error({
      message: `Error al asignar el creador al proyecto ${projectId} en la tabla pivote: ${error.message}`,
      source: file,
      method: "assignCreatorToProject()",
      params: { projectId, usuarioId },
    });

    throw error;
  }
};

/**
 * Actualiza el proyecto y registra el cambio de estado.
 * @param {number} projectId - ID del proyecto.
 * @param {string} newStatus - Nuevo estado (S, E, P, C, etc.).
 * @param {number} userId - ID del usuario que realiza la acción (obtenido del token).
 * @param {object} [extraFields={}] - Campos adicionales a actualizar (ej: fecha_inicio, fecha_cierre).
 * @param {string} actionType - Tipo de acción para el log (ej: 'PROJECT_ACTIVATED').
 */
const logUpdateEstadoProyecto = async (projectId, newStatus, userId, extraFields = {}, actionType) => {
  const proyecto = await Proyecto.findByPk(projectId);

  if (!proyecto) {
    throw new Error(`Proyecto con ID ${projectId} no encontrado.`);
  }

  const oldStatus = proyecto.estado; // 💡 Capturar el estado anterior

  // 1. Ejecutar la actualización
  const dataToUpdate = {
    estado: newStatus,
    ...extraFields,
  };
  await proyecto.update(dataToUpdate);

  // 2. Registrar el log
  await saveLog({
    userId: userId,
    actionType: actionType,
    resourceType: 'Proyecto',
    resourceId: projectId,
    details: {
      status: {
        old: oldStatus,
        new: newStatus,
      },
      ...extraFields, // Incluir campos extra en el log
    }
  });

  return proyecto; // Devolver el proyecto actualizado
};

module.exports = {
  getAllProyecto,
  getActiveProyecto,
  getProyectoById,
  createProyecto,
  createProyectoGeneralData,
  updateProyecto,
  getFilteredProjects,
  updateProyectoGeneralData,
  assignCreatorToProject,
  logUpdateEstadoProyecto,
};
