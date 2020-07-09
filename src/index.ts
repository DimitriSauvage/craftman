import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import handleError from "./Errors/errorHandler";
import { getConfig } from "./Config/ConfigManager";
import Config from "./Models/Config";

const craftsmanExecution = async (): Promise<void> => {
    try {
        //Clear the console when starting Craftsman
        clear();

        //Display the app name
        console.log(chalk.yellow(figlet.textSync("craftsman", {})));

        //Load configuration
        const config: Config = await getConfig();

        //Ask for template choice
        await getTemplateToUse();
        await askForTemplate();

        //Ask for variables values
        await askForVariables();

        console.log("\n");

        //File generation
        for (const file of currentTemplate.files) {
            //Check if the condition are checked
            if (
                !file.condition ||
                (file.condition &&
                    execCondition(file.condition, currentVariables))
            ) {
                await generateFile(
                    file.template,
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
