import CancelEditionError from "./CancelEditionError";
import ConfigNotFoundError from "./ConfigNotFoundError";
import ConfigValidationError from "./ConfigValidationError";
import TemplateNotFoundError from "./TemplateNotFoundError";
import TemplateParserError from "./TemplateParserError";
const chalk = require("chalk");

/**
 * Errors than can be thrown by the application (Voluntary)
 */
const ERRORS_NAMES = {
    ConfigNotFoundError: ConfigNotFoundError.name,
    ConfigValidationError: ConfigValidationError.name,
    TemplateNotFoundError: TemplateNotFoundError.name,
    TemplateParserError: TemplateParserError.name,
    CancelEditionError: CancelEditionError.name,
};

/**
 * Handle an application error
 * @param error Error to handle
 */
const handleError = (error: Error): void => {
    if (error.name === CancelEditionError.name) {
        process.exit();
    }
    if (error.name in ERRORS_NAMES) {
        console.error(chalk.red(error.message) + "\n");
        return;
    }
    throw error;
};

export default handleError;
