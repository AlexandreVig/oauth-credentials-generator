import { execSync, spawn } from "child_process";
import * as path from "path";
import { describe, test, expect } from "@jest/globals";

// Path to the compiled CLI
const CLI_PATH = path.join(__dirname, "../lib/bin/generate-oauth.js");

/**
 * Execute CLI and return output
 */
function runCLI(args: string[] = []): {
  stdout: string;
  stderr: string;
  exitCode: number;
} {
  try {
    const stdout = execSync(`node ${CLI_PATH} ${args.join(" ")}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      exitCode: error.status || 1,
    };
  }
}

/**
 * Execute CLI asynchronously
 */
function runCLIAsync(
  args: string[]
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const process = spawn("node", [CLI_PATH, ...args]);
    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (exitCode) => {
      resolve({ stdout, stderr, exitCode: exitCode || 0 });
    });
  });
}

describe("CLI Binary", () => {
  describe("Help command", () => {
    test("shows help with --help", () => {
      const result = runCLI(["--help"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Usage:");
      expect(result.stdout).toContain("generate-oauth");
      expect(result.stdout).toContain("Options:");
      expect(result.stdout).toContain("--prefix");
      expect(result.stdout).toContain("Examples:");
    });

    test("shows help with -h", () => {
      const result = runCLI(["-h"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Usage:");
    });
  });

  describe("Version command", () => {
    test("shows version with --version", () => {
      const result = runCLI(["--version"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test("shows version with -v", () => {
      const result = runCLI(["-v"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe("Credential generation", () => {
    test("generates credentials with default options", () => {
      const result = runCLI([]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("OAuth Credentials Generated");
      expect(result.stdout).toContain("Client ID:");
      expect(result.stdout).toContain("Client Secret:");
      expect(result.stdout).toContain("oauth_");
    });

    test("generates credentials with custom prefix", () => {
      const result = runCLI(["--prefix", "myapp"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Client ID:");
      expect(result.stdout).toContain("myapp_");
    });

    test("generates credentials with -p flag", () => {
      const result = runCLI(["-p", "test"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("test_");
    });

    test("generates credentials with custom id-length", () => {
      const result = runCLI(["--prefix", "test", "--id-length", "16"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Client ID:");
      // Extract the ID part after prefix
      const match = result.stdout.match(/test_([A-Za-z0-9_-]+)/);
      expect(match).toBeTruthy();
      if (match) {
        expect(match[1].length).toBe(16);
      }
    });

    test("generates credentials with custom secret-length", () => {
      const result = runCLI(["--secret-length", "32", "--json"]);
      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.clientSecret.length).toBe(32);
    });

    test("generates credentials with hex encoding", () => {
      const result = runCLI(["--encoding", "hex", "--json"]);
      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      // Hex should only contain 0-9 and a-f
      const idPart = output.clientId.split("_")[1];
      expect(/^[0-9a-f]+$/.test(idPart)).toBe(true);
      expect(/^[0-9a-f]+$/.test(output.clientSecret)).toBe(true);
    });

    test("generates credentials with base64 encoding", () => {
      const result = runCLI(["--encoding", "base64", "--json"]);
      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.clientId).toBeTruthy();
      expect(output.clientSecret).toBeTruthy();
    });

    test("generates credentials with base64url encoding", () => {
      const result = runCLI(["--encoding", "base64url", "--json"]);
      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      // base64url should not contain +, /, or =
      const idPart = output.clientId.split("_")[1];
      expect(/^[A-Za-z0-9_-]+$/.test(idPart)).toBe(true);
      expect(/^[A-Za-z0-9_-]+$/.test(output.clientSecret)).toBe(true);
    });
  });

  describe("JSON output", () => {
    test("outputs valid JSON with --json flag", () => {
      const result = runCLI(["--json"]);
      expect(result.exitCode).toBe(0);

      const output = JSON.parse(result.stdout);
      expect(output).toHaveProperty("clientId");
      expect(output).toHaveProperty("clientSecret");
    });

    test("JSON output has correct structure", () => {
      const result = runCLI(["--prefix", "test", "--json"]);
      expect(result.exitCode).toBe(0);

      const output = JSON.parse(result.stdout);
      expect(typeof output.clientId).toBe("string");
      expect(typeof output.clientSecret).toBe("string");
      expect(output.clientId).toMatch(/^test_/);
    });

    test("JSON output respects all options", () => {
      const result = runCLI([
        "--prefix",
        "prod",
        "--id-length",
        "32",
        "--secret-length",
        "64",
        "--encoding",
        "hex",
        "--json",
      ]);
      expect(result.exitCode).toBe(0);

      const output = JSON.parse(result.stdout);
      expect(output.clientId).toMatch(/^prod_/);
      const idPart = output.clientId.split("_")[1];
      expect(idPart.length).toBe(32);
      expect(output.clientSecret.length).toBe(64);
    });
  });

  describe("Combined options", () => {
    test("handles all options together", () => {
      const result = runCLI([
        "--prefix",
        "api",
        "--id-length",
        "24",
        "--secret-length",
        "48",
        "--encoding",
        "base64url",
      ]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("api_");
    });

    test("generates different credentials on each run", () => {
      const result1 = runCLI(["--json"]);
      const result2 = runCLI(["--json"]);

      const output1 = JSON.parse(result1.stdout);
      const output2 = JSON.parse(result2.stdout);

      expect(output1.clientId).not.toBe(output2.clientId);
      expect(output1.clientSecret).not.toBe(output2.clientSecret);
    });
  });

  describe("Error handling", () => {
    test("handles invalid option", () => {
      const result = runCLI(["--invalid-option"]);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Unknown option");
    });

    test("shows usage hint on error", () => {
      const result = runCLI(["--bad"]);
      expect(result.stdout).toContain("--help");
    });
  });

  describe("Security warnings", () => {
    test("shows security warning in default output", () => {
      const result = runCLI([]);
      expect(result.stdout).toContain("Store these securely");
      expect(result.stdout).toContain("never be committed");
    });

    test("does not show warning in JSON mode", () => {
      const result = runCLI(["--json"]);
      expect(result.stdout).not.toContain("Store these securely");
      // Should be valid JSON
      expect(() => JSON.parse(result.stdout)).not.toThrow();
    });
  });

  describe("Output format", () => {
    test("default output is user-friendly", () => {
      const result = runCLI(["--prefix", "test"]);
      expect(result.stdout).toContain("🔐");
      expect(result.stdout).toContain("OAuth Credentials Generated");
      expect(result.stdout).toContain("Client ID:");
      expect(result.stdout).toContain("Client Secret:");
    });

    test("output includes credential values", () => {
      const result = runCLI(["--prefix", "demo"]);
      const lines = result.stdout.split("\n");

      const idLine = lines.find((line) => line.includes("Client ID:"));
      const secretLine = lines.find((line) => line.includes("Client Secret:"));

      expect(idLine).toContain("demo_");
      expect(secretLine).toBeTruthy();
      expect(secretLine?.split(":")[1].trim().length).toBeGreaterThan(10);
    });
  });

  describe("Async execution", () => {
    test("works with async spawn", async () => {
      const result = await runCLIAsync(["--json"]);
      expect(result.exitCode).toBe(0);

      const output = JSON.parse(result.stdout);
      expect(output).toHaveProperty("clientId");
      expect(output).toHaveProperty("clientSecret");
    });
  });
});
