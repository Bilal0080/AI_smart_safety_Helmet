/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskLevel = "GREEN" | "YELLOW" | "ORANGE" | "RED";

export type AlertPriority = 1 | 2 | 3 | 4; // 1: Info, 2: Caution, 3: Warning, 4: Critical

export type CameraPosition = "FRONT" | "LEFT" | "RIGHT" | "REAR";

export interface BoundingBox {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number;
  height: number;
}

export interface DetectedRoadObject {
  id: string;
  camera: CameraPosition;
  label: string;
  category: "VULNERABLE_USER" | "VEHICLE" | "HAZARD" | "SIGN" | "MARKING" | "LIGHT";
  subCategory?: string; // "pedestrian", "child", "animal", "car", "pothole", "zebra", "speed_limit", etc.
  distanceMeters: number;
  relativeSpeedKmH: number; // negative = closing in
  direction: "AHEAD" | "APPROACHING_LEFT" | "APPROACHING_RIGHT" | "BEHIND" | "CROSSING_LEFT" | "CROSSING_RIGHT";
  ttcSeconds: number; // Time To Collision
  riskLevel: RiskLevel;
  box: BoundingBox;
  actionAdvice?: string;
  signValue?: string; // e.g., "40 km/h", "STOP", "RED", "GREEN"
}

export interface TrafficSignalState {
  color: "RED" | "YELLOW" | "GREEN";
  distanceMeters: number;
  timeRemainingSeconds: number;
  advice: string;
}

export interface ZebraCrossingState {
  detected: boolean;
  distanceMeters: number;
  pedestriansPresent: boolean;
}

export interface NavigationInstruction {
  maneuver: "STRAIGHT" | "LEFT" | "RIGHT" | "SLIGHT_LEFT" | "SLIGHT_RIGHT" | "U_TURN";
  distanceMeters: number;
  streetName: string;
  destinationMeters: number;
}

export interface MountainWeatherInfo {
  altitudeMeters: number;
  temperatureC: number;
  condition: "Clear" | "Dense Fog" | "Mountain Rain" | "Black Ice Hazard" | "High Winds";
  roadFrictionCoeff: number; // 0.1 (icy) - 0.9 (dry asphalt)
  updatedAt: string;
}

export interface TelemetryData {
  speedKmH: number;
  speedLimitKmH: number;
  followingDistanceMeters: number;
  pitchDegrees: number;
  rollDegrees: number;
  gForce: number;
  engineRpm: number;
  gear: number;
  gpsCoords: { lat: number; lng: number };
  headingDegrees: number;
  bluetoothConnected: boolean;
  wifiConnected: boolean;
  helmetBatteryPct: number;
  latencyMs: number;
}

export interface RunawayRamp {
  id: string;
  name: string;
  distanceKm: number;
  gradePercent: number;
  surface: string;
  status: string;
  coordinates: { lat: number; lng: number };
  recommendedSpeedKmH: string;
  trafficFlow: string;
}

export interface MaintenanceDiagnostics {
  brakePadsFrontMm: number;
  brakePadsRearMm: number;
  frontTirePsi: number;
  rearTirePsi: number;
  helmetBatteryPct: number;
  cameraLatencyMs: number;
  aiInferenceLatencyMs: number;
  nextServiceKm: number;
  sensorHealth: {
    frontCam: string;
    leftBlindSpotCam: string;
    rightBlindSpotCam: string;
    rearRadarCam: string;
    imuAccelerometer: string;
    gpsGnss: string;
    bleGateway: string;
  };
}

export interface RoadScenario {
  id: string;
  title: string;
  description: string;
  initialSpeed: number;
  speedLimit: number;
  weather: MountainWeatherInfo;
  hazardNote: string;
}

export interface InteractionLogEntry {
  id: string;
  type: "VOICE_ACTION" | "SAFETY_ALERT";
  text: string;
  detail?: string;
  timestamp: string;
  riskLevel?: RiskLevel;
  iconType?: "mic" | "alert" | "brake" | "camera" | "nav" | "hazard" | "speed";
}

