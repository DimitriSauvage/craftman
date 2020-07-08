/**
 * Definition of a variable
 */
interface BaseVariable {
    name: string;
    type: "text" | "choices" | "autocomplete" | "file" | "directory" | "array";
    message?: string;
    condition?: string;
}

/**
 * Definition of a variable which contains choices
 */
interface WithValuesVariable extends BaseVariable {
    type: "choices" | "autocomplete";
    choices: string[];
}

/**
 * File or directory variable
 */
interface FileDirectoryVariable extends BaseVariable {
    /**
     * Type of the file (File or folder)
     */
    type: "file" | "directory";
    /**
     * Path where search the file or the directory
     */
    path?: string;
}

/**
 * Definition of a text variable
 */
export interface TextVariable extends BaseVariable {
    type: "text";
}

/**
 * Definition of a text variable
 */
export interface ArrayVariable extends BaseVariable {
    type: "array";
}

/**
 * Define a choices variable
 */
export interface ChoicesVariable extends WithValuesVariable {
    type: "choices";
}

/**
 * Define an autocomplete variable
 */
export interface AutocompleteVariable extends WithValuesVariable {
    type: "autocomplete";
}

/**
 * File variable
 */
export interface FileVariable extends FileDirectoryVariable {
    type: "file";
}

/**
 * Directory variable
 */
export interface DirectoryVariable extends FileDirectoryVariable {
    type: "directory";
}

/**
 * Variable which will search in files wich contains a parameter in his name
 */
export interface WithStringMatchFileVariable extends FileVariable {
    /**
     * Filter files to show only those that contains this string in their path
     */
    matchString: string;
}

/**
 * Variable which will search in files wich name match with the regex
 */
export interface WithRegexMatchFileVariable extends FileVariable {
    /**
     * Filter files to show only those that contains this string in their path
     */
    matchRegex: RegExp | string;
}

/**
 * Variable type use in the waiting variable
 */
type Variable =
    | TextVariable
    | ArrayVariable
    | WithRegexMatchFileVariable
    | WithStringMatchFileVariable
    | ChoicesVariable
    | AutocompleteVariable
    | FileVariable
    | DirectoryVariable;

export default Variable;
