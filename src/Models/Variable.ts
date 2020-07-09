/**Variable type */
export type VariableType =
    | "autocomplete"
    | "text"
    | "password"
    | "invisible"
    | "number"
    | "confirm"
    | "select"
    | "date";

/**
 * Definition of a variable
 */
interface BaseVariable {
    /**
     * Name of the variable
     */
    name: string;
    /**
     * Type of the variable
     */
    type: VariableType;
    /**
     * Message to display when asking the value
     */
    message?: string;
    /**
     * Condition to ask
     */
    condition?: string;
    /**
     * Value of the variable
     */
    value?: any;
}

/**
 * Definition of a variable which contains choices
 */
interface WithValuesVariable extends BaseVariable {
    type: "select" | "autocomplete";
    choices: string[];
}

/**
 * Definition of a date variable
 */
export interface DateVariable extends BaseVariable {
    type: "date";
}

/**
 * Definition of a confirm variable
 */
export interface TextVariable extends BaseVariable {
    type: "text";
}

/**
 * Definition of a number variable
 */
export interface NumberVariable extends BaseVariable {
    type: "number";
}

/**
 * Definition of a select variable
 */
export interface SelectVariable extends WithValuesVariable {
    type: "select";
}

/**
 * Definition of a select variable
 */
export interface ConfirmVariable extends BaseVariable {
    type: "confirm";
}

/**
 * Definition of a password variable
 */
export interface PasswordVariable extends BaseVariable {
    type: "password";
}

/**
 * Definition of an invisible variable
 */
export interface InvisibleVariable extends BaseVariable {
    type: "invisible";
}

/**
 * Define an autocomplete variable
 */
export interface AutocompleteVariable extends WithValuesVariable {
    type: "autocomplete";
}

/**
 * Variable type use in the waiting variable
 */
type Variable =
    | AutocompleteVariable
    | TextVariable
    | PasswordVariable
    | InvisibleVariable
    | NumberVariable
    | ConfirmVariable
    | SelectVariable
    | DateVariable;
export default Variable;
