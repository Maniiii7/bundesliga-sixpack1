import React, { useState, useEffect, useMemo, useCallback, Component } from "react";
import { useRobustPersistedState } from "./utils/usePersistedState.js";
import robustStorage from "./utils/storage.js";
import { usePWA } from "./utils/usePWA.js";
import { fileUtils } from "./utils/fileExport.js";
import { userDataService, offlineStorage } from "./utils/supabase.js";
import Auth from "./components/Auth.jsx";

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Ein Fehler ist aufgetreten</h1>
            <p className="text-gray-600 mb-6">
              Die App ist auf ein Problem gestoßen. Bitte laden Sie die Seite neu.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// API-Konfiguration für echte Fußball-Daten
const API_CONFIG = {
  baseUrl: 'https://api.football-data.org/v4',
};

// Österreichische Bundesliga League ID
const LEAGUE_IDS = {
  footballData: 218,
  apiFootball: 218,
  rapidApi: 218
};

// Admiral Österreichische Bundesliga - Offizieller Spielplan 2025/26 (bundesliga.at)
const ROUND_MATCHES = {
  1: [
    { id: 1, home: "LASK", away: "SK Puntigamer Sturm Graz" },
    { id: 2, home: "RZ Pellets WAC", away: "SCR Altach" },
    { id: 3, home: "WSG Tirol", away: "TSV Egger Glas Hartberg" },
    { id: 4, home: "SV Oberbank Ried", away: "FC Red Bull Salzburg" },
    { id: 5, home: "SK Rapid Wien", away: "FC Blau-Weiß Linz" },
    { id: 6, home: "Grazer AK 1902", away: "FK Austria Wien" },
  ],
  2: [
    { id: 7, home: "FC Blau-Weiß Linz", away: "TSV Egger Glas Hartberg" },
    { id: 8, home: "SCR Altach", away: "SV Oberbank Ried" },
    { id: 9, home: "FC Red Bull Salzburg", away: "Grazer AK 1902" },
    { id: 10, home: "WSG Tirol", away: "LASK" },
    { id: 11, home: "SK Puntigamer Sturm Graz", away: "SK Rapid Wien" },
    { id: 12, home: "FK Austria Wien", away: "RZ Pellets WAC" },
  ],
  3: [
    { id: 13, home: "Grazer AK 1902", away: "WSG Tirol" },
    { id: 14, home: "TSV Egger Glas Hartberg", away: "FC Red Bull Salzburg" },
    { id: 15, home: "SV Oberbank Ried", away: "SK Puntigamer Sturm Graz" },
    { id: 16, home: "LASK", away: "FK Austria Wien" },
    { id: 17, home: "SK Rapid Wien", away: "SCR Altach" },
    { id: 18, home: "RZ Pellets WAC", away: "FC Blau-Weiß Linz" },
  ],
  4: [
    { id: 19, home: "FC Blau-Weiß Linz", away: "SV Oberbank Ried" },
    { id: 20, home: "FC Red Bull Salzburg", away: "LASK" },
    { id: 21, home: "SK Puntigamer Sturm Graz", away: "WSG Tirol" },
    { id: 22, home: "SCR Altach", away: "Grazer AK 1902" },
    { id: 23, home: "FK Austria Wien", away: "TSV Egger Glas Hartberg" },
    { id: 24, home: "RZ Pellets WAC", away: "SK Rapid Wien" },
  ],
  5: [
    { id: 25, home: "LASK", away: "SV Oberbank Ried" },
    { id: 26, home: "FC Red Bull Salzburg", away: "FC Blau-Weiß Linz" },
    { id: 27, home: "Grazer AK 1902", away: "SK Puntigamer Sturm Graz" },
    { id: 28, home: "FK Austria Wien", away: "SCR Altach" },
    { id: 29, home: "TSV Egger Glas Hartberg", away: "SK Rapid Wien" },
    { id: 30, home: "WSG Tirol", away: "RZ Pellets WAC" },
  ],
  6: [
    { id: 31, home: "SCR Altach", away: "LASK" },
    { id: 32, home: "FC Blau-Weiß Linz", away: "Grazer AK 1902" },
    { id: 33, home: "SK Rapid Wien", away: "WSG Tirol" },
    { id: 34, home: "SV Oberbank Ried", away: "TSV Egger Glas Hartberg" },
    { id: 35, home: "SK Puntigamer Sturm Graz", away: "FK Austria Wien" },
    { id: 36, home: "RZ Pellets WAC", away: "FC Red Bull Salzburg" },
  ],
  7: [
    { id: 37, home: "SCR Altach", away: "WSG Tirol" },
    { id: 38, home: "FK Austria Wien", away: "SV Oberbank Ried" },
    { id: 39, home: "Grazer AK 1902", away: "SK Rapid Wien" },
    { id: 40, home: "TSV Egger Glas Hartberg", away: "RZ Pellets WAC" },
    { id: 41, home: "LASK", away: "FC Blau-Weiß Linz" },
    { id: 42, home: "FC Red Bull Salzburg", away: "SK Puntigamer Sturm Graz" },
  ],
  8: [
    { id: 43, home: "FC Blau-Weiß Linz", away: "SCR Altach" },
    { id: 44, home: "SK Rapid Wien", away: "FK Austria Wien" },
    { id: 45, home: "SV Oberbank Ried", away: "Grazer AK 1902" },
    { id: 46, home: "SK Puntigamer Sturm Graz", away: "TSV Egger Glas Hartberg" },
    { id: 47, home: "WSG Tirol", away: "FC Red Bull Salzburg" },
    { id: 48, home: "RZ Pellets WAC", away: "LASK" },
  ],
  9: [
    { id: 49, home: "SCR Altach", away: "SK Puntigamer Sturm Graz" },
    { id: 50, home: "FK Austria Wien", away: "FC Blau-Weiß Linz" },
    { id: 51, home: "Grazer AK 1902", away: "RZ Pellets WAC" },
    { id: 52, home: "LASK", away: "TSV Egger Glas Hartberg" },
    { id: 53, home: "SV Oberbank Ried", away: "WSG Tirol" },
    { id: 54, home: "FC Red Bull Salzburg", away: "SK Rapid Wien" },
  ],
  10: [
    { id: 55, home: "FC Blau-Weiß Linz", away: "SK Puntigamer Sturm Graz" },
    { id: 56, home: "Grazer AK 1902", away: "TSV Egger Glas Hartberg" },
    { id: 57, home: "SK Rapid Wien", away: "LASK" },
    { id: 58, home: "FC Red Bull Salzburg", away: "SCR Altach" },
    { id: 59, home: "WSG Tirol", away: "FK Austria Wien" },
    { id: 60, home: "RZ Pellets WAC", away: "SV Oberbank Ried" },
  ],
  11: [
    { id: 61, home: "SCR Altach", away: "TSV Egger Glas Hartberg" },
    { id: 62, home: "FK Austria Wien", away: "FC Red Bull Salzburg" },
    { id: 63, home: "LASK", away: "Grazer AK 1902" },
    { id: 64, home: "SV Oberbank Ried", away: "SK Rapid Wien" },
    { id: 65, home: "SK Puntigamer Sturm Graz", away: "RZ Pellets WAC" },
    { id: 66, home: "WSG Tirol", away: "FC Blau-Weiß Linz" },
  ],
  12: [
    { id: 67, home: "FC Blau-Weiß Linz", away: "LASK" },
    { id: 68, home: "Grazer AK 1902", away: "SCR Altach" },
    { id: 69, home: "TSV Egger Glas Hartberg", away: "FK Austria Wien" },
    { id: 70, home: "SK Rapid Wien", away: "SK Puntigamer Sturm Graz" },
    { id: 71, home: "FC Red Bull Salzburg", away: "SV Oberbank Ried" },
    { id: 72, home: "RZ Pellets WAC", away: "WSG Tirol" },
  ],
  13: [
    { id: 73, home: "FK Austria Wien", away: "Grazer AK 1902" },
    { id: 74, home: "LASK", away: "SCR Altach" },
    { id: 75, home: "SV Oberbank Ried", away: "FC Blau-Weiß Linz" },
    { id: 76, home: "SK Puntigamer Sturm Graz", away: "FC Red Bull Salzburg" },
    { id: 77, home: "WSG Tirol", away: "SK Rapid Wien" },
    { id: 78, home: "RZ Pellets WAC", away: "TSV Egger Glas Hartberg" },
  ],
  14: [
    { id: 79, home: "SCR Altach", away: "RZ Pellets WAC" },
    { id: 80, home: "FC Blau-Weiß Linz", away: "FK Austria Wien" },
    { id: 81, home: "TSV Egger Glas Hartberg", away: "SV Oberbank Ried" },
    { id: 82, home: "SK Rapid Wien", away: "Grazer AK 1902" },
    { id: 83, home: "FC Red Bull Salzburg", away: "WSG Tirol" },
    { id: 84, home: "SK Puntigamer Sturm Graz", away: "LASK" },
  ],
  15: [
    { id: 85, home: "SCR Altach", away: "FC Red Bull Salzburg" },
    { id: 86, home: "FK Austria Wien", away: "WSG Tirol" },
    { id: 87, home: "Grazer AK 1902", away: "FC Blau-Weiß Linz" },
    { id: 88, home: "TSV Egger Glas Hartberg", away: "SK Puntigamer Sturm Graz" },
    { id: 89, home: "LASK", away: "SK Rapid Wien" },
    { id: 90, home: "SV Oberbank Ried", away: "RZ Pellets WAC" },
  ],
  16: [
    { id: 91, home: "FC Blau-Weiß Linz", away: "FC Red Bull Salzburg" },
    { id: 92, home: "TSV Egger Glas Hartberg", away: "LASK" },
    { id: 93, home: "SK Rapid Wien", away: "SV Oberbank Ried" },
    { id: 94, home: "SK Puntigamer Sturm Graz", away: "Grazer AK 1902" },
    { id: 95, home: "WSG Tirol", away: "SCR Altach" },
    { id: 96, home: "RZ Pellets WAC", away: "FK Austria Wien" },
  ],
  17: [
    { id: 97, home: "FK Austria Wien", away: "SK Puntigamer Sturm Graz" },
    { id: 98, home: "FC Blau-Weiß Linz", away: "SK Rapid Wien" },
    { id: 99, home: "Grazer AK 1902", away: "LASK" },
    { id: 100, home: "TSV Egger Glas Hartberg", away: "WSG Tirol" },
    { id: 101, home: "SV Oberbank Ried", away: "SCR Altach" },
    { id: 102, home: "FC Red Bull Salzburg", away: "RZ Pellets WAC" },
  ],
  18: [
    { id: 103, home: "SCR Altach", away: "FC Blau-Weiß Linz" },
    { id: 104, home: "LASK", away: "WSG Tirol" },
    { id: 105, home: "SK Rapid Wien", away: "TSV Egger Glas Hartberg" },
    { id: 106, home: "FC Red Bull Salzburg", away: "FK Austria Wien" },
    { id: 107, home: "SK Puntigamer Sturm Graz", away: "SV Oberbank Ried" },
    { id: 108, home: "RZ Pellets WAC", away: "Grazer AK 1902" },
  ],
  19: [
    { id: 109, home: "FK Austria Wien", away: "SK Rapid Wien" },
    { id: 110, home: "FC Blau-Weiß Linz", away: "RZ Pellets WAC" },
    { id: 111, home: "Grazer AK 1902", away: "FC Red Bull Salzburg" },
    { id: 112, home: "TSV Egger Glas Hartberg", away: "SCR Altach" },
    { id: 113, home: "SV Oberbank Ried", away: "LASK" },
    { id: 114, home: "WSG Tirol", away: "SK Puntigamer Sturm Graz" },
  ],
  20: [
    { id: 115, home: "SCR Altach", away: "FK Austria Wien" },
    { id: 116, home: "TSV Egger Glas Hartberg", away: "Grazer AK 1902" },
    { id: 117, home: "LASK", away: "FC Red Bull Salzburg" },
    { id: 118, home: "SK Rapid Wien", away: "RZ Pellets WAC" },
    { id: 119, home: "SK Puntigamer Sturm Graz", away: "FC Blau-Weiß Linz" },
    { id: 120, home: "WSG Tirol", away: "SV Oberbank Ried" },
  ],
  21: [
    { id: 121, home: "SCR Altach", away: "SK Rapid Wien" },
    { id: 122, home: "FK Austria Wien", away: "LASK" },
    { id: 123, home: "FC Blau-Weiß Linz", away: "WSG Tirol" },
    { id: 124, home: "Grazer AK 1902", away: "SV Oberbank Ried" },
    { id: 125, home: "FC Red Bull Salzburg", away: "TSV Egger Glas Hartberg" },
    { id: 126, home: "RZ Pellets WAC", away: "SK Puntigamer Sturm Graz" },
  ],
  22: [
    { id: 127, home: "TSV Egger Glas Hartberg", away: "FC Blau-Weiß Linz" },
    { id: 128, home: "LASK", away: "RZ Pellets WAC" },
    { id: 129, home: "SK Rapid Wien", away: "FC Red Bull Salzburg" },
    { id: 130, home: "SV Oberbank Ried", away: "FK Austria Wien" },
    { id: 131, home: "SK Puntigamer Sturm Graz", away: "SCR Altach" },
    { id: 132, home: "WSG Tirol", away: "Grazer AK 1902" },
  ],
};

