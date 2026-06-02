"use client";

import React from "react";

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

/**
 * Reusable SVG Circular Progress Component
 * Hardware-accelerated for smooth animations without heavy dependencies
 */
export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = "#3b82f6",
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
        >
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
          />

          {/* Animated Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              strokeDashoffset,
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>

        {/* Centered Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{percentage}%</span>
            {label && <p className="text-xs text-white/80 mt-1">{label}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCircle;
