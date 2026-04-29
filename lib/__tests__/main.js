import { isAllowed } from '../isAllowed.js';

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
