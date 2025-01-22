// get the settings
import _settings from "./settings";
const settings = _settings();

import * as fs from "fs/promises";

import * as path from "path";

const categoryFolders = ["documents"];

async function createStorageFolders() {
    const baseFolder = (await settings).basefolder;
    const dataFolder = path.join(baseFolder, "data");

    // create the folders if they don't exist
    const dataFolderExists = await fs
        .access(dataFolder)
        .then(() => true)
        .catch(() => false);

    if (!dataFolderExists) {
        await fs.mkdir(dataFolder, { recursive: true });
    }

    // create the category folders
    for (const category of categoryFolders) {
        const categoryFolder = path.join(dataFolder, category);
        const categoryFolderExists = await fs
            .access(categoryFolder)
            .then(() => true)
            .catch(() => false);
        if (!categoryFolderExists) {
            await fs.mkdir(categoryFolder, { recursive: true });
        }
    }
}

export default createStorageFolders;
