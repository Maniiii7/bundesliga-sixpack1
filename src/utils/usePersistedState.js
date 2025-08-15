import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import robustStorage from './storage.js';

// Robuster usePersistedState Hook
export const useRobustPersistedState = (key, initialValue) => {
  // Stabilisiere initialValue mit useMemo
  const stableInitialValue = useMemo(() => initialValue, []);
  
  const [state, setState] = useState(stableInitialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const debugMode = false; // Debug-Modus deaktiviert
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Initial laden (nur einmal)
  useEffect(() => {
    if (isInitialized.current) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // IndexedDB initialisieren
        await robustStorage.initDB();
        
        // Daten laden
        const data = await robustStorage.loadData(key, stableInitialValue);
        setState(data);
        setLastSaved(Date.now());
        isInitialized.current = true;
        
        if (debugMode) console.log(`Daten erfolgreich geladen: ${key}`);
      } catch (err) {
        console.error(`Fehler beim Laden von ${key}:`, err);
        setError(err.message);
        setState(stableInitialValue);
        isInitialized.current = true;
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, stableInitialValue]); // key und stableInitialValue als Dependencies

  // Robuster Setter mit Debouncing und Retry-Logic - Optimiert für bessere Performance
  const setPersistedState = useCallback((newState) => {
    // State sofort aktualisieren (Optimistic Update)
    setState(prev => {
      const updatedState = typeof newState === 'function' ? newState(prev) : newState;
      return updatedState;
    });

    // Debounced Speichern (erhöht für bessere Performance)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Verwende eine Funktion um den aktuellen State zu bekommen
        const currentState = typeof newState === 'function' ? 
          newState(state) : newState;
        
        // Daten speichern mit reduzierter Retry-Logic (nur 2 Versuche)
        let retries = 2;
        let success = false;
        
        while (retries > 0 && !success) {
          try {
            await robustStorage.saveData(key, currentState);
            setLastSaved(Date.now());
            setError(null);
            success = true;
            if (debugMode) console.log(`Daten erfolgreich gespeichert: ${key}`);
          } catch (err) {
            retries--;
            if (debugMode) console.warn(`Speicherversuch fehlgeschlagen (${2 - retries}/2):`, err);
            
            if (retries === 0) {
              setError(`Speicherfehler: ${err.message}`);
              console.error(`Alle Speicherversuche fehlgeschlagen für ${key}:`, err);
            } else {
              // Kürzere Pause vor Retry (500ms statt 1000ms)
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
      } catch (err) {
        setError(`Unerwarteter Fehler: ${err.message}`);
        console.error(`Unerwarteter Fehler beim Speichern von ${key}:`, err);
      }
    }, 1000); // 1000ms Debounce (erhöht für bessere Performance)
  }, [key]); // Nur key als Dependency

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Daten-Validierung
  const validateData = useCallback(async () => {
    try {
      const validation = await robustStorage.validateData(key);
      return validation;
    } catch (err) {
      console.error(`Validierungsfehler für ${key}:`, err);
      return { isValid: false, errors: [err.message] };
    }
  }, [key]);

  // Speicherplatz-Info
  const getStorageInfo = useCallback(async () => {
    try {
      return await robustStorage.checkStorageSpace();
    } catch (err) {
      console.error('Fehler beim Abrufen der Speicherinfo:', err);
      return null;
    }
  }, []);

  return [
    state,
    setPersistedState,
    {
      isLoading,
      error,
      lastSaved,
      validateData,
      getStorageInfo
    }
  ];
};

// Fallback Hook für einfache Anwendungsfälle
export const useSimplePersistedState = (key, initialValue) => {
  const stableInitialValue = useMemo(() => initialValue, []);
  
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : stableInitialValue;
    } catch (error) {
      console.error(`Fehler beim Laden von ${key}:`, error);
      return stableInitialValue;
    }
  });

  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Fehler beim Speichern von ${key}:`, error);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [key, state]);

  return [state, setState];
};
