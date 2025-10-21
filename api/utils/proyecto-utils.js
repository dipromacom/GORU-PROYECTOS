/* eslint-disable no-unused-vars */
const {
  Op, fn, col, literal
} = require('sequelize');
const { Proyecto } = require('../models/index');
const {
  Persona, DirectorProyecto, Patrocinador, Departamento,
  TipoProyecto, Empresa,
} = require('../models/index');
const DateUtils = require("./date-utils");
const { getNombreApellidoFromStr } = require('./string-utils');

const getAllProyecto = async (usuarioId) => {
  const items = await Proyecto.findAll({
    where: {
      usuario_creador: usuarioId
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
      [Op.and]: [
        fn('DATE_TRUNC', 'day', col('fecha_inicio')) >= startDateFrom,
        fn('DATE_TRUNC', 'day', col('fecha_inicio')) <= startDateTo,
        { fecha_inicio: { [Op.ne]: null } }
      ]
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
    filter = { ...filter, usuario_creador: usuarioId };
  }

  const items = await Proyecto.findAll({
    include: [
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
    where: filter,
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

module.exports = {
  getAllProyecto,
  getActiveProyecto,
  getProyectoById,
  createProyecto,
  createProyectoGeneralData,
  updateProyecto,
  getFilteredProjects,
  updateProyectoGeneralData
};
