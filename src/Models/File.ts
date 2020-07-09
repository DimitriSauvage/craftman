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
     * Template file name, without extension
     */
    template: string;
    /**
     * If the CLI should replace the file or not if it already exists, by default this parameter by default this parameter is set to "ask"
     */
    replaceExistingFile?: "yes" | "no" | "ask";
    /**
     * To condition to met to generate the file
     */
    condition?: string;
}
