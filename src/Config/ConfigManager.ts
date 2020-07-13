import fs from "fs";
import { homedir } from "os";
import { sep } from "path";
import { CONFIG_PATH, CRAFTSMAN_FOLDER } from "../constants";
import ConfigNotFoundError from "../Errors/ConfigNotFoundError";
import ConfigValidationError from "../Errors/ConfigValidationError";
import { Config } from "../Models/public/Config";
import HelperDefinition, {
    HelperFunction,
    HelperLongDeclaration,
    HelperShortcutDeclaration
} from "../Models/public/Helper";
import { Template } from "../Models/public/Template";
import { includedHelpers } from "./includedHelpers";
import { validateTemplateAsync } from "./TemplateManager";

/**Authorized helper extension */
const helperExtension = ".js";

export const getConfigAsync = async (): Promise<Config> => {
    //Get global config
    const globalConfig = await loadConfig(`${homedir()}${sep}${CONFIG_PATH}`);

    //Get local config
    const localConfig = await loadConfig(
        `${process.cwd()}${sep}${CONFIG_PATH}`
    );

    //Merge configs
    let config = await mergeConfigurationsAsync(globalConfig, localConfig);

    //Check templates
    config = await checkTemplatesAsync(config);

    //Check helpers
    config = await checkHelpersAsync(config);

    return config;
};

/**
 *
 * @param configToCheck Configuration to check
 * @param type Type
 */
const checkTemplatesAsync = async (configToCheck: Config): Promise<Config> => {
    const config: Config = {
        ...configToCheck,
    };
    //Check if the property is present
    if (
        !configToCheck.templates ||
        !Array.isArray(configToCheck.templates) ||
        configToCheck.templates.length === 0
    ) {
        throw new ConfigValidationError(
            "Template property is missing in the configuration, or should have at least one element"
        );
    }

    //CHeck the content
    const templates: Template[] = [];
    if (
        configToCheck.templates &&
        Array.isArray(configToCheck.templates) &&
        configToCheck.templates.length > 0
    ) {
        //Check templates content
        for (const template of configToCheck.templates) {
            templates.push(await validateTemplateAsync(template));
        }
        config.templates = templates;
    }
    return config;
};

/**
 * Check the helpers content
 * @param configToCheck Configuration to check
 */
const checkHelpersAsync = async (configToCheck: Config): Promise<Config> => {
    const config: Config = {
        ...configToCheck,
    };
    if (configToCheck.helpers) {
        //Result
        const helpers: HelperLongDeclaration[] = [];

        //Browse helpers to load functions
        configToCheck.helpers.forEach(
            async (helperDefinition: HelperDefinition) => {
                let helper: HelperFunction = helperDefinition as HelperFunction;
                //Change short definition in long
                if (!helper.name) {
                    const helperShortcut = helperDefinition as HelperShortcutDeclaration;
                    const objectKeys = Object.keys(helperShortcut);
                    if (objectKeys.length > 1)
                        throw new ConfigValidationError(
                            `Helper with keys ${objectKeys.join(
                                " - "
                            )} is not correct. It should have only one property.`
                        );
                    helper.name = objectKeys[0];
                    helper.path = helperShortcut[objectKeys[0]];
                }

                //Get the correct file path
                let helperPath: string;
                try {
                    let helperRelativePath =
                        helperDefinition.path && helperDefinition.path != ""
                            ? `${helperDefinition.path}/${helperDefinition.name}`
                            : helperDefinition.name;
                    if (helperRelativePath.endsWith(helperExtension))
                        helperRelativePath = helperRelativePath.replace(
                            helperExtension,
                            ""
                        );
                    helperPath = fs.realpathSync(
                        `${CRAFTSMAN_FOLDER}/${helperRelativePath}${helperExtension}`
                    );
                } catch {
                    throw new ConfigValidationError(
                        `Helper ${helperDefinition.name} not found`
                    );
                }

                //Get the function
                if (!(helperDefinition as HelperFunction).function) {
                    const helperFunction: Function = await import(helperPath);
                    if (typeof helperFunction !== "function") {
                        throw new ConfigValidationError(
                            `Make sure the ${helperDefinition.name} helper is an exported function `
                        );
                    }
                    helper.function = helperFunction;
                }

                helpers.push(helper);
                helpers.push(...includedHelpers);
            }
        );

        //Set helpers with function
        config.helpers = helpers;
    }

    return config;
};

/**
 * Load the configuration
 * @param path Config path
 */
const loadConfig = async (path: string): Promise<Config> => {
    //Check if exists
    if (!fs.existsSync(path)) {
        throw new ConfigNotFoundError(
            `The configuration does not exist at '${path}'`
        );
    }

    //Load it
    try {
        const content = await fs.promises.readFile(CONFIG_PATH, {
            encoding: "utf-8",
        });
        return JSON.parse(content) as Config;
    } catch {
        throw new ConfigValidationError();
    }
};

/**
 * Merge configurations
 * @param globalConfig Global configuration
 * @param localConfig Local configuration
 */
const mergeConfigurationsAsync = async (
    globalConfig: Config,
    localConfig: Config
): Promise<Config> => {
    let result: Config = {
        ...globalConfig,
    };

    //Templates
    if (localConfig.templates) {
        if (!result.templates) {
            result.templates = localConfig.templates;
        } else {
            localConfig.templates.forEach((template) => {
                const index = result.templates?.findIndex(
                    (x) => x.name.toUpperCase() === template.name.toUpperCase()
                );
                //Replace or add the template
                if (index && index >= 0) {
                    result.templates?.splice(index, 1, template);
                } else {
                    result.templates?.push(template);
                }
            });
        }
    }

    //Helpers
    if (localConfig.helpers) {
        if (!result.helpers) {
            result.helpers = localConfig.helpers;
        } else {
            localConfig.helpers.forEach((template) => {
                const index = result.helpers?.findIndex(
                    (x) => x.name.toUpperCase() === template.name.toUpperCase()
                );
                //Replace or add the template
                if (index && index >= 0) {
                    result.helpers?.splice(index, 1, template);
                } else {
                    result.helpers?.push(template);
                }
            });
        }
    }

    return result;
};
