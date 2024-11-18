/**
 * Throws an error if the condition is falsy.
 * @param condition The condition to check.
 * @param message The message to include in the error.
 */
export function invariant(condition: unknown, message: string): void {
	if (!condition) {
		throw new Error(message);
	}
}
