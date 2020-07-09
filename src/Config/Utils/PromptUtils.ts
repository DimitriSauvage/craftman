import prompts from "prompts";
import { Question } from "../../Models/Question";

/**
 * Ask a question with the availability to cancel
 * @param question Question to answer
 */
export const safePromptAsync = async <TAnswer>(
    question: Question<TAnswer>
): Promise<TAnswer> => {
    const result = await prompts(
        await mapQuestionToPrompsObjectAsync(question as Question<TAnswer>)
    );

    //Return the answer because we have just one question
    return result[question.answerName] as TAnswer;
};

/**
 * Ask multiple questions
 * @param questions Questions to answer
 */
export const safePromptsAsync = async <TAnswer>(
    questions: Array<Question<TAnswer>>
): Promise<{ [key: string]: TAnswer }> => {
    const questionsArray = questions as Array<Question<TAnswer>>;
    const promptObjectArray = await Promise.all(
        questionsArray.map(async (question) =>
            mapQuestionToPrompsObjectAsync(question)
        )
    );
    return await prompts(promptObjectArray);
};

/**
 * Map a question to a prompt object
 * @param question Question to map
 */
const mapQuestionToPrompsObjectAsync = async <TAnswer>(
    question: Question<TAnswer>
): Promise<prompts.PromptObject> =>
    new Promise<prompts.PromptObject>((resolve) => {
        resolve({
            name: question.answerName,
            type: question.type || "text",
            choices: question.choices,
            message: question.message,
        });
    });
