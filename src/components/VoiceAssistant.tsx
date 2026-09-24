/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Sparkles, Volume2, ShieldCheck, HelpCircle } from "lucide-react";
import { audioSynthesizer } from "../services/audioSynthesizer";
import { CameraPosition, TelemetryData, RiskLevel, InteractionLogEntry } from "../types";

interface VoiceAssistantProps {
  onExecuteCommand: (cmd: string) => void;
  onLogVoiceAction?: (actionText: string, detail?: string, iconType?: InteractionLogEntry["iconType"]) => void;
  telemetry: TelemetryData;
  riskLevel: RiskLevel;
  highContrast: boolean;
}

interface ChatMessage {
  id: string;
  sender: "RIDER" | "AI_COPILOT";
  text: string;
  timestamp: string;
  priority?: "NORMAL" | "CRITICAL";
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onExecuteCommand,
  onLogVoiceAction,
  telemetry,
  riskLevel,
  highContrast,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "AI_COPILOT",
      text: "Helmet Voice Copilot online. 360° Safety Shield connected.",
      timestamp: "Live",
      priority: "NORMAL",
    },
  ]);

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        handleUserSpeech(spoken);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Web Speech API not supported in this browser. Please use the quick tactile voice buttons below.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Failed to start speech recognition:", err);
      }
    }
  };

  const handleUserSpeech = async (inputStr: string) => {
    if (!inputStr.trim()) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "RIDER",
      text: inputStr,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    setMessages((prev) => [...prev.slice(-6), userMsg]);

    const lower = inputStr.toLowerCase();

    // Check direct helmet device commands
    if (lower.includes("show front")) {
      onExecuteCommand("show front");
      onLogVoiceAction?.("Voice: Show Front Camera", "Switched HUD to Forward Optical View", "camera");
      respond("Front camera live on visor.", "NORMAL", 1);
      return;
    }
    if (lower.includes("show left")) {
      onExecuteCommand("show left");
      onLogVoiceAction?.("Voice: Show Left Blind Spot", "Activated Left Mirror Cam", "camera");
      respond("Left blind spot camera active.", "NORMAL", 1);
      return;
    }
    if (lower.includes("show right")) {
      onExecuteCommand("show right");
      onLogVoiceAction?.("Voice: Show Right Blind Spot", "Activated Right Mirror Cam", "camera");
      respond("Right blind spot camera active.", "NORMAL", 1);
      return;
    }
    if (lower.includes("show rear")) {
      onExecuteCommand("show rear");
      onLogVoiceAction?.("Voice: Show Rear Traffic", "Switched HUD to Rear Camera", "camera");
      respond("Rear traffic camera active.", "NORMAL", 1);
      return;
    }
    if (lower.includes("speed limit")) {
      onLogVoiceAction?.("Voice: Speed Limit Check", `Limit is ${telemetry.speedLimitKmH} km/h`, "speed");
      respond(`Speed limit is ${telemetry.speedLimitKmH} km/h.`, "NORMAL", 1);
      return;
    }
    if (lower.includes("what is my speed") || lower.includes("current speed")) {
      onLogVoiceAction?.("Voice: Speed Query", `Current speed ${telemetry.speedKmH} km/h`, "speed");
      respond(`Current speed is ${telemetry.speedKmH} kilometers per hour.`, "NORMAL", 1);
      return;
    }
    if (lower.includes("what's ahead") || lower.includes("what is ahead")) {
      onLogVoiceAction?.("Voice: Scan Forward Road", "Forward path clear up to 45m", "nav");
      respond("Forward path clear up to 45 meters. Moderate curve in 120 meters.", "NORMAL", 2);
      return;
    }
    if (lower.includes("behind me")) {
      onLogVoiceAction?.("Voice: Scan Rear Traffic", "Vehicle following at 22m", "nav");
      respond("Vehicle following at 22 meters. Relative velocity stable.", "NORMAL", 2);
      return;
    }
    if (lower.includes("brake failure") || lower.includes("runaway ramp") || lower.includes("emergency ramp")) {
      onExecuteCommand("emergency runaway ramp");
      onLogVoiceAction?.("Voice: Brake Failure Emergency", "Ramp A-4 vector locked (1.4km)", "brake");
      respond("BRAKE EMERGENCY: Downshift engine. Escape Ramp A-4 is 1.4 kilometers ahead on the right.", "CRITICAL", 4);
      return;
    }

    // Call server-side Gemini Copilot
    setIsThinking(true);
    try {
      const res = await fetch("/api/gemini/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputStr,
          context: {
            speed: telemetry.speedKmH,
            speedLimit: telemetry.speedLimitKmH,
            riskLevel,
          },
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Eyes on road. Telemetry nominal.";
      onLogVoiceAction?.(`Voice: "${inputStr.slice(0, 26)}${inputStr.length > 26 ? '...' : ''}"`, reply, "mic");
      respond(reply, data.priority || "NORMAL", data.priority === "CRITICAL" ? 4 : 2);
    } catch (e) {
      onLogVoiceAction?.(`Voice: "${inputStr.slice(0, 26)}"`, "Copilot offline response", "mic");
      respond("Standing by. Ride defensively.", "NORMAL", 1);
    } finally {
      setIsThinking(false);
    }
  };

  const respond = (text: string, priority: "NORMAL" | "CRITICAL", alertLevel: 1 | 2 | 3 | 4) => {
    const aiMsg: ChatMessage = {
      id: "ai-" + Date.now(),
      sender: "AI_COPILOT",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      priority,
    };
    setMessages((prev) => [...prev.slice(-6), aiMsg]);

    // Speak audio instruction through helmet earphones
    audioSynthesizer.playAlertTone(alertLevel);
    audioSynthesizer.speakInstruction(text, alertLevel);
  };

  const quickCommands = [
    { label: "Show Front", cmd: "show front" },
    { label: "Show Left", cmd: "show left" },
    { label: "Show Right", cmd: "show right" },
    { label: "Show Rear", cmd: "show rear" },
    { label: "What's Ahead?", cmd: "what's ahead" },
    { label: "What's Behind?", cmd: "what's behind me" },
    { label: "Speed Limit?", cmd: "what's the speed limit" },
    { label: "Runaway Ramp!", cmd: "emergency runaway ramp" },
  ];

  return (
    <div
      id="voice-assistant-card"
      className={`w-full rounded-xl border p-3 flex flex-col justify-between ${
        highContrast
          ? "bg-black border-yellow-400 text-yellow-300"
          : "bg-slate-950/90 border-slate-800 text-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              AI Voice Copilot
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Hands-free Earphone Intercom &bull; Gemini 3.8 Flash
            </p>
          </div>
        </div>

        {/* Mic toggle */}
        <button
          onClick={toggleListening}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            isListening
              ? "bg-red-600 text-white animate-pulse"
              : "bg-cyan-700 hover:bg-cyan-600 text-white"
          }`}
          title="Toggle Hands-free Voice Input Microphone"
        >
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{isListening ? "LISTENING..." : "VOICE PTT"}</span>
        </button>
      </div>

      {/* Message Dialogue Feed */}
      <div className="flex-1 my-2 flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1 text-xs font-mono">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded-lg text-xs ${
              m.sender === "RIDER"
                ? "ml-8 bg-slate-900 border border-slate-700 text-slate-300 text-right"
                : m.priority === "CRITICAL"
                ? "mr-6 bg-red-950/90 border border-red-500 text-red-200 font-bold"
                : "mr-6 bg-cyan-950/70 border border-cyan-800/60 text-cyan-200"
            }`}
          >
            <div className="text-[9px] opacity-60 mb-0.5">
              {m.sender === "RIDER" ? "YOU (VOICE)" : "HELMET COPILOT"} &bull; {m.timestamp}
            </div>
            <div>{m.text}</div>
          </div>
        ))}
        {isThinking && (
          <div className="mr-6 p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono animate-pulse">
            Gemini AI analyzing road trajectory...
          </div>
        )}
      </div>

      {/* Quick Tactile Glove Buttons (Prompt required hands-free + emergency access) */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
          <span>HANDS-FREE QUICK COMMANDS:</span>
          <span className="text-cyan-400">TOUCH / VOICE ENABLED</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {quickCommands.map((q) => (
            <button
              key={q.cmd}
              onClick={() => handleUserSpeech(q.cmd)}
              className={`px-2 py-1.5 rounded text-[11px] font-mono font-medium truncate transition-colors text-left border ${
                q.cmd.includes("emergency")
                  ? "bg-amber-950/60 border-amber-600 text-amber-300 hover:bg-amber-900 font-bold"
                  : "bg-slate-900/90 border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-white"
              }`}
            >
              &ldquo;{q.label}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
