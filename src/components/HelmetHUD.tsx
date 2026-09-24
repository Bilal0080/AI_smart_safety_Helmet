/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  AlertOctagon,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Shield,
  Compass,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import {
  DetectedRoadObject,
  TrafficSignalState,
  ZebraCrossingState,
  NavigationInstruction,
  TelemetryData,
  RiskLevel,
  InteractionLogEntry,
} from "../types";
import { InteractionLog } from "./InteractionLog";

interface HelmetHUDProps {
  telemetry: TelemetryData;
  primaryHazard: DetectedRoadObject | null;
  allObjects: DetectedRoadObject[];
  signal: TrafficSignalState;
  zebra: ZebraCrossingState;
  nav: NavigationInstruction;
  riskLevel: RiskLevel;
  voiceInstruction: string;
  highContrast: boolean;
  interactionLogs?: InteractionLogEntry[];
  onClearLogs?: () => void;
}

export const HelmetHUD: React.FC<HelmetHUDProps> = ({
  telemetry,
  primaryHazard,
  allObjects,
  signal,
  zebra,
  nav,
  riskLevel,
  voiceInstruction,
  highContrast,
  interactionLogs,
  onClearLogs,
}) => {
  // Find blind spot or directional approaching objects
  const leftApproaching = allObjects.find(
    (o) => o.direction === "APPROACHING_LEFT" || (o.camera === "LEFT" && o.distanceMeters < 15)
  );
  const rightApproaching = allObjects.find(
    (o) => o.direction === "APPROACHING_RIGHT" || (o.camera === "RIGHT" && o.distanceMeters < 15)
  );
  const rearApproaching = allObjects.find(
    (o) => o.direction === "BEHIND" && o.distanceMeters < 25
  );

  // Speed limit check
  const isOverSpeed = telemetry.speedKmH > telemetry.speedLimitKmH;

  // HUD Color Scheme
  const hudColor = highContrast
    ? "text-yellow-300 border-yellow-400"
    : riskLevel === "RED"
    ? "text-red-400 border-red-500"
    : riskLevel === "ORANGE"
    ? "text-amber-400 border-amber-500"
    : "text-cyan-400 border-cyan-500/50";

  const glowClass = highContrast
    ? "shadow-[0_0_15px_rgba(253,224,71,0.3)]"
    : riskLevel === "RED"
    ? "shadow-[0_0_25px_rgba(239,68,68,0.4)]"
    : "shadow-[0_0_15px_rgba(6,182,212,0.25)]";

  return (
    <div
      id="helmet-hud-visor"
      aria-label="Augmented Reality Helmet HUD Visor"
      className={`relative w-full h-[420px] rounded-xl border-2 overflow-hidden select-none transition-all flex flex-col justify-between p-4 ${
        highContrast
          ? "bg-black text-yellow-300 border-yellow-400"
          : "bg-slate-950/90 text-cyan-300 border-cyan-500/40"
      } ${glowClass}`}
    >
      {/* HUD Background Visor Horizon & Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        {/* Subtle Pitch / Roll Artificial Horizon Ladder */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-[1px] bg-current transition-transform duration-300"
          style={{
            transform: `translate(-50%, -50%) rotate(${telemetry.rollDegrees}deg)`,
          }}
        >
          <div className="absolute -top-3 left-0 w-3 h-6 border-l border-t border-b border-current" />
          <div className="absolute -top-3 right-0 w-3 h-6 border-r border-t border-b border-current" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-current" />
        </div>
        {/* Curved visor vignette lines */}
        <div className="absolute inset-x-8 top-2 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-40" />
        <div className="absolute inset-x-8 bottom-2 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-40" />
      </div>

      {/* TOP HUD SECTION: Speed, Speed Limit, Navigation, Traffic Light */}
      <div className="relative z-10 flex items-start justify-between">
        {/* Left: Speedometer & Following Distance */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-lg border bg-black/60 backdrop-blur-sm ${
              isOverSpeed ? "border-red-500 text-red-400 animate-pulse" : hudColor
            }`}
          >
            <div className="text-[10px] font-mono tracking-widest uppercase opacity-75">
              SPEED
            </div>
            <div className="text-3xl font-black font-mono tracking-tighter leading-none">
              {telemetry.speedKmH}
              <span className="text-xs font-normal ml-1">km/h</span>
            </div>
            {isOverSpeed && (
              <div className="text-[10px] font-bold text-red-400 mt-0.5">
                EXCEEDING LIMIT
              </div>
            )}
          </div>

          {/* Speed Limit Circular Sign HUD */}
          <div className="w-11 h-11 rounded-full border-2 border-red-500 bg-white text-black font-black font-mono flex flex-col items-center justify-center shadow-md">
            <span className="text-[8px] font-bold tracking-tighter -mb-1 text-slate-700">LIMIT</span>
            <span className="text-sm leading-tight font-extrabold">{telemetry.speedLimitKmH}</span>
          </div>

          {/* Following distance indicator */}
          <div className="hidden sm:block px-2.5 py-1 rounded border border-current/30 bg-black/40 text-[11px] font-mono">
            <div className="opacity-70 text-[9px]">AHEAD GAP</div>
            <div className="font-bold">
              {telemetry.followingDistanceMeters > 0
                ? `${telemetry.followingDistanceMeters} m`
                : "CLEAR"}
            </div>
          </div>
        </div>

        {/* Center: Tactical Critical Instruction Banner */}
        <div className="flex-1 max-w-md mx-2 text-center">
          {riskLevel === "RED" ? (
            <div className="px-4 py-2 rounded-lg bg-red-600 text-white font-mono font-black text-sm tracking-wider uppercase animate-pulse shadow-lg flex items-center justify-center gap-2 border-2 border-red-300">
              <AlertOctagon className="w-5 h-5 animate-bounce" />
              <span>{voiceInstruction || "CRITICAL — BRAKE NOW"}</span>
            </div>
          ) : riskLevel === "ORANGE" ? (
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/90 text-black font-mono font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5 border border-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>{voiceInstruction || "CAUTION — SLOW DOWN"}</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded bg-black/50 border border-current/30 text-xs font-mono tracking-wide opacity-85">
              <span>{voiceInstruction || "ROAD CLEAR — MAINTAIN SPEED"}</span>
            </div>
          )}
        </div>

        {/* Right: Traffic Signal HUD Recognition & Nav */}
        <div className="flex items-center gap-2">
          {/* Traffic Signal */}
          <div className="px-2.5 py-1 rounded-lg border border-current/40 bg-black/60 flex items-center gap-2">
            <div className="flex flex-col gap-1 items-center">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  signal.color === "RED"
                    ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                    : "bg-red-950/40 opacity-30"
                }`}
              />
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  signal.color === "YELLOW"
                    ? "bg-yellow-400 shadow-[0_0_8px_#facc15]"
                    : "bg-yellow-950/40 opacity-30"
                }`}
              />
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  signal.color === "GREEN"
                    ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                    : "bg-emerald-950/40 opacity-30"
                }`}
              />
            </div>
            <div className="text-[11px] font-mono leading-tight">
              <div className="font-bold uppercase">
                {signal.color} {signal.color === "RED" ? "STOP" : signal.color === "YELLOW" ? "SLOW" : "GO"}
              </div>
              <div className="text-[9px] opacity-75">{signal.distanceMeters}m &bull; {signal.timeRemainingSeconds}s</div>
            </div>
          </div>

          {/* Navigation Miniature Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-current/40 bg-black/60 text-[11px] font-mono">
            {nav.maneuver === "LEFT" && <ArrowLeft className="w-4 h-4 text-cyan-400" />}
            {nav.maneuver === "RIGHT" && <ArrowRight className="w-4 h-4 text-cyan-400" />}
            {nav.maneuver === "STRAIGHT" && <ArrowUp className="w-4 h-4 text-cyan-400" />}
            {nav.maneuver === "SLIGHT_RIGHT" && <ArrowRight className="w-4 h-4 text-amber-400" />}
            <div>
              <div className="font-bold">{nav.distanceMeters}m</div>
              <div className="text-[9px] opacity-75 truncate max-w-[90px]">{nav.streetName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER HUD SECTION: Road Horizon & Target Reticles */}
      <div className="relative z-10 flex-1 flex items-center justify-between px-2 my-2">
        {/* Left Directional Warning */}
        <div className="w-32">
          {leftApproaching ? (
            <div
              className={`p-2 rounded-lg border font-mono animate-pulse ${
                leftApproaching.riskLevel === "RED"
                  ? "bg-red-950/90 text-red-200 border-red-500"
                  : "bg-amber-950/90 text-amber-200 border-amber-500"
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-black">
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>BLIND SPOT</span>
              </div>
              <div className="text-[10px] mt-0.5 font-bold">
                {leftApproaching.label} {leftApproaching.distanceMeters}m
              </div>
            </div>
          ) : (
            <div className="text-[10px] font-mono opacity-30 tracking-widest">
              ← LEFT CLEAR
            </div>
          )}
        </div>

        {/* Center Primary Collision Reticle */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {primaryHazard ? (
            <div
              className={`relative px-4 py-2 rounded-lg border-2 text-center backdrop-blur-md transition-all ${
                primaryHazard.riskLevel === "RED"
                  ? "bg-red-950/80 border-red-500 text-red-200 animate-bounce"
                  : primaryHazard.riskLevel === "ORANGE"
                  ? "bg-amber-950/80 border-amber-400 text-amber-100"
                  : "bg-black/60 border-cyan-400/80 text-cyan-200"
              }`}
            >
              {/* Corner targeting brackets */}
              <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-current" />
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-current" />
              <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-current" />
              <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-current" />

              <div className="text-xs font-mono font-black tracking-widest uppercase flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{primaryHazard.label}</span>
              </div>
              <div className="text-lg font-mono font-black leading-tight">
                {primaryHazard.distanceMeters} m
                <span className="text-xs font-normal ml-2 opacity-80">
                  TTC: {primaryHazard.ttcSeconds}s
                </span>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold">
                {primaryHazard.actionAdvice || "MONITOR TRAJECTORY"}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-40">
              <div className="w-8 h-8 rounded-full border border-dashed border-current flex items-center justify-center">
                <ArrowUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono mt-1 tracking-widest">ROAD AHEAD CLEAR</span>
            </div>
          )}
        </div>

        {/* Right Section: Blind Spot & Interaction Log */}
        <div className="w-56 sm:w-64 flex flex-col items-end gap-1.5 z-20">
          {rightApproaching ? (
            <div
              className={`p-1.5 rounded-lg border font-mono animate-pulse w-full text-right ${
                rightApproaching.riskLevel === "RED"
                  ? "bg-red-950/90 text-red-200 border-red-500"
                  : "bg-amber-950/90 text-amber-200 border-amber-500"
              }`}
            >
              <div className="flex items-center justify-end gap-1 text-xs font-black">
                <span>BLIND SPOT</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </div>
              <div className="text-[10px] mt-0.5 font-bold">
                {rightApproaching.label} {rightApproaching.distanceMeters}m
              </div>
            </div>
          ) : (
            <div className="text-[10px] font-mono opacity-30 tracking-widest self-end pr-1">
              RIGHT CLEAR →
            </div>
          )}

          {/* Interaction Log Overlay (Last 5 voice actions & safety alerts) */}
          <InteractionLog
            logs={interactionLogs || []}
            highContrast={highContrast}
            onClearLogs={onClearLogs}
            className="w-full"
          />
        </div>
      </div>

      {/* BOTTOM HUD SECTION: Zebra Crossing, Rear Threat, Compass Heading */}
      <div className="relative z-10 flex items-end justify-between text-xs font-mono pt-2 border-t border-current/20">
        {/* Zebra Crossing HUD detection */}
        <div className="flex items-center gap-2">
          {zebra.detected ? (
            <div
              className={`px-2.5 py-1 rounded border ${
                zebra.pedestriansPresent
                  ? "bg-red-950/90 border-red-500 text-red-300 animate-pulse font-bold"
                  : "bg-black/60 border-yellow-400 text-yellow-300"
              }`}
            >
              <span className="text-[10px] block opacity-80">ZEBRA CROSSING</span>
              <span>{zebra.distanceMeters}m AHEAD</span>
              {zebra.pedestriansPresent && (
                <span className="block text-[9px] text-red-400 font-black">
                  ⚠ PEDESTRIAN CROSSING &bull; SLOW DOWN
                </span>
              )}
            </div>
          ) : (
            <div className="opacity-40 text-[10px]">
              NO CROSSWALK DETECTED
            </div>
          )}
        </div>

        {/* Rear Threat Indicator */}
        <div className="text-center">
          {rearApproaching ? (
            <div className="px-3 py-1 rounded bg-red-900/80 border border-red-400 text-red-200 font-bold animate-pulse text-[11px]">
              ⚠ VEHICLE APPROACHING BEHIND ({rearApproaching.distanceMeters}m)
            </div>
          ) : (
            <div className="opacity-50 text-[10px] tracking-wider">
              ↓ REAR SENSOR SECURE
            </div>
          )}
        </div>

        {/* Heading & Gyro stats */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 opacity-75">
            <Compass className="w-3.5 h-3.5" />
            <span>HDG 042° NE &bull; G: {telemetry.gForce.toFixed(2)}</span>
          </div>
          <div className="text-[10px] opacity-60">
            PITCH: {telemetry.pitchDegrees}° &bull; ROLL: {telemetry.rollDegrees}°
          </div>
        </div>
      </div>
    </div>
  );
};
