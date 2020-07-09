import inquirer, { Answers } from "inquirer";
import observe from "inquirer/lib/utils/events";

/**
 * Handle esc press inquirer
 */
export const safePrompt = async (question) => {
    //Get prompt module and configure it
    const promptModule = inquirer.createPromptModule();
    promptModule.registerPrompt(
        "autocomplete",
        require("inquirer-autocomplete-prompt")
    );

    //Instance of the prompt
    const ui = new inquirer.ui.Prompt(promptModule.prompts);
    const events = observe(ui.rl);
    return new Promise(async (resolve, reject) => {
        const keySubscription = events.keypress.subscribe((e) => {
            if (e.key.name === "escape") {
                reject(new CancelEditionError());
                ui.close();
            }
        });

        try {
            const responses: Answers = await ui.run([question]);
            keySubscription.unsubscribe();
            resolve(responses);
        } catch (e) {
            reject(e);
        }
    });
};
