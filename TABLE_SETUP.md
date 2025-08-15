# 🗄️ Supabase Tabelle erstellen - Schritt-für-Schritt

## 📋 **Tabelle "user_data" erstellen:**

### **Schritt 1: Table Editor öffnen**
1. Gehen Sie zu: https://supabase.com/dashboard
2. Klicken Sie auf Ihr Projekt: `bundesliga-sixpack`
3. Klicken Sie im linken Menü auf **"Table Editor"**
4. Klicken Sie auf **"New Table"**

### **Schritt 2: Tabellen-Name**
- **Name:** `user_data`
- **Enable Row Level Security (RLS):** ✅ **AKTIVIERT** (wichtig!)

### **Schritt 3: Spalten hinzufügen**

**Spalte 1:**
- **Name:** `user_id`
- **Type:** `uuid`
- **Default Value:** `gen_random_uuid()`
- **Primary Key:** ✅ **AKTIVIERT**
- **Is Nullable:** ❌ **DEAKTIVIERT**

**Spalte 2:**
- **Name:** `accounts`
- **Type:** `jsonb`
- **Default Value:** `[]`
- **Is Nullable:** ✅ **AKTIVIERT**

**Spalte 3:**
- **Name:** `tips`
- **Type:** `jsonb`
- **Default Value:** `{}`
- **Is Nullable:** ✅ **AKTIVIERT**

**Spalte 4:**
- **Name:** `results`
- **Type:** `jsonb`
- **Default Value:** `{}`
- **Is Nullable:** ✅ **AKTIVIERT**

**Spalte 5:**
- **Name:** `current_round`
- **Type:** `integer`
- **Default Value:** `1`
- **Is Nullable:** ✅ **AKTIVIERT**

**Spalte 6:**
- **Name:** `updated_at`
- **Type:** `timestamp with time zone`
- **Default Value:** `now()`
- **Is Nullable:** ✅ **AKTIVIERT**

### **Schritt 4: Tabelle speichern**
- Klicken Sie auf **"Save"**

## 🔒 **Sicherheit aktivieren (RLS Policies):**

### **Schritt 1: Policies öffnen**
1. Klicken Sie im linken Menü auf **"Authentication"**
2. Klicken Sie auf **"Policies"**
3. Klicken Sie auf **"New Policy"**

### **Schritt 2: Policy erstellen**
- **Name:** `Users can only access their own data`
- **Target roles:** `authenticated`
- **Policy definition:**
  ```sql
  (auth.uid() = user_id)
  ```
- Klicken Sie auf **"Review"**
- Klicken Sie auf **"Save policy"**

## ✅ **Fertig!**

**Ihre Tabelle ist jetzt bereit für die Multi-User App!**

### **Was passiert:**
- ✅ Jeder Benutzer kann nur seine eigenen Daten sehen
- ✅ Automatische Benutzer-ID Zuweisung
- ✅ Sichere Daten-Speicherung
- ✅ Cloud-Synchronisation aktiviert

**Jetzt können Sie sich in der App registrieren!** 🚀
