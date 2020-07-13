import { Template } from "./Template";
import HelperDefinition from "./Helper";

/**
 * Craftsman configuration
 */
export interface Config {
    /**
     * Available templates
     */
    templates?: Template[];
    /**
     * Available helpers
     */
    helpers?: HelperDefinition[];
    /**
     * If we have to override global conf with the local
     */
    overrideGlobalConfWithLocal?: boolean;
}
