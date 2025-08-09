// Polyfills for browser environment
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window.global || window;
}

// Also make it available as a global
globalThis.Buffer = Buffer;
