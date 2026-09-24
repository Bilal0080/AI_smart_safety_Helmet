/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AlertTriangle, PhoneCall, Check, MapPin, X, ShieldAlert, HeartHandshake } from "lucide-react";
import { TelemetryData } from "../types";
import { audioSynthesizer } from "../services/audioSynthesizer";

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  const [countdown, setCountdown] = useState<number>(15);
  const [sosSent, setSosSent] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Array<{ name: string; phone: string; relation: string }>>([
    { name: "Emergency Dispatch (911/112)", phone: "911", relation: "First Responder" },
    { name: "Sarah Tanoli", phone: "+1 (555) 389-4412", relation: "Spouse (ICE)" },
  ]);

  useEffect(() => {
    let timer: any = null;
    if (isOpen) {
      setCountdown(15);
      setSosSent(false);

      audioSynthesizer.playAlertTone(4);
      audioSynthesizer.speakInstruction("ACCIDENT DETECTED. EMERGENCY SOS TRIGGERED IN FIFTEEN SECONDS. PRESS CANCEL IF UNHURT.", 4);

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setSosSent(true);
            audioSynthesizer.speakInstruction("EMERGENCY BEACON DISPATCHED WITH GPS COORDINATES.", 4);
            return 0;
          }
          audioSynthesizer.playAlertTone(4);
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-red-500 bg-slate-950 text-slate-100 shadow-[0_0_60px_rgba(239,68,68,0.6)] overflow-hidden font-mono">
        {/* Header */}
        <div className="px-5 py-4 bg-red-600 text-white flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-8 h-8 animate-bounce" />
            <div>
              <h2 className="text-base font-black uppercase tracking-wider">
                IMPACT ACCIDENT DETECTED
              </h2>
              <p className="text-xs text-red-100 font-bold">
                G-FORCE EXCEEDED CRITICAL THRESHOLD (4.8G)
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

        <div className="p-5 flex flex-col items-center text-center gap-4">
          {!sosSent ? (
            <>
              {/* Circular Countdown */}
              <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-red-500 bg-red-950/40 shadow-[0_0_25px_#ef4444]">
                <div className="text-4xl font-black font-mono text-white animate-pulse">
                  {countdown}
                </div>
                <span className="absolute -bottom-2 px-2 py-0.5 rounded bg-red-600 text-[10px] font-bold">
                  SEC REMAINING
                </span>
              </div>

              <div className="text-sm text-slate-200">
                Automatic SOS Emergency beacon transmitting to First Responders &amp; ICE contacts with live GPS coordinates.
              </div>

              {/* Big Cancel Button for Rider */}
              <button
                id="btn-cancel-sos"
                onClick={() => {
                  audioSynthesizer.speakInstruction("Emergency SOS aborted. Rider reported safe.", 2);
                  onClose();
                }}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
              >
                <Check className="w-5 h-5" />
                <span>I AM OK &mdash; CANCEL SOS BEACON</span>
              </button>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-left w-full space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <ShieldAlert className="w-5 h-5" />
                <span>SOS BEACON TRANSMITTED (ONLINE + SATELLITE GNSS)</span>
              </div>
              <p className="text-xs opacity-90">
                Crash telemetry packet dispatched to 911 Dispatch &amp; Emergency contacts.
              </p>
              <div className="text-[11px] font-mono text-slate-300 bg-black/50 p-2 rounded">
                <div>&bull; GPS: {telemetry.gpsCoords.lat.toFixed(6)} N, {telemetry.gpsCoords.lng.toFixed(6)} W</div>
                <div>&bull; Impact G-Force: 4.82G &bull; Speed prior: {telemetry.speedKmH} km/h</div>
                <div>&bull; Angle: {telemetry.rollDegrees}° roll &bull; Time: {new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          {/* Emergency Contacts & Coordinates Snapshot */}
          <div className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-slate-800 pb-1">
              <span>DISPATCH RECIPIENTS:</span>
              <span className="text-cyan-400">GPS ACCURACY: ±2.5m</span>
            </div>

            {contacts.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <div>
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="text-[10px] text-slate-400 block">{c.relation}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-cyan-300">{c.phone}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              CLOSE WINDOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
