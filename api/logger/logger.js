const winston = require("winston");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");
require('winston-daily-rotate-file');

const myFormat = winston.format.printf( ({ level, message, source, method, params, ...rest }) => {
    if (source) message += ` at ${source}`;
    if (method) message += ` in ${method}`;
    if (params) message += ` with params ${JSON.stringify(params)}`;

    const { uuid, date } = rest;
    return `${uuid} - [${date}] ${level}: ${message}`;
})

const uuid = winston.format((info, opts) => {
    info["uuid"] = uuidv4();
    info["date"] = new Date().toLocaleString();
    return info;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        //winston.format.timestamp({ format: new Date().toLocaleString() }),
        uuid(),
        winston.format.json()
    ),
    //exceptionHandlers: [
    //    new winston.transports.File({ filename: `${config.baseDirname}/logs/exceptions.log` })
    //],
    transports: [
        // new winston.transports.File({ filename: `${config.baseDirname}/logs/combined.log` }),
        // new winston.transports.File({ filename: `${config.baseDirname}/logs/error.log`, level: 'error' }),
        new(winston.transports.DailyRotateFile)({
          filename: './log',
          dirname: `${config.baseDirname}/logs/`,
          datePattern: 'yyyy-MM-DD',
          prepend: true
      }),
    ],
    exitOnError: false,
})

if (process.env.ENVIRONMENT !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            myFormat
            //winston.format.simple()
        )
    }));
}


module.exports = logger;

