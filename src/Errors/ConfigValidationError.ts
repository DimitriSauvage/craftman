export default class ConfigValidationError extends Error {
    constructor(
        message: string = "The config is not correct. Make sur that the file is in the JSON format and has no syntax error"
    ) {
        super(message);
        this.name = ConfigValidationError.name;
        this.message = message;
    }
}
