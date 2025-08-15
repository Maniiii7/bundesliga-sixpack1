import React, { useState, useEffect, useMemo, useCallback } from "react";

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

// Account-Farben
const COLORS = [
  "bg-blue-50 border-blue-200 text-blue-800",
  "bg-green-50 border-green-200 text-green-800",
  "bg-purple-50 border-purple-200 text-purple-800",
  "bg-orange-50 border-orange-200 text-orange-800",
  "bg-pink-50 border-pink-200 text-pink-800",
  "bg-indigo-50 border-indigo-200 text-indigo-800",
];



// Utility-Funktionen
const utils = {
  // Generiert eindeutige ID
  uid: () => Math.random().toString(36).slice(2, 10),
  
  // Berechnet Mannschaftsform basierend auf letzten 5 Runden
  getTeamForm: (teamName, results, currentRound) => {
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
    
    if (recentMatches.length === 0) return { 
      form: 'N/A', 
      points: 0, 
      wins: 0, 
      draws: 0, 
      losses: 0,
      recentResults: [],
      rounds: []
    };
    
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
    return { 
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
  
  // Persistiert State in localStorage
  usePersistedState: (key, initial) => {
    const [state, setState] = useState(() => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : initial;
      } catch {
        return initial;
      }
    });
    
    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    
    return [state, setState];
  }
};

