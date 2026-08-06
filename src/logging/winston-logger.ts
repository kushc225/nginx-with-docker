import { WinstonModuleOptions } from 'nest-winston';
import { format, transports } from 'winston';

export const winstonLoggerOptions: WinstonModuleOptions = {
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.Console(),
  ],
};
