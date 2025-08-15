# 🚀 QUICK SETUP - Supabase in 5 Minuten

## ⚡ **Schnell-Setup für Ihre App:**

### **1. Supabase Projekt öffnen**
- Gehen Sie zu: https://supabase.com/dashboard
- Klicken Sie auf Ihr Projekt: `bundesliga-sixpack`

### **2. Datenbank-Tabelle erstellen**
1. **Table Editor** → **New Table**
2. **Name:** `user_data`
3. **Columns hinzufügen:**
   ```
   - user_id (uuid, primary key) ✅
   - accounts (jsonb) ✅
   - tips (jsonb) ✅
   - results (jsonb) ✅
   - current_round (integer) ✅
   - updated_at (timestamp with time zone) ✅
   ```
4. **Save** klicken

### **3. Sicherheit aktivieren**
1. **Authentication** → **Policies**
2. **New Policy** → **"Users can only access their own data"**
3. **Target roles:** `authenticated`
4. **Policy definition:** `(auth.uid() = user_id)`
5. **Save policy**

### **4. App testen**
1. Browser öffnen: `http://localhost:5173`
2. **"Registrieren"** klicken
3. Daten eingeben und testen

## ✅ **Fertig!**

**Ihre Multi-User App ist jetzt bereit!**

### **Features:**
- ✅ Benutzer-Registrierung
- ✅ Cloud-Synchronisation
- ✅ Offline-Support
- ✅ Sichere Daten

**Viel Spaß!** ⚽📱
