import React, { useEffect} from "react";
import { Route, Switch } from "react-router-dom";
// import Home from "./publicRoutes/Home";
import Login from "./public/Login";
import SignUp from "./public/SignUp";
import Recover from "./public/Recover";
import Membership from "./private/Membership";
import Profile from "./private/Profile";
import Instrumentos from "./private/Instrumentos";
import Desktop from "./layout/Desktop";
import Default from "./layout/Default";
import NotFound from "./public/NotFound";
import PriorizacionProyectos from "./private/PriorizacionProyectos";
import Nosotros from "./private/Nosotros";
import Proyectos from "./private/Proyectos";
import Programas from "./private/Programas";
import Portafolios from "./private/Portafolios";
import Config from "./private/Config";
import Batch from "./private/Batch";
import PriorizacionResultados from "./private/PriorizacionResultados";
import SetupBatch from "./private/SetupBatch";
import EditCriterio from "./private/EditCriterio";
import EditOpcion from "./private/EditOpcion";
import NewCriterio from "./private/NewCriterio";
import NewOpcion from "./private/NewOpcion";
import PrintBatch from "./private/PrintBatch";
import ProyectoNew from "./private/ProyectoNew";
import ProyectoDetail from "./private/ProyectoDetail";
import Interesado from "./components/ProyectoDetailMatriz/Interesado";
import Interesados from "./components/ProyectoDetailMatriz/ViewInteresados";
import Dashboard from "./private/Dashboard";

const ExternalRedirect = ({ url }) => {
  useEffect(() => {
    window.open(url, "_blank");
  }, []);

  return null;
};

export default function Routes() {
  return (
    <Switch>
      {/* <Route exact path="/">
         <Home />
      </Route> */}

      <Default exact path="/" />
      <Default exact path="/login" component={Login} />
      <Default exact path="/signUp" component={SignUp} />
      <Default exact path="/recoverAccount" component={Recover} />

      <Route exact path="/membership">
        <Membership />
      </Route>

      <Desktop exact path="/desktop" component={Config} />
      <Desktop exact path="/config" component={Config} />
      <Desktop exact path="/profile" component={Profile} />
      <Desktop exact path="/tools" component={Instrumentos} />
      <Desktop exact path="/priorization" component={PriorizacionProyectos} />
      <Desktop exact path="/aboutUs" component={Nosotros} />
      <Desktop exact path="/projects" component={Proyectos} />
      <Desktop exact path="/projects/new" component={ProyectoNew} />
      <Desktop exact path="/projects/:id" component={ProyectoDetail} />
      <Desktop exact path="/activities" component={Proyectos} />
      <Desktop exact path="/activities/new" component={ProyectoNew} />
      <Desktop exact path="/activities/:id" component={ProyectoDetail} />
      <Desktop exact path="/programs" component={Programas} />
      <Desktop exact path="/portfolios" component={Portafolios} />
      <Desktop exact path="/batch" component={Batch} />
      <Desktop exact path="/priorization/result" component={PriorizacionResultados} />
      <Desktop exact path="/batch/setup" component={SetupBatch} />
      <Desktop exact path="/batch/criterio" component={NewCriterio} />
      <Desktop exact path="/batch/criterio/:id" component={EditCriterio} />
      <Desktop exact path="/batch/criterio/:id/opcion" component={NewOpcion} />
      <Desktop exact path="/batch/opcion/:id" component={EditOpcion} />
      <Desktop exact path="/batch/:id/print" component={PrintBatch} />
      <Desktop exact path="/Interesado/:id" component={Interesado} />
      <Desktop exact path="/Dashboard" component={Dashboard} />
      {/* <Desktop exact path="/Interesados" component={Interesados}/> */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}