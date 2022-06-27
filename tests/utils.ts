import { existsSync, mkdtempSync, rmdirSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const pkg = require('../package.json');
const scriptPath = resolve(__dirname, '..', pkg.bin['create-create-app']);
const TEST_PREFIX = join(tmpdir(), 'create-create-app-');

const createTempFolder = () => {
    return mkdtempSync(TEST_PREFIX);
}

const deleteTempFolder = async (dir: string) => {
    if (existsSync(dir)) {
        rmdirSync(dir, { recursive: true });
    }
}

export default {
    scriptPath,
    pkg,
    createTempFolder,
    deleteTempFolder
}
