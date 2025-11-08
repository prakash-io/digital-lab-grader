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
      {/* Base background with gradient */}
      <div 
        className="absolute inset-0 z-[1] dark:hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(244, 244, 245, 0.4) 0%, rgba(244, 244, 245, 0.2) 40%, rgba(228, 228, 231, 0.6) 60%, rgba(212, 212, 216, 0.8) 100%)',
        }}
      />
      <div 
        className="absolute inset-0 z-[1] hidden dark:block"
        style={{
          background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.3) 0%, rgba(24, 24, 27, 0.5) 40%, rgba(9, 9, 11, 0.7) 60%, rgba(9, 9, 11, 0.9) 100%)',
        }}
      />
      
      {/* Blurred light overlay */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none dark:hidden"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      />
      <div 
        className="absolute inset-0 z-[2] pointer-events-none hidden dark:block"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.2) 0%, transparent 60%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      />
      
      {/* Grid section with blur */}
      <div 
        className="relative h-full w-full overflow-hidden z-[3]"
        style={{
          filter: 'blur(4px)',
          WebkitFilter: 'blur(4px)',
          opacity: 0.6,
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

