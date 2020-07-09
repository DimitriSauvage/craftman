import { Question, QuestionChoice } from "../Models/Question";
import Variable from "../Models/Variable";
import { safePromptAsync } from "./Utils/PromptUtils";

// export interface QuestionConfig {
//     name: string;
//     message: string;
//     type: QuestionType;
//     choices?: string[];
//     source?: (_: any, search: string) => Promise<string[]>;
// }

/**
 * Get default config of a question
 * @param {Variable} variable Variable for which get the default value
 */
const getDefaultQuestion = async (variable: Variable): Promise<Question> =>
    new Promise((resolve) => {
        resolve({
            answerName: variable.name,
            message: variable.message
                ? variable.message
                : `What is the value for ${variable.name} ?`,
            type: variable.type,
        });
    });

/**
 * Get the config for a variable question
 * @param variable Variable for which get the config
 */
export const getQuestionAsync = async (variable: Variable): Promise<Question> => {
    let config: Question = await getDefaultQuestion(variable);

    switch (variable.type) {
        case "select":
        case "autocomplete":
            config.choices = variable.choices.map((x) => {
                return { value: x } as QuestionChoice;
            });
            break;
    }

    return config;
};

/**
 * Ask a question and return the response
 * @param question Question to ask
 * @param prefix Prefix to add to the question
 */
export const askQuestionAsync = async <TAnswer>(
    question: Question<TAnswer>,
    prefix?: string
): Promise<TAnswer> => {
    return await safePromptAsync({
        ...question,
        message: `${prefix || ""}${question.message}`,
    });
};
