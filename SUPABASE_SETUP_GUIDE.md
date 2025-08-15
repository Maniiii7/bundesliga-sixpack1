# 🚀 Supabase Setup Guide - Multi-User System

## 📋 **Schritt-für-Schritt Anleitung**

### **Schritt 1: Supabase Account erstellen**
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Klicken Sie auf "Start your project"
3. Melden Sie sich mit GitHub an (kostenlos)
4. Klicken Sie auf "New Project"

### **Schritt 2: Projekt erstellen**
1. **Name:** `bundesliga-sixpack`
2. **Database Password:** Wählen Sie ein sicheres Passwort (notieren Sie es!)
3. **Region:** Wählen Sie `West Europe (Frankfurt)` für beste Performance
4. Klicken Sie auf "Create new project"

### **Schritt 3: API Keys kopieren**
1. Warten Sie bis das Projekt erstellt ist (2-3 Minuten)
2. Gehen Sie zu **Settings** → **API**
3. Kopieren Sie:
   - **Project URL** (z.B. `https://abc123.supabase.co`)
   - **anon public** Key (beginnt mit `eyJ...`)

### **Schritt 4: Datenbank-Tabelle erstellen**
1. Gehen Sie zu **Table Editor**
2. Klicken Sie auf "New Table"
3. **Name:** `user_data`
4. **Columns:**
   ```
   - user_id (uuid, primary key)
   - accounts (jsonb)
   - tips (jsonb)
   - results (jsonb)
   - current_round (integer)
   - updated_at (timestamp with time zone)
   ```
5. Klicken Sie auf "Save"

### **Schritt 5: RLS (Row Level Security) aktivieren**
1. Gehen Sie zu **Authentication** → **Policies**
2. Klicken Sie auf "New Policy"
3. **Name:** `Users can only access their own data`
4. **Target roles:** `authenticated`
5. **Policy definition:**
   ```sql
   (auth.uid() = user_id)
   ```
6. Klicken Sie auf "Review" und dann "Save policy"

### **Schritt 6: App konfigurieren**
1. Öffnen Sie `src/utils/supabase.js`
2. Ersetzen Sie:
   ```javascript
   const supabaseUrl = 'https://your-project.supabase.co';
   const supabaseAnonKey = 'your-anon-key';
   ```
3. Mit Ihren echten Werten:
   ```javascript
   const supabaseUrl = 'https://abc123.supabase.co';
   const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

## ✅ **Fertig!**

**Ihre Multi-User App ist jetzt bereit!**

### **Features:**
- ✅ **Benutzer-Registrierung** mit E-Mail/Passwort
- ✅ **Automatische Synchronisation** in die Cloud
- ✅ **Offline-Funktionalität** mit lokaler Speicherung
- ✅ **Echtzeit-Updates** zwischen Geräten
- ✅ **Sichere Daten** - jeder sieht nur seine eigenen Daten

### **Wie es funktioniert:**
1. **Sie registrieren sich** → Daten werden in Cloud gespeichert
2. **Sie arbeiten offline** → Daten werden lokal gespeichert
3. **Sie gehen online** → Daten werden automatisch synchronisiert
4. **Ihr Freund registriert sich** → Er bekommt seine eigenen Daten

### **Kosten:**
- ✅ **KOSTENLOS** für bis zu 50.000 Nutzer
- ✅ **KOSTENLOS** für 500MB Datenbank
- ✅ **KOSTENLOS** für immer

## 🚀 **Nächste Schritte:**

1. **Supabase Setup** durchführen (siehe oben)
2. **API Keys** in die App einfügen
3. **App testen** - registrieren Sie sich und testen Sie die Funktionen
4. **Freunden zeigen** - sie können sich auch registrieren

**Viel Spaß mit Ihrer Multi-User Bundesliga Sixpack App!** ⚽📱
