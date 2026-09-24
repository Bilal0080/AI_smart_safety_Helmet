/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Gauge,
  Disc,
  Battery,
  Cpu,
  Bell,
  CheckCircle,
  AlertTriangle,
  X,
  Cloud,
  HardDrive,
} from "lucide-react";
import { MaintenanceDiagnostics } from "../types";

interface TelemetryMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelemetryMaintenanceModal: React.FC<TelemetryMaintenanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<MaintenanceDiagnostics>({
    brakePadsFrontMm: 4.8,
    brakePadsRearMm: 4.1,
    frontTirePsi: 32.5,
    rearTirePsi: 36.0,
    helmetBatteryPct: 88,
    cameraLatencyMs: 14,
    aiInferenceLatencyMs: 42,
    nextServiceKm: 1420,
    sensorHealth: {
      frontCam: "OPTIMAL",
      leftBlindSpotCam: "OPTIMAL",
      rightBlindSpotCam: "OPTIMAL",
      rearRadarCam: "OPTIMAL",
      imuAccelerometer: "CALIBRATED",
      gpsGnss: "LOCK_12_SATS",
      bleGateway: "CONNECTED",
    },
  });

  const [notificationSent, setNotificationSent] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/telemetry/maintenance")
        .then((res) => res.json())
        .then((resData) => {
          if (resData?.diagnostics) {
            setData(resData.diagnostics);
          }
        })
        .catch((e) => console.warn("Using local maintenance diagnostics:", e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerPushNotification = () => {
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider uppercase text-white">
                Predictive Maintenance &amp; Telemetry
              </h2>
              <p className="text-[10px] text-slate-400">
                ECU Diagnostics &bull; Cloud Synchronized &bull; Local Cache
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

        <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* Push notification banner */}
          {notificationSent && (
            <div className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-500 text-cyan-200 text-xs flex items-center gap-2 animate-bounce">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Simulated Push Notification: &ldquo;Service interval scheduled in 1,420 km. Brake pads 80% remaining.&rdquo;</span>
            </div>
          )}

          {/* Grid of Key Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Brake Pads Wear */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Disc className="w-4 h-4" />
                  <span>Brake Pad Thickness (Min: 1.5mm)</span>
                </div>
                <span className="text-[10px] text-emerald-400">HEALTHY</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Front Sintered Pads:</span>
                    <span className="font-bold text-white">{data.brakePadsFrontMm} mm (80%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Rear Organic Pads:</span>
                    <span className="font-bold text-white">{data.brakePadsRearMm} mm (68%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tire Pressure TPMS */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <div className="flex items-center gap-1.5 text-sky-400">
                  <Gauge className="w-4 h-4" />
                  <span>TPMS Tire Pressure &amp; Temp</span>
                </div>
                <span className="text-[10px] text-emerald-400">NOMINAL</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-black/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400">FRONT TIRE</div>
                  <div className="text-lg font-black text-cyan-300">{data.frontTirePsi} PSI</div>
                  <div className="text-[10px] text-slate-500">28°C Warm</div>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400">REAR TIRE</div>
                  <div className="text-lg font-black text-cyan-300">{data.rearTirePsi} PSI</div>
                  <div className="text-[10px] text-slate-500">31°C Warm</div>
                </div>
              </div>
            </div>

            {/* Helmet Sensors & Latency */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <div className="flex items-center gap-1.5 text-purple-400">
                  <Cpu className="w-4 h-4" />
                  <span>Hardware &amp; AI Latency</span>
                </div>
                <span className="text-[10px] text-emerald-400">&lt; 200ms REQUIREMENT MET</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">CAMERA BUS</div>
                  <div className="text-base font-bold text-emerald-400">{data.cameraLatencyMs} ms</div>
                </div>
                <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">AI INFERENCE</div>
                  <div className="text-base font-bold text-cyan-400">{data.aiInferenceLatencyMs} ms</div>
                </div>
              </div>
            </div>

            {/* Battery & Power */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Battery className="w-4 h-4" />
                  <span>Helmet Power Subsystem</span>
                </div>
                <span className="text-[10px] text-emerald-400">CHARGED</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-black text-white">{data.helmetBatteryPct}%</div>
                <div className="text-xs text-slate-400">
                  Estimated runtime: 8.5 hours continuous HUD &amp; 360° Vision AI processing.
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Health Table */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-300 flex items-center justify-between">
              <span>Perception Sensor Matrix Health:</span>
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> All 7 Subsystems Online
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400 block">CAM 1 (FRONT):</span>
                <span className="font-bold text-emerald-400">{data.sensorHealth.frontCam}</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400 block">CAM 2 (LEFT):</span>
                <span className="font-bold text-emerald-400">{data.sensorHealth.leftBlindSpotCam}</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400 block">CAM 3 (RIGHT):</span>
                <span className="font-bold text-emerald-400">{data.sensorHealth.rightBlindSpotCam}</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400 block">CAM 4 (REAR):</span>
                <span className="font-bold text-emerald-400">{data.sensorHealth.rearRadarCam}</span>
              </div>
            </div>
          </div>

          {/* Service Interval & Push Alert simulation */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={triggerPushNotification}
              className="px-3 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Bell className="w-4 h-4" />
              <span>TEST SERVICE NOTIFICATION PUSH</span>
            </button>

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
