import { Template } from "../Models/Template";
import ConfigValidationError from "../Errors/ConfigValidationError";
import File from "../Models/File";
import { validateFileAsync } from "./FileManager";
import { askQuestionAsync } from "./QuestionManager";
import { QuestionChoice } from "../Models/Question";

/**
 * Validate a template
 * @param templateToValidate Template to validate
 */
export const validateTemplateAsync = async (
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
        files.push(await validateFileAsync(file));
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
export const getTemplateToUseAsync = async (templates: Template[]) => {
    const answerName = "templateToUse";
    let result: Template;

    //If only one template, do not ask
    if (templates.length === 1) {
        result = templates[0];
    } else {
        //Create choices for templates
        const availableChoices: QuestionChoice<Template>[] = templates.map(
            (template: Template, index: number) => {
                return {
                    title: template.name,
                    value: template,
                    description: template.name,
                    selected: index == 0,
                };
            }
        );

        //Ask the question
        result = await askQuestionAsync<Template>({
            answerName: answerName,
            message: "Which template do you want to use ?",
            type: "select",
            choices: availableChoices,
        });
    }

    return result;
};
