import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";

import session from "./session";
import usuario from "./usuario";
import routes from "./routes";
import ciudad from "./ciudad";
import persona from "./persona";
import opcion from "./opcion";
import evaluacion from "./evaluacion";
import batch from "./batch";
import contacto from "./contacto";
import criterioCustom from "./criterioCustom";
import opcionCustom from "./opcionCustom";
import project from "./project"
import kanban from "./kanban"
import gantt from "./gantt"
import tipoProyecto from "./tipoProyecto"

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  session,
  usuario,
  routes,
  ciudad,
  persona,
  opcion,
  evaluacion,
  batch,
  contacto,
  criterioCustom,
  opcionCustom,
  project,
  kanban,
  gantt,
  tipoProyecto
});

export default createRootReducer;