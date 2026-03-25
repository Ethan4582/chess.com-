'use client';

/**
 * Simple "Secure" Local Storage Helper for DX-only Password Caching
 * Note: This is NOT fully secure against advanced attacks (as the key is on the client),
 * but it obfuscates credentials in LocalStorage to improve DX without exposing them in cleartext.
 */

const SECRET_SALT = "blitzr_secure_v1";

export const secureStorage = {
  save: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      // Basic XOR + Base64 obfuscation for local DX caching
      const obfuscated = btoa(
        value.split('').map((char, i) => 
          String.fromCharCode(char.charCodeAt(0) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length))
        ).join('')
      );
      localStorage.setItem(`_blitzr_${key}`, obfuscated);
    } catch (e) {
      console.error('Failed to save to secure storage', e);
    }
  },

  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`_blitzr_${key}`);
      if (!raw) return null;
      
      return atob(raw).split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length))
      ).join('');
    } catch (e) {
      return null;
    }
  },

  clear: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`_blitzr_${key}`);
  }
};
