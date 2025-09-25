const Sequelize = require('sequelize');
const db = require('../db');

// Import models
const models = {
  ContactoTelefonico: require('./contacto-telefonico')(db, Sequelize),
  Persona: require('./persona')(db, Sequelize),
  TipoTelefono: require('./tipo-telefono')(db, Sequelize),
  TipoDireccion: require('./tipo-direccion')(db, Sequelize),
  Direccion: require('./direccion')(db, Sequelize),
  DirectorProyecto: require('./director-proyecto')(db, Sequelize),
  TipoProyecto: require('./tipo-proyecto')(db, Sequelize),
  Proyecto: require('./proyecto')(db, Sequelize),
  Patrocinador: require('./patrocinador')(db, Sequelize),
  Empresa: require('./empresa')(db, Sequelize),
  Departamento: require('./departamento')(db, Sequelize),
  TipoEvaluacion: require('./tipo-evaluacion')(db, Sequelize),
  Criterio: require('./criterio')(db, Sequelize),
  CriterioCustom: require('./criterio-custom')(db, Sequelize),
  Opcion: require('./opcion')(db, Sequelize),
  OpcionCustom: require('./opcion-custom')(db, Sequelize),
  NivelPermiso: require('./nivel-permiso')(db, Sequelize),
  TipoLicencia: require('./tipo-licencia')(db, Sequelize),
  Menu: require('./menu')(db, Sequelize),
  PermisoLicencia: require('./permiso-licencia')(db, Sequelize),
  Usuario: require('./usuario')(db, Sequelize),
  Ciudad: require('./ciudad')(db, Sequelize),
  Evaluacion: require('./evaluacion')(db, Sequelize),
  EvaluacionDetalle: require('./evaluacion-detalle')(db, Sequelize),
  Interesado: require('./interesados')(db, Sequelize),
  EvaluacionInteresado: require('./evaluacion-interesados')(db, Sequelize),
  NoDisponibilidad: require('./fechas-no-disponibilidad')(db, Sequelize),
  criterioAnalisis: require('./criterio-analisis-impacto')(db, Sequelize),
  AnalisisImpacto: require('./analisisImpacto')(db, Sequelize),
  Batch: require('./batch')(db, Sequelize),
  Tarea: require('./tarea')(db, Sequelize),
  KanbanStatus: require('./kanbanStatus')(db, Sequelize),
  KanbanTask: require('./kanbanTask')(db, Sequelize),
  RespuestaAnalisis: require('./resultado-analisis') (db, Sequelize)
};

Object.keys(models).forEach((modelKey) => {
  if ('associate' in models[modelKey]) {
    models[modelKey].associate(models);
  }
});

module.exports = models;
