/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DetectedRoadObject,
  TrafficSignalState,
  ZebraCrossingState,
  NavigationInstruction,
  MountainWeatherInfo,
  RoadScenario,
  RiskLevel,
} from "../types";

export const PRESET_SCENARIOS: RoadScenario[] = [
  {
    id: "city_school",
    title: "Urban School Zone & Crosswalk",
    description: "Pedestrian & children crossing ahead, zebra crossing, 40 km/h speed limit, active traffic signal.",
    initialSpeed: 42,
    speedLimit: 40,
    weather: {
      altitudeMeters: 450,
      temperatureC: 21,
      condition: "Clear",
      roadFrictionCoeff: 0.85,
      updatedAt: "Live",
    },
    hazardNote: "School zone active: Watch for children crossing",
  },
  {
    id: "highway_traffic",
    title: "High-Speed Highway & Blind Spots",
    description: "Tailgating bike ahead, high-speed car approaching in left blind spot, vehicle behind.",
    initialSpeed: 88,
    speedLimit: 90,
    weather: {
      altitudeMeters: 820,
      temperatureC: 18,
      condition: "Clear",
      roadFrictionCoeff: 0.88,
      updatedAt: "Live",
    },
    hazardNote: "Heavy multi-lane traffic: Blind spot radar active",
  },
  {
    id: "mountain_descent",
    title: "Mountain Pass & Animal Hazard",
    description: "14% steep descent, animal crossing curve ahead, wet road friction warning.",
    initialSpeed: 55,
    speedLimit: 50,
    weather: {
      altitudeMeters: 1840,
      temperatureC: 9,
      condition: "Mountain Rain",
      roadFrictionCoeff: 0.52,
      updatedAt: "Live",
    },
    hazardNote: "Mountain fog & wildlife alert. High altitude descent.",
  },
  {
    id: "emergency_brake_test",
    title: "Brake Failure Emergency Protocol",
    description: "Steep grade runaway situation: Nearest gravel escape ramp at 1.4 km.",
    initialSpeed: 95,
    speedLimit: 60,
    weather: {
      altitudeMeters: 1950,
      temperatureC: 7,
      condition: "High Winds",
      roadFrictionCoeff: 0.65,
      updatedAt: "Live",
    },
    hazardNote: "CRITICAL: Engine braking & Runaway Ramp guidance ready",
  },
];

