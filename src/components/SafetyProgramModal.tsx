/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, Award, HeartHandshake, Eye, AlertOctagon, X, CheckCircle2 } from "lucide-react";

interface SafetyProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyProgramModal: React.FC<SafetyProgramModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600 text-white">
                Official Initiative
              </span>
              <span className="text-xs text-slate-400 font-mono">Vision Zero</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-0.5">
              Toyota Road Safety Awareness Program
            </h2>
            <p className="text-sm font-medium text-cyan-400">
              Prepared by: <span className="font-bold text-white">Muhammad Bilal</span>
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-5">
          <p className="text-sm text-slate-300 leading-relaxed">
            This AI-powered Smart Motorcycle Safety Helmet system is designed as part of the{" "}
            <span className="text-white font-semibold">Toyota Road Safety Awareness Program</span>,
            championing the global <span className="text-cyan-400 font-semibold">Vision Zero</span> initiative — working toward a society with zero traffic accidents and zero rider fatalities.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5">
            <Eye className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-200 uppercase font-mono">
                Vulnerable Road Users
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                AI detection for pedestrians, children, cyclists, elderly, and stray animals entering the path.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5">
            <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-200 uppercase font-mono">
                Predictive Collision TTC
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Real-time Time-to-Collision math calculating relative speed, trajectory, and braking thresholds.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5">
            <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-200 uppercase font-mono">
                360° Optical Shield
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Blind spot warnings (Left / Right) and rear approach alert for fast-closing trailing vehicles.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5">
            <Award className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-200 uppercase font-mono">
                Emergency Escape & SOS
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Runaway ramp guidance during brake failure & instant crash impact SOS broadcasting with GPS.
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & Acknowledgement */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Prepared by <span className="text-slate-200 font-semibold">Muhammad Bilal</span></span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold tracking-wide transition-all shadow-lg"
          >
            Acknowledge & Continue Riding
          </button>
        </div>
      </div>
    </div>
  );
};
