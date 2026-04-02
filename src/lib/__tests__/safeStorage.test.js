import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('safeStorage', () => {
  let safeLocal, safeSession;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('@/lib/safeStorage');
    safeLocal = mod.safeLocal;
    safeSession = mod.safeSession;
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('safeLocal', () => {
    it('get returns value from localStorage', () => {
      localStorage.setItem('testKey', 'testValue');
      expect(safeLocal.get('testKey')).toBe('testValue');
    });

    it('get returns null for missing key', () => {
      expect(safeLocal.get('missing')).toBeNull();
    });

    it('set stores value in localStorage', () => {
      safeLocal.set('myKey', 'myValue');
      expect(localStorage.getItem('myKey')).toBe('myValue');
    });

    it('remove deletes key from localStorage', () => {
      localStorage.setItem('delMe', 'val');
      safeLocal.remove('delMe');
      expect(localStorage.getItem('delMe')).toBeNull();
    });

    it('get returns null when localStorage throws', () => {
      const orig = Storage.prototype.getItem;
      Storage.prototype.getItem = () => { throw new Error('Blocked'); };
      expect(safeLocal.get('key')).toBeNull();
      Storage.prototype.getItem = orig;
    });

    it('set does not throw when localStorage throws', () => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = () => { throw new Error('Blocked'); };
      expect(() => safeLocal.set('key', 'val')).not.toThrow();
      Storage.prototype.setItem = orig;
    });

    it('remove does not throw when localStorage throws', () => {
      const orig = Storage.prototype.removeItem;
      Storage.prototype.removeItem = () => { throw new Error('Blocked'); };
      expect(() => safeLocal.remove('key')).not.toThrow();
      Storage.prototype.removeItem = orig;
    });
  });

  describe('safeSession', () => {
    it('get/set/remove work with sessionStorage', () => {
      safeSession.set('sKey', 'sVal');
      expect(safeSession.get('sKey')).toBe('sVal');
      safeSession.remove('sKey');
      expect(safeSession.get('sKey')).toBeNull();
    });

    it('get returns null when sessionStorage throws', () => {
      const orig = Storage.prototype.getItem;
      Storage.prototype.getItem = () => { throw new Error('Blocked'); };
      expect(safeSession.get('key')).toBeNull();
      Storage.prototype.getItem = orig;
    });
  });
});
