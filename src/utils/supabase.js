// Supabase Konfiguration für Multi-User System
import { createClient } from '@supabase/supabase-js';

// ⚠️ HIER IHRE API KEYS EINFÜGEN!
// Gehen Sie zu supabase.com → Ihr Projekt → Settings → API
// Kopieren Sie die Werte hier ein:

const supabaseUrl = 'https://pfnufvfdsbtkpedjrfya.supabase.co';  // ← HIER IHRE PROJECT URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbnVmdmZkc2J0a3BlZGpyZnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjk2NjQsImV4cCI6MjA3MDg0NTY2NH0.Ng-aj8Jrtoh4Dc8gcdmBZ6leCa7EofSUiwFns5BSyKI';                 // ← HIER IHREN ANON KEY

// Beispiel:
// const supabaseUrl = 'https://abc123.supabase.co';
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Supabase Client erstellen
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Multi-User Datenverwaltung
export const userDataService = {
  // Benutzer registrieren
  async registerUser(email, password, displayName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          },
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // Prüfen ob Email-Bestätigung erforderlich ist
      if (data.user && !data.user.email_confirmed_at) {
        return { 
          success: true, 
          user: data.user, 
          message: 'Bitte bestätigen Sie Ihre E-Mail-Adresse. Prüfen Sie Ihren Posteingang.' 
        };
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      return { success: false, error: error.message };
    }
  },

  // Benutzer anmelden
  async loginUser(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Anmeldefehler:', error);
      return { success: false, error: error.message };
    }
  },

  // Benutzer abmelden
  async logoutUser() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Abmeldefehler:', error);
      return { success: false, error: error.message };
    }
  },

  // Aktuellen Benutzer abrufen
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      console.error('Benutzer-Abruf-Fehler:', error);
      return { success: false, error: error.message };
    }
  },

  // Benutzer-Daten speichern
  async saveUserData(userId, data) {
    try {
      const userData = {
        user_id: userId,
        accounts: data.accounts,
        tips: data.tips,
        results: data.results,
        current_round: data.currentRound,
        updated_at: new Date().toISOString()
      };
      
      // Verwende upsert mit onConflict
      const { error } = await supabase
        .from('user_data')
        .upsert(userData, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Speicherfehler:', error);
      return { success: false, error: error.message };
    }
  },

  // Benutzer-Daten laden
  async loadUserData(userId) {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return { 
        success: true, 
        data: {
          accounts: data.accounts || [],
          tips: data.tips || {},
          results: data.results || {},
          currentRound: data.current_round || 1
        }
      };
    } catch (error) {
      console.error('Ladefehler:', error);
      return { success: false, error: error.message };
    }
  },

  // Echtzeit-Updates abonnieren
  subscribeToUserData(userId, callback) {
    return supabase
      .channel('user_data_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_data',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};

// Offline-Fallback für lokale Speicherung
export const offlineStorage = {
  saveData(userId, data) {
    try {
      localStorage.setItem(`user_${userId}_data`, JSON.stringify({
        ...data,
        timestamp: Date.now()
      }));
      return { success: true };
    } catch (error) {
      console.error('Offline-Speicherfehler:', error);
      return { success: false, error: error.message };
    }
  },

  loadData(userId) {
    try {
      const data = localStorage.getItem(`user_${userId}_data`);
      if (!data) return { success: false, error: 'Keine Daten gefunden' };
      
      const parsedData = JSON.parse(data);
      return { success: true, data: parsedData };
    } catch (error) {
      console.error('Offline-Ladefehler:', error);
      return { success: false, error: error.message };
    }
  }
};
