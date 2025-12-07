/**
 * Server-side API Key Cache
 * 
 * Stores full API keys persistently to survive server restarts.
 * Uses a JSON file for storage (development). In production, use a database.
 */

import { promises as fs } from "fs";
import path from "path";

// Cache file path (in project root, gitignored)
const CACHE_FILE_PATH = path.join(process.cwd(), ".api-keys-cache.json");

// In-memory cache: key ID -> full API key
const apiKeyCache = new Map<string, string>();

// Also track by prefix for lookup
const prefixToKeyCache = new Map<string, string>();

// Track if cache has been loaded from disk
let cacheLoaded = false;

/**
 * Cache file structure
 */
interface CacheFile {
  keys: Array<{
    id: string;
    prefix: string;
    fullKey: string;
  }>;
}

/**
 * Load cache from disk on first access
 */
async function loadCache(): Promise<void> {
  if (cacheLoaded) return;
  
  try {
    const data = await fs.readFile(CACHE_FILE_PATH, "utf-8");
    const cache: CacheFile = JSON.parse(data);
    
    // Restore cache from file
    for (const { id, prefix, fullKey } of cache.keys) {
      apiKeyCache.set(id, fullKey);
      prefixToKeyCache.set(prefix, fullKey);
    }
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[ApiKeyCache] Loaded ${cache.keys.length} API key(s) from disk`);
      console.log(`[ApiKeyCache] Cached prefixes:`, Array.from(prefixToKeyCache.keys()));
    }
  } catch (error: any) {
    // File doesn't exist or is invalid - that's okay, start with empty cache
    if (error.code === "ENOENT") {
      if (process.env.NODE_ENV === "development") {
        console.log(`[ApiKeyCache] Cache file not found, starting with empty cache`);
      }
    } else {
      console.warn("[ApiKeyCache] Failed to load cache from disk:", error.message);
    }
  }
  
  cacheLoaded = true;
}

/**
 * Save cache to disk
 */
async function saveCache(): Promise<void> {
  try {
    const cache: CacheFile = {
      keys: Array.from(apiKeyCache.entries()).map(([id, fullKey]) => {
        // Find prefix for this ID
        for (const [prefix, key] of prefixToKeyCache.entries()) {
          if (key === fullKey) {
            return { id, prefix, fullKey };
          }
        }
        // Fallback if prefix not found (shouldn't happen)
        return { id, prefix: "unknown", fullKey };
      }),
    };
    
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), "utf-8");
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[ApiKeyCache] Saved ${cache.keys.length} API key(s) to disk`);
    }
  } catch (error: any) {
    console.error("[ApiKeyCache] Failed to save cache to disk:", error.message);
  }
}

/**
 * Store a full API key in the cache
 * Called when a new API key is created
 */
export async function storeApiKey(id: string, prefix: string, fullKey: string): Promise<void> {
  await loadCache();
  
  apiKeyCache.set(id, fullKey);
  prefixToKeyCache.set(prefix, fullKey);
  
  await saveCache();
  
  if (process.env.NODE_ENV === "development") {
    console.log(`[ApiKeyCache] Stored API key: ${id} (prefix: ${prefix})`);
  }
}

/**
 * Get a full API key by ID
 */
export async function getApiKeyById(id: string): Promise<string | null> {
  await loadCache();
  return apiKeyCache.get(id) || null;
}

/**
 * Get a full API key by prefix
 */
export async function getApiKeyByPrefix(prefix: string): Promise<string | null> {
  await loadCache();
  const key = prefixToKeyCache.get(prefix) || null;
  
  if (process.env.NODE_ENV === "development") {
    if (!key) {
      console.log(`[ApiKeyCache] Key not found for prefix "${prefix}". Available prefixes:`, Array.from(prefixToKeyCache.keys()));
    } else {
      console.log(`[ApiKeyCache] Found key for prefix "${prefix}"`);
    }
  }
  
  return key;
}

/**
 * Remove an API key from the cache (when deleted)
 */
export async function removeApiKey(id: string, prefix: string): Promise<void> {
  await loadCache();
  
  apiKeyCache.delete(id);
  prefixToKeyCache.delete(prefix);
  
  await saveCache();
  
  if (process.env.NODE_ENV === "development") {
    console.log(`[ApiKeyCache] Removed API key: ${id} (prefix: ${prefix})`);
  }
}

/**
 * Get all cached API keys (for debugging)
 */
export async function getAllCachedKeys(): Promise<Array<{ id: string; prefix: string }>> {
  await loadCache();
  
  const keys: Array<{ id: string; prefix: string }> = [];
  for (const [id] of apiKeyCache) {
    // Find prefix for this ID (we'd need to track this better in production)
    for (const [prefix, key] of prefixToKeyCache) {
      if (key === apiKeyCache.get(id)) {
        keys.push({ id, prefix });
        break;
      }
    }
  }
  return keys;
}