// Punkte-System
const POINTS = {
  exact: 3,      // Exaktes Ergebnis
  diff: 2,       // Richtige Tordifferenz
  tendency: 1,   // Richtige Tendenz (1X2)
  wrong: 0,      // Falsch
};

// Account-Farben (intensiver für bessere Unterscheidbarkeit)
const COLORS = [
  "bg-blue-100 border-blue-400 text-blue-900",
  "bg-green-100 border-green-400 text-green-900",
  "bg-purple-100 border-purple-400 text-purple-900",
  "bg-orange-100 border-orange-400 text-orange-900",
  "bg-pink-100 border-pink-400 text-pink-900",
  "bg-indigo-100 border-indigo-400 text-indigo-900",
];



// Utility-Funktionen
const utils = {
  // Generiert eindeutige ID
  uid: () => Math.random().toString(36).slice(2, 10),
  
  // Cache für Team-Form-Berechnungen
  teamFormCache: new Map(),
  
  // Berechnet Mannschaftsform basierend auf letzten 5 Runden (mit Cache)
  getTeamForm: (teamName, results, currentRound) => {
    // Cache-Key erstellen
    const cacheKey = `${teamName}-${currentRound}-${JSON.stringify(results)}`;
    
    // Prüfe Cache
    if (utils.teamFormCache.has(cacheKey)) {
      return utils.teamFormCache.get(cacheKey);
    }
    
    // Sammle alle Spiele der Mannschaft aus den letzten 5 Runden
    const teamMatches = [];
    
    // Gehe durch die letzten 5 Runden (oder weniger, falls nicht verfügbar)
    for (let round = Math.max(1, currentRound - 4); round <= currentRound; round++) {
      const roundMatches = ROUND_MATCHES[round] || [];
      roundMatches.forEach(match => {
        if (match.home === teamName || match.away === teamName) {
          const result = results[match.id];
          if (result && result.home !== null && result.away !== null) {
            teamMatches.push({ match, result, round });
          }
        }
      });
    }
    
    // Nimm die letzten 5 Spiele
    const recentMatches = teamMatches.slice(-5);
    
    if (recentMatches.length === 0) {
      const result = { 
        form: 'N/A', 
        points: 0, 
        wins: 0, 
        draws: 0, 
        losses: 0,
        recentResults: [],
        rounds: [],
        formDisplay: '',
        avgPoints: 0,
        formTrend: 'neutral'
      };
      utils.teamFormCache.set(cacheKey, result);
      return result;
    }
    
    let points = 0, wins = 0, draws = 0, losses = 0;
    const recentResults = [];
    const rounds = [];
    
    recentMatches.forEach(({ match, result, round }) => {
      const isHome = match.home === teamName;
      const teamGoals = isHome ? result.home : result.away;
      const opponentGoals = isHome ? result.away : result.home;
      const opponent = isHome ? match.away : match.home;
      
      let outcome, pointsForMatch;
      if (teamGoals > opponentGoals) {
        points += 3;
        wins++;
        outcome = 'W';
        pointsForMatch = 3;
      } else if (teamGoals === opponentGoals) {
        points += 1;
        draws++;
        outcome = 'D';
        pointsForMatch = 1;
      } else {
        losses++;
        outcome = 'L';
        pointsForMatch = 0;
      }
      
      recentResults.push({
        outcome,
        score: `${teamGoals}:${opponentGoals}`,
        opponent,
        isHome,
        round
      });
      rounds.push(round);
    });
    
    // Erstelle eine visuelle Form-Anzeige
    const formDisplay = recentResults.map(r => r.outcome).join('');
    const avgPoints = points / recentMatches.length;
    
    // Bestimme Form-Trend
    let formTrend = 'neutral';
    if (recentResults.length >= 2) {
      const lastTwo = recentResults.slice(-2);
      const lastTwoPoints = lastTwo.reduce((sum, r) => sum + (r.outcome === 'W' ? 3 : r.outcome === 'D' ? 1 : 0), 0);
      if (lastTwoPoints >= 5) formTrend = 'good';
      else if (lastTwoPoints <= 1) formTrend = 'bad';
    }
    
    const form = `${wins}W-${draws}D-${losses}L (${points}P)`;
    const result = { 
      form, 
      points, 
      wins, 
      draws, 
      losses, 
      recentResults,
      rounds,
      formDisplay,
      avgPoints,
      formTrend
    };
    
      // Cache das Ergebnis (maximal 100 Einträge)
  if (utils.teamFormCache.size > 100) {
    const firstKey = utils.teamFormCache.keys().next().value;
    utils.teamFormCache.delete(firstKey);
  }
  utils.teamFormCache.set(cacheKey, result);
  
  return result;
},

// Cache leeren (wird aufgerufen, wenn sich Daten ändern)
clearTeamFormCache: () => {
  utils.teamFormCache.clear();
},
  
  // Berechnet Spielausgang
  getOutcome: (home, away) => {
    if (home == null || away == null) return null;
    if (home > away) return "H"; // Heimsieg
    if (home < away) return "A"; // Auswärtssieg
    return "D"; // Remis
  },
  
  // Berechnet Punkte für Tipp
  calculatePoints: (tip, actual) => {
  if (!tip || !actual) return 0;
  const { home: th, away: ta } = tip;
  const { home: ah, away: aa } = actual;
  if (th == null || ta == null || ah == null || aa == null) return 0;

    if (th === ah && ta === aa) return POINTS.exact;

    const tipOut = utils.getOutcome(th, ta);
    const actOut = utils.getOutcome(ah, aa);
  if (tipOut === actOut) {
      if (th - ta === ah - aa) return POINTS.diff;
      return POINTS.tendency;
    }
    return POINTS.wrong;
  },
  
  // Legacy usePersistedState (wird durch useRobustPersistedState ersetzt)
  usePersistedState: (key, initial) => {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
      } catch (error) {
        console.error(`Fehler beim Laden von ${key}:`, error);
      return initial;
    }
  });
    
    // Debounced localStorage save
  useEffect(() => {
      const timeoutId = setTimeout(() => {
        try {
    localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
          console.error(`Fehler beim Speichern von ${key}:`, error);
          // Versuche Speicherplatz freizugeben
          try {
            localStorage.clear();
            localStorage.setItem(key, JSON.stringify(state));
          } catch (clearError) {
            console.error('Kritischer Speicherfehler:', clearError);
          }
        }
      }, 500); // 500ms Debounce
      
      return () => clearTimeout(timeoutId);
  }, [key, state]);
    
  return [state, setState];
}
};

