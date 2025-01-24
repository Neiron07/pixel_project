import { join } from "path";
import { readFile } from "fs/promises";
import { parse as yamlparse } from "yaml";
import { homedir } from "os";

const SETTINGS_PATH = join(__dirname, "../", "settings.yaml");

/**
 * Reads and parses the application's settings file (YAML format).
 * 
 * This function also computes and adds derived folder paths (`basefolder` and `uploadfolder`)
 * based on the parsed settings and the user's home directory if no base folder is specified.
 * 
 * @returns A promise that resolves to the parsed settings object.
 */
async function settings() {
  // Read the settings file
  const settings = await readFile(SETTINGS_PATH, "utf8");

  // Parse the YAML content
  const parsedSettings = yamlparse(settings);

  // Set up the folder paths
  parsedSettings.basefolder = join(parsedSettings.basefolder ?? homedir(), "localcloud");
  parsedSettings.uploadfolder = join(parsedSettings.basefolder, "data");

  return parsedSettings;
}

export default settings;
