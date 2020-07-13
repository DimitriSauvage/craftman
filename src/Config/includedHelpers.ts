import { HelperFunction } from "../Models/public/Helper";

/**
 * Available helpers
 */
export const includedHelpers: HelperFunction[] = [
    {
        name: "capitalize",
        /**
         * Make the first letter to uppercase
         * @param {string} value to change
         */
        function: (value: string) =>
            value.charAt(0).toUpperCase() + value.slice(1),
    },
    {
        name: "uppercase",
        /**
         * Change the string to uppercase
         * @param {string} value to change
         */
        function: (value: string) => value.toUpperCase(),
    },
    {
        name: "lowercase",
        /**
         * Change the string to lowercase
         * @param {string} value to change
         */
        function: (value: string) => value.toLowerCase(),
    },
];
