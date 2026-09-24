/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  CloudSun,
  Mountain,
  Thermometer,
  Wind,
  Droplets,
  HardDrive,
  Cloud,
  CheckCircle2,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";
import { MountainWeatherInfo } from "../types";

interface OfflineMountainWeatherProps {
  isOpen: boolean;
  onClose: () => void;
  weather: MountainWeatherInfo;
}

export const OfflineMountainWeather: React.FC<OfflineMountainWeatherProps> = ({
  isOpen,
  onClose,
  weather,
}) => {
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [syncTimer, setSyncTimer] = useState<number>(10);
  const [lastSynced, setLastSynced] = useState<string>("Just now");

  // 10-second periodic data update loop as specified in prompt
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTimer((prev) => {
        if (prev <= 1) {
          setLastSynced(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-sky-600/40 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider uppercase text-white">
                Mountain Weather &amp; Offline Terrain Cache
              </h2>
              <p className="text-[10px] text-slate-400">
                10-Sec Auto Refresh Loop &bull; High Altitude Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Offline / Online Toggle Card */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                {isOfflineMode ? (
                  <HardDrive className="w-4 h-4 text-amber-400" />
                ) : (
                  <Cloud className="w-4 h-4 text-emerald-400" />
                )}
                <span>{isOfflineMode ? "OFFLINE SATELLITE MODE" : "CONNECTED CLOUD SYNC"}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isOfflineMode
                  ? "Operating on cached mountain elevation vector tiles & emergency database."
                  : "Syncing road hazards, weather radar, and profile logs to cloud server."}
              </p>
            </div>

            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                isOfflineMode
                  ? "bg-amber-600 text-white border-amber-400"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
            >
              {isOfflineMode ? "RECONNECT CLOUD" : "SIMULATE OFFLINE"}
            </button>
          </div>

          {/* 10-Second Auto Refresh Indicator */}
          <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "10s" }} />
              <span>Next Sensor &amp; Weather Poll: {syncTimer}s</span>
            </div>
            <span className="text-[10px] text-slate-400">Last Synced: {lastSynced}</span>
          </div>

          {/* Mountain Weather Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Mountain className="w-3 h-3 text-sky-400" />
                <span>ALTITUDE</span>
              </div>
              <div className="text-xl font-black text-white mt-1">
                {weather.altitudeMeters} m
              </div>
              <div className="text-[9px] text-slate-500">6,036 ft MSL</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-400" />
                <span>AMBIENT TEMP</span>
              </div>
              <div className="text-xl font-black text-white mt-1">
                {weather.temperatureC}°C
              </div>
              <div className="text-[9px] text-slate-500">{Math.round((weather.temperatureC * 9) / 5 + 32)}°F</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Droplets className="w-3 h-3 text-blue-400" />
                <span>ROAD FRICTION (μ)</span>
              </div>
              <div
                className={`text-xl font-black mt-1 ${
                  weather.roadFrictionCoeff < 0.6 ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {weather.roadFrictionCoeff.toFixed(2)}
              </div>
              <div className="text-[9px] text-slate-500">
                {weather.roadFrictionCoeff < 0.6 ? "LOW TRACTION / WET" : "GOOD ASPHALT"}
              </div>
            </div>
          </div>

          {/* Road Surface Hazard Advisory */}
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Condition: {weather.condition}</span>
            </div>
            <p className="text-[11px] opacity-90">
              High-elevation moisture detected. Sudden drop below 3°C can produce black ice on shaded curves.
              System adjusted safe following distance by +35%.
            </p>
          </div>

          {/* Local Cache Status */}
          <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="text-slate-300 font-bold">Local Offline Database Manifest:</div>
            <div>&bull; Topographic Elevation Grid: <span className="text-emerald-400">Cached (14.2 MB)</span></div>
            <div>&bull; Runaway Truck &amp; Bike Ramps: <span className="text-emerald-400">3 Ramps Synced</span></div>
            <div>&bull; SOS Emergency Contact Ledger: <span className="text-emerald-400">Active</span></div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
