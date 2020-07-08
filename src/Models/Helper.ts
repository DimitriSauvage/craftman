/**
 * Shortcut declration of an helper
 */
export interface HelperSortcut {
    /**
     * The key is the name of the helper (To be used in conditions later), and the value is the path
     */
    [name: string]: string;
}

/**
 * Long declaration of an helper
 */
export interface HelperLongDeclaration {
    name: string;
    path: string;
}

type Helper = HelperLongDeclaration | HelperSortcut;
export default Helper;
