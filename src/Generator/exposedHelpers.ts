import config from "../Config";

/**
 * Available helpers
 */
const helpers = {
    /**
     * Make the first letter to uppercase
     * @param {string} value to change
     */
    capitalize: (value: string) =>
        value.charAt(0).toUpperCase() + value.slice(1),

    /**
     * Change the string to uppercase
     * @param {string} value to change
     */
    uppercase: (value: string) => value.toUpperCase(),

    /**
     * Change the string to lowercase
     * @param {string} value to change
     */
    lowercase: (value: string) => value.toLowerCase(),

    /**
     * Add config helpers
     */
    ...config.exposedHelpers,
};

export default helpers;
