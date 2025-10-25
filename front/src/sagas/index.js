import session from "./session";
import usuario from "./usuario";
import routes from "./routes";
import ciudad from "./ciudad";
import persona from "./persona";
import opcion from "./opcion";
import evaluacion from "./evaluacion";
import batch from "./batch";
import project from "./project"
import contacto from "./contacto";
import criterioCustom from "./criterioCustom";
import opcionCustom from "./opcionCustom";
import kanban from "./kanban"
import gantt from "./gantt"
import whiteboard from "./whiteboard";
import tipoProyecto from "./tipoProyecto"
import { all, spawn, call } from "redux-saga/effects";




const sagas = [
  ...session,
  ...usuario,
  ...routes,
  ...ciudad,
  ...persona,
  ...opcion,
  ...evaluacion,
  ...batch,
  ...contacto,
  ...criterioCustom,
  ...opcionCustom,
  ...project,
  ...kanban,
  ...gantt,
  ...whiteboard,
  ...tipoProyecto
];

export default function* rootSaga() {
  yield all(
    sagas.map((saga) => 
      spawn(function* listenSagas() {
        while(true) {
          yield call(function* execSaga() {
            yield saga;
          })
        }
      }  
    ))
  );
}