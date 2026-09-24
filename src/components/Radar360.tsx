/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Radar, Shield, AlertCircle } from "lucide-react";
import { DetectedRoadObject, RiskLevel } from "../types";

interface Radar360Props {
  objects: DetectedRoadObject[];
  highContrast: boolean;
}

export const Radar360: React.FC<Radar360Props> = ({ objects, highContrast }) => {
  const [rangeRadius, setRangeRadius] = useState<number>(30); // 15m, 30m, 50m

  // Map object to 2D polar coordinates relative to rider center
  const getObjectCoordinates = (obj: DetectedRoadObject) => {
    // Normalizing distance (0 to rangeRadius meters -> 0 to 45% radius from center)
    const normDist = Math.min(obj.distanceMeters / rangeRadius, 1) * 42;

    let angleRad = 0;
    if (obj.camera === "FRONT") {
      // Forward sector: -30deg to +30deg
      const lateralShift = (obj.box.x - 50) * 0.8;
      angleRad = ((lateralShift - 90) * Math.PI) / 180;
    } else if (obj.camera === "LEFT") {
      // Left blind spot: ~180 to ~270deg (or -135deg)
      angleRad = Math.PI; // 180 degrees left
    } else if (obj.camera === "RIGHT") {
      // Right blind spot: 0 deg (3 o'clock)
      angleRad = 0; // 0 degrees right
    } else {
      // Rear: 90 deg down (6 o'clock)
      angleRad = Math.PI / 2;
    }

    const cx = 50 + normDist * Math.cos(angleRad);
    const cy = 50 + normDist * Math.sin(angleRad);

    return { cx, cy };
  };

  return (
    <div
      id="radar-360-container"
      className={`relative w-full h-[340px] rounded-xl border p-3 flex flex-col justify-between select-none ${
        highContrast
          ? "bg-black border-yellow-400 text-yellow-300"
          : "bg-slate-950/90 border-slate-800 text-cyan-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <Radar className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
          <span className="font-bold uppercase tracking-wider">360° Perception Shield</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono">
          <span className="opacity-70">RANGE:</span>
          {[15, 30, 50].map((r) => (
            <button
              key={r}
              onClick={() => setRangeRadius(r)}
              className={`px-1.5 py-0.5 rounded border text-[9px] ${
                rangeRadius === r
                  ? "bg-cyan-600 text-white border-cyan-400 font-bold"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {r}m
            </button>
          ))}
        </div>
      </div>

      {/* Radar SVG Display */}
      <div className="relative w-full flex-1 flex items-center justify-center my-1 overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full max-w-[280px] max-h-[280px]"
        >
          {/* Radar background circular rings */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,2" opacity="0.3" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.4" />

          {/* Crosshair Axes */}
          <line x1="50" y1="6" x2="50" y2="94" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          <line x1="6" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

          {/* Blind spot warning cones (Left & Right ~45deg rear arcs) */}
          <path
            d="M 50 50 L 15 35 A 44 44 0 0 1 15 65 Z"
            fill="#06b6d4"
            opacity="0.04"
          />
          <path
            d="M 50 50 L 85 35 A 44 44 0 0 0 85 65 Z"
            fill="#06b6d4"
            opacity="0.04"
          />

          {/* Range text markers */}
          <text x="52" y="38" fontSize="2.5" fill="currentColor" opacity="0.6" fontFamily="monospace">
            {Math.round(rangeRadius * 0.33)}m
          </text>
          <text x="52" y="22" fontSize="2.5" fill="currentColor" opacity="0.6" fontFamily="monospace">
            {Math.round(rangeRadius * 0.67)}m
          </text>
          <text x="52" y="8" fontSize="2.5" fill="currentColor" opacity="0.6" fontFamily="monospace">
            {rangeRadius}m
          </text>

          {/* Compass / Directional Labels */}
          <text x="50" y="5" textAnchor="middle" fontSize="3" fontWeight="bold" fill="currentColor" fontFamily="monospace">
            FRONT ↑
          </text>
          <text x="50" y="98" textAnchor="middle" fontSize="3" fontWeight="bold" fill="currentColor" fontFamily="monospace">
            REAR ↓
          </text>
          <text x="5" y="51" textAnchor="start" fontSize="3" fontWeight="bold" fill="currentColor" fontFamily="monospace">
            ← LEFT
          </text>
          <text x="95" y="51" textAnchor="end" fontSize="3" fontWeight="bold" fill="currentColor" fontFamily="monospace">
            RIGHT →
          </text>

          {/* Center Rider Motorcycle Icon */}
          <g transform="translate(46, 45) scale(0.35)">
            <rect x="7" y="2" width="10" height="20" rx="3" fill="#38bdf8" />
            <circle cx="12" cy="5" r="3" fill="#ffffff" />
            {/* Handlebars */}
            <line x1="2" y1="8" x2="22" y2="8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* Front Arrow */}
            <polygon points="12,0 9,4 15,4" fill="#38bdf8" />
          </g>

          {/* Render Detected Objects on Radar */}
          {objects.map((obj) => {
            const { cx, cy } = getObjectCoordinates(obj);
            const isCritical = obj.riskLevel === "RED";
            const isWarning = obj.riskLevel === "ORANGE";
            const color = isCritical
              ? "#ef4444"
              : isWarning
              ? "#f59e0b"
              : obj.riskLevel === "YELLOW"
              ? "#facc15"
              : "#10b981";

            return (
              <g key={obj.id} className="transition-all duration-300">
                {/* Threat Ping Wave */}
                {isCritical && (
                  <circle cx={cx} cy={cy} r="6" fill="none" stroke={color} strokeWidth="0.8" opacity="0.8">
                    <animate attributeName="r" values="3;8;3" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.1;1" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Object Blip */}
                <circle cx={cx} cy={cy} r={isCritical ? "3.2" : "2.4"} fill={color} stroke="#ffffff" strokeWidth="0.5" />
                {/* Object Label & Distance */}
                <text
                  x={cx > 50 ? cx - 2 : cx + 2}
                  y={cy - 3}
                  textAnchor={cx > 50 ? "end" : "start"}
                  fontSize="2.4"
                  fontWeight="bold"
                  fill="#ffffff"
                  fontFamily="monospace"
                >
                  {obj.label.split(" ")[0]} {obj.distanceMeters}m
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Radar Legend Footer */}
      <div className="flex items-center justify-between text-[9px] font-mono opacity-80 border-t border-current/20 pt-1.5">
        <div className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>NORMAL</span>
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
          <span>CAUTION</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span>WARNING</span>
        </div>
        <div className="flex items-center gap-1 text-red-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
          <span>CRITICAL COLLISION</span>
        </div>
      </div>
    </div>
  );
};
