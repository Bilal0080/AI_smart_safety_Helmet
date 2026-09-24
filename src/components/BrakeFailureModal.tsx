/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Flame,
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  Navigation,
  CheckCircle2,
  X,
  Radio,
} from "lucide-react";
import { RunawayRamp, TelemetryData } from "../types";
import { audioSynthesizer } from "../services/audioSynthesizer";

interface BrakeFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
}

export const BrakeFailureModal: React.FC<BrakeFailureModalProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  const [ramps, setRamps] = useState<RunawayRamp[]>([
    {
      id: "ramp-01",
      name: "Crest Mountain Escape Ramp A-4",
      distanceKm: 1.4,
      gradePercent: 14.5,
      surface: "Deep Pea-Gravel Arrester Bed",
      status: "CLEAR_ACTIVE",
      coordinates: { lat: 34.2285, lng: -118.0612 },
      recommendedSpeedKmH: "< 90 km/h entry",
      trafficFlow: "Zero obstruction, right shoulder branch",
    },
    {
      id: "ramp-02",
      name: "Valley Descent Sand Arrester 2B",
      distanceKm: 3.8,
      gradePercent: 18.0,
      surface: "Sand & Gravity Drag Incline",
      status: "CLEAR_ACTIVE",
      coordinates: { lat: 34.2140, lng: -118.0450 },
      recommendedSpeedKmH: "< 120 km/h entry",
      trafficFlow: "Clear, lighted emergency signs",
    },
  ]);
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      // Trigger urgent alarm and voice instructions
      audioSynthesizer.playAlertTone(4);
      audioSynthesizer.speakInstruction(
        "CRITICAL BRAKE EMERGENCY. RUNAWAY RAMP 1.4 KILOMETERS AHEAD ON RIGHT. DOWNSHIFT GEARS PROGRESSIVELY.",
        4
      );

      // Fetch dynamic ramps from server
      fetch("/api/emergency/runaway-ramps")
        .then((res) => res.json())
        .then((data) => {
          if (data?.ramps) {
            setRamps(data.ramps);
          }
        })
        .catch((e) => console.warn("Using offline cached runaway ramps:", e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nearestRamp = ramps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border-2 border-red-500 bg-slate-950 text-slate-100 shadow-[0_0_50px_rgba(239,68,68,0.5)] overflow-hidden font-mono">
        {/* Urgent Header Banner */}
        <div className="px-5 py-3.5 bg-red-600 text-white flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-7 h-7 animate-bounce" />
            <div>
              <h2 className="text-base font-black tracking-widest uppercase">
                EMERGENCY: BRAKE FAILURE ESCAPE PROTOCOL
              </h2>
              <p className="text-xs font-bold text-red-100">
                CRITICAL AUTONOMOUS TELEMETRY OVERRIDE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Nearest Runaway Ramp Tactical Card */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Navigation className="w-4 h-4 animate-spin" style={{ animationDuration: "8s" }} />
                <span>PRIMARY ESCAPE RUNAWAY RAMP DETECTED</span>
              </div>
              <div className="text-xl font-black text-white tracking-wide">
                {nearestRamp?.name}
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-3 flex-wrap">
                <span className="font-bold text-emerald-400">
                  DISTANCE: {nearestRamp?.distanceKm} KM (RIGHT SHOULDER)
                </span>
                <span>GRADE: +{nearestRamp?.gradePercent}%</span>
                <span>SURFACE: {nearestRamp?.surface}</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-lg bg-red-600 text-white text-center font-black">
              <div className="text-[10px] tracking-widest opacity-90">ETA AT CURRENT SPEED</div>
              <div className="text-xl leading-none font-extrabold">
                {Math.round((nearestRamp?.distanceKm / Math.max(20, telemetry.speedKmH)) * 3600)} SEC
              </div>
            </div>
          </div>

          {/* Stepped Emergency Braking Guidance */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Step-By-Step Survival Guidance (Follow Immediately):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  1
                </span>
                <div>
                  <div className="font-bold text-amber-300">PROGRESSIVE ENGINE BRAKE</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Downshift 1 gear at a time smoothly. Let compression drag slow vehicle down.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  2
                </span>
                <div>
                  <div className="font-bold text-amber-300">ACTIVATE HAZARD FLASHERS</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Warn traffic ahead and behind. Steer toward right emergency breakdown shoulder.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  3
                </span>
                <div>
                  <div className="font-bold text-amber-300">ALIGN WITH GRAVEL CHUTE</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Steer straight into ramp entrance. Keep handlebars parallel and upright.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  4
                </span>
                <div>
                  <div className="font-bold text-amber-300">DO NOT LEAN IN GRAVEL</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Stand slightly on footpegs to absorb impact. Let arresting bed sink and halt tires.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry live status */}
          <div className="p-3 rounded-lg bg-black/60 border border-slate-800 text-[11px] flex items-center justify-between flex-wrap gap-2 text-slate-300">
            <div>
              <span className="text-slate-500">SPEED:</span> <span className="font-bold text-white">{telemetry.speedKmH} km/h</span>
            </div>
            <div>
              <span className="text-slate-500">GPS:</span> <span className="font-bold text-cyan-400">{telemetry.gpsCoords.lat.toFixed(4)} N, {telemetry.gpsCoords.lng.toFixed(4)} W</span>
            </div>
            <div>
              <span className="text-slate-500">TRAFFIC FLOW:</span> <span className="font-bold text-emerald-400">{nearestRamp?.trafficFlow}</span>
            </div>
            <div>
              <span className="text-slate-500">BACKUP MAPS:</span> <span className="font-bold text-emerald-400">CACHED OFFLINE</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                audioSynthesizer.speakInstruction("Emergency runaway ramp navigation locked. Downshift engine now.", 4);
              }}
              className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg"
            >
              <Radio className="w-4 h-4 animate-ping" />
              <span>LOCK RAMP ESCAPE VECTOR</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              DISMISS ALERT (BRAKES RESTORED)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
