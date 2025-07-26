"use client";
import { useState } from "react";
import { requestNotificationPermission } from "@/lib/notify";
import { useSettings } from "@/context/SettingsContext";
import { backgroundOptions, boardThemeOptions, cardDeckOptions, boardEdgeOptions, cardStyleOptions, deckThemeOptions } from "@/lib/boardBackgrounds";

/**
 * Settings dropdown menu with customization options for themes, sound, and notifications
 */
export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  
  // Get settings from global context
  const { 
    sound, setSound, 
    notifications, setNotifications, 
    boardBackground, setBoardBackground, 
    boardTheme, setBoardTheme, 
    cardDeck, setCardDeck, 
    boardEdge, setBoardEdge, 
    cardStyle, setCardStyle, 
    deckTheme, setDeckTheme 
  } = useSettings();

  // Toggle notifications and request browser permission
  function toggleNotifications() {
    const next = !notifications;
    setNotifications(next);
    if (next) requestNotificationPermission();
  }

  // Toggle sound effects
  function toggleSound() {
    setSound(!sound);
  }

  return (
    <div className="absolute top-4 right-4 z-50">
      {/* Settings gear icon button */}
      <button
        aria-label="Settings"
        className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition"
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white dark:text-gray-200"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.82 1.65 1.65 0 0 0 3.49 15H3.4a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 5 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c.03.66.39 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.43.43-.57 1.07-.33 1.82.24.75.87 1.38 1.62 1.62.75.24 1.39.1 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82z" />
        </svg>
      </button>
      
      {/* Settings dropdown panel - conditionally rendered */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4 border border-gray-100 z-50 max-h-96 overflow-y-auto">
          <div className="font-semibold text-gray-700 mb-2">
            Settings
          </div>
          
          {/* Board Background Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Board Background
            </span>
            <div className="grid grid-cols-5 gap-2">
              {backgroundOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setBoardBackground(option.id)}
                  className={`w-10 h-7 rounded border-2 transition-all ${
                    boardBackground === option.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: option.color }}
                  title={option.name}
                  aria-label={`Select ${option.name} background`}
                />
              ))}
            </div>
          </div>

          {/* Board Theme Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Board Theme
            </span>
            <div className="grid grid-cols-3 gap-2">
              {boardThemeOptions.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setBoardTheme(theme.id)}
                  className={`p-2 h-12 rounded border-2 transition-all text-xs font-medium ${
                    boardTheme === theme.id
                      ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                  title={theme.name}
                  style={{ borderColor: boardTheme === theme.id ? '#3b82f6' : theme.borderColor }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Deck Theme Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Deck Theme
            </span>
            <div className="flex flex-col gap-2">
              {deckThemeOptions.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setDeckTheme(theme.id)}
                  className={`p-3 rounded border-2 transition-all text-left ${
                    deckTheme === theme.id
                      ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                  title={theme.description}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {theme.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {theme.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card Deck Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Card Deck Style
            </span>
            <div className="grid grid-cols-2 gap-2">
              {cardDeckOptions.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => setCardDeck(deck.id)}
                  className={`p-2 h-10 rounded border-2 transition-all text-xs font-medium ${
                    cardDeck === deck.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ 
                    borderColor: cardDeck === deck.id ? '#3b82f6' : deck.borderColor,
                    backgroundColor: deck.backgroundColor,
                    color: deck.textColor
                  }}
                  title={deck.name}
                >
                  {deck.name}
                </button>
              ))}
            </div>
          </div>

          {/* Board Edge Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Board Edge Pattern
            </span>
            <div className="grid grid-cols-2 gap-2">
              {boardEdgeOptions.map((edge) => (
                <button
                  key={edge.id}
                  onClick={() => setBoardEdge(edge.id)}
                  className={`p-2 h-12 rounded border-2 transition-all text-xs font-medium ${
                    boardEdge === edge.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ 
                    background: edge.style,
                    filter: 'brightness(0.93)'
                  }}
                  title={edge.name}
                >
                  <span className="text-white font-bold drop-shadow-md">
                    {edge.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card Style Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Card Style
            </span>
            <div className="grid grid-cols-3 gap-2">
              {cardStyleOptions.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setCardStyle(style.id)}
                  className={`p-2 h-10 rounded border-2 transition-all text-xs font-medium ${
                    cardStyle === style.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ 
                    borderColor: cardStyle === style.id ? '#3b82f6' : style.borderColor,
                    backgroundColor: style.backgroundColor,
                    color: style.id === 'dark' ? 'white' : 'inherit'
                  }}
                  title={style.name}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>
          {/* Notifications toggle */}
          <div className="flex items-center gap-3">
            <span className="text-blue-500">
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-5-6.32V4a1 1 0 1 0-2 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 20h12a1 1 0 0 0 .71-1.71L18 16z" />
              </svg>
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={toggleNotifications}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
              <div
                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white border border-gray-300 transition-all ${
                  notifications ? "translate-x-5" : ""
                }`}
              ></div>
            </label>
            <span className="ml-2 font-medium text-gray-700">
              Notifications
            </span>
          </div>
          {/* Sound toggle */}
          <div className="flex items-center gap-3">
            <span className="text-green-500">
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 10v4h4l5 5V5l-5 5H3zm13.5 2a2.5 2.5 0 0 0 0-5v5z" />
              </svg>
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sound}
                onChange={toggleSound}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
              <div
                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white border border-gray-300 transition-all ${
                  sound ? "translate-x-5" : ""
                }`}
              ></div>
            </label>
            <span className="ml-2 font-medium text-gray-700">
              Sound
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
