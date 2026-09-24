/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Maximize2,
  Minimize2,
  Video,
  VideoOff,
  Crosshair,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { CameraPosition, DetectedRoadObject, RiskLevel } from "../types";

interface CameraGridProps {
  objects: DetectedRoadObject[];
  activeView: CameraPosition | "QUAD";
  onSelectView: (view: CameraPosition | "QUAD") => void;
  highContrast: boolean;
}

export const CameraGrid: React.FC<CameraGridProps> = ({
  objects,
  activeView,
  onSelectView,
  highContrast,
}) => {
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Toggle Live Webcam on Front Camera
  const toggleWebcam = async () => {
    if (webcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setWebcamActive(true);
      } catch (err) {
        console.warn("Could not access webcam:", err);
        alert("Camera permission not granted or device has no camera. Using simulated optical feeds.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getCameraObjects = (pos: CameraPosition) =>
    objects.filter((obj) => obj.camera === pos);

  const renderBoundingBoxes = (pos: CameraPosition) => {
    const camObjs = getCameraObjects(pos);
    return (
      <div className="absolute inset-0 pointer-events-none">
        {camObjs.map((obj) => {
          const borderColor =
            obj.riskLevel === "RED"
              ? "border-red-500 text-red-400 bg-red-950/20"
              : obj.riskLevel === "ORANGE"
              ? "border-amber-400 text-amber-300 bg-amber-950/20"
              : obj.riskLevel === "YELLOW"
              ? "border-yellow-300 text-yellow-200 bg-yellow-950/20"
              : "border-cyan-400 text-cyan-300 bg-cyan-950/20";

          return (
            <div
              key={obj.id}
              className={`absolute border-2 rounded-sm transition-all duration-300 ${borderColor}`}
              style={{
                left: `${obj.box.x}%`,
                top: `${obj.box.y}%`,
                width: `${obj.box.width}%`,
                height: `${obj.box.height}%`,
              }}
            >
              {/* Corner crosshairs */}
              <span className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-current" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-current" />
              <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-current" />
              <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-current" />

              {/* Tag Pill */}
              <div className="absolute -top-5 left-0 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold tracking-tight whitespace-nowrap shadow-sm">
                {obj.label} &bull; {obj.distanceMeters}m
                {obj.ttcSeconds < 5 && ` [TTC ${obj.ttcSeconds}s]`}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSingleFeed = (pos: CameraPosition, title: string) => {
    const isFront = pos === "FRONT";
    const camObjs = getCameraObjects(pos);
    const hasDanger = camObjs.some((o) => o.riskLevel === "RED" || o.riskLevel === "ORANGE");

    return (
      <div
        key={pos}
        id={`cam-feed-${pos.toLowerCase()}`}
        className={`relative w-full h-full min-h-[160px] rounded-lg overflow-hidden border transition-all ${
          hasDanger
            ? "border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
            : "border-slate-800 hover:border-cyan-500/50"
        } bg-slate-950`}
      >
        {/* Header Ribbon */}
        <div className="absolute top-0 inset-x-0 z-20 px-2 py-1 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-[10px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                hasDanger ? "bg-red-500 animate-ping" : "bg-emerald-400"
              }`}
            />
            <span className="font-bold text-white uppercase tracking-wider">{title}</span>
            <span className="text-[9px] text-slate-400">1080p60 &bull; HDR</span>
          </div>

          <div className="flex items-center gap-1">
            {isFront && (
              <button
                onClick={toggleWebcam}
                className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1 text-[9px]"
                title="Toggle Real Device Webcam"
              >
                {webcamActive ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                <span>{webcamActive ? "Sim Feed" : "Live Cam"}</span>
              </button>
            )}
            <button
              onClick={() => onSelectView(activeView === pos ? "QUAD" : pos)}
              className="p-1 rounded bg-black/50 hover:bg-slate-800 text-slate-300"
              title="Maximize / Minimize this camera"
            >
              {activeView === pos ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Camera Visual Feed: Live Video or Simulated Highway/Road Canvas */}
        {isFront && webcamActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
            {/* Perspective Grid representing Road surface */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950" />
            <svg
              className="absolute inset-0 w-full h-full opacity-35"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              {pos === "FRONT" && (
                <>
                  {/* Road vanishing perspective */}
                  <polygon points="40,35 60,35 90,100 10,100" fill="#1e293b" />
                  {/* Lane markings */}
                  <line x1="50" y1="35" x2="50" y2="100" stroke="#facc15" strokeDasharray="4,6" strokeWidth="1" />
                  <line x1="42" y1="35" x2="20" y2="100" stroke="#ffffff" strokeWidth="0.8" />
                  <line x1="58" y1="35" x2="80" y2="100" stroke="#ffffff" strokeWidth="0.8" />
                  {/* Horizon line & mountain silhouette */}
                  <polyline points="0,35 25,28 45,34 70,27 100,35" fill="none" stroke="#475569" strokeWidth="0.5" />
                </>
              )}
              {pos === "LEFT" && (
                <>
                  <polygon points="10,20 80,40 100,100 0,100" fill="#1e293b" />
                  <line x1="40" y1="30" x2="50" y2="100" stroke="#ffffff" strokeDasharray="3,5" strokeWidth="0.8" />
                </>
              )}
              {pos === "RIGHT" && (
                <>
                  <polygon points="90,20 20,40 0,100 100,100" fill="#1e293b" />
                  <line x1="60" y1="30" x2="50" y2="100" stroke="#ffffff" strokeDasharray="3,5" strokeWidth="0.8" />
                </>
              )}
              {pos === "REAR" && (
                <>
                  <polygon points="35,40 65,40 95,100 5,100" fill="#1e293b" />
                  <line x1="50" y1="40" x2="50" y2="100" stroke="#facc15" strokeDasharray="4,6" strokeWidth="1" />
                </>
              )}
            </svg>

            {/* Camera Position Watermark */}
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-slate-400">
              AI OPTICAL FLOW &bull; 120 FPS
            </div>
          </div>
        )}

        {/* Computer Vision Object Bounding Boxes Overlay */}
        {renderBoundingBoxes(pos)}

        {/* Blind spot danger warning banner on side cameras */}
        {hasDanger && (
          <div className="absolute bottom-2 inset-x-2 px-2 py-1 rounded bg-red-600/90 text-white font-mono text-[10px] font-bold text-center tracking-wider animate-pulse">
            ⚠ BLIND SPOT THREAT DETECTED
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Quick Camera Navigation Controls (glove accessible buttons) */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
        <div className="flex items-center gap-1 text-slate-300">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">VISION SENSORS:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectView("QUAD")}
            className={`px-2.5 py-1 rounded border text-xs ${
              activeView === "QUAD"
                ? "bg-cyan-600 text-white border-cyan-400 font-bold"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            4-CAM SPLIT
          </button>
          <button
            onClick={() => onSelectView("FRONT")}
            className={`px-2.5 py-1 rounded border text-xs ${
              activeView === "FRONT"
                ? "bg-cyan-600 text-white border-cyan-400 font-bold"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            FRONT
          </button>
          <button
            onClick={() => onSelectView("LEFT")}
            className={`px-2.5 py-1 rounded border text-xs ${
              activeView === "LEFT"
                ? "bg-cyan-600 text-white border-cyan-400 font-bold"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            LEFT BLIND SPOT
          </button>
          <button
            onClick={() => onSelectView("RIGHT")}
            className={`px-2.5 py-1 rounded border text-xs ${
              activeView === "RIGHT"
                ? "bg-cyan-600 text-white border-cyan-400 font-bold"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            RIGHT BLIND SPOT
          </button>
          <button
            onClick={() => onSelectView("REAR")}
            className={`px-2.5 py-1 rounded border text-xs ${
              activeView === "REAR"
                ? "bg-cyan-600 text-white border-cyan-400 font-bold"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            REAR
          </button>
        </div>
      </div>

      {/* Camera Grid Layout */}
      {activeView === "QUAD" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 h-[340px]">
          {renderSingleFeed("FRONT", "CAM-1: Forward Road")}
          {renderSingleFeed("REAR", "CAM-4: Rear Traffic")}
          {renderSingleFeed("LEFT", "CAM-2: Left Blind Spot")}
          {renderSingleFeed("RIGHT", "CAM-3: Right Blind Spot")}
        </div>
      ) : (
        <div className="w-full h-[340px]">
          {renderSingleFeed(
            activeView,
            activeView === "FRONT"
              ? "CAM-1: Forward Road (Full Live View)"
              : activeView === "LEFT"
              ? "CAM-2: Left Blind Spot (Full Live View)"
              : activeView === "RIGHT"
              ? "CAM-3: Right Blind Spot (Full Live View)"
              : "CAM-4: Rear Traffic (Full Live View)"
          )}
        </div>
      )}
    </div>
  );
};
