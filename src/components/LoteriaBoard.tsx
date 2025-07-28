
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
  winningLine?: { type: 'row' | 'col' | 'diag1' | 'diag2' | 'corners' | 'center', index: number } | null; // Winning line to highlight
}

/**
 * 4x4 Lotería game board with customizable themes and interactive cards
 */
export default function LoteriaBoard({ board, marks = [], onMark, markable, winningLine }: LoteriaBoardProps) {
  const { boardBackground, boardTheme, deckTheme } = useSettings();
  const backgroundClass = getBoardBackgroundClass(boardBackground);
  const themeClass = getBoardThemeClass(boardTheme);
  
  // Helper function to check if a cell is part of the winning line
  const isInWinningLine = (row: number, col: number): boolean => {
    if (!winningLine) return false;
    
    switch (winningLine.type) {
      case 'row':
        return row === winningLine.index;
      case 'col':
        return col === winningLine.index;
      case 'diag1':
        return row === col;
      case 'diag2':
        return row === (3 - col);
      case 'corners':
        return (row === 0 && col === 0) || (row === 0 && col === 3) || (row === 3 && col === 0) || (row === 3 && col === 3);
      case 'center':
        return (row === 1 && col === 1) || (row === 1 && col === 2) || (row === 2 && col === 1) || (row === 2 && col === 2);
      default:
        return false;
    }
  };
  
  return (
    <div className={`grid grid-cols-4 gap-0 p-4 rounded-lg ios-transform-gpu ios-smooth ${backgroundClass} ${themeClass}`}>
      {board.map((row, i) =>
        row.map((cell, j) => (
          <LoteriaCard
            key={`${cell}-${i}-${j}-${deckTheme}`}
            name={cell}
            marked={!!marks?.[i]?.[j]}
            onClick={onMark ? () => onMark(i, j) : undefined}
            markable={markable ? markable(i, j) : undefined}
            className={`touch-manipulation ${isInWinningLine(i, j) ? "ring-4 ring-yellow-400 ring-opacity-75 animate-pulse" : ""}`}
          />
        ))
      )}
    </div>
  );
}
