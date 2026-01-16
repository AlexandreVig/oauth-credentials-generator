# OAuth Credentials Generator

Generate secure OAuth client IDs and secrets with customizable prefixes using TypeScript and cryptographically secure random bytes.

[![npm version](https://badge.fury.io/js/oauth-credentials-generator.svg)](https://www.npmjs.com/package/oauth-credentials-generator)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔐 Cryptographically secure random generation
- 📘 Full TypeScript support with type definitions
- 🎨 Customizable prefixes for client IDs
- ⚙️ Configurable ID and secret lengths
- 🔤 Multiple encoding formats (hex, base64, base64url)
- 📦 Works as both CLI tool and Node.js module
- ✅ Input validation with type safety
- 🚀 Zero runtime dependencies
- 🧪 Comprehensive test coverage

## Installation

```bash
npm install oauth-credentials-generator
```

Or install globally for CLI usage:

```bash
npm install -g oauth-credentials-generator
```

## Usage

### As a TypeScript/JavaScript Module

```typescript
import {
  generateOAuthCredentials,
  OAuthCredentials,
} from "oauth-credentials-generator";

// Basic usage with type inference
const credentials = generateOAuthCredentials();
console.log(credentials);
// {
//   clientId: 'oauth_Kx9dP2mNvQ7rLwE3',
//   clientSecret: 'tZ8yH4jU6nB1qA5sD9fG7kL0pM3xC2wV'
// }

// With custom options and explicit typing
const prodCredentials: OAuthCredentials = generateOAuthCredentials({
  idPrefix: "prod",
  idLength: 32,
  secretLength: 64,
  encoding: "base64url",
});
```

### As a CLI Tool

```bash
# Basic usage (default prefix: 'oauth')
generate-oauth

# With custom prefix
generate-oauth --prefix myapp

# With all options
generate-oauth --prefix prod --id-length 32 --secret-length 64

# JSON output
generate-oauth --json

# Different encoding
generate-oauth --encoding hex
```

## API

### Types

#### `EncodingFormat`

```typescript
type EncodingFormat = "hex" | "base64" | "base64url";
```

#### `OAuthCredentialsOptions`

```typescript
interface OAuthCredentialsOptions {
  /** Prefix for the OAuth ID (default: 'oauth') */
  idPrefix?: string;

  /** Length of random part of ID (default: 24) */
  idLength?: number;

  /** Length of the secret (default: 48) */
  secretLength?: number;

  /** Encoding format for the credentials (default: 'base64url') */
  encoding?: EncodingFormat;
}
```

#### `OAuthCredentials`

```typescript
interface OAuthCredentials {
  /** OAuth client ID with prefix */
  clientId: string;

  /** OAuth client secret */
  clientSecret: string;
}
```

### Functions

#### `generateOAuthCredentials(options?)`

Generates OAuth client credentials with type safety.

**Parameters:**

- `options` (`OAuthCredentialsOptions`, optional) - Configuration options

**Returns:**

- `OAuthCredentials` - Object with clientId and clientSecret

**Throws:**

- `Error` - If invalid options are provided

**Example:**

```typescript
import {
  generateOAuthCredentials,
  OAuthCredentialsOptions,
} from "oauth-credentials-generator";

const options: OAuthCredentialsOptions = {
  idPrefix: "myapp",
  idLength: 24,
  secretLength: 48,
  encoding: "base64url",
};

const credentials = generateOAuthCredentials(options);
```

#### `generateRandomString(length, encoding?)`

Generate a cryptographically secure random string.

**Parameters:**

- `length` (`number`) - Length of the string
- `encoding` (`EncodingFormat`, optional) - Encoding format (default: `'hex'`)

**Returns:**

- `string` - Random string of specified length

**Example:**

```typescript
import { generateRandomString } from "oauth-credentials-generator";

const randomHex = generateRandomString(32, "hex");
const randomBase64 = generateRandomString(32, "base64url");
```

## TypeScript Examples

### Basic Usage

```typescript
import { generateOAuthCredentials } from "oauth-credentials-generator";

const credentials = generateOAuthCredentials({ idPrefix: "myapp" });
console.log(credentials.clientId); // myapp_abc123...
console.log(credentials.clientSecret); // xyz789...
```

### With Type Annotations

```typescript
import {
  generateOAuthCredentials,
  OAuthCredentials,
  OAuthCredentialsOptions,
} from "oauth-credentials-generator";

const options: OAuthCredentialsOptions = {
  idPrefix: "prod",
  idLength: 32,
  secretLength: 64,
  encoding: "hex",
};

const credentials: OAuthCredentials = generateOAuthCredentials(options);
```

### Environment Configuration

```typescript
import {
  generateOAuthCredentials,
  OAuthCredentials,
} from "oauth-credentials-generator";

interface EnvironmentConfig {
  environment: string;
  oauth: OAuthCredentials;
}

function createEnvConfig(env: string): EnvironmentConfig {
  return {
    environment: env,
    oauth: generateOAuthCredentials({
      idPrefix: env,
      idLength: 32,
      secretLength: 64,
    }),
  };
}

const devConfig = createEnvConfig("dev");
const prodConfig = createEnvConfig("prod");
```

### Error Handling with Types

```typescript
import {
  generateOAuthCredentials,
  OAuthCredentials,
} from "oauth-credentials-generator";

function generateSafeCredentials(prefix: string): OAuthCredentials | null {
  try {
    return generateOAuthCredentials({ idPrefix: prefix });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to generate credentials: ${error.message}`);
    }
    return null;
  }
}
```

### Express.js Integration with TypeScript

```typescript
import express, { Request, Response } from "express";
import {
  generateOAuthCredentials,
  OAuthCredentials,
} from "oauth-credentials-generator";