export function getScenarioObjects(
  scenarioId: string,
  elapsedSec: number,
  riderSpeed: number
): {
  objects: DetectedRoadObject[];
  signal: TrafficSignalState;
  zebra: ZebraCrossingState;
  nav: NavigationInstruction;
} {
  // Sinusoidal distance variation for realistic dynamic simulation
  const wave = Math.sin(elapsedSec * 0.8);
  const waveFast = Math.sin(elapsedSec * 1.5);

  let objects: DetectedRoadObject[] = [];
  let signal: TrafficSignalState = {
    color: "GREEN",
    distanceMeters: 65,
    timeRemainingSeconds: 12,
    advice: "PROCEED WHEN SAFE",
  };
  let zebra: ZebraCrossingState = {
    detected: false,
    distanceMeters: 80,
    pedestriansPresent: false,
  };
  let nav: NavigationInstruction = {
    maneuver: "STRAIGHT",
    distanceMeters: 450,
    streetName: "Skyline Ridge Blvd",
    destinationMeters: 2400,
  };

  if (scenarioId === "city_school") {
    const pedDistance = Math.max(5, Math.round(18 + wave * 7));
    const pedCrossingTTC = +(pedDistance / (riderSpeed / 3.6)).toFixed(1);
    const pedRisk: RiskLevel = pedDistance < 10 ? "RED" : pedDistance < 18 ? "ORANGE" : "YELLOW";

    const carDist = Math.max(8, Math.round(26 + waveFast * 6));
    const carTTC = +(carDist / (Math.max(10, riderSpeed - 30) / 3.6)).toFixed(1);

    // Dynamic traffic light cycle
    const lightCycle = (elapsedSec % 20);
    if (lightCycle > 14) {
      signal = {
        color: "RED",
        distanceMeters: Math.max(8, Math.round(30 - (elapsedSec % 10) * 2)),
        timeRemainingSeconds: Math.max(1, Math.round(20 - lightCycle)),
        advice: "STOP AT STOP LINE",
      };
    } else if (lightCycle > 11) {
      signal = {
        color: "YELLOW",
        distanceMeters: Math.max(12, Math.round(35 - (elapsedSec % 10) * 2)),
        timeRemainingSeconds: Math.max(1, Math.round(14 - lightCycle)),
        advice: "PREPARE TO STOP",
      };
    } else {
      signal = {
        color: "GREEN",
        distanceMeters: 45,
        timeRemainingSeconds: Math.max(1, Math.round(11 - lightCycle)),
        advice: "PROCEED WHEN SAFE",
      };
    }

    zebra = {
      detected: true,
      distanceMeters: Math.max(6, Math.round(28 + wave * 9)),
      pedestriansPresent: pedDistance < 22,
    };

    nav = {
      maneuver: "LEFT",
      distanceMeters: 150,
      streetName: "Pinecrest Ave (School Way)",
      destinationMeters: 1200,
    };

    objects = [
      {
        id: "obj-ped-1",
        camera: "FRONT",
        label: "PEDESTRIAN CROSSING",
        category: "VULNERABLE_USER",
        subCategory: "child",
        distanceMeters: pedDistance,
        relativeSpeedKmH: -riderSpeed,
        direction: "CROSSING_LEFT",
        ttcSeconds: pedCrossingTTC,
        riskLevel: pedRisk,
        box: { x: 38 + wave * 4, y: 44, width: 14, height: 28 },
        actionAdvice: pedRisk === "RED" ? "BRAKE NOW" : "REDUCE SPEED",
      },
      {
        id: "obj-speed-sign",
        camera: "FRONT",
        label: "SPEED LIMIT 40",
        category: "SIGN",
        distanceMeters: 35,
        relativeSpeedKmH: 0,
        direction: "AHEAD",
        ttcSeconds: 3.5,
        riskLevel: riderSpeed > 45 ? "YELLOW" : "GREEN",
        box: { x: 74, y: 22, width: 9, height: 14 },
        signValue: "40 km/h",
      },
      {
        id: "obj-zebra-sign",
        camera: "FRONT",
        label: "ZEBRA CROSSING 25m",
        category: "MARKING",
        distanceMeters: zebra.distanceMeters,
        relativeSpeedKmH: 0,
        direction: "AHEAD",
        ttcSeconds: 2.1,
        riskLevel: zebra.pedestriansPresent ? "ORANGE" : "YELLOW",
        box: { x: 26, y: 68, width: 48, height: 20 },
        signValue: "25 m",
      },
      {
        id: "obj-cyclist-right",
        camera: "RIGHT",
        label: "CYCLIST",
        category: "VULNERABLE_USER",
        subCategory: "cyclist",
        distanceMeters: 11,
        relativeSpeedKmH: -12,
        direction: "APPROACHING_RIGHT",
        ttcSeconds: 3.2,
        riskLevel: "YELLOW",
        box: { x: 42, y: 48, width: 18, height: 32 },
        actionAdvice: "MAINTAIN DISTANCE",
      },
      {
        id: "obj-rear-car",
        camera: "REAR",
        label: "FOLLOWING CAR",
        category: "VEHICLE",
        subCategory: "car",
        distanceMeters: 22,
        relativeSpeedKmH: 4,
        direction: "BEHIND",
        ttcSeconds: 9.9,
        riskLevel: "GREEN",
        box: { x: 40, y: 48, width: 22, height: 26 },
      },
    ];
  } else if (scenarioId === "highway_traffic") {
    const bikeDistance = Math.max(3, Math.round(7 + wave * 3)); // Tailgating risk!
    const bikeTTC = +(bikeDistance / 6).toFixed(1);
    const bikeRisk: RiskLevel = bikeDistance < 6 ? "RED" : bikeDistance < 10 ? "ORANGE" : "YELLOW";

    const leftCarDist = Math.max(4, Math.round(8 + waveFast * 3));
    const rearTruckDist = Math.max(10, Math.round(16 - (elapsedSec % 8)));

    nav = {
      maneuver: "STRAIGHT",
      distanceMeters: 1400,
      streetName: "Interstate 210 East",
      destinationMeters: 14200,
    };

    objects = [
      {
        id: "obj-lead-bike",
        camera: "FRONT",
        label: "MOTORCYCLE AHEAD",
        category: "VEHICLE",
        subCategory: "motorcycle",
        distanceMeters: bikeDistance,
        relativeSpeedKmH: -14,
        direction: "AHEAD",
        ttcSeconds: bikeTTC,
        riskLevel: bikeRisk,
        box: { x: 44, y: 45, width: 14, height: 30 },
        actionAdvice: bikeRisk === "RED" ? "BRAKE NOW — TOO CLOSE" : "INCREASE FOLLOWING DISTANCE",
      },
      {
        id: "obj-pothole",
        camera: "FRONT",
        label: "ROAD DEBRIS / POTHOLE",
        category: "HAZARD",
        subCategory: "pothole",
        distanceMeters: Math.max(6, Math.round(18 - (elapsedSec % 6) * 3)),
        relativeSpeedKmH: -riderSpeed,
        direction: "AHEAD",
        ttcSeconds: 1.4,
        riskLevel: "ORANGE",
        box: { x: 49, y: 72, width: 12, height: 12 },
        actionAdvice: "STEER SLIGHT RIGHT",
      },
      {
        id: "obj-left-blind",
        camera: "LEFT",
        label: "VEHICLE IN BLIND SPOT",
        category: "VEHICLE",
        subCategory: "car",
        distanceMeters: leftCarDist,
        relativeSpeedKmH: 18,
        direction: "APPROACHING_LEFT",
        ttcSeconds: 1.6,
        riskLevel: leftCarDist < 6 ? "RED" : "ORANGE",
        box: { x: 32, y: 40, width: 34, height: 38 },
        actionAdvice: "DO NOT MERGE LEFT",
      },
      {
        id: "obj-rear-truck",
        camera: "REAR",
        label: "FAST TRUCK BEHIND",
        category: "VEHICLE",
        subCategory: "truck",
        distanceMeters: rearTruckDist,
        relativeSpeedKmH: -24,
        direction: "BEHIND",
        ttcSeconds: 2.2,
        riskLevel: rearTruckDist < 12 ? "RED" : "ORANGE",
        box: { x: 36, y: 36, width: 30, height: 42 },
        actionAdvice: "FAST VEHICLE BEHIND — MOVE TO SHOULDER IF SAFE",
      },
    ];
  } else if (scenarioId === "mountain_descent") {
    const deerDist = Math.max(6, Math.round(16 + wave * 7));
    const deerRisk: RiskLevel = deerDist < 12 ? "RED" : "ORANGE";

    nav = {
      maneuver: "SLIGHT_RIGHT",
      distanceMeters: 80,
      streetName: "Angeles Crest Hwy (Mile 32)",
      destinationMeters: 8400,
    };

    objects = [
      {
        id: "obj-deer",
        camera: "FRONT",
        label: "ANIMAL CROSSING",
        category: "VULNERABLE_USER",
        subCategory: "livestock",
        distanceMeters: deerDist,
        relativeSpeedKmH: -riderSpeed,
        direction: "CROSSING_RIGHT",
        ttcSeconds: +(deerDist / (riderSpeed / 3.6)).toFixed(1),
        riskLevel: deerRisk,
        box: { x: 42 + wave * 5, y: 46, width: 16, height: 26 },
        actionAdvice: deerRisk === "RED" ? "BRAKE NOW — ANIMAL ON ROAD" : "REDUCE SPEED — ANIMAL AHEAD",
      },
      {
        id: "obj-sharp-turn",
        camera: "FRONT",
        label: "HAIRPIN CURVE 15 KM/H",
        category: "SIGN",
        distanceMeters: 40,
        relativeSpeedKmH: 0,
        direction: "AHEAD",
        ttcSeconds: 2.8,
        riskLevel: "YELLOW",
        box: { x: 68, y: 32, width: 10, height: 16 },
        signValue: "Curve",
      },
      {
        id: "obj-wet-pavement",
        camera: "FRONT",
        label: "WATER ON ROAD / LOW FRICTION",
        category: "HAZARD",
        subCategory: "water",
        distanceMeters: 14,
        relativeSpeedKmH: -riderSpeed,
        direction: "AHEAD",
        ttcSeconds: 1.8,
        riskLevel: "ORANGE",
        box: { x: 30, y: 64, width: 40, height: 18 },
        actionAdvice: "APPLY BRAKES GENTLY",
      },
      {
        id: "obj-right-barrier",
        camera: "RIGHT",
        label: "ROCKFALL DEBRIS",
        category: "HAZARD",
        subCategory: "debris",
        distanceMeters: 5,
        relativeSpeedKmH: 0,
        direction: "APPROACHING_RIGHT",
        ttcSeconds: 9.9,
        riskLevel: "YELLOW",
        box: { x: 62, y: 55, width: 18, height: 22 },
      },
    ];
  } else if (scenarioId === "emergency_brake_test") {
    nav = {
      maneuver: "SLIGHT_RIGHT",
      distanceMeters: 1400,
      streetName: "RUNAWAY ESCAPE RAMP A-4",
      destinationMeters: 1400,
    };

    objects = [
      {
        id: "obj-runaway-ramp",
        camera: "FRONT",
        label: "RUNAWAY RAMP 1.4 KM (RIGHT)",
        category: "SIGN",
        distanceMeters: 140,
        relativeSpeedKmH: -riderSpeed,
        direction: "APPROACHING_RIGHT",
        ttcSeconds: 5.5,
        riskLevel: "ORANGE",
        box: { x: 65, y: 30, width: 18, height: 24 },
        signValue: "RAMP A-4",
        actionAdvice: "DOWNSHIFT ENGINE — AIM FOR GRAVEL BED",
      },
      {
        id: "obj-lead-bus",
        camera: "FRONT",
        label: "SLOW BUS AHEAD",
        category: "VEHICLE",
        subCategory: "bus",
        distanceMeters: Math.max(14, Math.round(28 - (elapsedSec % 12))),
        relativeSpeedKmH: -45,
        direction: "AHEAD",
        ttcSeconds: 1.2,
        riskLevel: "RED",
        box: { x: 38, y: 34, width: 26, height: 38 },
        actionAdvice: "EVADE LEFT SHOULDER — BUS STOPPED",
      },
    ];
  }

  return { objects, signal, zebra, nav };
}

