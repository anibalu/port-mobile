/**
 * Represents a large file with its properties.
 * @interface
 * @property {string} fileUri - The URI (Uniform Resource Identifier) of the large file.
 * @property {string} fileType - The MIME type of the large file.
 * @property {string} fileName - The name of the large file.
 */
export interface FileAttributes {
  fileUri: string;
  fileType: string;
  fileName: string;
}
