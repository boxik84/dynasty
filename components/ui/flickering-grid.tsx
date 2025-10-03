"use client";

import { cn } from "@/lib/utils";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  variant?: "default" | "subtle" | "intense" | "matrix" | "waves" | "pulse";
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
  variant = "default",
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Variant-specific settings
  const variantConfig = useMemo(() => {
    switch (variant) {
      case "subtle":
        return {
          flickerChance: 0.1,
          maxOpacity: 0.15,
          squareSize: 3,
          gridGap: 8,
        };
      case "intense":
        return {
          flickerChance: 0.6,
          maxOpacity: 0.6,
          squareSize: 6,
          gridGap: 4,
        };
      case "matrix":
        return {
          flickerChance: 0.4,
          maxOpacity: 0.5,
          squareSize: 2,
          gridGap: 2,
        };
      case "waves":
        return {
          flickerChance: 0.2,
          maxOpacity: 0.4,
          squareSize: 4,
          gridGap: 6,
        };
      case "pulse":
        return {
          flickerChance: 0.25,
          maxOpacity: 0.35,
          squareSize: 5,
          gridGap: 5,
        };
      default:
        return {
          flickerChance,
          maxOpacity,
          squareSize,
          gridGap,
        };
    }
  }, [variant, flickerChance, maxOpacity, squareSize, gridGap]);

  const finalSquareSize = variantConfig.squareSize;
  const finalGridGap = variantConfig.gridGap;
  const finalFlickerChance = variantConfig.flickerChance;
  const finalMaxOpacity = variantConfig.maxOpacity;

  const memoizedColor = useMemo(() => {
    const toRGBA = (color: string) => {
      if (typeof window === "undefined") {
        return `rgba(0, 0, 0,`;
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "rgba(255, 0, 0,";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.floor(width / (finalSquareSize + finalGridGap));
      const rows = Math.floor(height / (finalSquareSize + finalGridGap));

      const squares = new Float32Array(cols * rows);
      const phases = new Float32Array(cols * rows); // For wave effect
      
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * finalMaxOpacity;
        phases[i] = Math.random() * Math.PI * 2; // Random phase for waves
      }

      return { cols, rows, squares, phases, dpr };
    },
    [finalSquareSize, finalGridGap, finalMaxOpacity],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, phases: Float32Array, deltaTime: number, time: number, cols: number, rows: number) => {
      if (variant === "waves") {
        // Wave pattern
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const index = i * rows + j;
            const waveX = Math.sin(i * 0.2 + time * 0.001) * 0.5 + 0.5;
            const waveY = Math.cos(j * 0.2 + time * 0.001) * 0.5 + 0.5;
            squares[index] = (waveX * waveY) * finalMaxOpacity;
          }
        }
      } else if (variant === "pulse") {
        // Radial pulse from center
        const centerX = cols / 2;
        const centerY = rows / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
        
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const index = i * rows + j;
            const dx = i - centerX;
            const dy = j - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const normalizedDist = dist / maxDist;
            const pulse = Math.sin(time * 0.002 - normalizedDist * Math.PI * 2) * 0.5 + 0.5;
            squares[index] = pulse * finalMaxOpacity;
          }
        }
      } else if (variant === "matrix") {
        // Matrix-style falling effect
        for (let i = 0; i < cols; i++) {
          if (Math.random() < finalFlickerChance * deltaTime * 0.5) {
            // Start new "drop"
            const startJ = 0;
            const index = i * rows + startJ;
            squares[index] = finalMaxOpacity;
          }
          
          // Move existing drops down
          for (let j = rows - 1; j > 0; j--) {
            const index = i * rows + j;
            const prevIndex = i * rows + (j - 1);
            squares[index] = squares[prevIndex] * 0.95; // Fade as it falls
          }
        }
      } else {
        // Default and other variants - random flicker
        for (let i = 0; i < squares.length; i++) {
          if (Math.random() < finalFlickerChance * deltaTime) {
            squares[i] = Math.random() * finalMaxOpacity;
          } else if (variant === "subtle") {
            // Gradually fade out for subtle variant
            squares[i] *= 0.98;
          }
        }
      }
    },
    [finalFlickerChance, finalMaxOpacity, variant],
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j];
          if (opacity > 0.01) { // Only draw if visible (performance optimization)
            ctx.fillStyle = `${memoizedColor}${opacity})`;
            
            // Add slight blur for intense variant
            if (variant === "intense" || variant === "matrix") {
              ctx.shadowBlur = 2 * dpr;
              ctx.shadowColor = `${memoizedColor}${opacity * 0.5})`;
            } else {
              ctx.shadowBlur = 0;
            }
            
            ctx.fillRect(
              i * (finalSquareSize + finalGridGap) * dpr,
              j * (finalSquareSize + finalGridGap) * dpr,
              finalSquareSize * dpr,
              finalSquareSize * dpr,
            );
          }
        }
      }
    },
    [memoizedColor, finalSquareSize, finalGridGap, variant],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;
    let startTime = Date.now();

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      const currentTime = Date.now() - startTime;

      updateSquares(
        gridParams.squares, 
        gridParams.phases, 
        deltaTime, 
        currentTime, 
        gridParams.cols, 
        gridParams.rows
      );
      
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full", className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};