/**
 * Calculates aggregate risk level based on detected objects
 */
export function calculateAggregateRisk(objects: DetectedRoadObject[]): {
  overallRisk: RiskLevel;
  primaryHazard: DetectedRoadObject | null;
  recommendedInstruction: string;
} {
  let highestRisk: RiskLevel = "GREEN";
  let primaryHazard: DetectedRoadObject | null = null;

  const priorityMap: Record<RiskLevel, number> = {
    GREEN: 0,
    YELLOW: 1,
    ORANGE: 2,
    RED: 3,
  };

  for (const obj of objects) {
    if (priorityMap[obj.riskLevel] > priorityMap[highestRisk]) {
      highestRisk = obj.riskLevel;
      primaryHazard = obj;
    }
  }

  let recommendedInstruction = "PATH CLEAR — RIDE RESPONSIBLY";

  if (highestRisk === "RED") {
    if (primaryHazard?.category === "VULNERABLE_USER") {
      recommendedInstruction = "BRAKE NOW — PERSON AHEAD";
    } else if (primaryHazard?.subCategory === "motorcycle" || primaryHazard?.subCategory === "car") {
      recommendedInstruction = "BRAKE NOW — VEHICLE TOO CLOSE";
    } else if (primaryHazard?.category === "HAZARD") {
      recommendedInstruction = "BRAKE NOW — OBSTACLE IN PATH";
    } else {
      recommendedInstruction = "CRITICAL WARNING — BRAKE NOW";
    }
  } else if (highestRisk === "ORANGE") {
    if (primaryHazard?.direction === "APPROACHING_LEFT") {
      recommendedInstruction = "CAUTION — VEHICLE APPROACHING LEFT";
    } else if (primaryHazard?.direction === "APPROACHING_RIGHT") {
      recommendedInstruction = "CAUTION — VEHICLE APPROACHING RIGHT";
    } else if (primaryHazard?.direction === "BEHIND") {
      recommendedInstruction = "CAUTION — VEHICLE APPROACHING BEHIND";
    } else {
      recommendedInstruction = primaryHazard?.actionAdvice || "REDUCE SPEED — HAZARD AHEAD";
    }
  } else if (highestRisk === "YELLOW") {
    recommendedInstruction = primaryHazard?.actionAdvice || "MAINTAIN SAFE FOLLOWING DISTANCE";
  }

  return { overallRisk: highestRisk, primaryHazard, recommendedInstruction };
}
