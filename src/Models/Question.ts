import prompts from "prompts";
import { VariableType } from "./Variable";

/**Question type */
export type QuestionType = VariableType;

/**Question choice */
export interface QuestionChoice<TAnswer = any> extends prompts.Choice {
    value: TAnswer;
}

/**
 * Question to ask to the user
 */
export interface Question<TAnswer = any> {
    answerName: string;
    message: string;
    choices?: QuestionChoice<TAnswer>[];
    type?: QuestionType;
}
