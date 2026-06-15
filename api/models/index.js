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
  Rol: require('./rol')(db, Sequelize),
  Permiso: require('./permiso')(db, Sequelize),
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
  GanttTask: require('./ganttTask')(db, Sequelize),
  Whiteboard: require('./whiteboard')(db, Sequelize),
  RespuestaAnalisis: require('./resultado-analisis') (db, Sequelize),
  Log: require('./log')(db, Sequelize),
  RolProyecto: require('./rol-proyecto')(db, Sequelize),
  PermisoProyecto: require('./permiso-proyecto')(db, Sequelize),
  UsuarioProyecto: require('./usuario-proyecto')(db, Sequelize),
  EncuestaSatisfaccion: require('./encuesta-satisfaccion')(db, Sequelize),
  InformeAvance: require('./informe-avance')(db, Sequelize),
  SolicitudCambio: require('./solicitud-cambio')(db, Sequelize),
  ConfigColaboradoresProyecto: require('./config-colaboradores-proyecto')(db, Sequelize),
  ConfigSesionTimeout: require('./config-sesion-timeout')(db, Sequelize),
  ChatConversacion: require('./chat-conversacion')(db, Sequelize),
  ChatMensaje: require('./chat-mensaje')(db, Sequelize),
  ChatLectura: require('./chat-lectura')(db, Sequelize),
  MadurezDireccionProyectos: require('./madurez-direccion-proyectos')(db, Sequelize),
  ScrumEpic: require('./scrum-epic')(db, Sequelize),
  ScrumSprint: require('./scrum-sprint')(db, Sequelize),
  ScrumStory: require('./scrum-story')(db, Sequelize),
  ScrumConfig: require('./scrum-config')(db, Sequelize),
};

Object.keys(models).forEach((modelKey) => {
  if ('associate' in models[modelKey]) {
    models[modelKey].associate(models);
  }
});

module.exports = models;
