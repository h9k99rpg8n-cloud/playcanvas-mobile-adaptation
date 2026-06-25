const PREFIX = 'atlas-engine:';

export function readStorage(key, fallbackValue) {
  try {
    const rawValue = window.localStorage.getItem(PREFIX + key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch (error) {
    console.warn('Atlas Engine storage read failed:', error);
    return fallbackValue;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Atlas Engine storage write failed:', error);
    return false;
  }
}
