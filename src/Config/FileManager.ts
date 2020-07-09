import ConfigValidationError from "../Errors/ConfigValidationError";
import File from "../Models/File";

/**
 * Validate a file and return it with validation modifications
 * @param fileToValidate File to validate
 */
export const validateFileAsync = async (fileToValidate: File): Promise<File> => {
    //Copy of the file
    const file: File = {
        ...fileToValidate,
    };

    //Check values
    if (!file.name || !file.template) {
        throw new ConfigValidationError(
            "Make sure all files have name and template properties."
        );
    }
    file.path = file.path || "./";

    return file;
};