// Hauptkomponente
function App() {
  // Multi-User States
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Robuste State Management (jetzt user-spezifisch)
  const [accounts, setAccounts, accountsMeta] = useRobustPersistedState('admiral-accounts', [
    { id: utils.uid(), name: "Account 1", color: 0 }
  ]);

  const [tips, setTips, tipsMeta] = useRobustPersistedState('admiral-tips', {});
  const [results, setResults, resultsMeta] = useRobustPersistedState('admiral-results', {});
  const [currentRound, setCurrentRound, currentRoundMeta] = useRobustPersistedState('admiral-current-round', 1);
  const [newAccountName, setNewAccountName] = useState("");
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // PWA State
  const {
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    setIsInstallable,
    installApp,
    checkForUpdates,
    requestNotificationPermission,
    sendNotification,
    canInstall,
    isPWA,
    isOffline
  } = usePWA();



  // Memoized Werte
  const currentMatches = useMemo(() => {
    // Für Runden 1-22: Verwende ROUND_MATCHES
    if (currentRound <= 22) {
      return ROUND_MATCHES[currentRound] || [];
    }
    // Für Runden 23+: Verwende manuell eingegebene Spiele
    return results[`round-${currentRound}-matches`] || [];
  }, [currentRound, results]);
  

  
  const currentRoundPoints = useMemo(() => {
    return accounts.map(account => ({
      ...account,
      correctPredictions: currentMatches.reduce((sum, match) => {
        const tip = tips[account.id]?.[match.id];
        const result = results[match.id];
        // Nur berechnen wenn sowohl Tip als auch Ergebnis vorhanden sind
        if (!tip || !result || tip.home === null || tip.away === null || result.home === null || result.away === null) {
          return sum;
        }
        const points = utils.calculatePoints(tip, result);
        return sum + (points === 3 ? 1 : 0); // Zählt nur exakte Vorhersagen (3 Punkte)
      }, 0)
    })).sort((a, b) => b.correctPredictions - a.correctPredictions);
  }, [accounts, tips, results, currentMatches]);



  // Event Handlers
  const addAccount = useCallback(() => {
    if (!newAccountName.trim()) return;
    
    setAccounts(prev => {
      const usedColors = new Set(prev.map(a => a.color));
      let colorIndex = 0;
      while (usedColors.has(colorIndex) && colorIndex < COLORS.length) colorIndex++;
      if (colorIndex >= COLORS.length) {
        colorIndex = prev.length % COLORS.length;
      }
      return [
        ...prev,
        {
          id: utils.uid(),
          name: newAccountName.trim(),
          color: colorIndex
        }
      ];
    });
    setNewAccountName("");
  }, [newAccountName]);

  const deleteAccount = useCallback((accountId) => {
    setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    setTips(prev => {
      const newTips = { ...prev };
      delete newTips[accountId];
      return newTips;
    });
  }, []);

  // Verbesserte Input-Validierung
  const validateTipInput = (value, field) => {
    if (value === '' || value === null || value === undefined) return null;
    const numValue = parseInt(value);
    if (isNaN(numValue)) return null;
    if (numValue < 0) return 0;
    if (numValue > 10) {
      alert(`Unrealistischer Tipp! Maximal 10 Tore pro Team.`);
      return 10;
    }
    return numValue;
  };

  // Verbesserte setTip-Funktion mit Validierung (ohne doppelte localStorage-Aufrufe)
  const setTip = useCallback((accountId, matchId, home, away) => {
    const validatedHome = validateTipInput(home, 'home');
    const validatedAway = validateTipInput(away, 'away');
    
    setTips(prev => ({
      ...prev,
      [accountId]: {
        ...prev[accountId],
        [matchId]: { 
          home: validatedHome, 
          away: validatedAway 
        }
      }
    }));
    
    // Cache leeren, da sich Daten geändert haben (debounced für bessere Performance)
    setTimeout(() => utils.clearTeamFormCache(), 500);
  }, []);

  // Verbesserte setResult-Funktion mit Validierung (ohne doppelte localStorage-Aufrufe)
  const setResult = useCallback((matchId, home, away) => {
    const clampResult = (value) => {
      const n = parseInt(value);
      if (Number.isNaN(n)) return null;
      return Math.max(0, Math.min(99, n));
    };

    setResults(prev => ({
      ...prev,
      [matchId]: {
        home: clampResult(home),
        away: clampResult(away)
      }
    }));

    // Cache leeren, da sich Daten geändert haben (debounced für bessere Performance)
    setTimeout(() => utils.clearTeamFormCache(), 500);
  }, []);

  // Multi-User Funktionen
  const handleLogin = useCallback(async (user) => {
    try {
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Benutzer-Daten laden
      const result = await userDataService.loadUserData(user.id);
      if (result.success) {
        setAccounts(result.data.accounts);
        setTips(result.data.tips);
        setResults(result.data.results);
        setCurrentRound(result.data.currentRound);
      } else {
        // Fallback zu lokalen Daten
        console.log('Keine Cloud-Daten gefunden, verwende lokale Daten');
      }
    } catch (error) {
      console.error('Login-Fehler:', error);
      setAuthError('Fehler beim Laden der Daten');
    }
  }, [setAccounts, setTips, setResults, setCurrentRound]);

  const handleRegister = useCallback(async (user) => {
    try {
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Neue Benutzer-Daten in Cloud speichern
      await userDataService.saveUserData(user.id, {
        accounts,
        tips,
        results,
        currentRound
      });
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      setAuthError('Fehler beim Speichern der Daten');
    }
  }, [accounts, tips, results, currentRound]);

  const handleLogout = useCallback(async () => {
    try {
      // Aktuelle Daten in Cloud speichern
      if (currentUser) {
        await userDataService.saveUserData(currentUser.id, {
          accounts,
          tips,
          results,
          currentRound
        });
      }
      
      // Abmelden
      await userDataService.logoutUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // Lokale Daten löschen
      setAccounts([{ id: utils.uid(), name: "Account 1", color: 0 }]);
      setTips({});
      setResults({});
      setCurrentRound(1);
    } catch (error) {
      console.error('Logout-Fehler:', error);
    }
  }, [currentUser, accounts, tips, results, currentRound, setAccounts, setTips, setResults, setCurrentRound]);

  // Automatische Synchronisation
  const syncDataToCloud = useCallback(async () => {
    if (!currentUser || !isAuthenticated) return;
    
    try {
      await userDataService.saveUserData(currentUser.id, {
        accounts,
        tips,
        results,
        currentRound
      });
    } catch (error) {
      console.error('Sync-Fehler:', error);
    }
  }, [currentUser, isAuthenticated, accounts, tips, results, currentRound]);

  // Automatische Synchronisation bei Datenänderungen
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const timeoutId = setTimeout(syncDataToCloud, 2000); // 2 Sekunden Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [accounts, tips, results, currentRound, syncDataToCloud, isAuthenticated, currentUser]);

  // Initialisierung - Prüfe ob Benutzer bereits angemeldet ist
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await userDataService.getCurrentUser();
        if (result.success && result.user) {
          await handleLogin(result.user);
        }
      } catch (error) {
        console.error('Auth-Check-Fehler:', error);
      }
    };
    
    checkAuth();
  }, [handleLogin]);



  const showTeamResults = useCallback(() => {
    setShowTeamSelector(true);
  }, []);

  // Funktion zum manuellen Hinzufügen von Spielen für zukünftige Runden
  const addManualMatch = useCallback((roundNumber) => {
    const currentMatches = results[`round-${roundNumber}-matches`] || [];
    
    // Prüfe ob bereits 6 Spiele vorhanden sind
    if (currentMatches.length >= 6) {
      alert('Maximal 6 Spiele pro Runde erlaubt!');
      return;
    }
    
    // Alle verfügbaren Teams aus ROUND_MATCHES extrahieren
    const allTeams = new Set();
    Object.values(ROUND_MATCHES).forEach(roundMatches => {
      roundMatches.forEach(match => {
        allTeams.add(match.home);
        allTeams.add(match.away);
      });
    });
    const teamList = Array.from(allTeams).sort();
    
    // Heimteam auswählen
    let homeTeamPrompt = `Heimteam für Runde ${roundNumber} (Spiel ${currentMatches.length + 1}/6):\n\n`;
    teamList.forEach((team, index) => {
      homeTeamPrompt += `${index + 1}. ${team}\n`;
    });
    homeTeamPrompt += `\nGeben Sie die Nummer (1-${teamList.length}) oder den Teamnamen ein:`;
    
    const homeTeamInput = prompt(homeTeamPrompt);
    if (!homeTeamInput) return;
    
    let homeTeam;
    const homeTeamNumber = parseInt(homeTeamInput);
    if (!isNaN(homeTeamNumber) && homeTeamNumber >= 1 && homeTeamNumber <= teamList.length) {
      homeTeam = teamList[homeTeamNumber - 1];
    } else {
      homeTeam = homeTeamInput;
    }
    
    // Auswärtsteam auswählen
    let awayTeamPrompt = `Auswärtsteam für Runde ${roundNumber} (Spiel ${currentMatches.length + 1}/6):\n\n`;
    teamList.forEach((team, index) => {
      awayTeamPrompt += `${index + 1}. ${team}\n`;
    });
    awayTeamPrompt += `\nGeben Sie die Nummer (1-${teamList.length}) oder den Teamnamen ein:`;
    
    const awayTeamInput = prompt(awayTeamPrompt);
    if (!awayTeamInput) return;
    
    let awayTeam;
    const awayTeamNumber = parseInt(awayTeamInput);
    if (!isNaN(awayTeamNumber) && awayTeamNumber >= 1 && awayTeamNumber <= teamList.length) {
      awayTeam = teamList[awayTeamNumber - 1];
    } else {
      awayTeam = awayTeamInput;
    }
    
    // Nur prüfen ob das gleiche Team gegen sich selbst spielt
    if (homeTeam === awayTeam) {
      alert('Ein Team kann nicht gegen sich selbst spielen!');
      return;
    }
    
    if (homeTeam && awayTeam && homeTeam.trim() && awayTeam.trim()) {
      const homeTeamTrimmed = homeTeam.trim();
      const awayTeamTrimmed = awayTeam.trim();
      
      // Prüfe auf doppelte Spiele
      const isDuplicate = currentMatches.some(match => 
        (match.home === homeTeamTrimmed && match.away === awayTeamTrimmed) ||
        (match.home === awayTeamTrimmed && match.away === homeTeamTrimmed)
      );
      
      if (isDuplicate) {
        alert('Dieses Spiel existiert bereits!');
        return;
      }
      
      const newMatch = {
        id: `manual-${roundNumber}-${Date.now()}`,
        home: homeTeamTrimmed,
        away: awayTeamTrimmed,
        date: `Runde ${roundNumber}`,
        venue: 'TBD'
      };
      
      const updatedMatches = [...currentMatches, newMatch];
      
      setResults(prev => ({
        ...prev,
        [`round-${roundNumber}-matches`]: updatedMatches
      }));
      
      alert(`Spiel hinzugefügt: ${homeTeam} vs ${awayTeam}`);
    }
  }, [setResults, results]);

  // Funktion zum Löschen von manuellen Spielen
  const deleteManualMatch = useCallback((roundNumber, matchId) => {
    if (confirm('Möchten Sie dieses Spiel wirklich löschen?')) {
      const currentMatches = results[`round-${roundNumber}-matches`] || [];
      const updatedMatches = currentMatches.filter(match => match.id !== matchId);
      
      setResults(prev => ({
        ...prev,
        [`round-${roundNumber}-matches`]: updatedMatches
      }));
    }
  }, [setResults, results]);

  const generateAllMatches = useCallback((roundNumber) => {
    const currentMatches = results[`round-${roundNumber}-matches`] || [];
    
    if (currentMatches.length > 0) {
      if (!confirm('Es existieren bereits Spiele in dieser Runde. Möchten Sie alle 6 Spiele neu generieren?')) {
        return;
      }
    }
    
    // Alle verfügbaren Teams
    const allTeams = new Set();
    Object.values(ROUND_MATCHES).forEach(roundMatches => {
      roundMatches.forEach(match => {
        allTeams.add(match.home);
        allTeams.add(match.away);
      });
    });
    const teamList = Array.from(allTeams).sort();
    
    // 6 zufällige Spiele generieren
    const newMatches = [];
    const usedTeams = new Set();
    
    for (let i = 0; i < 6; i++) {
      let homeTeam, awayTeam;
      let attempts = 0;
      
      do {
        homeTeam = teamList[Math.floor(Math.random() * teamList.length)];
        awayTeam = teamList[Math.floor(Math.random() * teamList.length)];
        attempts++;
      } while ((homeTeam === awayTeam || usedTeams.has(homeTeam) || usedTeams.has(awayTeam)) && attempts < 50);
      
      if (attempts >= 50) {
        alert('Konnte nicht genügend verschiedene Spiele generieren. Bitte fügen Sie Spiele manuell hinzu.');
        return;
      }
      
      usedTeams.add(homeTeam);
      usedTeams.add(awayTeam);
      
      newMatches.push({
        id: `manual-${roundNumber}-${Date.now()}-${i}`,
        home: homeTeam,
        away: awayTeam,
        date: `Runde ${roundNumber}`,
        venue: 'TBD'
      });
    }
    
    setResults(prev => ({
      ...prev,
      [`round-${roundNumber}-matches`]: newMatches
    }));
    
    alert(`6 Spiele für Runde ${roundNumber} generiert!`);
  }, [setResults, results]);

  const showTeamDetails = useCallback((teamName) => {
    const teamForm = utils.getTeamForm(teamName, results, currentRound);
    
    if (!teamForm.recentResults || teamForm.recentResults.length === 0) {
      alert(`${teamName}: Keine Ergebnisse verfügbar`);
      return;
    }
    
    // Detaillierte Ergebnis-Anzeige erstellen
    const resultsText = teamForm.recentResults.map((result, index) => {
      const homeAway = result.isHome ? 'H' : 'A';
      const resultEmoji = result.outcome === 'W' ? '✅' : result.outcome === 'D' ? '⚖️' : '❌';
      const resultText = result.outcome === 'W' ? 'Sieg' : result.outcome === 'D' ? 'Remis' : 'Niederlage';
      const points = result.outcome === 'W' ? 3 : result.outcome === 'D' ? 1 : 0;
      
      return `${index + 1}. R${result.round}: ${result.opponent} ${homeAway} ${result.score} ${resultEmoji} ${resultText} (${points}P)`;
    }).join('\n');
    
    const totalPoints = teamForm.points;
    const avgPoints = teamForm.avgPoints.toFixed(1);
    const trendText = teamForm.formTrend === 'good' ? '📈 Aufwärtstrend' : 
                     teamForm.formTrend === 'bad' ? '📉 Abwärtstrend' : '➡️ Stabil';
    
    const summaryText = `\n📊 ZUSAMMENFASSUNG:\n` +
                       `Gesamtpunkte: ${totalPoints}P\n` +
                       `Durchschnitt: ${avgPoints}P/Spiel\n` +
                       `Form: ${teamForm.form}\n` +
                       `Trend: ${trendText}`;
    
    alert(`${teamName.toUpperCase()} - LETZTE ${teamForm.recentResults.length} ERGEBNISSE\n\n${resultsText}${summaryText}`);
  }, [results, currentRound]);

  const generateSmartTip = useCallback((homeTeam, awayTeam) => {
    const homeForm = utils.getTeamForm(homeTeam, results, currentRound);
    const awayForm = utils.getTeamForm(awayTeam, results, currentRound);
    
    // Basis-Bewertung für beide Teams
    const homeStrength = homeForm.avgPoints || 0;
    const awayStrength = awayForm.avgPoints || 0;
    
    // Heimvorteil (ca. 0.5 Punkte Vorteil)
    const homeAdvantage = 0.5;
    const adjustedHomeStrength = homeStrength + homeAdvantage;
    
    // Form-Trend-Bewertung
    const homeTrendBonus = homeForm.formTrend === 'good' ? 0.3 : homeForm.formTrend === 'bad' ? -0.3 : 0;
    const awayTrendBonus = awayForm.formTrend === 'good' ? 0.3 : awayForm.formTrend === 'bad' ? -0.3 : 0;
    
    const finalHomeStrength = adjustedHomeStrength + homeTrendBonus;
    const finalAwayStrength = awayStrength + awayTrendBonus;
    
    // Ergebnis-Vorhersage basierend auf Stärke-Unterschied
    const strengthDiff = finalHomeStrength - finalAwayStrength;
    
    let predictedResult, confidence, reasoning;
    
    if (strengthDiff > 1.5) {
      // Deutlicher Heimsieg
      predictedResult = { home: 2, away: 0 };
      confidence = 'Hoch';
      reasoning = `${homeTeam} ist deutlich stärker (${finalHomeStrength.toFixed(1)} vs ${finalAwayStrength.toFixed(1)}P)`;
    } else if (strengthDiff > 0.5) {
      // Leichter Heimsieg
      predictedResult = { home: 2, away: 1 };
      confidence = 'Mittel';
      reasoning = `${homeTeam} ist etwas stärker (${finalHomeStrength.toFixed(1)} vs ${finalAwayStrength.toFixed(1)}P)`;
    } else if (strengthDiff > -0.5) {
      // Unentschieden
      predictedResult = { home: 1, away: 1 };
      confidence = 'Mittel';
      reasoning = `Ausgeglichene Kräfte (${finalHomeStrength.toFixed(1)} vs ${finalAwayStrength.toFixed(1)}P)`;
    } else if (strengthDiff > -1.5) {
      // Leichter Auswärtssieg
      predictedResult = { home: 1, away: 2 };
      confidence = 'Mittel';
      reasoning = `${awayTeam} ist etwas stärker (${finalAwayStrength.toFixed(1)} vs ${finalHomeStrength.toFixed(1)}P)`;
    } else {
      // Deutlicher Auswärtssieg
      predictedResult = { home: 0, away: 2 };
      confidence = 'Hoch';
      reasoning = `${awayTeam} ist deutlich stärker (${finalAwayStrength.toFixed(1)} vs ${finalHomeStrength.toFixed(1)}P)`;
    }
    
    // Zusätzliche Faktoren
    const additionalFactors = [];
    
    // Heimform vs Auswärtsform
    const homeHomeGames = homeForm.recentResults?.filter(r => r.isHome) || [];
    const awayAwayGames = awayForm.recentResults?.filter(r => !r.isHome) || [];
    
    if (homeHomeGames.length > 0) {
      const homeHomeAvg = homeHomeGames.reduce((sum, r) => sum + (r.outcome === 'W' ? 3 : r.outcome === 'D' ? 1 : 0), 0) / homeHomeGames.length;
      if (homeHomeAvg > 2) additionalFactors.push(`${homeTeam} stark zu Hause (${homeHomeAvg.toFixed(1)}P)`);
      else if (homeHomeAvg < 1) additionalFactors.push(`${homeTeam} schwach zu Hause (${homeHomeAvg.toFixed(1)}P)`);
    }
    
    if (awayAwayGames.length > 0) {
      const awayAwayAvg = awayAwayGames.reduce((sum, r) => sum + (r.outcome === 'W' ? 3 : r.outcome === 'D' ? 1 : 0), 0) / awayAwayGames.length;
      if (awayAwayAvg > 2) additionalFactors.push(`${awayTeam} stark auswärts (${awayAwayAvg.toFixed(1)}P)`);
      else if (awayAwayAvg < 1) additionalFactors.push(`${awayTeam} schwach auswärts (${awayAwayAvg.toFixed(1)}P)`);
    }
    
    // Aktuelle Form
    if (homeForm.formTrend === 'good') additionalFactors.push(`${homeTeam} in Aufwärtstrend`);
    if (awayForm.formTrend === 'good') additionalFactors.push(`${awayTeam} in Aufwärtstrend`);
    if (homeForm.formTrend === 'bad') additionalFactors.push(`${homeTeam} in Abwärtstrend`);
    if (awayForm.formTrend === 'bad') additionalFactors.push(`${awayTeam} in Abwärtstrend`);
    
    const smartTipData = {
      predictedResult,
      confidence,
      reasoning,
      additionalFactors,
      homeForm: homeForm.form,
      awayForm: awayForm.form,
      homeStrength: finalHomeStrength,
      awayStrength: finalAwayStrength
    };

    // Modal anzeigen
    const modalContent = {
      title: '🎯 Smarte Tipp-Vorschlag',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {homeTeam} vs {awayTeam}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <div className="text-center mb-3">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {predictedResult.home}:{predictedResult.away}
              </div>
              <div className="text-sm text-gray-600">Vorschlag</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-700">Vertrauen:</div>
                <div className="text-blue-600">{confidence}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Heimvorteil:</div>
                <div className="text-green-600">+0.5 Punkte</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="font-semibold text-gray-700 mb-2">Begründung:</div>
            <div className="text-gray-600">{reasoning}</div>
          </div>
          
          {additionalFactors.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="font-semibold text-gray-700 mb-2">Zusätzliche Faktoren:</div>
              <div className="space-y-1">
                {additionalFactors.map((factor, index) => (
                  <div key={index} className="text-sm text-gray-600">• {factor}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    };
    
    setModalContent(modalContent);
    setShowModal(true);
    
    return smartTipData;
  }, [results, currentRound]);

  const showCorrectGames = useCallback((accountId) => {
    const correctGames = currentMatches
      .map((match, index) => {
        const result = results[match.id];
        const tip = tips[accountId]?.[match.id];
        const points = result && result.home !== null && result.away !== null ? utils.calculatePoints(tip, result) : 0;
        return { index: index + 1, match: `${match.home} vs ${match.away}`, points };
      })
      .filter(game => game.points === 3);
    
    if (correctGames.length === 0) {
      alert('Keine exakten Tipps in dieser Runde!');
      return;
    }
    
    const accountName = accounts.find(a => a.id === accountId)?.name || 'Unbekannt';
    const gameList = correctGames.map(game => `Spiel ${game.index}: ${game.match}`).join('\n');
    alert(`${accountName} - Exakte Tipps (${correctGames.length}/6):\n\n${gameList}`);
  }, [currentMatches, results, tips, accounts, currentRound]);

  const showTeamFormDetails = useCallback((teamName, teamForm) => {
    if (!teamForm.recentResults || teamForm.recentResults.length === 0) {
      alert(`${teamName}: Keine Form-Daten verfügbar`);
      return;
    }
    
    const formDetails = teamForm.recentResults.map((result, index) => {
      const homeAway = result.isHome ? 'H' : 'A';
      const resultText = result.outcome === 'W' ? '✅ Sieg' : result.outcome === 'D' ? '⚖️ Remis' : '❌ Niederlage';
      return `R${result.round}: ${result.opponent} ${homeAway} ${result.score} ${resultText}`;
    }).join('\n');
    
    const avgPoints = teamForm.avgPoints.toFixed(1);
    const trendText = teamForm.formTrend === 'good' ? '📈 Aufwärtstrend' : 
                     teamForm.formTrend === 'bad' ? '📉 Abwärtstrend' : '➡️ Stabil';
    
    alert(`${teamName} - Form der letzten ${teamForm.recentResults.length} Spiele:\n\n${formDetails}\n\nDurchschnitt: ${avgPoints} Punkte/Spiel\nTrend: ${trendText}`);
  }, []);

  const showTipHistory = useCallback((accountId) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    
    // Sammle alle Tipps des Accounts
    const accountTips = tips[accountId] || {};
    const tipHistory = [];
    
    // Gehe durch alle Runden
    for (let round = 1; round <= 22; round++) {
      const roundMatches = ROUND_MATCHES[round] || [];
      const roundTips = [];
      
      roundMatches.forEach(match => {
        const tip = accountTips[match.id];
        const result = results[match.id];
        if (tip && tip.home !== null && tip.away !== null) {
          const points = result && result.home !== null && result.away !== null ? utils.calculatePoints(tip, result) : 0;
          const status = points === 3 ? '✅' : points >= 1 ? '🟡' : '❌';
          roundTips.push(`${match.home} vs ${match.away}: ${tip.home}:${tip.away} ${status}`);
        }
      });
      
      if (roundTips.length > 0) {
        tipHistory.push(`Runde ${round}:\n${roundTips.join('\n')}`);
      }
    }
    
    if (tipHistory.length === 0) {
      alert(`${account.name}: Keine Tipp-Historie verfügbar`);
      return;
    }
    
    const historyText = tipHistory.join('\n\n');
    alert(`${account.name.toUpperCase()} - TIPP-HISTORIE\n\n${historyText}`);
  }, [accounts, tips, results]);





  // Swipe Navigation
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentRound < 22) {
      setCurrentRound(currentRound + 1);
    }
    if (isRightSwipe && currentRound > 1) {
      setCurrentRound(currentRound - 1);
    }
  };

  // Mobile UX States
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'matches', 'settings'
  const [collapsedSections, setCollapsedSections] = useState({
    accounts: false,
    leaderboard: false,
    roundOverview: false,
    currentRound: false
  });

  // Loading und Error States
  const [error, setError] = useState(null);
  const debugMode = false; // Debug-Modus für Performance-Optimierung

  // Erweiterte Speicher-Management
  const clearStorage = useCallback(async () => {
    try {
      setIsLoading(true);
      await robustStorage.clearAllData();
      window.location.reload();
    } catch (error) {
      console.error('Fehler beim Löschen des Speichers:', error);
      setError('Fehler beim Löschen des Speichers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkStorageHealth = useCallback(async () => {
    try {
      const storageInfo = await robustStorage.checkStorageSpace();
      const validations = await Promise.all([
        robustStorage.validateData('admiral-accounts'),
        robustStorage.validateData('admiral-tips'),
        robustStorage.validateData('admiral-results'),
        robustStorage.validateData('admiral-current-round')
      ]);

      const healthReport = {
        storage: storageInfo,
        validations,
        meta: {
          accounts: accountsMeta,
          tips: tipsMeta,
          results: resultsMeta,
          currentRound: currentRoundMeta
        }
      };

      console.log('Speicher-Gesundheitsbericht:', healthReport);
      return healthReport;
    } catch (error) {
      console.error('Fehler beim Gesundheitscheck:', error);
      return null;
    }
  }, [accountsMeta, tipsMeta, resultsMeta, currentRoundMeta]);

  const exportData = useCallback(() => {
    try {
      const data = {
        accounts,
        tips,
        results,
        currentRound,
        timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
    a.href = url;
      a.download = `bundesliga-sixpack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Fehler beim Exportieren:', error);
      setError('Fehler beim Exportieren der Daten');
    }
  }, [accounts, tips, results, currentRound]);

  const importData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.accounts) setAccounts(data.accounts);
        if (data.tips) setTips(data.tips);
        if (data.results) setResults(data.results);
        if (data.currentRound) setCurrentRound(data.currentRound);
        alert('Daten erfolgreich importiert!');
      } catch (error) {
        console.error('Fehler beim Importieren:', error);
        setError('Ungültige Datei');
      }
    };
    reader.readAsText(file);
  }, [setAccounts, setTips, setResults, setCurrentRound]);

  // Neue Funktionen für unabhängige Nutzung
  const exportCurrentRound = useCallback(() => {
    try {
      fileUtils.exportCurrentRound(accounts, tips, results, currentRound);
      alert(`Runde ${currentRound} erfolgreich exportiert!`);
    } catch (error) {
      console.error('Fehler beim Exportieren der Runde:', error);
      setError('Fehler beim Exportieren der Runde');
    }
  }, [accounts, tips, results, currentRound]);

  const importCurrentRound = useCallback((file) => {
    fileUtils.importRoundData(file)
      .then((roundData) => {
        // Nur die Daten der aktuellen Runde importieren
        if (roundData.accounts) {
          setAccounts(roundData.accounts);
        }
        if (roundData.matches) {
          roundData.matches.forEach(match => {
            if (match.result) {
              setResults(prev => ({
                ...prev,
                [match.matchId]: match.result
              }));
            }
          });
        }
        if (roundData.tips) {
          setTips(prev => ({
            ...prev,
            ...roundData.tips
          }));
        }
        alert(`Runde ${roundData.round} erfolgreich importiert!`);
      })
      .catch((error) => {
        console.error('Fehler beim Importieren der Runde:', error);
        setError('Fehler beim Importieren der Runde');
      });
  }, [setAccounts, setResults, setTips]);

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  // Reset active tab to matches on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setActiveTab('overview');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatische Backup-Erstellung (alle 30 Minuten - reduziert für bessere Performance)
  useEffect(() => {
    const backupInterval = setInterval(async () => {
      try {
        const backup = await robustStorage.createBackup();
        if (debugMode) console.log('Automatisches Backup erstellt:', backup.timestamp);
      } catch (error) {
        console.error('Automatisches Backup fehlgeschlagen:', error);
      }
    }, 30 * 60 * 1000); // 30 Minuten - weniger häufig für bessere Performance

    return () => clearInterval(backupInterval);
  }, []);

  // Speicherplatz-Überwachung (alle 10 Minuten - reduziert für bessere Performance)
  useEffect(() => {
    const storageCheckInterval = setInterval(async () => {
      try {
        const storageInfo = await robustStorage.checkStorageSpace();
        const totalSize = storageInfo.localStorage.size + storageInfo.indexedDB.size;
        
        // Warnung bei hohem Speicherverbrauch (>15MB - erhöht für weniger Warnungen)
        if (totalSize > 15 * 1024 * 1024) {
          console.warn('Hoher Speicherverbrauch erkannt:', Math.round(totalSize / 1024 / 1024), 'MB');
        }
      } catch (error) {
        console.error('Speicherplatz-Überwachung fehlgeschlagen:', error);
      }
    }, 10 * 60 * 1000); // 10 Minuten - weniger häufig für bessere Performance

    return () => clearInterval(storageCheckInterval);
  }, []);

  const exportRoundAsTxt = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const roundData = currentMatches.map((match, index) => {
      const result = results[match.id];
      const homeForm = utils.getTeamForm(match.home, results, currentRound);
      const awayForm = utils.getTeamForm(match.away, results, currentRound);
      
      let matchText = `\nSPIEL ${index + 1}: ${match.home} vs ${match.away}\n`;
      matchText += `Form: ${homeForm.form} | ${awayForm.form}\n`;
      
      if (result && result.home !== null && result.away !== null) {
        matchText += `Ergebnis: ${result.home}:${result.away}\n`;
      } else {
        matchText += `Ergebnis: -:-\n`;
      }
      
      matchText += `Tipps:\n`;
      accounts.forEach(account => {
        const tip = tips[account.id]?.[match.id];
        const points = result && result.home !== null && result.away !== null ? utils.calculatePoints(tip, result) : 0;
        const tipText = tip && tip.home !== null && tip.away !== null ? `${tip.home}:${tip.away}` : '-:-';
        const status = points === 3 ? '✅ Richtig' : 
                      points === 0 && tip ? '❌ Falsch' : '⏳ Offen';
        matchText += `  ${account.name}: ${tipText} ${status}\n`;
      });
      
      return matchText;
    }).join('\n' + '─'.repeat(50) + '\n');
    
    const exportText = `ADMIRAL BUNDESLIGA SIXPACK - RUNDE ${currentRound}

Datum: ${new Date().toLocaleDateString('de-DE')}
Zeit: ${new Date().toLocaleTimeString('de-DE')}

${'='.repeat(60)}

${roundData}

${'='.repeat(60)}

Rangliste Runde ${currentRound}:
${currentRoundPoints.map((account, index) => 
  `${index + 1}. ${account.name}: ${account.correctPredictions}/6 richtig`
).join('\n')}

${'='.repeat(60)}
Exportiert von Admiral Bundesliga Sixpack Tracker`;

      const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bundesliga-sixpack-runde-${currentRound}-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Fehler beim Export:', error);
      setError('Fehler beim Export der Daten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMatches, results, tips, accounts, currentRound, currentRoundPoints]);

  // Render-Funktionen
  const renderAccountRow = useCallback((account) => (
    <div key={account.id} className={`p-3 rounded-lg border ${COLORS[account.color]}`}>
      <div className="flex justify-between items-center">
        <span className="font-medium">{account.name}</span>
        <button
          onClick={() => deleteAccount(account.id)}
          className="text-red-500 hover:text-red-700"
        >
          🗑️
        </button>
      </div>
    </div>
  ), [deleteAccount]);

  const renderMatchRow = useCallback((match) => {
    // Sicherheitsprüfung für match Objekt
    if (!match || !match.id || !match.home || !match.away) {
      console.warn('Ungültiges match Objekt:', match);
      return null;
    }
    
    const result = results[match.id];
    const hasResult = result && result.home !== null && result.away !== null;
    const homeForm = utils.getTeamForm(match.home, results, currentRound);
    const awayForm = utils.getTeamForm(match.away, results, currentRound);
    const isManualMatch = match.id && typeof match.id === 'string' && match.id.startsWith('manual-');

  return (
      <div 
        key={match.id} 
        className="bg-gray-50 rounded-lg p-6 border border-gray-200"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Spiel-Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-800 mb-1 flex items-center justify-between">
              <span>{match.home} vs {match.away}</span>
              {isManualMatch && currentRound > 22 && (
                <button
                  onClick={() => deleteManualMatch(currentRound, match.id)}
                  className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-all"
                  title="Spiel löschen"
                >
                  🗑️
                </button>
              )}
          </div>
            <div className="text-sm text-gray-500 space-y-1">
              <div>Spiel-ID: {match.id}</div>
              <div className="flex flex-col gap-1">
                <div className="text-xs">
                  <span className="font-semibold text-blue-600">{match.home}:</span>
                  <button 
                    onClick={() => showTeamFormDetails(match.home, homeForm)}
                    className={`ml-1 px-1 py-0.5 rounded text-xs font-mono cursor-pointer hover:scale-105 transition-transform ${
                      homeForm.formTrend === 'good' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      homeForm.formTrend === 'bad' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                      'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}>
                    {homeForm.formDisplay || 'N/A'}
                  </button>
                  <span className="ml-1 text-gray-600">({homeForm.form})</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-purple-600">{match.away}:</span>
                  <button 
                    onClick={() => showTeamFormDetails(match.away, awayForm)}
                    className={`ml-1 px-1 py-0.5 rounded text-xs font-mono cursor-pointer hover:scale-105 transition-transform ${
                      awayForm.formTrend === 'good' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      awayForm.formTrend === 'bad' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                      'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}>
                    {awayForm.formDisplay || 'N/A'}
                  </button>
                  <span className="ml-1 text-gray-600">({awayForm.form})</span>
                </div>
              </div>
            </div>
          </div>
          {hasResult && (
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Endergebnis</div>
              <div className="text-2xl font-bold text-green-600 bg-green-100 px-3 py-1 rounded-lg">
                {result.home} : {result.away}
              </div>
            </div>
          )}
        </div>
        
        {/* Smarte Tipp-Vorschlag */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4 border border-purple-200">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-semibold text-purple-700">🤖 Smarte Tipp-Vorschlag:</div>
            <button
              onClick={() => {
                const smartTip = generateSmartTip(match.home, match.away);
                const confidenceColor = smartTip.confidence === 'Hoch' ? 'text-green-600' : 
                                      smartTip.confidence === 'Mittel' ? 'text-yellow-600' : 'text-red-600';
                
                const tipText = `SMARTE TIPP-VORSCHLAG: ${match.home} vs ${match.away}\n\n` +
                               `🎯 Vorhersage: ${smartTip.predictedResult.home}:${smartTip.predictedResult.away}\n` +
                               `📊 Konfidenz: ${smartTip.confidence}\n\n` +
                               `📈 BEGRÜNDUNG:\n${smartTip.reasoning}\n\n` +
                               `📋 FORM-DETAILS:\n` +
                               `${match.home}: ${smartTip.homeForm} (${smartTip.homeStrength.toFixed(1)}P)\n` +
                               `${match.away}: ${smartTip.awayForm} (${smartTip.awayStrength.toFixed(1)}P)\n\n` +
                               `🔍 ZUSÄTZLICHE FAKTOREN:\n` +
                               (smartTip.additionalFactors.length > 0 ? smartTip.additionalFactors.join('\n') : 'Keine besonderen Faktoren');
                
                alert(tipText);
              }}
              className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-xs shadow-md"
            >
              🎯 Tipp generieren
            </button>
              </div>
          <div className="text-xs text-purple-600">
            Klicken Sie auf "Tipp generieren" für eine KI-basierte Vorhersage basierend auf Mannschaftsform, Heimvorteil und Trends.
          </div>
        </div>

        {/* Ergebnis-Eingabe */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <div className="text-sm font-semibold text-gray-700 mb-3">🏆 Endergebnis eintragen:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Heim ({match.home})</label>
                             <input
                 type="number"
                 placeholder="0"
                 value={result?.home ?? ''}
                 onChange={(e) => {
                   setResult(match.id, e.target.value, result?.away);
                 }}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-bold"
               />
              </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Auswärts ({match.away})</label>
                             <input
                 type="number"
                 placeholder="0"
                 value={result?.away ?? ''}
                 onChange={(e) => {
                   setResult(match.id, result?.home, e.target.value);
                 }}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-bold"
               />
            </div>
          </div>
        </div>

        {/* Tipps der Accounts */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-semibold text-gray-700 mb-3">🎯 Tipps der Accounts:</div>
          
          {/* Schnell-Tipp-Buttons */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-semibold text-gray-600 mb-2">⚡ Schnell-Tipp für alle Accounts:</div>
            <div className="flex flex-wrap gap-1">
              {[
                { label: '1:0', home: 1, away: 0 },
                { label: '1:1', home: 1, away: 1 },
                { label: '2:1', home: 2, away: 1 },
                { label: '2:0', home: 2, away: 0 },
                { label: '0:1', home: 0, away: 1 },
                { label: '1:2', home: 1, away: 2 },
                { label: '0:0', home: 0, away: 0 },
                { label: '2:2', home: 2, away: 2 }
              ].map((quickTip, index) => (
                <button
                  key={index}
                  onClick={() => {
                    accounts.forEach(account => {
                      setTip(account.id, match.id, quickTip.home, quickTip.away);
                    });
                  }}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
                >
                  {quickTip.label}
                </button>
              ))}
              </div>
        </div>
          <div className="space-y-3">
            {accounts.map(account => {
              const tip = tips[account.id]?.[match.id];
              const points = hasResult ? utils.calculatePoints(tip, result) : 0;
              
              return (
                <div key={account.id} className={`p-3 rounded-lg border-2 ${COLORS[account.color]}`}>
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-semibold text-sm">{account.name}</span>
                      <button
                        onClick={() => showTipHistory(account.id)}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                        title="Tipp-Historie anzeigen"
                      >
                        📊
                      </button>
                      <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">H</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            placeholder="0"
                            value={tip?.home ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setTip(account.id, match.id, value, tip?.away);
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              const validatedValue = validateTipInput(value, 'home');
                              if (validatedValue !== parseInt(value)) {
                                setTip(account.id, match.id, validatedValue, tip?.away);
                              }
                            }}
                            className="w-full sm:w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">A</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            placeholder="0"
                            value={tip?.away ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setTip(account.id, match.id, tip?.home, value);
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              const validatedValue = validateTipInput(value, 'away');
                              if (validatedValue !== parseInt(value)) {
                                setTip(account.id, match.id, tip?.home, validatedValue);
                              }
                            }}
                            className="w-full sm:w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    {hasResult && (
                      <div className="w-full sm:w-auto sm:text-right">
                        <div className="text-xs text-gray-600 mb-1">Tipp</div>
                        <div className={`inline-block max-w-full break-words text-xs sm:text-sm font-bold px-3 py-1 rounded-lg ${
                          points === 3 ? 'bg-green-100 text-green-800 border border-green-300' :
                          'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {points === 3 ? '✅ Richtig' : '❌ Falsch'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }, [accounts, tips, results, setTip, setResult]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 pb-20 lg:pb-6 overflow-x-hidden">
      {/* Globale Deaktivierung aller Animationen/Transitions */}
      <style>{`*{animation:none !important;transition:none !important;}`}</style>
      {/* Auth Check - Zeige Login/Register wenn nicht angemeldet */}
      {!isAuthenticated ? (
        <Auth onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
            <div>
                    <h3 className="font-semibold text-red-800">Fehler aufgetreten</h3>
                    <p className="text-red-600 text-sm">{error}</p>
            </div>
            </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 text-xl"
                >
                  ×
                </button>
          </div>
            </div>
          )}

          {/* Loading Overlay */}
          {typeof isLoading !== 'undefined' && isLoading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Lade...</p>
            </div>
            </div>
          )}
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  Admiral Bundesliga Sixpack
                </h1>
                <p className="text-base lg:text-lg text-gray-600 font-medium">
                  Saison 2025/26 • Runde {currentRound}
                </p>
                {currentUser && (
                  <p className="text-sm text-gray-500 mt-1">
                    Angemeldet als: {currentUser.user_metadata?.display_name || currentUser.email}
                  </p>
                )}
              </div>
              <div className="mt-6 lg:mt-0 lg:ml-8 flex items-center gap-4">
                <div className="text-5xl lg:text-6xl font-black text-white bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-2xl shadow-lg">
                  R{currentRound}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg text-sm"
                >
                  🚪 Abmelden
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Quick Overview */}
          <div className="lg:hidden mb-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/30">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">📱 Schnellübersicht</h3>
                <div className="text-sm text-gray-600">
                  Runde {currentRound}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{accounts.length}</div>
                  <div className="text-xs text-gray-600">Accounts</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {currentRoundPoints.reduce((sum, acc) => sum + acc.correctPredictions, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Richtige Tipps</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Übersicht Panel */}
            <div className={`lg:col-span-1 space-y-6 sm:space-y-8 ${activeTab === 'overview' ? 'block' : 'hidden lg:block'}`}>
              {/* Aktuelle Runde */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('currentRound')}
                >
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      ⚽
                    </div>
                    Aktuelle Runde {currentRound}
                  </h2>
                  <div className="text-2xl text-gray-500 transform transition-transform">
                    {collapsedSections.currentRound ? '▼' : '▲'}
                  </div>
                </div>
                
                {!collapsedSections.currentRound && (
                  <div className="mt-6 space-y-4">
                    {currentRoundPoints.map((account, index) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
            </div>
            <div>
                            <div className="font-semibold text-gray-800">{account.name}</div>
                            <div className="text-sm text-gray-600">{account.correctPredictions} von 6 richtig</div>
            </div>
          </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{account.correctPredictions}</div>
                          <div className="text-xs text-gray-500">Richtig</div>
        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>



              {/* Runden-Übersicht */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('roundOverview')}
                >
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      📋
                    </div>
                    Runden-Übersicht
                  </h2>
                  <div className="text-2xl text-gray-500 transform transition-transform">
                    {collapsedSections.roundOverview ? '▼' : '▲'}
                  </div>
                </div>
                
                {!collapsedSections.roundOverview && (
                  <div className="mt-6 space-y-2">
                    {[1, 2, 3, 4, 5, 6].map(round => {
                      const roundMatches = ROUND_MATCHES[round] || [];
                      const roundResults = roundMatches.filter(match => 
                        results[match.id] && results[match.id].home !== null && results[match.id].away !== null
                      ).length;
                      const matchesWithAllTips = roundMatches.filter(match => 
                        accounts.every(account => {
                          const accountTips = tips[account.id] || {};
                          const t = accountTips[match.id];
                          return t && t.home !== null && t.away !== null;
                        })
                      ).length;
                      
  return (
                        <div 
                          key={round} 
                          className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                            currentRound === round
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => setCurrentRound(round)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm">Runde {round}</span>
                            <div className="text-xs opacity-75">
                              {matchesWithAllTips}/{roundMatches.length} Tipps
                            </div>
                          </div>
                          <div className="text-xs opacity-75">
                            {roundResults}/{roundMatches.length} Ergebnisse
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Accounts Panel entfernt (leere Spalte beseitigt) */}

            {/* Hauptbereich - Spiele & Tipps */}
            <div className={`lg:col-span-3 ${activeTab === 'matches' ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                      ⚽
                    </div>
                    Spiele & Tipps - Runde {currentRound}
                  </h2>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={showTeamResults}
                      className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg text-sm"
                    >
                      🏆 Mannschafts-Ergebnisse
                    </button>
                    <button
                      onClick={exportRoundAsTxt}
                      className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-lg text-sm"
                    >
                      📄 Export TXT
                    </button>
                  </div>
                  

                </div>
                
                {/* Runden-Navigation */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 border border-gray-200/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
                    <button
                      onClick={() => setCurrentRound(Math.max(1, currentRound - 1))}
                      disabled={currentRound === 1}
                      className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                    >
                      ← Vorherige
                    </button>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800 mb-1">
                        Runde {currentRound}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
    
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentRound(currentRound + 1)}
                      className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg"
                    >
                      Nächste →
                    </button>
                  </div>
                  
                  {/* Schnell-Navigation */}
                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    <button
                      onClick={() => setCurrentRound(1)}
                      className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-medium ${
                        currentRound >= 1 && currentRound <= 6 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      Runden 1-6
                    </button>
                    <button
                      onClick={() => setCurrentRound(7)}
                      className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-medium ${
                        currentRound >= 7 && currentRound <= 12 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      Runden 7-12
                    </button>
                    <button
                      onClick={() => setCurrentRound(13)}
                      className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-medium ${
                        currentRound >= 13 && currentRound <= 18 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      Runden 13-18
                    </button>
                    <button
                      onClick={() => setCurrentRound(19)}
                      className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-medium ${
                        currentRound >= 19 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      Runden 19-22
                    </button>
                  </div>
                </div>



                {/* Spiele */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      🎯
                    </div>
                    Spiele der Runde {currentRound}
                    {currentRound > 22 && (
                      <span className="text-sm font-normal text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">
                        📝 Manuell
                      </span>
                    )}
                  </h3>
                  
                  {/* Manuelle Spieleingabe für Runden > 22 */}
                  {currentRound > 22 && (
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 mb-4">
                                      <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-orange-800">Manuelle Spieleingabe</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateAllMatches(currentRound)}
                        className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium text-xs"
                      >
                        🎲 6 Spiele generieren
                      </button>
                      <button
                        onClick={() => addManualMatch(currentRound)}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium text-sm"
                      >
                        ➕ Spiel hinzufügen
                      </button>
                    </div>
                  </div>
                                      <p className="text-sm text-orange-700 mb-3">
                    Fügen Sie manuell Spiele für Runde {currentRound} hinzu. <strong>Frei wählbar:</strong> Wählen Sie aus allen verfügbaren Mannschaften, wer gegen wen spielt. Maximal 6 Spiele pro Runde.
                  </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-orange-600">
                          Spiele: {currentMatches.length}/6
                        </span>
                        <div className="w-32 bg-orange-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentMatches.length / 6) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      {currentMatches.length === 0 && (
                        <div className="text-center py-4 text-orange-600 break-words">
                          <div className="text-2xl mb-2">📝</div>
                          <p>Noch keine Spiele für Runde {currentRound} eingetragen</p>
                          <p className="text-xs mt-1">Klicken Sie auf "Spiel hinzufügen" um zu beginnen</p>
                        </div>
                      )}
                      {currentMatches.length >= 6 && (
                        <div className="text-center py-2 text-green-600 bg-green-50 rounded-lg">
                          <div className="text-lg mb-1">✅</div>
                          <p className="text-sm font-medium">Alle 6 Spiele eingetragen!</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div 
                    className="space-y-6"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {Array.isArray(currentMatches) ? currentMatches.map(renderMatchRow).filter(Boolean) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-2xl mb-2">⚠️</div>
                        <p>Keine Spiele für Runde {currentRound} verfügbar</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats & Settings View */}
            <div className={`lg:col-span-4 ${activeTab === 'settings' ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                    ⚙️
                  </div>
                  Statistiken & Einstellungen
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Account Statistiken */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Account Übersicht</h3>
                    <div className="space-y-3">
                      {accounts.map((account, index) => {
                        const accountTips = tips[account.id] || {};
                        const totalTips = Object.values(accountTips).filter(tip => 
                          tip && tip.home !== null && tip.away !== null
                        ).length;
                        const totalResults = Object.values(results).filter(result => 
                          result && result.home !== null && result.away !== null
                        ).length;
                        const correctTips = Object.keys(accountTips).filter(matchId => {
                          const tip = accountTips[matchId];
                          const result = results[matchId];
                          return tip && result && tip.home !== null && tip.away !== null && 
                                 result.home !== null && result.away !== null &&
                                 utils.calculatePoints(tip, result) === 3;
                        }).length;
                        
  return (
                          <div key={account.id} className={`p-3 rounded-lg border-2 ${COLORS[account.color]}`}>
                            <div className="font-semibold text-sm mb-1">{account.name}</div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>Tipps: {totalTips}</div>
                              <div>Richtig: {correctTips}</div>
                              <div>Quote: {totalTips > 0 ? `${Math.round((correctTips/totalTips)*100)}%` : '0%'}</div>
        </div>
                          </div>
                        );
                      })}
        </div>
      </div>



                  {/* Aktuelle Runde Details */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">⚽ Runde {currentRound}</h3>
                    <div className="space-y-3">
                      <div className="text-center p-4 bg-white/50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {currentRoundPoints.reduce((sum, acc) => sum + acc.correctPredictions, 0)}
                </div>
                        <div className="text-sm text-gray-600">Richtige Tipps gesamt</div>
                </div>
                      <div className="space-y-2">
                        {currentRoundPoints.map((account, index) => (
                          <div key={account.id} className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                            <span className="text-sm font-medium">{account.name}</span>
                            <span className="text-sm font-bold text-purple-600">
                              {account.correctPredictions}/6
                            </span>
              </div>
            ))}
                      </div>
                    </div>
                  </div>

                  {/* Accounts Management */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Accounts Management</h3>
                    <div className="space-y-3 mb-4">
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {accounts.map(renderAccountRow)}
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                          placeholder="Account Name..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && addAccount()}
                        />
                        <button
                          onClick={addAccount}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium text-sm"
                        >
                          ➕
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Einstellungen & Daten-Management */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ Einstellungen</h3>
                    <div className="space-y-3">
                      <button
                        onClick={exportData}
                        className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium text-sm"
                      >
                        💾 Backup erstellen
                      </button>
                      <button
                        onClick={() => document.getElementById('importFile').click()}
                        className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-medium text-sm"
                      >
                        📥 Backup importieren
                      </button>
                      
                      {/* Neue Funktionen für unabhängige Nutzung */}
                      <div className="border-t border-orange-200 pt-3 mt-3">
                        <h4 className="text-sm font-semibold text-orange-800 mb-2">📁 Unabhängige Nutzung</h4>
                <div className="space-y-2">
                          <button
                            onClick={exportCurrentRound}
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium text-sm"
                          >
                            📤 Runde {currentRound} exportieren
                          </button>
                          <button
                            onClick={() => document.getElementById('importRoundFile').click()}
                            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium text-sm"
                          >
                            📥 Runde importieren
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={async () => {
                          const health = await checkStorageHealth();
                          if (health) {
                            alert(`Speicher-Status:\n\n` +
                              `localStorage: ${health.storage.localStorage.available ? '✅' : '❌'} (${Math.round(health.storage.localStorage.size / 1024)}KB)\n` +
                              `IndexedDB: ${health.storage.indexedDB.available ? '✅' : '❌'} (${Math.round(health.storage.indexedDB.size / 1024)}KB)\n` +
                              `SessionStorage: ${health.storage.sessionStorage.available ? '✅' : '❌'}\n\n` +
                              `Daten-Integrität: ${health.validations.every(v => v.isValid) ? '✅ Gut' : '⚠️ Probleme'}`);
                          }
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all font-medium text-sm"
                      >
                        🔍 Speicher-Status
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('⚠️ WARNUNG: Möchten Sie wirklich alle Daten löschen?\n\nDies kann nicht rückgängig gemacht werden!\n\nAlle Accounts, Tipps und Ergebnisse werden gelöscht.')) {
                            clearStorage();
                          }
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium text-sm"
                      >
                        🗑️ Alle Daten löschen
                      </button>
                    </div>
                  </div>

                  {/* Performance & Ressourcen */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Performance & PWA</h3>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 space-y-2">
                        <div className="flex justify-between">
                          <span>Team-Form Cache:</span>
                          <span className="font-mono">{utils.teamFormCache.size}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Debug-Modus:</span>
                          <span>{debugMode ? '🔴 Aktiv' : '🟢 Deaktiviert'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Backup-Intervall:</span>
                          <span>30 Min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Speicher-Check:</span>
                          <span>10 Min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>PWA Status:</span>
                          <span>{isPWA ? '📱 Installiert' : '🌐 Browser'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Online Status:</span>
                          <span>{isOnline ? '🟢 Online' : '🔴 Offline'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            utils.clearTeamFormCache();
                            alert('Cache geleert! Performance wurde optimiert.');
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium text-sm"
                        >
                          🧹 Cache leeren
                        </button>
                        <button
                          onClick={checkForUpdates}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium text-sm"
                        >
                          🔄 Update prüfen
                        </button>
                      </div>
                      {!isPWA && canInstall && (
                        <button
                          onClick={installApp}
                          className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-medium text-sm"
                        >
                          📱 App installieren
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hidden file input for import */}
                <input
                  id="importFile"
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      importData(file);
                    }
                    e.target.value = ''; // Reset input
                  }}
                  style={{ display: 'none' }}
                />
                
                {/* Hidden file input for round import */}
                <input
                  id="importRoundFile"
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      importCurrentRound(file);
                    }
                    e.target.value = ''; // Reset input
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mannschafts-Auswahl Modal */}
      {showTeamSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">🏆 Mannschafts-Ergebnisse</h2>
                <button
                  onClick={() => setShowTeamSelector(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold hover:scale-110 transition-transform"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(() => {
                  const allTeams = new Set();
                  Object.values(ROUND_MATCHES).flat().forEach(match => {
                    allTeams.add(match.home);
                    allTeams.add(match.away);
                  });
                  return Array.from(allTeams).sort().map(team => {
                    const teamForm = utils.getTeamForm(team, results, currentRound);
                    return (
                      <button
                        key={team}
                        onClick={() => {
                          setShowTeamSelector(false);
                          showTeamDetails(team);
                        }}
                        className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all text-left group shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <div className="font-bold text-lg text-gray-800 group-hover:text-blue-800 mb-3">
                          {team}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm px-3 py-1 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 font-bold">
                              {teamForm.formDisplay || 'N/A'}
                            </span>
                            <span className="text-sm font-medium">
                              {teamForm.form}
                            </span>
                      </div>
                          <div className="text-sm text-gray-500 font-medium">
                            {teamForm.recentResults?.length || 0} Spiele • {teamForm.avgPoints?.toFixed(1) || '0.0'}P/Spiel
                          </div>
                        </div>
                      </button>
                    );
                  });
                })()}
                </div>
              </div>
      </div>
    </div>
      )}



      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-40 lg:hidden overflow-x-hidden">
        <div className="flex justify-around py-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              activeTab === 'overview' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="text-xl mb-1">📊</span>
            <span className="text-xs font-medium">Übersicht</span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              activeTab === 'matches' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="text-xl mb-1">⚽</span>
            <span className="text-xs font-medium">Spiele</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              activeTab === 'settings' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="text-xl mb-1">⚙️</span>
            <span className="text-xs font-medium">Einstellungen</span>
          </button>
        </div>
      </div>

      {/* PWA Install Prompt */}
      {isInstallable && !isInstalled && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 shadow-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📱</div>
              <div>
                <div className="font-bold">App installieren</div>
                <div className="text-sm opacity-90">Für bessere Erfahrung auf dem Homescreen</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={installApp}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Installieren
              </button>
              <button
                onClick={() => setIsInstallable(false)}
                className="px-3 py-2 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status */}
      {isOffline && (
        <div className="fixed top-4 left-4 right-4 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl p-3 shadow-xl border border-white/20">
          <div className="flex items-center justify-center gap-2">
            <div className="text-lg">📶</div>
            <span className="font-medium">Offline-Modus aktiv</span>
          </div>
        </div>
      )}

      {/* PWA Status Badge */}
      {isPWA && (
        <div className="fixed top-4 right-4 z-30 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-3 py-1 text-xs font-medium shadow-lg">
          📱 PWA
        </div>
      )}
    </div>

  );
}

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>

  );
};

// Wrapper Component mit Error Boundary
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;
