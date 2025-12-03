/**
 * Utility functions for API key management
 */

export interface ApiKey {
  id: string;
  raw: string;
  masked: string;
  createdAt: string;
}

/**
 * Masks an API key showing only first 8 and last 4 characters
 */
export function maskKey(key: string): string {
  if (key.length <= 12) {
    return key;
  }
  return key.slice(0, 8) + "…" + key.slice(-4);
}

/**
 * Generates a random API key
 */
export function generateApiKey(): string {
  const prefix = "sk_test_";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomPart = Array.from({ length: 24 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return prefix + randomPart;
}

/**
 * Generates a unique ID for API keys
 */
export function generateKeyId(): string {
  return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gets all API keys from localStorage
 */
export function getApiKeys(): ApiKey[] {
  if (typeof window === "undefined") {
    return [];
  }
  const stored = localStorage.getItem("asp_api_keys");
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse stored API keys", e);
    return [];
  }
}

