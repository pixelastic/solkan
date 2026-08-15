import { mkdirp, remove, run, tmpDirectory, write, writeJson } from 'firost';

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
        stderr: false,
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
          allow: { isAllowed: true, allowed: ['echo'], rejected: [] },
        },
      },
      {
        title: 'rejected command exits 1 with JSON',
        args: "--allow-list echo 'wget evil.com'",
        expectedExitCode: 1,
        expectedJson: {
          allow: { isAllowed: false, allowed: [], rejected: ['wget'] },
        },
      },
    ])('$title', async ({ args, expectedExitCode, expectedJson }) => {
      const { stdout, exitCode } = await runCli(args);
      expect(exitCode).toBe(expectedExitCode);
      expect(JSON.parse(stdout)).toEqual(expectedJson);
    });
  });

  describe('allow-only mode', () => {
    it('no rewrite key in output', async () => {
      const { stdout } = await runCli("--allow-list echo 'echo hello'");
      expect(JSON.parse(stdout)).not.toHaveProperty('rewrite');
    });
  });

  describe('rewrite-only mode', () => {
    let testDirectory;
    let rewriteFile;
    beforeEach(async () => {
      testDirectory = tmpDirectory('solkan-rewrite');
      rewriteFile = `${testDirectory}/rewrite.json`;
      await writeJson({ rm: 'rm-for-claude' }, rewriteFile);
    });
    afterEach(async () => {
      await remove(testDirectory);
    });

    it('outputs rewrite key when rewrite occurred, exit 0', async () => {
      const { stdout, exitCode } = await runCli(
        `--rewrite-list-file ${rewriteFile} 'rm foo'`,
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout)).toEqual({ rewrite: 'rm-for-claude foo' });
    });

    it('outputs empty object when no rewrite occurred, exit 0', async () => {
      const { stdout, exitCode } = await runCli(
        `--rewrite-list-file ${rewriteFile} 'echo hello'`,
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout)).toEqual({});
    });

    it('no allow key in output', async () => {
      const { stdout } = await runCli(
        `--rewrite-list-file ${rewriteFile} 'rm foo'`,
      );
      expect(JSON.parse(stdout)).not.toHaveProperty('allow');
    });
  });

  describe('combined mode', () => {
    let testDirectory;
    let rewriteFile;
    beforeEach(async () => {
      testDirectory = tmpDirectory('solkan-combined');
      rewriteFile = `${testDirectory}/rewrite.json`;
      await writeJson({ rm: 'rm-for-claude' }, rewriteFile);
    });
    afterEach(async () => {
      await remove(testDirectory);
    });

    it('validation runs on rewritten command', async () => {
      const { stdout, exitCode } = await runCli(
        `--rewrite-list-file ${rewriteFile} --allow-list rm-for-claude 'rm foo'`,
      );
      expect(exitCode).toBe(0);
      const output = JSON.parse(stdout);
      expect(output).toHaveProperty('rewrite', 'rm-for-claude foo');
      expect(output).toHaveProperty('allow', {
        isAllowed: true,
        allowed: ['rm-for-claude'],
        rejected: [],
      });
    });

    it('both rewrite and allow keys present when rewrite occurred', async () => {
      const { stdout } = await runCli(
        `--rewrite-list-file ${rewriteFile} --allow-list rm-for-claude 'rm foo'`,
      );
      const output = JSON.parse(stdout);
      expect(output).toHaveProperty('rewrite');
      expect(output).toHaveProperty('allow');
    });

    it('only allow key when no rewrite match', async () => {
      const { stdout } = await runCli(
        `--rewrite-list-file ${rewriteFile} --allow-list echo 'echo hello'`,
      );
      const output = JSON.parse(stdout);
      expect(output).not.toHaveProperty('rewrite');
      expect(output).toHaveProperty('allow');
    });
  });

  describe('rewrite error handling', () => {
    let testDirectory;
    beforeEach(() => {
      testDirectory = tmpDirectory('solkan-error');
    });
    afterEach(async () => {
      await remove(testDirectory);
    });

    it('exit 2 for missing rewrite file', async () => {
      const { exitCode, stderr } = await runCli(
        "--rewrite-list-file /tmp/nonexistent.json 'echo hello'",
      );
      expect(exitCode).toBe(2);
      expect(stderr).not.toBe('');
    });

    it.each([
      {
        title: 'malformed JSON',
        content: '{not valid json}',
        isRawString: true,
      },
      {
        title: 'array instead of object',
        content: ['rm', 'rm-for-claude'],
        isRawString: false,
      },
      {
        title: 'string instead of object',
        content: 'just a string',
        isRawString: true,
      },
    ])(
      'exit 2 for $title in rewrite file',
      async ({ content, isRawString }) => {
        const rewriteFile = `${testDirectory}/bad.json`;
        if (isRawString) {
          await mkdirp(testDirectory);
          await write(content, rewriteFile);
        } else {
          await writeJson(content, rewriteFile);
        }
        const { exitCode, stderr } = await runCli(
          `--rewrite-list-file ${rewriteFile} 'echo hello'`,
        );
        expect(exitCode).toBe(2);
        expect(stderr).not.toBe('');
      },
    );
  });

  describe('exit codes', () => {
    let testDirectory;
    let rewriteFile;
    beforeEach(async () => {
      testDirectory = tmpDirectory('solkan-exitcodes');
      rewriteFile = `${testDirectory}/rewrite.json`;
      await writeJson({ rm: 'rm-for-claude' }, rewriteFile);
    });
    afterEach(async () => {
      await remove(testDirectory);
    });

    it.each([
      {
        title: 'exit 0 for rewrite-only mode',
        args: "'rm foo'",
        extraFlags: '',
        expected: 0,
      },
      {
        title: 'exit 0 when validation passes',
        args: "'rm foo'",
        extraFlags: '--allow-list rm-for-claude',
        expected: 0,
      },
      {
        title: 'exit 1 when validation rejects',
        args: "'rm foo'",
        extraFlags: '--allow-list echo',
        expected: 1,
      },
    ])('$title', async ({ args, extraFlags, expected }) => {
      const { exitCode } = await runCli(
        `--rewrite-list-file ${rewriteFile} ${extraFlags} ${args}`,
      );
      expect(exitCode).toBe(expected);
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
