// Datei-basierte Datenverwaltung für unabhängige Nutzung
export const fileUtils = {
  // Export aller Daten als JSON-Datei
  exportAllData: (accounts, tips, results, currentRound) => {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        accounts,
        tips,
        results,
        currentRound
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bundesliga-sixpack-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Import von JSON-Datei
  importFromFile: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.data && data.data.accounts) {
            resolve(data.data);
          } else {
            reject(new Error('Ungültige Datei'));
          }
        } catch (error) {
          reject(new Error('Fehler beim Lesen der Datei'));
        }
      };
      reader.readAsText(file);
    });
  },

  // Export nur der aktuellen Runde
  exportCurrentRound: (accounts, tips, results, currentRound) => {
    const roundData = {
      round: currentRound,
      timestamp: new Date().toISOString(),
      accounts: accounts.map(account => ({
        id: account.id,
        name: account.name,
        color: account.color
      })),
      matches: Object.keys(results).filter(key => 
        key.startsWith(`round-${currentRound}`) || 
        (key.length <= 3 && parseInt(key) >= 1 && parseInt(key) <= 6)
      ).map(key => ({
        matchId: key,
        result: results[key]
      })),
      tips: Object.keys(tips).reduce((acc, accountId) => {
        const accountTips = tips[accountId];
        if (accountTips) {
          acc[accountId] = Object.keys(accountTips).filter(key => 
            key.startsWith(`round-${currentRound}`) || 
            (key.length <= 3 && parseInt(key) >= 1 && parseInt(key) <= 6)
          ).reduce((matchAcc, matchId) => {
            matchAcc[matchId] = accountTips[matchId];
            return matchAcc;
          }, {});
        }
        return acc;
      }, {})
    };

    const blob = new Blob([JSON.stringify(roundData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runde-${currentRound}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Import nur einer Runde
  importRoundData: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.round && data.accounts) {
            resolve(data);
          } else {
            reject(new Error('Ungültige Rundendatei'));
          }
        } catch (error) {
          reject(new Error('Fehler beim Lesen der Rundendatei'));
        }
      };
      reader.readAsText(file);
    });
  }
};