// Hauptkomponente
function App() {
  // State Management
  const [accounts, setAccounts] = utils.usePersistedState('admiral-accounts', [
    { id: utils.uid(), name: "Account 1", color: 0 }
  ]);

  const [tips, setTips] = utils.usePersistedState('admiral-tips', {});
  const [results, setResults] = utils.usePersistedState('admiral-results', {});
  const [currentRound, setCurrentRound] = utils.usePersistedState('admiral-current-round', 1);
  const [newAccountName, setNewAccountName] = useState("");
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showTeamSelector, setShowTeamSelector] = useState(false);

  // Tipp-Erinnerungen Funktion (muss vor useEffect definiert werden)
  const checkTipReminders = useCallback(() => {
    const currentRoundMatches = ROUND_MATCHES[currentRound] || [];
    const missingTips = [];
    
    accounts.forEach(account => {
      const accountTips = tips[account.id] || {};
      const roundTips = currentRoundMatches.filter(match => 
        accountTips[match.id] && accountTips[match.id].home !== null && accountTips[match.id].away !== null
      ).length;
      
      if (roundTips < currentRoundMatches.length) {
        missingTips.push(`${account.name}: ${roundTips}/${currentRoundMatches.length} Tipps`);
      }
    });
    
    if (missingTips.length > 0) {
      const reminderText = `⚠️ TIPP-ERINNERUNG Runde ${currentRound}:\n\n${missingTips.join('\n')}\n\nVergessen Sie nicht, alle Spiele zu tippen!`;
      
      // Zeige Erinnerung nur einmal pro Session
      if (!localStorage.getItem(`reminder-shown-${currentRound}`)) {
        setTimeout(() => {
          alert(reminderText);
          localStorage.setItem(`reminder-shown-${currentRound}`, 'true');
        }, 2000); // 2 Sekunden Verzögerung
      }
    }
  }, [currentRound, accounts, tips]);

  // Memoized Werte
  const currentMatches = useMemo(() => ROUND_MATCHES[currentRound] || [], [currentRound]);
  
  // Tipp-Erinnerungen prüfen
  useEffect(() => {
    checkTipReminders();
  }, [currentRound, checkTipReminders]);
  
  const currentRoundPoints = useMemo(() => {
    return accounts.map(account => ({
      ...account,
      correctPredictions: currentMatches.reduce((sum, match) => {
        const tip = tips[account.id]?.[match.id];
        const points = utils.calculatePoints(tip, results[match.id]);
        return sum + (points === 3 ? 1 : 0); // Zählt nur exakte Vorhersagen (3 Punkte)
      }, 0)
    })).sort((a, b) => b.correctPredictions - a.correctPredictions);
  }, [accounts, tips, results, currentMatches]);



  // Event Handlers
  const addAccount = useCallback(() => {
    if (!newAccountName.trim()) return;
    
    setAccounts(prev => [...prev, {
      id: utils.uid(),
      name: newAccountName.trim(),
      color: prev.length % COLORS.length
    }]);
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

  const setTip = useCallback((accountId, matchId, home, away) => {
    setTips(prev => {
      const newTips = {
        ...prev,
        [accountId]: {
          ...prev[accountId],
          [matchId]: { home, away }
        }
      };
      // Auto-Save
      localStorage.setItem('admiral-tips', JSON.stringify(newTips));
      return newTips;
    });
  }, []);

  const setResult = useCallback((matchId, home, away) => {
    setResults(prev => {
      const newResults = {
        ...prev,
        [matchId]: { home, away }
      };
      // Auto-Save
      localStorage.setItem('admiral-results', JSON.stringify(newResults));
      return newResults;
    });
  }, []);





  const showTeamResults = useCallback(() => {
    setShowTeamSelector(true);
  }, []);

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
    
    return {
      predictedResult,
      confidence,
      reasoning,
      additionalFactors,
      homeForm: homeForm.form,
      awayForm: awayForm.form,
      homeStrength: finalHomeStrength,
      awayStrength: finalAwayStrength
    };
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

  const showStatistics = useCallback(() => {
    const stats = accounts.map(account => {
      const accountTips = tips[account.id] || {};
      let totalTips = 0;
      let exactTips = 0;
      let partialTips = 0;
      let wrongTips = 0;
      
      // Gehe durch alle Spiele
      Object.values(ROUND_MATCHES).flat().forEach(match => {
        const tip = accountTips[match.id];
        const result = results[match.id];
        
        if (tip && tip.home !== null && tip.away !== null) {
          totalTips++;
          
          if (result && result.home !== null && result.away !== null) {
            const points = utils.calculatePoints(tip, result);
            if (points === 3) exactTips++;
            else if (points >= 1) partialTips++;
            else wrongTips++;
          }
        }
      });
      
      const totalEvaluated = exactTips + partialTips + wrongTips;
      const exactPercentage = totalEvaluated > 0 ? Math.round((exactTips / totalEvaluated) * 100) : 0;
      const partialPercentage = totalEvaluated > 0 ? Math.round((partialTips / totalEvaluated) * 100) : 0;
      const wrongPercentage = totalEvaluated > 0 ? Math.round((wrongTips / totalEvaluated) * 100) : 0;
      
      return {
        name: account.name,
        totalTips,
        exactTips,
        partialTips,
        wrongTips,
        exactPercentage,
        partialPercentage,
        wrongPercentage
      };
    });
    
    const statsText = stats.map(stat => 
      `${stat.name}:\n` +
      `📊 ${stat.totalTips} Tipps insgesamt\n` +
      `✅ ${stat.exactTips} exakte Tipps (${stat.exactPercentage}%)\n` +
      `🟡 ${stat.partialTips} teilweise richtig (${stat.partialPercentage}%)\n` +
      `❌ ${stat.wrongTips} falsche Tipps (${stat.wrongPercentage}%)`
    ).join('\n\n');
    
    alert(`📈 STATISTIK-DASHBOARD\n\n${statsText}`);
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

  const exportRoundAsTxt = useCallback(() => {
    const roundData = currentMatches.map((match, index) => {
      const result = results[match.id];
      const homeForm = utils.getTeamForm(match.home, results);
      const awayForm = utils.getTeamForm(match.away, results);
      
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
${currentRound <= 12 ? 'GRUNDDURCHGANG' : 'MEISTERDURCHGANG'}
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
    const result = results[match.id];
    const hasResult = result && result.home !== null && result.away !== null;
    const homeForm = utils.getTeamForm(match.home, results, currentRound);
    const awayForm = utils.getTeamForm(match.away, results, currentRound);
    
    return (
      <div 
        key={match.id} 
        className="bg-gray-50 rounded-lg p-6 border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Spiel-Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-800 mb-1">
              {match.home} vs {match.away}
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
            <div className="text-right animate-pulse">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Heim ({match.home})</label>
                             <input
                 type="number"
                 min="0"
                 max="99"
                 placeholder="0"
                 value={result?.home || ''}
                 onChange={(e) => {
                   const value = parseInt(e.target.value) || 0;
                   setResult(match.id, Math.max(0, Math.min(99, value)), result?.away);
                 }}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-bold"
               />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Auswärts ({match.away})</label>
                             <input
                 type="number"
                 min="0"
                 max="99"
                 placeholder="0"
                 value={result?.away || ''}
                 onChange={(e) => {
                   const value = parseInt(e.target.value) || 0;
                   setResult(match.id, result?.home, Math.max(0, Math.min(99, value)));
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
                  <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{account.name}</span>
                    <button
                      onClick={() => showTipHistory(account.id)}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                      title="Tipp-Historie anzeigen"
                    >
                      📊
                    </button>
                      <div className="flex gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">H</label>
                                                     <input
                             type="number"
                             min="0"
                             max="99"
                             placeholder="0"
                             value={tip?.home || ''}
                             onChange={(e) => {
                               const value = parseInt(e.target.value) || 0;
                               const validatedValue = Math.max(0, Math.min(10, value)); // Maximal 10 Tore
                               if (value > 10) {
                                 alert('Unrealistischer Tipp! Maximal 10 Tore pro Team.');
                               }
                               setTip(account.id, match.id, validatedValue, tip?.away);
                             }}
                             className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center text-sm"
                           />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">A</label>
                                                     <input
                             type="number"
                             min="0"
                             max="99"
                             placeholder="0"
                             value={tip?.away || ''}
                             onChange={(e) => {
                               const value = parseInt(e.target.value) || 0;
                               const validatedValue = Math.max(0, Math.min(10, value)); // Maximal 10 Tore
                               if (value > 10) {
                                 alert('Unrealistischer Tipp! Maximal 10 Tore pro Team.');
                               }
                               setTip(account.id, match.id, tip?.home, validatedValue);
                             }}
                             className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center text-sm"
                           />
                        </div>
                      </div>
                    </div>
                                         {hasResult && (
                       <div className="text-right">
                         <div className="text-xs text-gray-600 mb-1">Tipp</div>
                         <div className={`text-sm font-bold px-3 py-1 rounded-lg ${
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Admiral Bundesliga Sixpack
              </h1>
              <p className="text-base lg:text-lg text-gray-600 font-medium">
                Saison 2025/26 • Runde {currentRound} • {currentRound <= 12 ? "Grunddurchgang" : "Meisterdurchgang"}
              </p>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="text-5xl lg:text-6xl font-black text-white bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                R{currentRound}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Accounts Panel */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            {/* Accounts */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  👥
                </div>
                Bundesliga Sixpack Accounts
              </h2>
              
              <div className="space-y-3 mb-6 max-h-48 sm:max-h-64 overflow-y-auto">
                {accounts.map(renderAccountRow)}
              </div>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="Account Name eingeben..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addAccount()}
                />
                <button
                  onClick={addAccount}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ➕
                </button>
              </div>
            </div>

            {/* Aktuelle Runden-Rangliste */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  🎯
                </div>
                Aktuelle Runde {currentRound}
              </h2>
              
              <div className="space-y-3">
                {currentRoundPoints.map((account, index) => (
                  <div key={account.id} className={`p-4 rounded-xl border-2 ${COLORS[account.color]} shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          #{index + 1}
                        </div>
                        <span className="font-semibold text-base">{account.name}</span>
                      </div>
                      <div className="text-right">
                        <button 
                          onClick={() => showCorrectGames(account.id)}
                          className="cursor-pointer hover:scale-110 transition-transform"
                        >
                          <div className="text-2xl font-bold text-gray-800">{account.correctPredictions}</div>
                          <div className="text-xs text-gray-500 font-medium">von 6 richtig</div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hauptbereich - Spiele & Tipps */}
          <div className="lg:col-span-3">
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
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-xl text-sm transform hover:scale-105"
                  >
                    🏆 Mannschafts-Ergebnisse
                  </button>
                  <button
                    onClick={showStatistics}
                    className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg hover:shadow-xl text-sm transform hover:scale-105"
                  >
                    📈 Statistiken
                  </button>
                  <button
                    onClick={exportRoundAsTxt}
                    className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl text-sm transform hover:scale-105"
                  >
                    📄 Export TXT
                  </button>
                </div>
              </div>
              
              {/* Runden-Navigation */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 border border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentRound(Math.max(1, currentRound - 1))}
                    disabled={currentRound === 1}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ← Vorherige
                  </button>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800 mb-1">
                      Runde {currentRound}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {currentRound <= 12 ? "Grunddurchgang" : "Meisterdurchgang"}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentRound(Math.min(22, currentRound + 1))}
                    disabled={currentRound === 22}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Nächste →
                  </button>
                </div>
                
                {/* Schnell-Navigation */}
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setCurrentRound(1)}
                    className={`px-4 py-2 text-sm rounded-xl font-medium transition-all transform hover:scale-105 ${
                      currentRound >= 1 && currentRound <= 6 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    Runden 1-6
                  </button>
                  <button
                    onClick={() => setCurrentRound(7)}
                    className={`px-4 py-2 text-sm rounded-xl font-medium transition-all transform hover:scale-105 ${
                      currentRound >= 7 && currentRound <= 12 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    Runden 7-12
                  </button>
                  <button
                    onClick={() => setCurrentRound(13)}
                    className={`px-4 py-2 text-sm rounded-xl font-medium transition-all transform hover:scale-105 ${
                      currentRound >= 13 && currentRound <= 18 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    Runden 13-18
                  </button>
                  <button
                    onClick={() => setCurrentRound(19)}
                    className={`px-4 py-2 text-sm rounded-xl font-medium transition-all transform hover:scale-105 ${
                      currentRound >= 19 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    Runden 19-22
                  </button>
                </div>
              </div>

              {/* Runden-Übersicht */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    📊
                  </div>
                  Runden-Übersicht
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(round => {
                    const roundMatches = ROUND_MATCHES[round] || [];
                    const roundResults = roundMatches.filter(match => 
                      results[match.id] && results[match.id].home !== null && results[match.id].away !== null
                    ).length;
                    const roundTips = accounts.reduce((total, account) => {
                      const accountTips = tips[account.id] || {};
                      return total + roundMatches.filter(match => 
                        accountTips[match.id] && accountTips[match.id].home !== null && accountTips[match.id].away !== null
                      ).length;
                    }, 0);
                    const totalPossible = roundMatches.length * accounts.length;
                    
                    return (
                      <div key={round} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200/50 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                        <div className="text-base font-bold text-gray-800 mb-3">
                          Runde {round}
                        </div>
                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">📝</span>
                            <span>Tipps: {roundTips}/{totalPossible}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">🏆</span>
                            <span>Ergebnisse: {roundResults}/{roundMatches.length}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-700 pt-1 border-t border-gray-200">
                            {roundTips > 0 ? `${Math.round((roundTips/totalPossible)*100)}%` : '0%'} getippt
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spiele */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    🎯
                  </div>
                  Spiele der Runde {currentRound}
                </h3>
                <div className="space-y-6">
                  {currentMatches.map(renderMatchRow)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}

export default App;
