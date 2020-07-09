import fs from "fs";
import path from "path";

/**
 * Get all files in a directory
 * @param directory Directory where search for files
 */
export const getFilesAsync = async (directory: string): Promise<string[]> => {
    if (!fs.existsSync(directory)) return [];
    const result: string[] = [];

    //Get all files in the directory
    const files: string[] = fs.readdirSync(directory);
    files.forEach(async (file) => {
        //Complete filename
        const name = directory + path.sep + file;
        if (fs.statSync(name).isDirectory()) {
            //Get subdirectory files
            result.push(...(await getFilesAsync(name)));
        } else {
            result.push(name);
        }
    });
    return result;
};

/**
 * Get all directories and subdirectories
 * @param directory Directory where search
 */
export const getDirectoriesAsync = async (
    directory: string
): Promise<string[]> => {
    if (!fs.existsSync(directory)) return [];

    const result: string[] = [];

    fs.readdirSync(directory)
        .map((x: string) => directory + path.sep + x)
        .filter((x: string) => fs.statSync(x).isDirectory())
        .forEach(async (subDir: string) => {
            result.push(subDir);
            result.push(...(await getDirectoriesAsync(subDir)));
        });
    return result;
};
