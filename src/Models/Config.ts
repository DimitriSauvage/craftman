import { Template } from "./Template";
import Helper from "./Helper";

/**
 * Craftsman configuration
 */
export default interface Config {
    /**
     * Available templates
     */
    templates: Template[];
    /**
     * Available helpers
     */
    helpers?: Helper[];
}
