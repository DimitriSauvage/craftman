export default class ConfigNotFoundError extends Error {
    constructor(
        message: string = "Sorry but the configuration file could not be found 👀"
    ) {
        super(message);
        this.name = ConfigNotFoundError.name;
        this.message = message;
    }
}
