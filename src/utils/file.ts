/**
 * Get the extension of a file
 * @param filePath The path to the file
 * @returns The extension
 */
export function getFileExtension(filePath: string): string | undefined {
	return filePath.split('.').pop()?.toLowerCase();
}
