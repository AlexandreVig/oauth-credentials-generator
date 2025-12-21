import {
  generateOAuthCredentials,
  OAuthCredentials,
  OAuthCredentialsOptions,
  EncodingFormat,
} from "../src/index";

// Example 1: Basic usage with type safety
console.log("Example 1: Basic usage with TypeScript types");
const basicCredentials: OAuthCredentials = generateOAuthCredentials();
console.log(basicCredentials);
console.log();

// Example 2: Custom prefix with typed options
console.log("Example 2: Custom prefix for production");
const prodOptions: OAuthCredentialsOptions = {
  idPrefix: "prod",
};
const prodCredentials = generateOAuthCredentials(prodOptions);
console.log(prodCredentials);
console.log();

// Example 3: Custom lengths with type inference
console.log("Example 3: Longer credentials for enhanced security");
const secureCredentials = generateOAuthCredentials({
  idPrefix: "secure",
  idLength: 32,
  secretLength: 64,
});
console.log(secureCredentials);
console.log();

// Example 4: Different encodings with type safety
console.log("Example 4: Different encoding formats");
const encodings: EncodingFormat[] = ["hex", "base64", "base64url"];
encodings.forEach((encoding) => {
  const credentials = generateOAuthCredentials({
    idPrefix: encoding,
    encoding,
  });
  console.log(`${encoding}:`, credentials);
});
console.log();

// Example 5: Generate for multiple environments with type safety
console.log("Example 5: Generate for multiple environments");
interface EnvironmentCredentials {
  [key: string]: OAuthCredentials;
}

const environments = ["dev", "staging", "prod"] as const;
const envCredentials: EnvironmentCredentials = {};

environments.forEach((env) => {
  envCredentials[env] = generateOAuthCredentials({
    idPrefix: env,
    idLength: 24,
    secretLength: 48,
  });
});

console.log(JSON.stringify(envCredentials, null, 2));
console.log();

// Example 6: Type-safe configuration
console.log("Example 6: Using configuration objects");
interface AppConfig {
  oauth: OAuthCredentials;
  environment: string;
}

function createAppConfig(env: string): AppConfig {
  return {
    environment: env,
    oauth: generateOAuthCredentials({
      idPrefix: env,
      idLength: 32,
      secretLength: 64,
      encoding: "base64url",
    }),
  };
}

const devConfig = createAppConfig("dev");
console.log("Dev Config:", devConfig);
console.log();

// Example 7: Error handling with TypeScript
console.log("Example 7: Type-safe error handling");
function generateSafeCredentials(
  options: OAuthCredentialsOptions,
): OAuthCredentials | null {
  try {
    return generateOAuthCredentials(options);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to generate credentials: ${error.message}`);
    }
    return null;
  }
}

const invalidCredentials = generateSafeCredentials({ idLength: -1 });
console.log("Invalid credentials result:", invalidCredentials);

const validCredentials = generateSafeCredentials({ idPrefix: "valid" });
console.log("Valid credentials:", validCredentials);
