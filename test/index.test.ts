import {
  generateOAuthCredentials,
  generateRandomString,
  EncodingFormat,
  OAuthCredentials,
  OAuthCredentialsOptions,
} from "../src/index";

describe("generateRandomString", () => {
  test("generates string of correct length", () => {
    const result = generateRandomString(32, "hex");
    expect(result).toHaveLength(32);
  });

  test("generates different strings on each call", () => {
    const result1 = generateRandomString(32);
    const result2 = generateRandomString(32);
    expect(result1).not.toBe(result2);
  });

  test("supports hex encoding", () => {
    const result = generateRandomString(32, "hex");
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  test("supports base64url encoding", () => {
    const result = generateRandomString(32, "base64url");
    // base64url should not contain +, /, or =
    expect(/^[A-Za-z0-9_-]+$/.test(result)).toBe(true);
  });

  test("supports base64 encoding", () => {
    const result = generateRandomString(32, "base64");
    // base64 can contain +, /, and =
    expect(/^[A-Za-z0-9+/]+={0,2}$/.test(result)).toBe(true);
  });
});

describe("generateOAuthCredentials", () => {
  test("generates credentials with default options", () => {
    const credentials: OAuthCredentials = generateOAuthCredentials();

    expect(credentials).toHaveProperty("clientId");
    expect(credentials).toHaveProperty("clientSecret");
    expect(credentials.clientId).toMatch(/^oauth_/);
  });

  test("uses custom prefix", () => {
    const credentials = generateOAuthCredentials({ idPrefix: "myapp" });
    expect(credentials.clientId).toMatch(/^myapp_/);
  });

  test("generates unique credentials each time", () => {
    const creds1 = generateOAuthCredentials();
    const creds2 = generateOAuthCredentials();

    expect(creds1.clientId).not.toBe(creds2.clientId);
    expect(creds1.clientSecret).not.toBe(creds2.clientSecret);
  });

  test("respects idLength option", () => {
    const credentials = generateOAuthCredentials({
      idPrefix: "test",
      idLength: 16,
    });
    // Total length should be prefix (4) + underscore (1) + idLength (16) = 21
    expect(credentials.clientId.length).toBe(21);
  });

  test("respects secretLength option", () => {
    const credentials = generateOAuthCredentials({ secretLength: 32 });
    expect(credentials.clientSecret.length).toBe(32);
  });

  test("validates idPrefix", () => {
    expect(() => generateOAuthCredentials({ idPrefix: "" })).toThrow(
      "idPrefix must be a non-empty string"
    );
  });

  test("validates idLength", () => {
    expect(() => generateOAuthCredentials({ idLength: 0 })).toThrow(
      "idLength must be a positive integer"
    );

    expect(() => generateOAuthCredentials({ idLength: -1 })).toThrow(
      "idLength must be a positive integer"
    );

    expect(() => generateOAuthCredentials({ idLength: 1.5 as number })).toThrow(
      "idLength must be a positive integer"
    );
  });

  test("validates secretLength", () => {
    expect(() => generateOAuthCredentials({ secretLength: 0 })).toThrow(
      "secretLength must be a positive integer"
    );
  });

  test("validates encoding", () => {
    expect(() =>
      generateOAuthCredentials({ encoding: "invalid" as EncodingFormat })
    ).toThrow("encoding must be one of: hex, base64, base64url");
  });

  test("uses hex encoding correctly", () => {
    const credentials = generateOAuthCredentials({
      encoding: "hex",
      idLength: 32,
      secretLength: 32,
    });

    const idPart = credentials.clientId.split("_")[1];
    expect(/^[0-9a-f]+$/.test(idPart)).toBe(true);
    expect(/^[0-9a-f]+$/.test(credentials.clientSecret)).toBe(true);
  });

  test("uses base64url encoding correctly", () => {
    const credentials = generateOAuthCredentials({
      encoding: "base64url",
      idLength: 32,
      secretLength: 32,
    });

    const idPart = credentials.clientId.split("_")[1];
    expect(/^[A-Za-z0-9_-]+$/.test(idPart)).toBe(true);
    expect(/^[A-Za-z0-9_-]+$/.test(credentials.clientSecret)).toBe(true);
  });

  test("type checking: accepts valid options", () => {
    const options: OAuthCredentialsOptions = {
      idPrefix: "test",
      idLength: 24,
      secretLength: 48,
      encoding: "base64url",
    };

    const credentials = generateOAuthCredentials(options);
    expect(credentials.clientId).toMatch(/^test_/);
  });

  test("returns correctly typed credentials", () => {
    const credentials: OAuthCredentials = generateOAuthCredentials();

    // TypeScript ensures these properties exist
    const clientId: string = credentials.clientId;
    const clientSecret: string = credentials.clientSecret;

    expect(typeof clientId).toBe("string");
    expect(typeof clientSecret).toBe("string");
  });
});

describe("Type exports", () => {
  test("EncodingFormat type is correct", () => {
    const validEncodings: EncodingFormat[] = ["hex", "base64", "base64url"];
    expect(validEncodings).toHaveLength(3);
  });

  test("OAuthCredentialsOptions has correct shape", () => {
    const options: OAuthCredentialsOptions = {
      idPrefix: "test",
      idLength: 24,
      secretLength: 48,
      encoding: "hex",
    };

    expect(options).toBeDefined();
  });

  test("OAuthCredentials has correct shape", () => {
    const credentials: OAuthCredentials = {
      clientId: "test_abc123",
      clientSecret: "secret123",
    };

    expect(credentials.clientId).toBe("test_abc123");
    expect(credentials.clientSecret).toBe("secret123");
  });
});
