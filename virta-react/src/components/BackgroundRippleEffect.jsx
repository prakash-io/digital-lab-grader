import { useState, useMemo } from "react";
import { cn } from "../lib/utils";

export const BackgroundRippleEffect = ({
  rows = 8,
  cols = 27,
  cellSize = 56,
}) => {
  const [clickedCell, setClickedCell] = useState(null);
  const [rippleKey, setRippleKey] = useState(0);

  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols]
  );

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: "auto",
  };

  const handleCellClick = (rowIdx, colIdx) => {
    setClickedCell({ row: rowIdx, col: colIdx });
    setRippleKey((k) => k + 1);
  };

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      {/* Dark bottom section (diagonal from top-left to bottom-right) */}
      <div 
        className="absolute inset-0 bg-zinc-900 dark:bg-zinc-950 z-[1]"
        style={{
          clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
          WebkitClipPath: 'polygon(0 0, 100% 100%, 0 100%)',
        }}
      />
      
      {/* Blurred diagonal partition */}
      <div 
        className="absolute inset-0 z-[4] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, transparent 48%, rgba(0,0,0,0.5) 49.5%, rgba(0,0,0,0.5) 50.5%, transparent 52%, transparent 100%)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
          WebkitClipPath: 'polygon(0 0, 100% 100%, 0 100%)',
        }}
      />
      
      {/* Grid section (upper portion - above diagonal from top-left to bottom-right) */}
      <div 
        className="relative h-full w-full overflow-hidden z-[2]"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
          WebkitClipPath: 'polygon(0 0, 100% 0, 100% 100%)',
          filter: 'blur(4px)',
          WebkitFilter: 'blur(4px)',
        }}
      >
        <div className="relative h-auto w-auto overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
          <div className="relative z-[3]" style={gridStyle}>
            {cells.map((idx) => {
              const rowIdx = Math.floor(idx / cols);
              const colIdx = idx % cols;
              const distance = clickedCell
                ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
                : 0;
              const delay = clickedCell ? Math.max(0, distance * 55) : 0;
              const duration = 200 + distance * 80;

              const style = clickedCell
                ? {
                    "--delay": `${delay}ms`,
                    "--duration": `${duration}ms`,
                  }
                : {};

              return (
                <div
                  key={idx}
                  className={cn(
                    "cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80",
                    clickedCell && "animate-cell-ripple"
                  )}
                  style={{
                    backgroundColor: "var(--cell-fill-color, rgba(244, 244, 245, 0.3))",
                    borderColor: "var(--cell-border-color, #d4d4d8)",
                    ...style,
                  }}
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

