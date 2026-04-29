import { extractSimpleCommands } from '../extractSimpleCommands.js';
import { isAllowed } from '../isAllowed.js';
import { isCommandLineAllowed } from '../isCommandLineAllowed.js';

describe('isAllowed', () => {
  describe('exact matching', () => {
    it('should return true for exact match', () => {
      const result = isAllowed('echo', ['echo']);
      expect(result).toBe(true);
    });

    it('should return false when not in allowList', () => {
      const result = isAllowed('wget', ['echo']);
      expect(result).toBe(false);
    });
  });

  describe('prefix matching', () => {
    it('should match command with arguments', () => {
      const result = isAllowed('echo hello world', ['echo']);
      expect(result).toBe(true);
    });

    it('should match against multiple patterns', () => {
      const result = isAllowed('grep foo', ['echo', 'grep', 'git']);
      expect(result).toBe(true);
    });

    it('should not match arguments as command name', () => {
      const result = isAllowed('grep echo', ['echo']);
      expect(result).toBe(false);
    });

    it('should require full word boundaries', () => {
      const result = isAllowed('git commit', ['git log']);
      expect(result).toBe(false);
    });

    it('should match multi-word patterns', () => {
      const result = isAllowed('git commit -m "test"', ['git commit']);
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return false for empty allowList', () => {
      const result = isAllowed('echo hello', []);
      expect(result).toBe(false);
    });

    it('should handle empty command', () => {
      const result = isAllowed('', ['echo']);
      expect(result).toBe(false);
    });
  });
});

describe('extractSimpleCommands', () => {
  it('should return single command as array', () => {
    const result = extractSimpleCommands('echo hello');
    expect(result).toEqual(['echo hello']);
  });

  it('should handle empty string', () => {
    const result = extractSimpleCommands('');
    expect(result).toEqual(['']);
  });
});

describe('isCommandLineAllowed', () => {
  describe('simple commands', () => {
    it('should allow command in allowList', () => {
      const result = isCommandLineAllowed('echo hello world', ['echo']);
      expect(result).toBe(true);
    });

    it('should reject command not in allowList', () => {
      const result = isCommandLineAllowed('wget evil.com', ['echo']);
      expect(result).toBe(false);
    });

    it('should check against all patterns', () => {
      const result = isCommandLineAllowed('git status', ['echo', 'git']);
      expect(result).toBe(true);
    });

    it('should reject when no patterns match', () => {
      const result = isCommandLineAllowed('rm file.txt', ['echo', 'git']);
      expect(result).toBe(false);
    });

    it('should not match command name in arguments', () => {
      const result = isCommandLineAllowed('echo grep', ['grep']);
      expect(result).toBe(false);
    });
  });

  describe('bats tests ported (simple.bats)', () => {
    it('should pass: allowed', () => {
      const result = isCommandLineAllowed("echo 'hello world", ['echo']);
      expect(result).toBe(true);
    });

    it('should pass: not allowed', () => {
      const result = isCommandLineAllowed('wget evil.com', ['echo']);
      expect(result).toBe(false);
    });
  });
});
