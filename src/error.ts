export function createError(message: string): Error;
export function createError(error: Error): Error;
export function createError(props: { error: Error; message: string }): Error;
export function createError(
	arg: string | Error | { error: Error; message: string },
): Error {
	if (typeof arg === "string") {
		// If arg is a string
		return new Error(arg);
	}
	if (arg instanceof Error) {
		// If arg is an Error object
		return new Error(arg.message, { cause: arg });
	}
	// Assuming arg is an object with error and message properties
	return new Error(arg.message, { cause: arg.error });
}
