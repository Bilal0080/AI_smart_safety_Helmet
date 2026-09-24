/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { TopBar } from "./components/TopBar";
import { HelmetHUD } from "./components/HelmetHUD";
import { CameraGrid } from "./components/CameraGrid";
import { Radar360 } from "./components/Radar360";
import { VoiceAssistant } from "./components/VoiceAssistant";
import { ScenarioBar } from "./components/ScenarioBar";
import { BrakeFailureModal } from "./components/BrakeFailureModal";
import { EmergencySOSModal } from "./components/EmergencySOSModal";
import { TelemetryMaintenanceModal } from "./components/TelemetryMaintenanceModal";
import { OfflineMountainWeather } from "./components/OfflineMountainWeather";
import {
  PRESET_SCENARIOS,
  getScenarioObjects,
  calculateAggregateRisk,
} from "./services/roadSimulation";
import { audioSynthesizer } from "./services/audioSynthesizer";
import {
  CameraPosition,
  DetectedRoadObject,
  RiskLevel,
  RoadScenario,
  TelemetryData,
  InteractionLogEntry,
} from "./types";

export default function App() {
  const [currentScenario, setCurrentScenario] = useState<RoadScenario>(
    PRESET_SCENARIOS[0]
  );
  const [riderSpeed, setRiderSpeed] = useState<number>(PRESET_SCENARIOS[0].initialSpeed);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [activeCameraView, setActiveCameraView] = useState<CameraPosition | "QUAD">("QUAD");
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals state
  const [isOpenSOS, setIsOpenSOS] = useState<boolean>(false);
  const [isOpenBrakeFailure, setIsOpenBrakeFailure] = useState<boolean>(false);
  const [isOpenMaintenance, setIsOpenMaintenance] = useState<boolean>(false);
  const [isOpenWeather, setIsOpenWeather] = useState<boolean>(false);

  // Injected temporary hazard
  const [injectedHazard, setInjectedHazard] = useState<DetectedRoadObject | null>(null);

  // Interaction Log state for last 5 voice-triggered actions and safety alerts
  const [interactionLogs, setInteractionLogs] = useState<InteractionLogEntry[]>([
    {
      id: "log-init-1",
      type: "SAFETY_ALERT",
      text: "360° Safety Shield Engaged",
      detail: "Vision AI & Optical Radar active",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      riskLevel: "GREEN",
      iconType: "alert",
    },
    {
      id: "log-init-2",
      type: "VOICE_ACTION",
      text: "Helmet Voice Copilot Online",
      detail: "Earphone PTT & Gemini connected",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      iconType: "mic",
    },
  ]);

  const addInteractionLog = (entry: Omit<InteractionLogEntry, "id" | "timestamp">) => {
    const newEntry: InteractionLogEntry = {
      ...entry,
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    setInteractionLogs((prev) => [newEntry, ...prev.slice(0, 9)]);
  };

  // Last risk level to detect priority escalation
  const lastRiskRef = useRef<RiskLevel>("GREEN");

  // Dynamic simulation loop (ticks every 200ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => +(prev + 0.2).toFixed(1));
    }, 200);

    return () => clearInterval(timer);
  }, []);

  // Compute live scene objects & signals
  const baseScene = getScenarioObjects(
    currentScenario.id,
    elapsedSec,
    riderSpeed
  );

  // Combine with any user-injected hazard
  let allObjects = [...baseScene.objects];
  if (injectedHazard) {
    allObjects.unshift(injectedHazard);
  }

  // Calculate aggregate risk & primary hazard
  const { overallRisk, primaryHazard, recommendedInstruction } =
    calculateAggregateRisk(allObjects);

  // Audio tone and voice instruction management on risk change
  useEffect(() => {
    if (overallRisk !== lastRiskRef.current) {
      if (overallRisk === "RED") {
        audioSynthesizer.playAlertTone(4);
        audioSynthesizer.speakInstruction(recommendedInstruction, 4);
        addInteractionLog({
          type: "SAFETY_ALERT",
          text: recommendedInstruction || "CRITICAL — BRAKE NOW",
          detail: primaryHazard ? `${primaryHazard.label} (${primaryHazard.distanceMeters}m)` : "Emergency collision hazard",
          riskLevel: "RED",
          iconType: "brake",
        });
      } else if (overallRisk === "ORANGE") {
        audioSynthesizer.playAlertTone(3);
        audioSynthesizer.speakInstruction(recommendedInstruction, 3);
        addInteractionLog({
          type: "SAFETY_ALERT",
          text: recommendedInstruction || "CAUTION — SLOW DOWN",
          detail: primaryHazard ? `${primaryHazard.label} (${primaryHazard.distanceMeters}m)` : "High-risk trajectory",
          riskLevel: "ORANGE",
          iconType: "alert",
        });
      } else if (overallRisk === "YELLOW" && lastRiskRef.current === "GREEN") {
        audioSynthesizer.playAlertTone(2);
        audioSynthesizer.speakInstruction(recommendedInstruction, 2);
        addInteractionLog({
          type: "SAFETY_ALERT",
          text: recommendedInstruction || "POTENTIAL HAZARD",
          detail: primaryHazard ? `${primaryHazard.label} (${primaryHazard.distanceMeters}m)` : "Road caution",
          riskLevel: "YELLOW",
          iconType: "alert",
        });
      }
      lastRiskRef.current = overallRisk;
    }
  }, [overallRisk, recommendedInstruction, primaryHazard]);

  // Telemetry object
  const telemetry: TelemetryData = {
    speedKmH: riderSpeed,
    speedLimitKmH: currentScenario.speedLimit,
    followingDistanceMeters: primaryHazard?.distanceMeters || 45,
    pitchDegrees: +(Math.sin(elapsedSec * 0.4) * 2).toFixed(1),
    rollDegrees: +(Math.cos(elapsedSec * 0.6) * 4).toFixed(1),
    gForce: +(1.0 + (riderSpeed > 70 ? 0.35 : 0.08) + Math.sin(elapsedSec) * 0.05).toFixed(2),
    engineRpm: Math.round(2400 + riderSpeed * 45),
    gear: riderSpeed < 20 ? 1 : riderSpeed < 40 ? 2 : riderSpeed < 65 ? 3 : riderSpeed < 90 ? 4 : 5,
    gpsCoords: { lat: 34.2285, lng: -118.0612 },
    headingDegrees: 42,
    bluetoothConnected: true,
    wifiConnected: true,
    helmetBatteryPct: 88,
    latencyMs: 14,
  };

  // Switch scenario
  const handleSelectScenario = (sc: RoadScenario) => {
    setCurrentScenario(sc);
    setRiderSpeed(sc.initialSpeed);
    setInjectedHazard(null);
    audioSynthesizer.playAlertTone(1);
    audioSynthesizer.speakInstruction(`Scenario switched: ${sc.title}`, 1);
    addInteractionLog({
      type: "VOICE_ACTION",
      text: `Scenario: ${sc.title}`,
      detail: `Speed limit: ${sc.speedLimit} km/h`,
      iconType: "nav",
    });
  };

  // Adjust rider speed
  const handleAdjustSpeed = (delta: number) => {
    setRiderSpeed((prev) => Math.max(0, Math.min(160, prev + delta)));
  };

  // Sudden hazard injection
  const handleInjectHazard = () => {
    const hazard: DetectedRoadObject = {
      id: "sudden-hazard-" + Date.now(),
      camera: "FRONT",
      label: "SUDDEN OBSTACLE / DEBRIS",
      category: "HAZARD",
      distanceMeters: 9,
      relativeSpeedKmH: -riderSpeed,
      direction: "AHEAD",
      ttcSeconds: +(9 / (riderSpeed / 3.6)).toFixed(1),
      riskLevel: "RED",
      box: { x: 42, y: 55, width: 16, height: 18 },
      actionAdvice: "BRAKE NOW — OBSTACLE AHEAD",
    };
    setInjectedHazard(hazard);
    audioSynthesizer.playAlertTone(4);
    audioSynthesizer.speakInstruction("BRAKE NOW. OBSTACLE AHEAD.", 4);
    addInteractionLog({
      type: "SAFETY_ALERT",
      text: "SUDDEN OBSTACLE / DEBRIS",
      detail: "Obstacle in path (9m) — BRAKE NOW",
      riskLevel: "RED",
      iconType: "hazard",
    });

    // Clear after 6 seconds
    setTimeout(() => {
      setInjectedHazard(null);
    }, 6000);
  };

  // Voice command execution handler
  const handleVoiceCommand = (cmd: string) => {
    const c = cmd.toLowerCase();
    if (c.includes("show front")) setActiveCameraView("FRONT");
    else if (c.includes("show left")) setActiveCameraView("LEFT");
    else if (c.includes("show right")) setActiveCameraView("RIGHT");
    else if (c.includes("show rear")) setActiveCameraView("REAR");
    else if (c.includes("quad") || c.includes("camera mode")) setActiveCameraView("QUAD");
    else if (c.includes("runaway ramp") || c.includes("brake failure")) {
      setIsOpenBrakeFailure(true);
      addInteractionLog({
        type: "SAFETY_ALERT",
        text: "BRAKE FAILURE ESCAPE",
        detail: "Runaway Ramp A-4 Locked",
        riskLevel: "RED",
        iconType: "brake",
      });
    } else if (c.includes("safety mode")) setActiveCameraView("QUAD");
  };

  const handleLogVoiceAction = (
    actionText: string,
    detail?: string,
    iconType?: InteractionLogEntry["iconType"]
  ) => {
    addInteractionLog({
      type: "VOICE_ACTION",
      text: actionText,
      detail,
      iconType: iconType || "mic",
    });
  };

  // Keyboard controls for convenient rider simulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;

      if (e.key === "ArrowUp") {
        handleAdjustSpeed(5);
      } else if (e.key === "ArrowDown" || e.code === "Space") {
        handleAdjustSpeed(-5);
      } else if (e.key === "1") {
        setActiveCameraView("FRONT");
      } else if (e.key === "2") {
        setActiveCameraView("LEFT");
      } else if (e.key === "3") {
        setActiveCameraView("RIGHT");
      } else if (e.key === "4") {
        setActiveCameraView("REAR");
      } else if (e.key === "0" || e.key === "q" || e.key === "Q") {
        setActiveCameraView("QUAD");
      } else if (e.key === "b" || e.key === "B") {
        setIsOpenBrakeFailure(true);
      } else if (e.key === "s" || e.key === "S") {
        setIsOpenSOS(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        highContrast ? "bg-black text-yellow-300" : "bg-slate-950 text-slate-100"
      }`}
    >
      {/* Top Bar with Telemetry, Connectivity, Risk, and Emergency Triggers */}
      <TopBar
        riskLevel={overallRisk}
        telemetry={telemetry}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          audioSynthesizer.setMuted(next);
        }}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        onTriggerSOS={() => {
          setIsOpenSOS(true);
          addInteractionLog({
            type: "SAFETY_ALERT",
            text: "IMPACT CRASH DETECTED",
            detail: "Emergency SOS beacon broadcast",
            riskLevel: "RED",
            iconType: "alert",
          });
        }}
        onTriggerBrakeFailure={() => {
          setIsOpenBrakeFailure(true);
          addInteractionLog({
            type: "SAFETY_ALERT",
            text: "CRITICAL BRAKE FAILURE",
            detail: "Runaway Ramp A-4 Locked",
            riskLevel: "RED",
            iconType: "brake",
          });
        }}
        onOpenMaintenance={() => setIsOpenMaintenance(true)}
        onOpenWeather={() => setIsOpenWeather(true)}
      />

      {/* Main Rider Cockpit / HUD Dashboard */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 flex flex-col gap-3">
        {/* Scenario and Throttle Bar */}
        <ScenarioBar
          currentScenarioId={currentScenario.id}
          onSelectScenario={handleSelectScenario}
          speed={riderSpeed}
          onAdjustSpeed={handleAdjustSpeed}
          onInjectHazard={handleInjectHazard}
          highContrast={highContrast}
        />

        {/* Primary Flight Deck: Helmet HUD Display */}
        <HelmetHUD
          telemetry={telemetry}
          primaryHazard={primaryHazard}
          allObjects={allObjects}
          signal={baseScene.signal}
          zebra={baseScene.zebra}
          nav={baseScene.nav}
          riskLevel={overallRisk}
          voiceInstruction={recommendedInstruction}
          highContrast={highContrast}
          interactionLogs={interactionLogs}
          onClearLogs={() => setInteractionLogs([])}
        />

        {/* Perception Layer: 4-Channel Camera Grid & 360° Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          {/* 4-Channel Camera Feeds (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col">
            <CameraGrid
              objects={allObjects}
              activeView={activeCameraView}
              onSelectView={setActiveCameraView}
              highContrast={highContrast}
            />
          </div>

          {/* 360° Awareness Radar & Voice Assistant (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <Radar360 objects={allObjects} highContrast={highContrast} />
            <VoiceAssistant
              onExecuteCommand={handleVoiceCommand}
              onLogVoiceAction={handleLogVoiceAction}
              telemetry={telemetry}
              riskLevel={overallRisk}
              highContrast={highContrast}
            />
          </div>
        </div>

        {/* Keyboard Quick Controls Bar for Driver Simulation */}
        <div className="w-full p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-cyan-400 font-bold">KEYBOARD HOTKEYS:</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">▲ Up</kbd> Accelerate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">▼ Down / Space</kbd> Brake</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">1-4</kbd> Cam Views</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">0 / Q</kbd> 4-Split</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">B</kbd> Brake Fail Ramp</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">S</kbd> Crash SOS</span>
          </div>
          <div className="text-emerald-400">
            &bull; AI Optical Flow 120 FPS &bull; Low Latency Active
          </div>
        </div>
      </main>

      {/* Emergency Modals */}
      <BrakeFailureModal
        isOpen={isOpenBrakeFailure}
        onClose={() => setIsOpenBrakeFailure(false)}
        telemetry={telemetry}
      />

      <EmergencySOSModal
        isOpen={isOpenSOS}
        onClose={() => setIsOpenSOS(false)}
        telemetry={telemetry}
      />

      <TelemetryMaintenanceModal
        isOpen={isOpenMaintenance}
        onClose={() => setIsOpenMaintenance(false)}
      />

      <OfflineMountainWeather
        isOpen={isOpenWeather}
        onClose={() => setIsOpenWeather(false)}
        weather={currentScenario.weather}
      />
    </div>
  );
}
