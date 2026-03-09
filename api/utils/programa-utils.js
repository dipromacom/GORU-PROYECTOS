/* eslint-disable no-unused-vars */
const { Op, literal } = require('sequelize');
const { Proyecto, Usuario } = require('../models/index');
const {
    Persona, DirectorProyecto, Patrocinador, Departamento,
    TipoProyecto, Empresa,
} = require('../models/index');
const { saveLog } = require('./log-service');

// Includes reutilizables (mismo patrón que proyecto-utils)
const DEFAULT_PROYECTO_INCLUDES = [
    {
        model: DirectorProyecto,
        as: 'DirectorProyecto',
        include: { model: Persona, as: 'Persona', foreignKey: 'persona', },
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

/**
 * Obtiene todos los proyectos (modo P o A) pertenecientes a un programa.
 * @param {number} programaId
 */
const getProyectosByPrograma = async (programaId) => {
    // Verificar que el programa existe y es de modo PR
    const programa = await Proyecto.findOne({
        where: { id: programaId, modo: 'PR' },
    });

    if (!programa) {
        throw new Error(`El proyecto con ID ${programaId} no existe o no es un programa.`);
    }

    const proyectos = await Proyecto.findAll({
        where: { programa_id: programaId },
        include: DEFAULT_PROYECTO_INCLUDES,
        order: [
            [literal(`CASE 
        WHEN estado = 'X' THEN 1
        WHEN estado = 'P' THEN 2
        WHEN estado = 'S' THEN 3
        WHEN estado = 'C' THEN 4
        WHEN estado = 'E' THEN 5
        ELSE 6 END`), 'ASC'],
        ],
    });

    return proyectos;
};

/**
 * Obtiene todos los proyectos disponibles del usuario para ser añadidos a un programa.
 * Excluye: los que ya pertenecen al programa, los que son programas (PR), 
 * y los que ya pertenecen a otro programa.
 * @param {number} programaId
 * @param {number} usuarioId
 */
const getProyectosDisponiblesParaPrograma = async (programaId, usuarioId) => {
    const proyectos = await Proyecto.findAll({
        where: {
            modo: { [Op.in]: ['P', 'A'] }, // Solo proyectos y actividades, no programas
            programa_id: null,             // Que no estén ya en un programa
            [Op.or]: [
                { usuario_creador: usuarioId },
                { '$Usuarios.id$': usuarioId },
            ],
        },
        include: [
            {
                model: Usuario,
                as: 'Usuarios',
                required: false,
                through: { attributes: [] },
                attributes: ['id'],
            },
            ...DEFAULT_PROYECTO_INCLUDES,
        ],
        order: [['nombre', 'ASC']],
    });

    return proyectos;
};

/**
 * Asigna un proyecto a un programa.
 * Valida que el programa sea modo PR y el proyecto no sea PR.
 * @param {number} programaId
 * @param {number} proyectoId
 * @param {number} usuarioId
 */
const asignarProyectoAPrograma = async (programaId, proyectoId, usuarioId) => {
    // Validar programa
    const programa = await Proyecto.findOne({
        where: { id: programaId, modo: 'PR' },
    });
    if (!programa) {
        throw new Error(`El ID ${programaId} no corresponde a un programa válido.`);
    }

    // Validar proyecto
    const proyecto = await Proyecto.findOne({
        where: { id: proyectoId },
    });
    if (!proyecto) {
        throw new Error(`El proyecto con ID ${proyectoId} no existe.`);
    }
    if (proyecto.modo === 'PR') {
        throw new Error(`Un programa no puede ser parte de otro programa.`);
    }
    if (proyecto.programa_id && proyecto.programa_id !== programaId) {
        throw new Error(`El proyecto ya pertenece a otro programa (ID: ${proyecto.programa_id}).`);
    }

    await proyecto.update({ programa_id: programaId });

    await saveLog({
        userId: usuarioId,
        actionType: 'PROJECT_ASSIGNED_TO_PROGRAM',
        resourceType: 'Proyecto',
        resourceId: proyectoId,
        details: {
            programa_id: programaId,
            programa_nombre: programa.nombre,
            proyecto_nombre: proyecto.nombre,
        },
    });

    return proyecto;
};

/**
 * Desasigna un proyecto de su programa actual.
 * @param {number} proyectoId
 * @param {number} usuarioId
 */
const desasignarProyectoDePrograma = async (proyectoId, usuarioId) => {
    const proyecto = await Proyecto.findByPk(proyectoId);

    if (!proyecto) {
        throw new Error(`El proyecto con ID ${proyectoId} no existe.`);
    }
    if (!proyecto.programa_id) {
        throw new Error(`El proyecto con ID ${proyectoId} no pertenece a ningún programa.`);
    }

    const programaIdAnterior = proyecto.programa_id;
    await proyecto.update({ programa_id: null });

    await saveLog({
        userId: usuarioId,
        actionType: 'PROJECT_REMOVED_FROM_PROGRAM',
        resourceType: 'Proyecto',
        resourceId: proyectoId,
        details: {
            programa_id_anterior: programaIdAnterior,
            proyecto_nombre: proyecto.nombre,
        },
    });

    return proyecto;
};

module.exports = {
    getProyectosByPrograma,
    getProyectosDisponiblesParaPrograma,
    asignarProyectoAPrograma,
    desasignarProyectoDePrograma,
};