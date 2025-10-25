/* eslint-disable no-console */
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs-extra');

const http = require('http');
const https = require('https');
// const logger = require('./logger/logger');

const app = express();
const apiPort = process.env.HTTP_PORT;
const secureApiPort = process.env.HTTPS_PORT;

app.use(helmet());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "50mb" }));

const TipoTelefonoRouter = require('./routes/tipo-telefono');
const TipoDireccionRouter = require('./routes/tipo-direccion');
const PersonaRouter = require('./routes/persona');
const DirectorProyectoRouter = require('./routes/director-proyecto');
const TipoProyectoRouter = require('./routes/tipo-proyecto');
const Patrocinador = require('./routes/patrocinador');
const Empresa = require('./routes/empresa');
const Departamento = require('./routes/departamento');
const Proyecto = require('./routes/proyecto');
const TipoEvaluacion = require('./routes/tipo-evaluacion');
const Criterio = require('./routes/criterio');
const Opcion = require('./routes/opcion');
const NivelPermiso = require('./routes/nivel-permiso');
const TipoLicencia = require('./routes/tipo-licencia');
const Menu = require('./routes/menu');
const Usuario = require('./routes/usuario');
const Ciudad = require('./routes/ciudad');
const Evaluacion = require('./routes/evaluacion');
const Mail = require('./routes/mail');
const Batch = require('./routes/batch');
const CriterioCustom = require('./routes/criterio-custom');
const OpcionCustom = require('./routes/opcion-custom');

const Tarea = require('./routes/tarea')
const interesados = require('./routes/interesado');
const analisisAmbiental = require('./routes/analisis-impacto');
const criterioAnalisis  = require('./routes/criterio-analisis');
const resultadoAnalisis = require('./routes/resultado-analisis-impacto');

app.use('/api', TipoTelefonoRouter);
app.use('/api', TipoDireccionRouter);
app.use('/api', PersonaRouter);
app.use('/api', DirectorProyectoRouter);
app.use('/api', TipoProyectoRouter);
app.use('/api', Patrocinador);
app.use('/api', Empresa);
app.use('/api', Departamento);
app.use('/api', Proyecto);
app.use('/api', TipoEvaluacion);
app.use('/api', Criterio);
app.use('/api', Opcion);
app.use('/api', NivelPermiso);
app.use('/api', TipoLicencia);
app.use('/api', Menu);
app.use('/api', Usuario);
app.use('/api', Ciudad);
app.use('/api', Evaluacion);
app.use('/api', Mail);
app.use('/api', Batch);
app.use('/api', CriterioCustom);
app.use('/api', OpcionCustom);
app.use('/api', interesados);
app.use('/api', Tarea);
app.use('/api', analisisAmbiental);
app.use('/api', criterioAnalisis);
app.use('/api', resultadoAnalisis);

app.get('/', (req, res) => {
  res.send('Hello from Goru!!!');
});

// eslint-disable-next-line no-console
// app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));

if (process.env.NODE_ENV !== 'dev') {
  const options = {
    key: fs.readFileSync('private.key'),
    cert: fs.readFileSync('certificate.crt'),
    ca: fs.readFileSync('ca.pem'),
  };
  const httpsServer = https.createServer(options, app);
  httpsServer.listen(secureApiPort, () => console.log(`Server running on port ${secureApiPort}`));
} else {
  const httpServer = http.createServer(app);
  httpServer.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
}
