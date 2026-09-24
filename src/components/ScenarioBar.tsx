/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Play, FastForward, Rewind, AlertOctagon, Sparkles, Navigation } from "lucide-react";
import { PRESET_SCENARIOS } from "../services/roadSimulation";
import { RoadScenario } from "../types";

interface ScenarioBarProps {
  currentScenarioId: string;
  onSelectScenario: (scenario: RoadScenario) => void;
  speed: number;
  onAdjustSpeed: (delta: number) => void;
  onInjectHazard: () => void;
  highContrast: boolean;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  currentScenarioId,
  onSelectScenario,
  speed,
  onAdjustSpeed,
  onInjectHazard,
  highContrast,
}) => {
  return (
    <div
      id="scenario-control-bar"
      className={`w-full p-3 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono select-none ${
        highContrast
          ? "bg-black border-yellow-400 text-yellow-300"
          : "bg-slate-950/90 border-slate-800 text-slate-200"
      }`}
    >
      {/* Scenario Selectors */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>ROAD SCENARIO:</span>
        </span>
        {PRESET_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => onSelectScenario(sc)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              currentScenarioId === sc.id
                ? "bg-cyan-600 text-white border-cyan-400 font-bold shadow-sm"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {sc.title}
          </button>
        ))}
      </div>

      {/* Throttle & Brake controls for Rider Simulation */}
      <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
        <div className="flex items-center gap-1">
          <span className="text-slate-400 mr-1 text-[11px]">RIDER SPEED:</span>
          <button
            onClick={() => onAdjustSpeed(-5)}
            className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/60 font-bold flex items-center gap-1 active:scale-95"
            title="Apply Motorcycle Brakes"
          >
            <Rewind className="w-3.5 h-3.5" />
            <span>BRAKE (-5)</span>
          </button>
          <button
            onClick={() => onAdjustSpeed(5)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold flex items-center gap-1 active:scale-95"
            title="Accelerate Motorcycle"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>THROTTLE (+5)</span>
          </button>
        </div>

        {/* Inject Sudden Hazard button */}
        <button
          onClick={onInjectHazard}
          className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-600 font-bold flex items-center gap-1 active:scale-95 shadow-sm"
          title="Simulate sudden unexpected road hazard"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
          <span>INJECT HAZARD</span>
        </button>
      </div>
    </div>
  );
};
