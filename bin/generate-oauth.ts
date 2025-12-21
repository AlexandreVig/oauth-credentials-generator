#!/usr/bin/env node

import {
  generateOAuthCredentials,
  OAuthCredentialsOptions,
} from "../src/index";
import * as fs from "fs";
import * as path from "path";

interface CliOptions extends OAuthCredentialsOptions {
  json?: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--prefix":
      case "-p":
        options.idPrefix = args[++i];
        break;
      case "--id-length":
        options.idLength = parseInt(args[++i], 10);
        break;
      case "--secret-length":
        options.secretLength = parseInt(args[++i], 10);
        break;
      case "--encoding":
        options.encoding = args[++i] as "hex" | "base64" | "base64url";
        break;
      case "--json":
        options.json = true;
        break;
      case "--help":
      case "-h":
        showHelp();
        process.exit(0);
        break;
      case "--version":
      case "-v":
        showVersion();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        console.log("Use --help for usage information");
        process.exit(1);
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
Usage: generate-oauth [options]

Options:
  -p, --prefix <string>          Prefix for OAuth ID (default: 'oauth')
  --id-length <number>           Length of random part of ID (default: 24)
  --secret-length <number>       Length of secret (default: 48)
  --encoding <string>            Encoding format: 'hex', 'base64', 'base64url' (default: 'base64url')
  --json                         Output as JSON
  -h, --help                     Show this help message
  -v, --version                  Show version number

Examples:
  generate-oauth
  generate-oauth --prefix myapp
  generate-oauth --prefix prod --id-length 32 --secret-length 64
  generate-oauth --encoding hex --json
  `);
}

/**
 * Show version
 */
function showVersion(): void {
  try {
    const packageJsonPath = path.join(__dirname, "../..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    console.log(packageJson.version);
  } catch {
    // Ignore errors - just show fallback message
    console.log("Version information not available");
  }
}

/**
 * Main CLI function
 */
function main(): void {
  try {
    const args = process.argv.slice(2);
    const { json, ...generatorOptions } = parseArgs(args);

    const credentials = generateOAuthCredentials(generatorOptions);

    if (json) {
      console.log(JSON.stringify(credentials, null, 2));
    } else {
      console.log("\n🔐 OAuth Credentials Generated:\n");
      console.log(`Client ID:     ${credentials.clientId}`);
      console.log(`Client Secret: ${credentials.clientSecret}`);
      console.log(
        "\n⚠️  Store these securely! The secret should never be committed to version control.\n",
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }
    process.exit(1);
  }
}

// Run CLI
main();
