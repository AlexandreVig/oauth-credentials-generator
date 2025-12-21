import * as crypto from "crypto";

/**
 * Encoding format options for random string generation
 */
export type EncodingFormat = "hex" | "base64" | "base64url";

/**
 * Options for generating OAuth credentials
 */
export interface OAuthCredentialsOptions {
  /**
   * Prefix for the OAuth ID
   * @default 'oauth'
   */
  idPrefix?: string;

  /**
   * Length of random part of ID
   * @default 24
   */
  idLength?: number;

  /**
   * Length of the secret
   * @default 48
   */
  secretLength?: number;

  /**
   * Encoding format for the credentials
   * @default 'base64url'
   */
  encoding?: EncodingFormat;
}

/**
 * Generated OAuth credentials
 */
export interface OAuthCredentials {
  /**
   * OAuth client ID with prefix
   */
  clientId: string;

  /**
   * OAuth client secret
   */
  clientSecret: string;
}

/**
 * Generate a random string using cryptographically secure random bytes
 * @param length - Length of the random string
 * @param encoding - Encoding format ('hex', 'base64', 'base64url')
 * @returns Random string
 */
export function generateRandomString(
  length: number,
  encoding: EncodingFormat = "hex",
): string {
  let bytes: number;

  if (encoding === "hex") {
    // Hex encoding: 1 byte = 2 characters
    bytes = Math.ceil(length / 2);
  } else {
    // Base64 encoding: 3 bytes = 4 characters
    // Calculate bytes needed and add extra to ensure we have enough
    bytes = Math.ceil((length * 3) / 4) + 2;
  }

  if (encoding === "base64url") {
    // Generate base64url-safe string (URL-safe, no padding)
    return crypto
      .randomBytes(bytes)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
      .substring(0, length);
  }

  return crypto.randomBytes(bytes).toString(encoding).substring(0, length);
}

/**
 * Generate OAuth credentials
 * @param options - Configuration options
 * @returns OAuth credentials with clientId and clientSecret
 * @throws {Error} If invalid options are provided
 * @example
 * ```typescript
 * import { generateOAuthCredentials } from 'oauth-credentials-generator';
 *
 * const credentials = generateOAuthCredentials({ idPrefix: 'myapp' });
 * console.log(credentials.clientId);     // myapp_abc123...
 * console.log(credentials.clientSecret); // xyz789...
 * ```
 */
export function generateOAuthCredentials(
  options: OAuthCredentialsOptions = {},
): OAuthCredentials {
  const {
    idPrefix = "oauth",
    idLength = 24,
    secretLength = 48,
    encoding = "base64url",
  } = options;

  // Validate inputs
  if (typeof idPrefix !== "string" || idPrefix.length === 0) {
    throw new Error("idPrefix must be a non-empty string");
  }

  if (!Number.isInteger(idLength) || idLength < 1) {
    throw new Error("idLength must be a positive integer");
  }

  if (!Number.isInteger(secretLength) || secretLength < 1) {
    throw new Error("secretLength must be a positive integer");
  }

  const validEncodings: EncodingFormat[] = ["hex", "base64", "base64url"];
  if (!validEncodings.includes(encoding)) {
    throw new Error("encoding must be one of: hex, base64, base64url");
  }

  const clientId = `${idPrefix}_${generateRandomString(idLength, encoding)}`;
  const clientSecret = generateRandomString(secretLength, encoding);

  return {
    clientId,
    clientSecret,
  };
}
