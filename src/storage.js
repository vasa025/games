const STORAGE_KEY = 'tileflow-save-v1';
const SETTINGS_KEY = 'tileflow-settings-v1';

export function createMemoryStorage() {
    const map = new Map();
    return {
        getItem(key) {
            return map.has(key) ? map.get(key) : null;
        },
        setItem(key, value) {
            map.set(key, String(value));
        },
        removeItem(key) {
            map.delete(key);
        },
        clear() {
            map.clear();
        }
    };
}

export function ensureStorage() {
    if (typeof window === 'undefined') {
        return createMemoryStorage();
    }

    return window.localStorage;
}

export function loadGameState() {
    const storage = ensureStorage();
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
}

export function saveGameState(state) {
    const storage = ensureStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearGameState() {
    const storage = ensureStorage();
    storage.removeItem(STORAGE_KEY);
}

export function loadSettings() {
    const storage = ensureStorage();
    const raw = storage.getItem(SETTINGS_KEY);

    if (!raw) {
        return {
            theme: 'dark',
            soundEnabled: false,
            settingsOpen: false
        };
    }

    try {
        const parsed = JSON.parse(raw);
        return {
            theme: parsed.theme || 'dark',
            soundEnabled: !!parsed.soundEnabled,
            settingsOpen: !!parsed.settingsOpen
        };
    } catch (error) {
        return {
            theme: 'dark',
            soundEnabled: false,
            settingsOpen: false
        };
    }
}

export function saveSettings(settings) {
    const storage = ensureStorage();
    storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
