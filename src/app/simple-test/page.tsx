"use client";

import { useState } from "react";
import { SettingsProvider, useSettings } from "../../context/SettingsContext";
import { deckThemeOptions } from "@/lib/boardBackgrounds";
import { getCardImageForDeck } from "@/lib/cardMappings";

function SimpleThemeTest() {
  const { deckTheme, setDeckTheme } = useSettings();
  const testCard = "El Corazón";
  
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Simple Deck Theme Test</h1>
      
      <div className="mb-6 p-4 bg-white rounded border">
        <h2 className="text-xl font-semibold mb-3">Current State:</h2>
        <p><strong>deckTheme:</strong> {deckTheme}</p>
        <p><strong>localStorage value:</strong> {typeof window !== 'undefined' ? localStorage.getItem('deckTheme') : 'N/A'}</p>
      </div>
      
      <div className="mb-6 p-4 bg-white rounded border">
        <h2 className="text-xl font-semibold mb-3">Theme Controls:</h2>
        <div className="grid grid-cols-2 gap-2">
          {deckThemeOptions.map(theme => (
            <button
              key={theme.id}
              onClick={() => {
                console.log(`Switching from ${deckTheme} to ${theme.id}`);
                setDeckTheme(theme.id);
                console.log(`After setDeckTheme call, localStorage: ${localStorage.getItem('deckTheme')}`);
              }}
              className={`p-3 rounded border ${
                deckTheme === theme.id 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-white rounded border">
        <h2 className="text-xl font-semibold mb-3">URL Generation Test for "{testCard}":</h2>
        {deckThemeOptions.map(theme => {
          const url = getCardImageForDeck(testCard, theme.id);
          return (
            <div key={theme.id} className="mb-2">
              <strong>{theme.name} ({theme.id}):</strong> 
              <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">{url}</code>
            </div>
          );
        })}
      </div>
      
      <div className="mb-6 p-4 bg-white rounded border">
        <h2 className="text-xl font-semibold mb-3">Current URL being used:</h2>
        <p><code className="bg-gray-100 px-2 py-1 rounded">{getCardImageForDeck(testCard, deckTheme)}</code></p>
      </div>
      
      <div className="mb-6 p-4 bg-white rounded border">
        <h2 className="text-xl font-semibold mb-3">Image Test:</h2>
        <img 
          key={`${testCard}-${deckTheme}`}
          src={getCardImageForDeck(testCard, deckTheme)} 
          alt={testCard}
          className="w-24 h-32 border rounded"
          onError={(e) => {
            console.log(`Image failed to load: ${e.currentTarget.src}`);
            (e.target as HTMLImageElement).style.border = '3px solid red';
          }}
          onLoad={(e) => {
            console.log(`Image loaded: ${e.currentTarget.src}`);
            (e.target as HTMLImageElement).style.border = '3px solid green';
          }}
        />
      </div>
    </div>
  );
}

export default function SimpleTestPage() {
  return (
    <SettingsProvider>
      <SimpleThemeTest />
    </SettingsProvider>
  );
}
