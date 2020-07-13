/**Available values to know what we have to do when a file already exists */
export type ReplaceExistingFileEnum = "yes" | "no" | "ask";

/**
 * File to generate
 */
export default interface File {
    /**
     * Destination of the generated file
     * If not provided, the current folder will be the defined path in the template.
     */
    path?: string;
    /**
     * Name of the generated file
     */
    name: string;
    /**
     * Model file name
     */
    model: string;
    /**
     * If the CLI should replace the file or not if it already exists, by default this parameter by default this parameter is set to "ask"
     */
    replaceExistingFile?: ReplaceExistingFileEnum;
    /**
     * Condition to met to generate the file
     */
    condition?: string;
}
