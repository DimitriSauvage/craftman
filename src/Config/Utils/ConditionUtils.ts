
/**
 * Execute a condition
 * @param condition Condition to execute
 */
export const conditionRespectedAsync = async (
    condition: string
): Promise<boolean> => {
    return new Promise((resolve) => {
        resolve(!!new Function(`return ${condition}`)());
    });
};
