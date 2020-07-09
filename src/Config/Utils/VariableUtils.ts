import ejs from "ejs";
import TemplateParserError from "../../Errors/TemplateParserError";
import { Question } from "../../Models/Question";
import Variable from "../../Models/Variable";
import { getQuestionAsync } from "../QuestionManager";
import { conditionRespectedAsync } from "./ConditionUtils";
import { safePromptAsync } from "./PromptUtils";

/**
 * Apply variables to a string
 * @param {object} variables
 * @param {string} content
 * @param {string} scope
 */
export const applyVariablesAsync = (
    variables: Variable[],
    content: string,
    scope: string,
    renderType: "ejs" | "replacement"
): Promise<string> => {
    return new Promise((resolve) => {
        let result = "";
        //Create data object
        if (renderType === "ejs") {
            try {
                const data: ejs.Data = {};
                variables.forEach((x) => {
                    data[x.name] = x.value || null;
                });
                result = ejs.render(content, data);
                //Just replace the values if there is variables without
            } catch (e) {
                throw new TemplateParserError(scope, e.message);
            }
        } else if (renderType === "replacement") {
            //Replace with variables values
            variables.forEach((variable) => {
                result = content.replace(variable.name, variable.value);
            });
        }
        resolve(result);
    });
};

/**
 * Sort variables to browse them. The first will not have any references to another
 * @param variables Variables to sort
 */
const sortVariablesAsync = async (
    variables: Variable[]
): Promise<Variable[]> => {
    return new Promise((resolve) => {
        const result: Variable[] = [];

        //Copy variables
        let toBrowseVariables: Variable[] = [...variables];

        //Get all variable names
        const variableNames = variables.map((x) => x.name);

        let index = 0;
        while (toBrowseVariables.length > 0) {
            const variable = toBrowseVariables[index];
            let hasOtherVariable = false;
            for (const variableName in variableNames) {
                if (variable.message?.includes(variableName)) {
                    hasOtherVariable = true;
                    break;
                }
            }
            if (!hasOtherVariable) {
                result.push(variable);
                toBrowseVariables = toBrowseVariables.slice(index, 1);
                index--;
            }
            //Go to the next element, or the first
            index = index >= toBrowseVariables.length - 1 ? 0 : index++;
        }

        resolve(result);
    });
};

/**
 * Ask and set the values to the variables
 * @param variables Variables for which set the values
 * @param prefixMessage Prefix to add to the displayed messages
 */
export const getVariableValuesAsync = async (
    variables: Variable[],
    prefixMessage: string = ""
): Promise<Variable[]> => {
    //Sort variables
    const toBrowseVariables = await sortVariablesAsync(variables);
    toBrowseVariables
        .filter((x) => x.value)
        .forEach(async (variable) => {
            //Create the message with the prefix
            let message = prefixMessage || "";

            //Add the message or a default
            message +=
                (variable.message &&
                    (await applyVariablesAsync(
                        variables,
                        variable.message,
                        "Variable value",
                        "replacement"
                    ))) ||
                `What is the value for the variable ${variable.name}`;

            //Get question config
            const question: Question = {
                ...(await getQuestionAsync(variable)),
                message: message,
            };

            //Check condition
            let response;
            if (
                !variable.condition ||
                conditionRespectedAsync(variable.condition)
            ) {
                response = await safePromptAsync(question);
            }

            variable.value = JSON.parse(JSON.stringify(response));
        });

    return toBrowseVariables;
};
