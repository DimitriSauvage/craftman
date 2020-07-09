import { Template } from "../Models/Template";
import ConfigValidationError from "../Errors/ConfigValidationError";
import File from "../Models/File";
import { validateFile } from "./FileManager";

/**
 * Validate a template
 * @param templateToValidate Template to validate
 */
export const validateTemplate = async (
    templateToValidate: Template
): Promise<Template> => {
    //Make copy of the template
    const template: Template = {
        ...templateToValidate,
    };

    //Check fields
    if (!template.name || !template.files) {
        throw new ConfigValidationError(
            "Make sure all templates have name and files keys"
        );
    }
    if (
        template.files.length === undefined ||
        typeof template.files !== "object"
    ) {
        throw new ConfigValidationError(
            "Make sure templates have all the key files of type array"
        );
    }

    //Check files
    const files: File[] = [];
    for (const file of template.files) {
        files.push(await validateFile(file));
    }
    template.files = files;

    //Initialize variables
    template.variables = template.variables || [];

    return template;
};

/**
 * Get the template to use
 * @param templates Available templates
 */
export const getTemplateToUse = async (templates: Template[]) => {
    let result: Template;

    //If only one template, do not ask
    if (templates.length === 1) {
        result = templates[0];
        return;
    }
    const { name } = await ask({
        name: {
            message: "What do you want to generate ?",
            type: "choices",
            choices: templates.map((template) => template.name),
        },
    });
    currentTemplate = templates.find((template) => template.name === name);
    if (currentTemplate.files.length < 1) {
        throw new ConfigValidationError(
            "Add at least one file to your template"
        );
    }
};
