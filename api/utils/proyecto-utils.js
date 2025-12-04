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

const createProyecto = async (data) => {
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
    modo: data.modo
  })

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

  return proyecto;
};


const updateProyecto = async (data, id) => {
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

  await proyecto.update(data)
  return proyecto;
}

const updateProyectoGeneralData = async (data, id) => {
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

  const projectData = {
    nombre: data.nombreProyecto,
    informacion: data.informacionBreve,
    tipo_proyecto: data.tipoProyecto
  }

  await proyecto.update(projectData);
  if (data.departamento) {
    await proyecto.Departamento.update({ nombre: data.departamento });
  }

  if (data.directorProyecto) {
    const { nombre, apellido } = getNombreApellidoFromStr(data.directorProyecto);

    await proyecto.DirectorProyecto.Persona.update({
      nombre, apellido
    });
  }

  if (data.patrocinadorProyecto) {
    const { nombre, apellido } = getNombreApellidoFromStr(data.patrocinadorProyecto);
    await proyecto.Patrocinador.Persona.update({
      nombre, apellido
    });
  }

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
};
