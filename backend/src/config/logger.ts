import fs from 'fs';
import path from 'path';
import winston from 'winston';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

for (const file of ['error.log', 'combined.log']) {
  const filePath = path.join(logsDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
  }
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const maskPasswords = winston.format((info) => {
  const maskValue = (input: string) =>
    input.replace(/("password"\s*:\s*)"[^"]*"/gi, '$1"****"').replace(/password[=:]\S+/gi, 'password=****');

  if (typeof info.message === 'string') {
    info.message = maskValue(info.message);
  }

  if (info.meta && typeof info.meta === 'object') {
    info.meta = JSON.parse(maskValue(JSON.stringify(info.meta)));
  }

  return info;
});

const jsonFormat = winston.format.combine(
  maskPasswords(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleDevFormat = winston.format.printf(({ level, message }) => {
  return `[${level.toUpperCase()}] ${message}`;
});

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  format: jsonFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: jsonFormat,
    }),
  ],
});

if (isProduction) {
  logger.add(
    new winston.transports.Console({
      level: 'warn',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level.toUpperCase()}] ${message}`;
        }),
      ),
    }),
  );
} else {
  logger.add(
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        consoleDevFormat,
      ),
    }),
  );
}

export default logger;
