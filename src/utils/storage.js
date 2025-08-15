// Robuste Datenspeicherung mit Multi-Layer Backup
class RobustStorage {
  constructor() {
    this.dbName = 'AdmiralBundesligaDB';
    this.dbVersion = 1;
    this.storeName = 'appData';
    this.db = null;
    this.isIndexedDBSupported = 'indexedDB' in window;
    this.debugMode = false; // Debug-Modus deaktiviert
  }

  // IndexedDB initialisieren
  async initDB() {
    if (!this.isIndexedDBSupported) {
      if (this.debugMode) console.warn('IndexedDB nicht unterstützt, verwende nur localStorage');
      return false;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB Fehler:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        if (this.debugMode) console.log('IndexedDB erfolgreich initialisiert');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          if (this.debugMode) console.log('IndexedDB Store erstellt');
        }
      };
    });
  }

  // Daten speichern (Multi-Layer) - Optimiert für bessere Performance
  async saveData(key, data) {
    const timestamp = Date.now();
    const savePromises = [];

    // 1. Memory Cache (schnellster Zugriff)
    this.memoryCache = this.memoryCache || {};
    this.memoryCache[key] = {
      data,
      timestamp
    };

    // 2. localStorage (Primär) - mit Fehlerbehandlung
    try {
      const localStorageData = {
        data,
        timestamp,
        version: '1.0'
      };
      localStorage.setItem(key, JSON.stringify(localStorageData));
      if (this.debugMode) console.log(`Daten in localStorage gespeichert: ${key}`);
    } catch (error) {
      console.error('localStorage Fehler:', error);
      // Versuche Speicherplatz freizugeben
      try {
        localStorage.clear();
        localStorage.setItem(key, JSON.stringify(localStorageData));
      } catch (clearError) {
        console.error('Kritischer localStorage Fehler:', clearError);
      }
    }

    // 3. IndexedDB (Backup) - nur wenn verfügbar
    if (this.isIndexedDBSupported && this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const indexedDBData = {
          key,
          data,
          timestamp,
          version: '1.0'
        };
        await store.put(indexedDBData);
        if (this.debugMode) console.log(`Daten in IndexedDB gespeichert: ${key}`);
      } catch (error) {
        console.error('IndexedDB Fehler:', error);
        // IndexedDB Fehler sind nicht kritisch, da localStorage funktioniert
      }
    }

    // 4. Session Storage (Temporär) - nur für wichtige Daten
    if (key.includes('current') || key.includes('round')) {
      try {
        sessionStorage.setItem(`${key}_temp`, JSON.stringify({
          data,
          timestamp
        }));
      } catch (error) {
        console.error('SessionStorage Fehler:', error);
      }
    }

    return Promise.resolve(); // Immer erfolgreich, da Memory Cache funktioniert
  }

  // Daten laden (Multi-Layer Recovery)
  async loadData(key, defaultValue = null) {
    let data = null;
    let source = 'none';

    // 1. Memory Cache (Schnellster)
    if (this.memoryCache && this.memoryCache[key]) {
      data = this.memoryCache[key].data;
      source = 'memory';
    }

    // 2. localStorage (Primär)
    if (!data) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.data) {
            data = parsed.data;
            source = 'localStorage';
            // Memory Cache aktualisieren
            this.memoryCache = this.memoryCache || {};
            this.memoryCache[key] = {
              data,
              timestamp: parsed.timestamp
            };
          }
        }
      } catch (error) {
        console.error('localStorage Load Fehler:', error);
      }
    }

    // 3. IndexedDB (Backup Recovery)
    if (!data && this.isIndexedDBSupported && this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        
        await new Promise((resolve, reject) => {
          request.onsuccess = () => {
            if (request.result) {
              data = request.result.data;
              source = 'indexedDB';
              if (this.debugMode) console.log(`Daten aus IndexedDB wiederhergestellt: ${key}`);
            }
            resolve();
          };
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('IndexedDB Load Fehler:', error);
      }
    }

    // 4. Session Storage (Temporär Recovery)
    if (!data) {
      try {
        const raw = sessionStorage.getItem(`${key}_temp`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.data) {
            data = parsed.data;
            source = 'sessionStorage';
            if (this.debugMode) console.log(`Daten aus SessionStorage wiederhergestellt: ${key}`);
          }
        }
      } catch (error) {
        console.error('SessionStorage Load Fehler:', error);
      }
    }

    if (this.debugMode) console.log(`Daten geladen von: ${source} für Key: ${key}`);
    return data || defaultValue;
  }

  // Daten löschen (Alle Layer)
  async deleteData(key) {
    const deletePromises = [];

    // localStorage
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage Delete Fehler:', error);
    }

    // IndexedDB
    if (this.isIndexedDBSupported && this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        await store.delete(key);
      } catch (error) {
        console.error('IndexedDB Delete Fehler:', error);
      }
    }

    // Session Storage
    try {
      sessionStorage.removeItem(`${key}_temp`);
    } catch (error) {
      console.error('SessionStorage Delete Fehler:', error);
    }

    // Memory Cache
    if (this.memoryCache) {
      delete this.memoryCache[key];
    }

    return Promise.all(deletePromises);
  }

  // Alle Daten löschen
  async clearAllData() {
    const clearPromises = [];

    // localStorage
    try {
      localStorage.clear();
    } catch (error) {
      console.error('localStorage Clear Fehler:', error);
    }

    // IndexedDB
    if (this.isIndexedDBSupported && this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        await store.clear();
      } catch (error) {
        console.error('IndexedDB Clear Fehler:', error);
      }
    }

    // Session Storage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('SessionStorage Clear Fehler:', error);
    }

    // Memory Cache
    this.memoryCache = {};

    return Promise.all(clearPromises);
  }

  // Speicherplatz überprüfen
  async checkStorageSpace() {
    const storageInfo = {
      localStorage: { available: true, size: 0 },
      indexedDB: { available: this.isIndexedDBSupported, size: 0 },
      sessionStorage: { available: true, size: 0 }
    };

    // localStorage Größe
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      storageInfo.localStorage.size = totalSize;
    } catch (error) {
      storageInfo.localStorage.available = false;
    }

    // IndexedDB Größe
    if (this.isIndexedDBSupported && this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        
        await new Promise((resolve) => {
          request.onsuccess = () => {
            let totalSize = 0;
            request.result.forEach(item => {
              totalSize += JSON.stringify(item).length;
            });
            storageInfo.indexedDB.size = totalSize;
            resolve();
          };
        });
      } catch (error) {
        storageInfo.indexedDB.available = false;
      }
    }

    return storageInfo;
  }

  // Daten-Integrität prüfen
  async validateData(key) {
    const validation = {
      isValid: false,
      errors: [],
      sources: []
    };

    try {
      // localStorage prüfen
      const localStorageData = localStorage.getItem(key);
      if (localStorageData) {
        const parsed = JSON.parse(localStorageData);
        if (parsed && parsed.data && parsed.timestamp) {
          validation.sources.push('localStorage');
        } else {
          validation.errors.push('localStorage: Ungültige Datenstruktur');
        }
      }

      // IndexedDB prüfen
      if (this.isIndexedDBSupported && this.db) {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        
        await new Promise((resolve) => {
          request.onsuccess = () => {
            if (request.result) {
              validation.sources.push('indexedDB');
            }
            resolve();
          };
        });
      }

      validation.isValid = validation.sources.length > 0;
    } catch (error) {
      validation.errors.push(`Validierungsfehler: ${error.message}`);
    }

    return validation;
  }

  // Automatische Backup-Erstellung
  async createBackup() {
    const backup = {
      timestamp: Date.now(),
      version: '1.0',
      data: {}
    };

    const keys = ['admiral-accounts', 'admiral-tips', 'admiral-results', 'admiral-current-round'];
    
    for (const key of keys) {
      try {
        const data = await this.loadData(key);
        if (data) {
          backup.data[key] = data;
        }
      } catch (error) {
        console.error(`Backup Fehler für ${key}:`, error);
      }
    }

    return backup;
  }

  // Backup wiederherstellen
  async restoreBackup(backup) {
    const results = {};

    for (const [key, data] of Object.entries(backup.data)) {
      try {
        await this.saveData(key, data);
        results[key] = { success: true };
      } catch (error) {
        results[key] = { success: false, error: error.message };
      }
    }

    return results;
  }
}

// Singleton Instanz
const robustStorage = new RobustStorage();

export default robustStorage;
