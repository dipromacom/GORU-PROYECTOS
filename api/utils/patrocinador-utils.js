const PersonaUtils = require('./persona-utils');
const {
  Persona, Direccion, ContactoTelefonico, TipoTelefono, TipoDireccion, Patrocinador,
} = require('../models/index');

const getAllPatrocinador = async () => {
  const items = await Patrocinador.findAll({
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

const getActivePatrocinador = async () => {
  const items = await Patrocinador.findAll({
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

const getPatrocinadorById = async (id) => {
  const item = await Patrocinador.findOne({
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
  const item = await Patrocinador.findOne({
    where: {
      persona: personaId,
    },
  });

  return item;
};

const createPatrocinador = async (data) => {
  const { tipoIdentificacion, identificacion } = data;
  let persona = await PersonaUtils.getPersonaByIdentificacion(
    tipoIdentificacion, identificacion, true,
  );

  if (persona === null) {
    persona = await PersonaUtils.createPersona(data);
  }

  const patrocinador = await getDetailsByPersonaId(persona.id);
  if (patrocinador === null) {
    persona.createPatrocinador({
      fecha_creacion: null,
      activo: true,
    });
  }

  return persona;
};

const deactivatePatrocinador = async (id) => {
  let result = false;
  const patrocinador = await getPatrocinadorById(id);

  if (patrocinador === null) {
    throw Error('Patrocinador no existe');
  }
  await patrocinador.update({ activo: false });

  result = true;
  return result;
};

module.exports = {
  createPatrocinador,
  getAllPatrocinador,
  getActivePatrocinador,
  getPatrocinadorById,
  getDetailsByPersonaId,
  deactivatePatrocinador,
};