const app = express();

interface GenerateRequest {
  prefix?: string;
  idLength?: number;
  secretLength?: number;
}

app.post(
  "/admin/generate-oauth",
  (req: Request<{}, {}, GenerateRequest>, res: Response) => {
    try {
      const credentials: OAuthCredentials = generateOAuthCredentials({
        idPrefix: req.body.prefix || "oauth",
        idLength: req.body.idLength || 32,
        secretLength: req.body.secretLength || 64,
      });

      res.json(credentials);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check without emitting
npm run typecheck
```

### Project Structure

```
├── src/              # TypeScript source files
│   └── index.ts
├── bin/              # CLI source files
│   └── generate-oauth.ts
├── lib/              # Compiled JavaScript (generated)
│   ├── src/
│   │   ├── index.js
│   │   ├── index.d.ts
│   │   └── index.js.map
│   └── bin/
├── test/             # Test files
│   └── index.test.ts
├── examples/         # TypeScript examples
│   └── basic-usage.ts
├── tsconfig.json     # TypeScript configuration
├── jest.config.js    # Jest configuration
└── package.json      # Package metadata
```

### Build Process

The package uses TypeScript compiler to transpile `.ts` files to JavaScript:

1. Source files in `src/` and `bin/` are written in TypeScript
2. `npm run build` compiles them to `lib/` directory
3. Type definitions (`.d.ts`) are generated automatically
4. The compiled JavaScript in `lib/` is what gets published to npm

### Publishing

```bash
# Build the project
npm run build

# Run tests
npm test

# Update version (also runs build and test)
npm version patch  # or minor, major

# Publish to npm
npm publish
```

## CLI Options

| Option            | Alias | Description                            | Default       |
| ----------------- | ----- | -------------------------------------- | ------------- |
| `--prefix`        | `-p`  | Prefix for OAuth ID                    | `'oauth'`     |
| `--id-length`     |       | Length of random part of ID            | `24`          |
| `--secret-length` |       | Length of secret                       | `48`          |
| `--encoding`      |       | Encoding format (hex/base64/base64url) | `'base64url'` |
| `--json`          |       | Output as JSON                         | `false`       |
| `--help`          | `-h`  | Show help message                      |               |
| `--version`       | `-v`  | Show version number                    |               |

## Security Best Practices

1. **Never commit credentials to version control**
2. **Store secrets securely** (use vault services)
3. **Rotate credentials regularly**
4. **Use HTTPS** for transmission
5. **Monitor usage** and set up alerts

## TypeScript Configuration

The package includes full TypeScript support:

- **Strict mode enabled** for maximum type safety
- **Declaration files** (`.d.ts`) generated automatically
- **Source maps** for debugging
- **CommonJS output** for Node.js compatibility

## Requirements

- Node.js >= 14.0.0
- TypeScript >= 5.0.0 (for development)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/AlexandreVig/oauth-credentials-generator/issues).
