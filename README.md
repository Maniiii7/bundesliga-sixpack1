
# 🏆 Sixpack Freunde-Tracker

Ein moderner Tracker für das Admiral Sixpack Tippspiel mit Multi-Account-Management und Live-API-Integration.

## ✨ Features

### 🎯 Multi-Account-Management
- **Farbkodierte Accounts**: Jeder Account hat eine eigene Farbe für bessere Unterscheidung
- **Account-Status**: Übersicht welche Accounts bereits getippt haben
- **Bulk-Operationen**: Mehrere Accounts gleichzeitig bearbeiten
- **Schnell-Tipp-Modus**: Effiziente Tipp-Eingabe für mehrere Accounts

### ⚡ SofaScore Live-API-Integration
- **Live-Ergebnisse**: Echtzeit-Updates aus der österreichischen Bundesliga
- **H2H-Historie**: Letzte 5 Begegnungen zwischen Teams
- **Team-Form**: Aktuelle Form und Performance der Teams
- **Automatische Bewertung**: Tipps werden automatisch bewertet
- **API-Runden**: Automatische Erstellung von Runden aus echten Spielen

### 📊 Erweiterte Statistiken
- **Live-Ranglisten**: Automatische Punkteberechnung
- **Performance-Tracking**: Account-Performance über Zeit
- **Chart-Visualisierung**: Entwicklung der Punkte über Runden

## 🚀 Installation

1. **Repository klonen**:
```bash
git clone <repository-url>
cd sixpack-freunde-tracker
```

2. **Dependencies installieren**:
```bash
npm install
```

3. **Entwicklungsserver starten**:
```bash
npm run dev
```

## 🔑 API-Setup

### SofaScore API Integration ✅

**Die SofaScore API ist bereits konfiguriert und einsatzbereit!**

1. **API-Key**: Bereits eingetragen (`7eba745e4bmsh129772c74c7e7b4p1e04ebjsn6710643ed8e`)
2. **Konfiguration**: Vollständig in `src/App.jsx` implementiert
3. **Features**: Live-Scores, H2H-Daten, Team-Form

**SofaScore Konfiguration:**
```javascript
const SOFASCORE_CONFIG = {
  baseUrl: 'https://sofascore.p.rapidapi.com',
  apiKey: '7eba745e4bmsh129772c74c7e7b4p1e04ebjsn6710643ed8e',
  headers: {
    'x-rapidapi-host': 'sofascore.p.rapidapi.com',
    'x-rapidapi-key': '7eba745e4bmsh129772c74c7e7b4p1e04ebjsn6710643ed8e'
  }
};
```

**API aktivieren:**
- Starte die Anwendung
- Klicke auf "API aktivieren" im API-Integration Panel
- Erstelle Runden automatisch aus echten Spielen mit H2H-Daten

## 📱 Verwendung

### Account-Management
1. **Accounts hinzufügen**: Gib den Namen ein und klicke "Add"
2. **Account auswählen**: Klicke auf das Auge-Icon für Bulk-Operationen
3. **Status verfolgen**: Farbige Indikatoren zeigen den Tipp-Status

### SofaScore Live-API-Features
1. **API aktivieren**: Toggle im API-Integration Panel
2. **Runden erstellen**: "Runde aus API erstellen" für echte Spiele
3. **H2H-Daten**: Letzte 5 Begegnungen zwischen Teams anzeigen
4. **Team-Form**: Aktuelle Form und Performance der Teams
5. **Live-Updates**: Ergebnisse werden automatisch aktualisiert
6. **Automatische Bewertung**: Tipps werden live bewertet

### Bulk-Operationen
1. **Accounts auswählen**: Klicke auf das Copy-Icon
2. **Bulk-Edit**: Mehrere Accounts gleichzeitig bearbeiten
3. **Tipps kopieren**: Tipps zwischen Accounts übertragen

## 🎮 Tippspiel-Regeln

- **Exakte Vorhersage**: 3 Punkte
- **Tendenz mit Tordifferenz**: 2 Punkte  
- **Nur Tendenz**: 1 Punkt
- **Falsch**: 0 Punkte

## 🔧 Technische Details

### Technologie-Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **API**: SofaScore (RapidAPI)

### Daten-Persistierung
- **LocalStorage**: Alle Daten werden lokal gespeichert
- **Export/Import**: JSON-Format für Backup/Restore

### API-Limits
- **Kostenlos**: 100 Anfragen/Tag
- **Update-Intervall**: 60 Sekunden bei aktivierter API
- **Liga**: Österreichische Bundesliga
- **Features**: Live-Scores, H2H-Daten, Team-Form

## 🐛 Troubleshooting

### API-Fehler
- **API-Key prüfen**: Stelle sicher, dass der Key korrekt ist
- **Limits prüfen**: Kostenlose API hat 100 Anfragen/Tag
- **Netzwerk**: Prüfe deine Internetverbindung

### Performance
- **Browser-Cache**: Bei Problemen Cache leeren
- **LocalStorage**: Bei Datenverlust Export/Import verwenden

## 📄 Lizenz

MIT License - siehe LICENSE-Datei für Details.

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

---

**Viel Spaß beim Tippen! 🏈⚽**
