import Variable from "../Models/Variable";

interface QuestionConfig {
    name: string;
    message: string;
    type: string;
    choices?: string[];
    source?: (_: any, search: string) => Promise<string[]>;
}

/**
 * Get default config of a question
 * @param {Variable} variable Variable for which get the default value
 */
const getDefaultVariableConfig = async (
    variable: Variable
): Promise<QuestionConfig> =>
    new Promise((resolve) => {
        resolve({
            name: variable.name,
            message: variable.message
                ? variable.message
                : `What is the value for ${variable.name} ?`,
            type: "input",
        });
    });

/**
 * Get config for the select question of a file or a directory
 * @param {object} variable
 * @param {"file" | "directory"} type
 */
const getFileConfig = (variable, type) => ({
    ...getDefaultVariableConfig(variable),
    type: "autocomplete",
    source: (_, fileName) =>
        new Promise((resolve) => {
            const initialPath = variable.path || ".";
            const list =
                type === "file"
                    ? getFiles(initialPath)
                    : getDirectories(initialPath);

            resolve(
                list
                    .filter(
                        (f) =>
                            !fileName ||
                            f.toLowerCase().indexOf(fileName.toLowerCase()) !=
                                -1
                    )
                    .filter((f) => {
                        if (!variable.matchRegex) return true;
                        const regexMatch = new RegExp(variable.matchRegex);
                        return regexMatch.test(f);
                    })
                    .filter(
                        (f) =>
                            !variable.matchString ||
                            f
                                .toLowerCase()
                                .indexOf(variable.matchString.toLowerCase()) !=
                                -1
                    )
                    .sort((a, b) => a.length - b.length)
            );
        }),
});

const getQuestionConfig = async (variable: Variable): Promise<void> => {
    let config: QuestionConfig = await getDefaultVariableConfig(variable);
    switch (variable.type) {
        case "text":
            break;
        case "array":
            break;
        case "file":
            break;
        case "choices":
            config.type = "list";
            config.choices = variable.choices;
            break;
        case "autocomplete":
            config.type = "autocomplete";
            config.source = (_, search) => {
                const searchRegex = new RegExp(search, "i");
                return new Promise((resolve, reject) =>
                    resolve(
                        variable.choices.filter(
                            (choice) => choice.search(searchRegex) !== -1
                        )
                    )
                );
            },
            break;
        case "directory":
            break;
    }
};
const questionsConfig = {
    /**
     * Get config for a text question
     * @param {object} variable
     */
    text: (variable) => ({
        ...getDefaultVariableConfig(variable),
        type: "input",
    }),

    /**
     * Get config for a choices question
     * @param {object} variable
     */
    choices: (variable) => ({
        ...getDefaultVariableConfig(variable),
        type: "list",
        choices: variable.choices,
    }),

    /**
     * Get config for a autocomplete question
     * @param {object} variable
     */
    autocomplete: (variable) => ({
        ...getDefaultVariableConfig(variable),
        type: "autocomplete",
        source: (_, search) => {
            const searchRegex = new RegExp(search, "i");
            return new Promise((resolve, reject) =>
                resolve(
                    variable.choices.filter(
                        (choice) => choice.search(searchRegex) !== -1
                    )
                )
            );
        },
    }),

    /**
     * Get config for a file select question
     * @param {object} variable
     */
    file: (variable) => getFileConfig(variable, "file"),

    /**
     * Get config for a directory select question
     * @param {object} variable
     */
    directory: (variable) => getFileConfig(variable, "directory"),
};

/**
 * Prompt questions and return the responses
 * @param {object} variables
 * @return {object} responses
 */
const ask = async (variables, prefixMessage) => {
    let responses = {};

    for (const variableName in variables) {
        const variable = variables[variableName];

        if (variable.type === "array") {
            if (variable.message) {
                console.log(
                    `${bold(
                        `\n${applyVariables(
                            responses,
                            variable.message,
                            "message"
                        )}`
                    )} (esc to exit loop)`
                );
            }

            let response = [];
            let index = 0;
            const defaultVariable = {
                default: {
                    type: "text",
                    message: "",
                    name: variableName,
                },
            };

            while (true) {
                try {
                    if (!variable.variables) {
                        const subResponses = await ask(
                            defaultVariable,
                            `${index}:`
                        );
                        response = [
                            ...response,
                            ...Object.keys(subResponses).map(
                                (key) => subResponses[key]
                            ),
                        ];
                    } else {
                        const subResponses = await ask(
                            variable.variables,
                            `${index}: `
                        );
                        response = [...response, subResponses];
                    }
                    index++;
                } catch (e) {
                    if (e.name !== ERRORS_NAMES.CancelEditionError) {
                        throw e;
                    }
                    console.log("\n");
                    break;
                }
            }

            responses = { ...responses, [variableName]: response };
        } else {
            const question = questionsConfig[variable.type]({
                name: variableName,
                message:
                    variable.message &&
                    applyVariables(responses, variable.message, "message"),
                ...variable,
            });

            if (prefixMessage !== undefined) {
                question.message = `${prefixMessage}${question.message}`;
            }

            let response;
            if (variable.condition) {
                response = execCondition(variable.condition, responses)
                    ? await safePrompt(question)
                    : { [question.name]: "" };
            } else response = await safePrompt(question);

            responses = { ...responses, ...response };
        }
    }
    return responses;
};

export default ask;
