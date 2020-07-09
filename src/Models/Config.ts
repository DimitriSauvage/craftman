import { Template } from "./Template";
import HelperDefinition from "./Helper";

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
    helpers?: HelperDefinition[];
}
