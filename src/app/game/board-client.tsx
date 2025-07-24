"use client";
import { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import LoteriaBoard from "@/components/LoteriaBoard";

export default function BoardClient() {
  const [cardNames, setCardNames] = useState<string[]>([]);
  const { deckTheme } = useSettings();

  useEffect(() => {
    fetch(`/api/cards?deckTheme=${deckTheme}`)
      .then(res => res.json())
      .then(setCardNames);
  }, [deckTheme]);

  if (cardNames.length < 16) return <div className="text-red-600">Not enough cards in /public/cards (need at least 16)</div>;

  // Shuffle and pick 16 for a 4x4 board
  const shuffled = [...cardNames].sort(() => Math.random() - 0.5);
  const board = [
    shuffled.slice(0, 4),
    shuffled.slice(4, 8),
    shuffled.slice(8, 12),
    shuffled.slice(12, 16),
  ];

  return <LoteriaBoard board={board} />;
}
