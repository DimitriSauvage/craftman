import fs from "fs";
import { CONFIG_PATH, CRAFTSMAN_FOLDER } from "../constants";
import ConfigNotFoundError from "../Errors/ConfigNotFoundError";
import ConfigValidationError from "../Errors/ConfigValidationError";
import Config from "../Models/public/Config";
import { includedHelpers } from "./includedHelpers";
import { validateTemplateAsync } from "./TemplateManager";
import { Template } from "../Models/public/Template";
import HelperDefinition, { HelperLongDeclaration, HelperFunction, HelperShortcutDeclaration } from "../Models/public/Helper";

const ask = require("./ask").default;

/**Authorized helper extension */
const helperExtension = ".js";

/**
 * Get the configuration
 */
export const getConfigAsync = async (): Promise<Config> => {
    //Check if the config file exists
    if (!fs.existsSync(CONFIG_PATH)) throw new ConfigNotFoundError();

    //Load config
    let config: Config;
    try {
        const content = await fs.promises.readFile(CONFIG_PATH, {
            encoding: "utf-8",
        });
        config = JSON.parse(content);
    } catch {
        throw new ConfigValidationError();
    }

    //Check config content
    if (
        !config ||
        !config.templates ||
        config.templates.length == 0 ||
        typeof config.templates != typeof {}
    ) {
        throw new ConfigValidationError(
            "The config file has no template. Please add an array with at least one template"
        );
    }

    //Check templates content
    const templates: Template[] = [];
    for (const template of config.templates) {
        templates.push(await validateTemplateAsync(template));
    }
    config.templates = templates;

    //Check helpers
    if (config.helpers) {
        //Result
        const helpers: HelperLongDeclaration[] = [];

        //Browse helpers to load functions
        config.helpers.forEach(async (helperDefinition: HelperDefinition) => {
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
        });

        //Set helpers with function
        config.helpers = helpers.concat();
    }

    return config;
};

// class _Config {
//     templates;
//     exposedHelpers = {};
//     currentTemplate;
//     currentVariables;

//     // async askForTemplate() {
//     //     if (this.templates.length === 1) {
//     //         this.currentTemplate = this.templates[0];
//     //         return;
//     //     }

//     //     const { name } = await ask({
//     //         name: {
//     //             message: "What do you want to generate ?",
//     //             type: "choices",
//     //             choices: this.templates.map((template) => template.name),
//     //         },
//     //     });

//     //     this.currentTemplate = this.templates.find(
//     //         (template) => template.name === name
//     //     );

//     //     if (this.currentTemplate.files.length < 1) {
//     //         throw new ConfigValidationError(
//     //             "Add at least one file to your template"
//     //         );
//     //     }
//     // }

//     async askForVariables() {
//         const { variables } = this.currentTemplate;
//         this.currentVariables = await ask(variables);
//     }

//     fetchConfig() {
//         if (this.templates !== undefined) return;

//         if (!fs.existsSync(CONFIG_PATH)) throw new ConfigNotFoundError();

//         let configContent;
//         try {
//             configContent = fs.readFileSync(CONFIG_PATH).toString();
//             configContent = JSON.parse(configContent);
//         } catch {
//             throw new ConfigValidationError(
//                 "Make sure the configuration file is in the JSON format"
//             );
//         }
//         if (configContent.templates === undefined)
//             throw new ConfigValidationError(
//                 "Make sure the configuration file has the key templates"
//             );
//         if (
//             configContent.templates.length === undefined ||
//             typeof configContent.templates !== "object"
//         ) {
//             throw new ConfigValidationError(
//                 "Make sure the key templates is an array"
//             );
//         }
//         if (configContent.templates.length < 1) {
//             throw new ConfigValidationError(
//                 "Add templates to the configuration file"
//             );
//         }
//         for (const template of configContent.templates) {
//             if (template.name === undefined || template.files === undefined) {
//                 throw new ConfigValidationError(
//                     "Make sure templates have all the keys name and files"
//                 );
//             }
//             if (
//                 template.files.length === undefined ||
//                 typeof template.files !== "object"
//             ) {
//                 throw new ConfigValidationError(
//                     "Make sure templates have all the key files of type array"
//                 );
//             }
//             for (const file of template.files) {
//                 if (
//                     (!file.path && !template.path) ||
//                     !file.name ||
//                     !file.template
//                 ) {
//                     throw new ConfigValidationError(
//                         "Make sure files have all the keys path name and template"
//                     );
//                 }
//                 file.path = file.path || template.path;
//             }
//             if (!template.variables) {
//                 template.variables = {};
//             }
//         }

//         if (configContent.helpers) {
//             Object.keys(configContent.helpers).forEach((helperName) => {
//                 let helperPath;
//                 try {
//                     helperPath = fs.realpathSync(
//                         `${CRAFTSMAN_FOLDER}/${configContent.helpers[helperName]}.js`
//                     );
//                 } catch {
//                     throw new ConfigValidationError(
//                         `helper ${helperName} helper not found`
//                     );
//                 }

//                 const helper = require(helperPath);
//                 if (typeof helper !== "function") {
//                     throw new ConfigValidationError(
//                         `Make sure the ${helperName} helper is a function`
//                     );
//                 }
//                 this.exposedHelpers[helperName] = helper;
//             });
//         }

//         this.templates = configContent.templates;
//     }
// }
