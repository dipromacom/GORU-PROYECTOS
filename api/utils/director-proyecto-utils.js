const { DirectorProyecto } = require('../models');
const PersonaUtils = require('./persona-utils');
const {
  Persona, Direccion, ContactoTelefonico, TipoTelefono, TipoDireccion,
} = require('../models/index');

const getAllDirectorProyecto = async () => {
  const items = await DirectorProyecto.findAll({
    include: {
      model: Persona,
      as: 'Persona',
      include: [
        {
          model: Direccion,
          as: 'TipoDireccion',
          include: {
            model: TipoDireccion,
            as: 'TipoDireccion',
          },
        },
        {
          model: ContactoTelefonico,
          as: 'TipoTelefono',
          include: {
            model: TipoTelefono,
            as: 'TipoTelefono',
          },
        },
      ],
    },
  });
  return items;
};

const getActiveDirectorProyecto = async () => {
  const items = await DirectorProyecto.findAll({
    where: { activo: true },
    include: {
      model: Persona,
      as: 'Persona',
      include: [
        {
          model: Direccion,
          as: 'TipoDireccion',
          include: {
            model: TipoDireccion,
            as: 'TipoDireccion',
          },
        },
        {
          model: ContactoTelefonico,
          as: 'TipoTelefono',
          include: {
            model: TipoTelefono,
            as: 'TipoTelefono',
          },
        },
      ],
    },
  });

  return items;
};

const getDirectorProyectoById = async (id) => {
  const item = await DirectorProyecto.findOne({
    where: { id },
    include: {
      model: Persona,
      as: 'Persona',
      include: [
        {
          model: Direccion,
          as: 'TipoDireccion',
          include: {
            model: TipoDireccion,
            as: 'TipoDireccion',
          },
        },
        {
          model: ContactoTelefonico,
          as: 'TipoTelefono',
          include: {
            model: TipoTelefono,
            as: 'TipoTelefono',
          },
        },
      ],
    },
  });

  return item;
};

const getDetailsByPersonaId = async (personaId) => {
  const item = await DirectorProyecto.findOne({
    where: {
      persona: personaId,
    },
  });

  return item;
};

const createDirectorProyecto = async (data) => {
  const { tipoIdentificacion, identificacion } = data;
  let persona = await PersonaUtils.getPersonaByIdentificacion(
    tipoIdentificacion, identificacion, true,
  );

  if (persona === null) {
    persona = await PersonaUtils.createPersona(data);
  }

  const directorProyecto = await getDetailsByPersonaId(persona.id);
  if (directorProyecto === null) {
    persona.createDirectorProyecto({
      fecha_creacion: null,
      activo: true,
    });
  }

  return persona;
};

const deactivateDirectorProyecto = async (id) => {
  let result = false;
  const directorProyecto = await getDirectorProyectoById(id);

  if (directorProyecto === null) {
    throw Error('Director de Proyecto no existe');
  }
  await directorProyecto.update({ activo: false });

  /* const persona = await PersonaUtils.getPersonaById(directorProyecto.persona);
  if (persona !== null) {
    await persona.update({ activo: false });
  } */

  result = true;
  return result;
};

module.exports = {
  createDirectorProyecto,
  getAllDirectorProyecto,
  getActiveDirectorProyecto,
  getDirectorProyectoById,
  getDetailsByPersonaId,
  deactivateDirectorProyecto,
};
