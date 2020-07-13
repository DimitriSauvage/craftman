import chalk from "chalk";
import fs from "fs";
import path from "path";
import { askQuestionAsync } from "../Config/QuestionManager";
import { applyVariablesAsync } from "../Config/Utils/VariableUtils";
import { CRAFTSMAN_FOLDER } from "../constants";
import TemplateNotFoundError from "../Errors/TemplateNotFoundError";
import { Question } from "../Models/internal/Question";
import File, { ReplaceExistingFileEnum } from "../Models/public/File";
import { Template } from "../Models/public/Template";
import Variable from "../Models/public/Variable";

/**
 * Create a file
 * @param {string} filePath Path of the created file
 * @param {string} fileName Name of the created file
 * @param {string} content Content of the created file
 * @param {ReplaceExistingFileEnum} replaceExistingFile Action when the file already exists
 */
const createFileAsync = async (
    filePath: string,
    fileName: string,
    content: string,
    replaceExistingFile: ReplaceExistingFileEnum
) => {
    //Check if the file exists
    const completeFilePath = `${filePath}${path.sep}${fileName}`;
    const fileExists = fs.existsSync(filePath);
    if (fileExists && replaceExistingFile === "no") {
        console.log(
            "\n=> " + chalk.blue(filePath) + chalk.red(" already exist ! 😇")
        );
    } else {
        //Ask to the user if he wants to remove the file
        if (fileExists && replaceExistingFile === "ask") {
            if (
                await askQuestionAsync({
                    answerName: "replaceExistingFile",
                    message: `The file ${completeFilePath} already exists. Do you want to replace it ?`,
                    type: "confirm",
                } as Question<boolean>)
            ) {
                //Delete file
                fs.unlinkSync(completeFilePath);
            } else {
                return;
            }
        }

        //Create the file
        fs.mkdirSync(completeFilePath, { recursive: true });
        fs.writeFileSync(completeFilePath, content);
        console.log(
            "=> " + chalk.blue(completeFilePath) + chalk.yellow(" Done ! 🥳")
        );
    }
};

/**
 * Get the content of a template file
 * @param {string} template Template
 */
const getTemplateContentAsync = async (template: Template): Promise<string> => {
    return new Promise((resolve) => {
        const templatePath = `${CRAFTSMAN_FOLDER}${path.sep}${template.name}`;
        if (!fs.existsSync(templatePath)) {
            throw new TemplateNotFoundError(template.name);
        }
        resolve(fs.readFileSync(templatePath).toString());
    });
};

/**
 *
 * @param template Template to use for the generation
 * @param file File to generate
 * @param replaceExistingFile Choice
 * @param variables
 */
export const generateFileAsync = async (
    template: Template,
    file: File,
    replaceExistingFile: ReplaceExistingFileEnum,
    variables: Variable[]
): Promise<void> => {
    const templateToUse = { ...template } as Template;
    const filePath = file.path
        ? await applyVariablesAsync(
              variables,
              file.path,
              "File path",
              "replacement"
          )
        : "./";
    const fileName = await applyVariablesAsync(
        variables,
        file.name,
        "File name",
        "replacement"
    );
    templateToUse.name = await applyVariablesAsync(
        variables,
        templateToUse.name,
        "Template name",
        "replacement"
    );
    //Get content
    let content = await getTemplateContentAsync(templateToUse);
    content = await applyVariablesAsync(
        variables,
        content,
        "Templaten content",
        "ejs"
    );
    content = await applyVariablesAsync(
        variables,
        content,
        "Templaten content",
        "replacement"
    );
    await createFileAsync(filePath, fileName, content, replaceExistingFile);
};
