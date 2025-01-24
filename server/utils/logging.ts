import chalk from "chalk";
import { Enums } from "../types/exporter";

export default class Logging {

  /**
   * General-purpose logging function.
   * @param level Log level (info, warn, error).
   * @param apitype The type of HTTP action (e.g., GET, POST), or "GENERAL" for non-HTTP actions.
   * @param message The message to log.
   */
  static log(
    level: keyof typeof Enums.LogLevel, // Using LogLevel from Enums
    apitype: keyof typeof Enums.HttpRequestTypes | "GENERAL", // HTTP request type or general
    message: string
  ) {
    const colorMap = {
      [Enums.LogLevel.INFO]: chalk.green,
      [Enums.LogLevel.WARN]: chalk.yellowBright,
      [Enums.LogLevel.ERROR]: chalk.redBright,
    };

    const color = colorMap[level] || chalk.white;
    const prefix = apitype === "GENERAL" ? "[GENERAL]" : `[${Enums.HttpRequestTypes[apitype].toUpperCase()}]`;

    console.log(color(`[${Enums.LogLevel[level]}] ${prefix} ${message}`));
  }

  /**
   * Logs a successful operation.
   * @param apitype The type of HTTP action, or "GENERAL" for non-HTTP actions.
   * @param message The success message.
   */
  static success(apitype: keyof typeof Enums.HttpRequestTypes | "GENERAL", message: string) {
    this.log(Enums.LogLevel.INFO, apitype, message);
  }

  /**
   * Logs a warning.
   * @param apitype The type of HTTP action, or "GENERAL" for non-HTTP actions.
   * @param message The warning message.
   */
  static warn(apitype: keyof typeof Enums.HttpRequestTypes | "GENERAL", message: string) {
    this.log(Enums.LogLevel.WARN, apitype, message);
  }

  /**
   * Logs an error.
   * @param apitype The type of HTTP action, or "GENERAL" for non-HTTP actions.
   * @param message The error message.
   * @param error Optional error object for detailed logging.
   */
  static error(
    apitype: keyof typeof Enums.HttpRequestTypes | "GENERAL",
    message: string,
    error?: any
  ) {
    this.log(Enums.LogLevel.ERROR, apitype, message);
    if (error) {
      console.error(chalk.redBright(`Detailed Error: ${error.stack || error.message || error}`));
    }
  }

  /**
   * Logs general (non-HTTP) messages.
   * @param level Log level (info, warn, error).
   * @param message The message to log.
   */
  static general(level: keyof typeof Enums.LogLevel, message: string) {
    this.log(level, "GENERAL", message);
  }
}
