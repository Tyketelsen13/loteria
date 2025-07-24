
"use client";
import React from "react";
import LoteriaCard from "./LoteriaCard";
import { useSettings } from "@/context/SettingsContext";
import { getBoardBackgroundClass, getBoardThemeClass } from "@/lib/boardBackgrounds";

interface LoteriaBoardProps {
  board: string[][]; // 4x4 grid of card names
  marks?: boolean[][]; // Optional marking state for each card
  onMark?: (row: number, col: number) => void; // Click handler for marking cards
  markable?: (row: number, col: number) => boolean; // Function to determine if card can be marked
}

/**
 * 4x4 Lotería game board with customizable themes and interactive cards
 */
export default function LoteriaBoard({ board, marks = [], onMark, markable }: LoteriaBoardProps) {
  const { boardBackground, boardTheme } = useSettings();
  const backgroundClass = getBoardBackgroundClass(boardBackground);
  const themeClass = getBoardThemeClass(boardTheme);
  
  return (
    <div className={`grid grid-cols-4 gap-0 p-4 rounded-lg ${backgroundClass} ${themeClass}`}>
      {board.map((row, i) =>
        row.map((cell, j) => (
          <LoteriaCard
            key={cell + i + j}
            name={cell}
            marked={!!marks?.[i]?.[j]}
            onClick={onMark ? () => onMark(i, j) : undefined}
            markable={markable ? markable(i, j) : undefined}
          />
        ))
      )}
    </div>
  );
}
