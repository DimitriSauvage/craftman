/**
 * Shortcut declration of an helper
 */
export interface HelperShortcutDeclaration {
    /**
     * The key is the name of the helper (To be used in conditions later), and the value is the path
     */
    [name: string]: string;
}

/**
 * Long declaration of an helper
 */
export interface HelperLongDeclaration {
    /**
     * Helper name
     */
    name: string;
    /**
     * Helper file path (Optionnal. The root folder will be used)
     */
    path?: string;
}

export interface HelperFunction extends HelperLongDeclaration {
    /**
     * Function to execute
     */
    function: Function;
}

type HelperDefinition =
    | HelperLongDeclaration
    | HelperShortcutDeclaration
    | HelperFunction;
export default HelperDefinition;
