/**
 * Settings Context - manages user preferences and visual customization
 * Provides persistent storage via localStorage and real-time theme switching
 */

"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// TypeScript interface for Settings Context
interface SettingsContextType {
  // Audio Settings
  sound: boolean;
  setSound: (v: boolean) => void;
  
  // Notification Settings
  notifications: boolean;
  setNotifications: (v: boolean) => void;
  
  // Visual Theme Settings
  boardBackground: string;
  setBoardBackground: (v: string) => void;
  boardTheme: string;
  setBoardTheme: (v: string) => void;
  cardDeck: string;
  setCardDeck: (v: string) => void;
  boardEdge: string;
  setBoardEdge: (v: string) => void;
  cardStyle: string;
  setCardStyle: (v: string) => void;
  
  // Deck Theme Settings
  deckTheme: string;
  setDeckTheme: (v: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Settings Provider - wraps app with settings context and manages localStorage sync
 */
export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  // Audio and notification state
  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  // Visual customization state with defaults
  const [boardBackground, setBoardBackground] = useState('default');
  const [boardTheme, setBoardTheme] = useState('classic');
  const [cardDeck, setCardDeck] = useState('traditional');
  const [boardEdge, setBoardEdge] = useState('classic');
  const [cardStyle, setCardStyle] = useState('classic');
  const [deckTheme, setDeckTheme] = useState('traditional');

  // On mount, initialize from localStorage
  useEffect(() => {
    const storedSound = localStorage.getItem("sound");
    if (storedSound === "false") setSound(false);
    const storedNotif = localStorage.getItem("notifications");
    if (storedNotif === "false") setNotifications(false);
    const storedBoardBackground = localStorage.getItem("boardBackground");
    if (storedBoardBackground) setBoardBackground(storedBoardBackground);
    const storedBoardTheme = localStorage.getItem("boardTheme");
    if (storedBoardTheme) setBoardTheme(storedBoardTheme);
    const storedCardDeck = localStorage.getItem("cardDeck");
    if (storedCardDeck) setCardDeck(storedCardDeck);
    const storedBoardEdge = localStorage.getItem("boardEdge");
    if (storedBoardEdge) setBoardEdge(storedBoardEdge);
    const storedCardStyle = localStorage.getItem("cardStyle");
    if (storedCardStyle) setCardStyle(storedCardStyle);
    
    const storedDeckTheme = localStorage.getItem("deckTheme");
    if (storedDeckTheme) setDeckTheme(storedDeckTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("sound", sound.toString());
  }, [sound]);

  useEffect(() => {
    localStorage.setItem("notifications", notifications.toString());
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("boardBackground", boardBackground);
  }, [boardBackground]);

  useEffect(() => {
    localStorage.setItem("boardTheme", boardTheme);
  }, [boardTheme]);

  useEffect(() => {
    localStorage.setItem("cardDeck", cardDeck);
  }, [cardDeck]);

  useEffect(() => {
    localStorage.setItem("boardEdge", boardEdge);
  }, [boardEdge]);

  useEffect(() => {
    localStorage.setItem("cardStyle", cardStyle);
  }, [cardStyle]);

  useEffect(() => {
    localStorage.setItem("deckTheme", deckTheme);
    
    // Auto-switch to horror background when horror deck is selected (only if user hasn't manually chosen a specific background)
    if (deckTheme === 'horror' && boardBackground === 'default') {
      setBoardBackground('horror');
    }
    
    // Auto-switch to fantasy background and board edge when fantasy deck is selected
    if (deckTheme === 'fantasy' && boardBackground === 'default') {
      setBoardBackground('fantasy');
    }
    if (deckTheme === 'fantasy' && boardEdge === 'classic') {
      setBoardEdge('fantasy-magic');
    }
  }, [deckTheme, boardBackground, boardEdge]);

  return (
    <SettingsContext.Provider value={{ 
      sound, setSound, 
      notifications, setNotifications, 
      boardBackground, setBoardBackground, 
      boardTheme, setBoardTheme, 
      cardDeck, setCardDeck, 
      boardEdge, setBoardEdge, 
      cardStyle, setCardStyle, 
      deckTheme, setDeckTheme 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Custom hook to access Settings Context
 * Provides convenient access to settings with error checking for proper usage
 */
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
};
