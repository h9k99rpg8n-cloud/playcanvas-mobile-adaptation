import localforage from 'https://cdn.jsdelivr.net/npm/localforage@1.10.0/+esm';

const KEY_PREFIX = 'atlas-engine:';

export const atlasDatabase = localforage.createInstance({
  name: 'AtlasEngineDB',
  storeName: 'atlas_store',
  description: 'IndexedDB storage for Atlas projects, templates, assets and settings.'
});

export async function readStorage(key, fallbackValue = null) {
  try {
    const value = await atlasDatabase.getItem(KEY_PREFIX + key);
    return value ?? fallbackValue;
  } catch (error) {
    console.warn('Atlas Engine IndexedDB read failed:', error);
    return fallbackValue;
  }
}

export async function writeStorage(key, value) {
  try {
    await atlasDatabase.setItem(KEY_PREFIX + key, value);
    return true;
  } catch (error) {
    console.warn('Atlas Engine IndexedDB write failed:', error);
    return false;
  }
}

export async function removeStorage(key) {
  try {
    await atlasDatabase.removeItem(KEY_PREFIX + key);
    return true;
  } catch (error) {
    console.warn('Atlas Engine IndexedDB remove failed:', error);
    return false;
  }
}

export async function clearAtlasStorage() {
  try {
    await atlasDatabase.clear();
    return true;
  } catch (error) {
    console.warn('Atlas Engine IndexedDB clear failed:', error);
    return false;
  }
}
