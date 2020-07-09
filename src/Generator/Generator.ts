import fs from "fs";
import chalk from "chalk";
import { CRAFTSMAN_FOLDER, TEMPLATE_EXT } from "../constants";
import File, { ReplaceExistingFileEnum } from "../Models/File";
import path from "path";
import { askQuestionAsync } from "../Config/QuestionManager";
import { Question } from "../Models/Question";
import { Template } from "../Models/Template";
import TemplateNotFoundError from "../Errors/TemplateNotFoundError";
import Variable from "../Models/Variable";
import { applyVariablesAsync } from "../Config/Utils/VariableUtils";

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
    if (fs.existsSync(filePath)) {
        if (replaceExistingFile === "no") {
            console.log(
                "\n=> " +
                    chalk.blue(filePath) +
                    chalk.red(" already exist ! 😇")
            );
            return;
        } else {
            //Ask to the user if he wants to remove the file
            if (
                replaceExistingFile === "ask" &&
                (await askQuestionAsync({
                    answerName: "replaceExistingFile",
                    message: `The file ${completeFilePath} already exists. Do you want to replace it ?`,
                    type: "confirm",
                } as Question<boolean>))
            ) {
                fs.unlinkSync(completeFilePath);
            } else {
                return;
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
    const templatePath = `${CRAFTSMAN_FOLDER}${path.sep}${template.name}.${TEMPLATE_EXT}`;
    if (!fs.existsSync(templatePath)) {
        throw new TemplateNotFoundError(template.name);
    }
    resolve(fs.readFileSync(templatePath).toString());
   })
};

/**
 * Create a file in terms of template and variables
 * @param {string} templateName
 * @param {string} filePath
 * @param {string} fileName
 * @param {"yes"|"no"|"ask"|undefined} replaceExistingFile
 * @param {object} variables
 */
const generateFileAsync = async (
    template: Template,
    file: File,
    replaceExistingFile: ReplaceExistingFileEnum,
    variables: Variable[]
) => {
    const filePath = file.path ? await applyVariablesAsync(variables, file.path, "File path", "replacement") : "./";
    const fileName = await applyVariablesAsync(variables, file.name, "File name", "replacement");
    const templateName = await applyVariablesAsync(variables, template.name, "Template name", "replacement");
    let content = await getTemplateContentAsync(template);
    content = await applyVariablesAsync(variables, content, "Templaten content","ejs");
    content = await applyVariablesAsync(variables, content, "Templaten content","replacement");
    await createFileAsync(filePath, fileName, content, replaceExistingFile);
};
