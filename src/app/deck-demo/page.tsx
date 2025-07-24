"use client";
import { useState, useEffect } from "react";
import { SettingsProvider } from "@/context/SettingsContext";
import LoteriaCard from "@/components/LoteriaCard";
import SettingsMenu from "@/components/SettingsMenu";
import { deckThemeOptions } from "@/lib/boardBackgrounds";
import Link from "next/link";
import { FaArrowLeft, FaPlay, FaRandom, FaPalette } from "react-icons/fa";

// Demo page to showcase different deck themes
export default function DeckThemeDemo() {
  const [selectedTheme, setSelectedTheme] = useState('traditional');
  const [sampleCards, setSampleCards] = useState(["El Corazón", "La Luna", "El Sol", "La Estrella"]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // All available cards for randomization
  const allCards = [
    "El Corazón", "La Luna", "El Sol", "La Estrella", "La Rosa", "La Muerte",
    "El Diablito", "La Dama", "El Catrin", "El Gallo", "El Borracho", "La Sirena",
    "El Soldado", "La Corona", "El Mundo", "El Apache", "El Negrito", "La Bandera",
    "El Bandolón", "El Violoncello", "La Garza", "El Pajaro", "La Mano", "La Bota"
  ];

  // Shuffle sample cards
  const shuffleCards = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const shuffled = [...allCards].sort(() => Math.random() - 0.5).slice(0, 4);
      setSampleCards(shuffled);
      setIsAnimating(false);
    }, 300);
  };

  // Auto-update localStorage when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('deckTheme', selectedTheme);
    }
  }, [selectedTheme]);

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              <FaArrowLeft />
              Back to Home
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/game/create" 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
              >
                <FaPlay />
                Start Game
              </Link>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaPalette className="text-4xl text-purple-600" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Deck Theme Showcase
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our collection of beautifully crafted Lotería card themes. 
              Each deck tells its own unique story and brings a different atmosphere to your game.
            </p>
          </div>
          
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
                    {theme.preview && (
                      <img 
                        src={theme.preview} 
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
                  <LoteriaCard name={cardName} />
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
    </SettingsProvider>
  );
}
