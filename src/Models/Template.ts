import File from "./File";
import Variable from "./Variable";

/**
 * Template used to generate files
 */
export interface Template {
    /**
     * Name of the template
     */
    name: string;
    /**
     * Files which will be generated
     */
    files: File[];
    /**
     * Path where the files will be created.
     * If not provided, the root folder will be used
     */
    path?: string;
    /**
     * Needed values to create the files
     */
    variables?: Variable[];
}
