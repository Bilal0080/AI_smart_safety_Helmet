/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  ShieldAlert,
  Wifi,
  Bluetooth,
  BatteryCharging,
  Volume2,
  VolumeX,
  Eye,
  AlertTriangle,
  Flame,
  Wrench,
  CloudSun,
  Navigation,
  Award,
} from "lucide-react";
import { RiskLevel, TelemetryData } from "../types";

interface TopBarProps {
  riskLevel: RiskLevel;
  telemetry: TelemetryData;
  isMuted: boolean;
  onToggleMute: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onTriggerSOS: () => void;
  onTriggerBrakeFailure: () => void;
  onOpenMaintenance: () => void;
  onOpenWeather: () => void;
  onOpenSafetyProgram: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  riskLevel,
  telemetry,
  isMuted,
  onToggleMute,
  highContrast,
  onToggleHighContrast,
  onTriggerSOS,
  onTriggerBrakeFailure,
  onOpenMaintenance,
  onOpenWeather,
  onOpenSafetyProgram,
}) => {
  const getRiskBadge = () => {
    switch (riskLevel) {
      case "RED":
        return {
          bg: "bg-red-600 text-white border-red-400 animate-pulse",
          label: "DEFENSE LEVEL: CRITICAL",
          sub: "COLLISION RISK — BRAKE NOW",
        };
      case "ORANGE":
        return {
          bg: "bg-amber-600 text-white border-amber-400",
          label: "DEFENSE LEVEL: HIGH CAUTION",
          sub: "HAZARD IN TRAJECTORY",
        };
      case "YELLOW":
        return {
          bg: "bg-yellow-500 text-black border-yellow-300",
          label: "DEFENSE LEVEL: ADVISORY",
          sub: "OBJECTS TRACKED",
        };
      case "GREEN":
      default:
        return {
          bg: "bg-emerald-600 text-white border-emerald-400",
          label: "DEFENSE LEVEL: NORMAL",
          sub: "360° SHIELD NOMINAL",
        };
    }
  };

  const badge = getRiskBadge();

  return (
    <header
      id="helmet-topbar"
      className={`w-full px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b select-none transition-colors ${
        highContrast
          ? "bg-black text-yellow-300 border-yellow-400"
          : "bg-slate-950/95 text-slate-100 border-slate-800 backdrop-blur-md"
      }`}
    >
      {/* Brand & System Mode */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-red-950/60 border border-red-500/50 text-red-400 shadow-inner">
          <ShieldAlert className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-black tracking-wider uppercase">
              AI Smart Safety Helmet
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
              MK-IV HUD
            </span>
            <button
              onClick={onOpenSafetyProgram}
              className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-600/70 flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105"
              title="Toyota Road Safety Awareness Program — Prepared by Muhammad Bilal"
            >
              <Award className="w-3 h-3 text-red-400" />
              <span>Toyota Road Safety Program</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono flex-wrap">
            <span className="text-cyan-300 font-semibold">Prepared by Muhammad Bilal</span>
            <span className="text-slate-600">&bull;</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>360° Vision AI Active &bull; Latency: {telemetry.latencyMs}ms</span>
          </p>
        </div>
      </div>

      {/* Center Dynamic Risk Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`px-3 py-1 rounded-md border text-center font-mono tracking-wider flex items-center gap-2 shadow-sm ${badge.bg}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-ping" />
          <div className="text-left">
            <div className="text-xs font-black leading-tight">{badge.label}</div>
            <div className="text-[10px] opacity-90 leading-tight">{badge.sub}</div>
          </div>
        </div>
      </div>

      {/* Hardware Connectivity & Quick Action Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Hardware Status Chips */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1 text-cyan-400" title="Bluetooth Intercom / Headset Connected">
            <Bluetooth className="w-3.5 h-3.5" />
            <span>BT EARPHONES</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-emerald-400" title="Wi-Fi 5G Direct Gateway Connected">
            <Wifi className="w-3.5 h-3.5" />
            <span>5G LINK</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-sky-400" title="GPS Satellite Lock">
            <Navigation className="w-3.5 h-3.5" />
            <span>GPS 12-SAT</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-amber-300" title="Helmet Battery Level">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>{telemetry.helmetBatteryPct}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <button
          id="btn-mountain-weather"
          onClick={onOpenWeather}
          className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-sky-300 flex items-center gap-1.5 transition-colors"
          title="Mountain Region Weather & Road Surface Friction"
        >
          <CloudSun className="w-3.5 h-3.5" />
          <span className="hidden md:inline font-mono">Weather/Road</span>
        </button>

        <button
          id="btn-maintenance-diagnostics"
          onClick={onOpenMaintenance}
          className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-300 flex items-center gap-1.5 transition-colors"
          title="Predictive Vehicle Diagnostics, TPMS, Brake Pad Wear"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden md:inline font-mono">Diagnostics</span>
        </button>

        <button
          id="btn-toggle-contrast"
          onClick={onToggleHighContrast}
          className={`p-1.5 rounded-md border text-xs transition-colors ${
            highContrast
              ? "bg-yellow-400 text-black border-yellow-500 font-bold"
              : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300"
          }`}
          title="Toggle High-Contrast HUD Visor Mode for Bright Sun / Dark Fog"
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          id="btn-toggle-sound"
          onClick={onToggleMute}
          className={`p-1.5 rounded-md border text-xs transition-colors ${
            isMuted
              ? "bg-red-950/80 text-red-400 border-red-800"
              : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-cyan-400"
          }`}
          title={isMuted ? "Unmute Helmet Audio & Voice Alerts" : "Mute Helmet Audio Alerts"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* EMERGENCY BRAKE FAILURE BUTTON */}
        <button
          id="btn-brake-failure-emergency"
          onClick={onTriggerBrakeFailure}
          className="px-2.5 py-1.5 rounded-md bg-amber-950/90 hover:bg-amber-900 border border-amber-600 text-amber-200 text-xs font-black tracking-wide flex items-center gap-1 transition-all shadow-sm"
          title="EMERGENCY: Brake Failure Runaway Ramp Escape System"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-mono">BRAKE FAIL</span>
        </button>

        {/* ACCIDENT SOS TRIGGER */}
        <button
          id="btn-crash-sos"
          onClick={onTriggerSOS}
          className="px-2.5 py-1.5 rounded-md bg-red-900 hover:bg-red-800 border border-red-500 text-white text-xs font-black tracking-wide flex items-center gap-1 transition-all shadow-md active:scale-95"
          title="Test Impact Detection & Crash SOS"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-white" />
          <span className="font-mono">CRASH SOS</span>
        </button>
      </div>
    </header>
  );
};
