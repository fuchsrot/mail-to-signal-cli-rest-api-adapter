import winston, { format } from "winston";

const customFormat = format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    customFormat,
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
