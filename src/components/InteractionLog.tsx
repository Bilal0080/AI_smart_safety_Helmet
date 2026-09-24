/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Mic,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Camera,
  Navigation,
  Disc,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
  Sparkles,
} from "lucide-react";
import { InteractionLogEntry } from "../types";

interface InteractionLogProps {
  logs: InteractionLogEntry[];
  highContrast: boolean;
  onClearLogs?: () => void;
  className?: string;
}

export const InteractionLog: React.FC<InteractionLogProps> = ({
  logs,
  highContrast,
  onClearLogs,
  className = "",
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Take the latest 5 entries
  const displayLogs = logs.slice(0, 5);

  const getIcon = (item: InteractionLogEntry) => {
    if (item.type === "VOICE_ACTION") {
      if (item.iconType === "camera") return <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      if (item.iconType === "nav") return <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      if (item.iconType === "speed") return <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      return <Mic className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }

    // Safety Alert Icons
    if (item.riskLevel === "RED" || item.iconType === "brake") {
      return <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0 animate-pulse" />;
    }
    if (item.riskLevel === "ORANGE") {
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    return <ShieldAlert className="w-3.5 h-3.5 text-yellow-300 shrink-0" />;
  };

  const getBorderColor = (item: InteractionLogEntry) => {
    if (highContrast) return "border-yellow-400/60 bg-black/80 text-yellow-300";

    if (item.type === "VOICE_ACTION") {
      return "border-cyan-500/30 bg-cyan-950/40 text-cyan-200 hover:border-cyan-400/60";
    }

    if (item.riskLevel === "RED") {
      return "border-red-500/70 bg-red-950/50 text-red-200 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse";
    }
    if (item.riskLevel === "ORANGE") {
      return "border-amber-500/60 bg-amber-950/40 text-amber-200";
    }
    return "border-yellow-500/40 bg-yellow-950/30 text-yellow-200";
  };

  const hudBorder = highContrast
    ? "border-yellow-400 bg-black/85 text-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.25)]"
    : "border-cyan-500/30 bg-slate-950/80 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]";

  return (
    <div
      id="hud-interaction-log"
      aria-label="HUD Interaction and Warning Log"
      className={`rounded-lg border backdrop-blur-md transition-all font-mono pointer-events-auto select-none ${hudBorder} ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-current/20 text-[10px] tracking-wider uppercase font-bold">
        <div className="flex items-center gap-1.5">
          <History className="w-3 h-3 text-current opacity-80" />
          <span>RECENT LOG (LAST 5)</span>
          <span className="px-1 py-0.2 rounded bg-black/40 text-[9px] opacity-75">
            {displayLogs.length}/5
          </span>
        </div>

        <div className="flex items-center gap-1">
          {displayLogs.length > 0 && onClearLogs && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearLogs();
              }}
              title="Clear interaction log"
              className="text-[9px] px-1 py-0.5 rounded opacity-60 hover:opacity-100 hover:bg-white/10 transition-opacity"
            >
              CLEAR
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Log" : "Collapse Log"}
            className="p-0.5 rounded hover:bg-white/10 opacity-75 hover:opacity-100 transition-opacity"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="p-1.5 max-h-[160px] overflow-y-auto space-y-1.5 text-[10px] scrollbar-thin scrollbar-thumb-current/20 scrollbar-track-transparent">
          {displayLogs.length === 0 ? (
            <div className="px-2 py-3 text-center opacity-40 text-[9px] italic">
              No recent voice actions or alerts.
              <br />
              Standing by on road trajectory.
            </div>
          ) : (
            displayLogs.map((item) => (
              <div
                key={item.id}
                className={`p-1.5 rounded border transition-all ${getBorderColor(item)}`}
              >
                <div className="flex items-center justify-between gap-1 text-[9px] mb-0.5 opacity-80">
                  <div className="flex items-center gap-1">
                    {getIcon(item)}
                    <span
                      className={`px-1 py-0.2 rounded font-bold uppercase text-[8px] ${
                        item.type === "VOICE_ACTION"
                          ? "bg-cyan-900/60 text-cyan-300"
                          : item.riskLevel === "RED"
                          ? "bg-red-800 text-white font-extrabold"
                          : item.riskLevel === "ORANGE"
                          ? "bg-amber-800/80 text-amber-200"
                          : "bg-yellow-800/60 text-yellow-200"
                      }`}
                    >
                      {item.type === "VOICE_ACTION" ? "VOICE" : "ALERT"}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-70 text-[8px] font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                {/* Main Text Content */}
                <div className="font-bold text-[10px] leading-tight truncate">
                  {item.text}
                </div>

                {/* Detail string if available */}
                {item.detail && (
                  <div className="text-[9px] opacity-75 mt-0.5 truncate">
                    {item.detail}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
