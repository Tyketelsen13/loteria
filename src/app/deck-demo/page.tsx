"use client";
import { useState, useEffect } from "react";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import LoteriaCard from "@/components/LoteriaCard";
import SettingsMenu from "@/components/SettingsMenu";
import { deckThemeOptions, getDeckThemePreviewUrl } from "@/lib/boardBackgrounds";

// Demo content component that uses settings
function DemoContent() {
  const [selectedTheme, setSelectedTheme] = useState('traditional');
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const { deckTheme } = useSettings();
  
  // Generate preview URLs on client side only
  useEffect(() => {
    const urls: Record<string, string> = {};
    deckThemeOptions.forEach(theme => {
      urls[theme.id] = getDeckThemePreviewUrl(theme.id);
    });
    setPreviewUrls(urls);
  }, []);
  
  // Sample cards to demonstrate
  const sampleCards = ["El Corazón", "La Luna", "El Sol", "La Estrella"];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Deck Theme Showcase
        </h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Available Deck Themes:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deckThemeOptions.map((theme) => (
              <div 
                key={theme.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTheme === theme.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  {previewUrls[theme.id] && (
                    <img 
                      src={previewUrls[theme.id]} 
                      alt={theme.name}
                      className="w-12 h-12 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-lg">{theme.name}</h3>
                    <p className="text-sm text-gray-600">{theme.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Sample Cards:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleCards.map((cardName) => (
              <div key={cardName} className="flex flex-col items-center">
                <LoteriaCard key={`${cardName}-${deckTheme}`} name={cardName} />
                <p className="mt-2 text-sm font-medium">{cardName}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-4 right-4">
          <SettingsMenu />
        </div>
      </div>
    </div>
  );
}

// Demo page to showcase different deck themes
export default function DeckThemeDemo() {
  return (
    <SettingsProvider>
      <DemoContent />
    </SettingsProvider>
  );
}
