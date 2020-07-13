import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import handleError from "./Errors/errorHandler";
import { getConfigAsync } from "./Config/ConfigManager";
import Config from "./Models/public/Config";
import { getTemplateToUseAsync } from "./Config/TemplateManager";
import {
    getVariableValuesAsync,
    applyVariablesAsync,
} from "./Config/Utils/VariableUtils";
import { conditionRespectedAsync } from "./Config/Utils/ConditionUtils";
import { generateFileAsync } from "./Generator";

export const craftsmanExecutionAsync = async (): Promise<void> => {
    try {
        //Clear the console when starting Craftsman
        clear();

        //Display the app name
        console.log(chalk.yellow(figlet.textSync("craftsman", {})));

        //Load configuration
        const config: Config = await getConfigAsync();

        //Ask for template choice
        const template = await getTemplateToUseAsync(config.templates);

        //Ask for variables values
        if (template.variables && template.variables.length > 0)
            template.variables = await getVariableValuesAsync(
                template.variables
            );

        console.log("\n");

        //File generation
        for (const file of template.files) {
            //Check condition
            let canGenerate = true;
            if (file.condition) {
                const condition = template.variables
                    ? await applyVariablesAsync(
                          template.variables,
                          file.condition,
                          "File condition",
                          "replacement"
                      )
                    : file.condition;
                canGenerate = await conditionRespectedAsync(file.condition);
            }
            //Check if the condition are checked
            if (canGenerate) {
                await generateFileAsync(template, file)
                await generateFileAsync(
                    file.model,
                    file.path,
                    file.name,
                    file.replaceExistingFile,
                    currentVariables
                );
            }
        }

        console.log(chalk.yellow("\nDone 🏆! 🚀\n"));
    } catch (e) {
        handleError(e);
    }
};
