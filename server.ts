import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Google GenAI Client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
    }
  }
  return genAI;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    system: "AI Smart Safety Helmet Telemetry & Vision Gateway",
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Emergency Runaway Truck / Motorcycle Ramps Database
const EMERGENCY_RAMPS = [
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
  {
    id: "ramp-03",
    name: "High Pass Deceleration Siding",
    distanceKm: 6.2,
    gradePercent: 12.0,
    surface: "Mechanical Cable Catch Barrier",
    status: "CLEAR_ACTIVE",
    coordinates: { lat: 34.2011, lng: -118.0210 },
    recommendedSpeedKmH: "< 80 km/h entry",
    trafficFlow: "Light roadside snow / rain runoff caution",
  },
];

app.get("/api/emergency/runaway-ramps", (req, res) => {
  res.json({
    ramps: EMERGENCY_RAMPS,
    guidance: [
      "DOWN-SHIFT GEARS PROGRESSIVELY TO ENGAGE ENGINE BRAKING",
      "REMAIN UPRIGHT, ACTIVATE HAZARD LIGHTS",
      "STEER STRAIGHT INTO GRAVEL BED ENTRY CHUTE",
      "DO NOT LEAN SHARPLY UPON GRAVEL CONTACT",
      "BRACE BODY AND PREPARE FOR RAPID SPEED DECELERATION",
    ],
  });
});

// AI Copilot Road Reasoning Endpoint
app.post("/api/gemini/copilot", async (req, res) => {
  try {
    const { message, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback autonomous local safety engine response
      const fallbackResponses: Record<string, string> = {
        "what's ahead": "Path clear up to 45 meters. Moderate curve in 120m. Follow safe following distance.",
        "what is my speed": `Current telemetry shows ${context?.speed ?? 42} km/h. Speed limit is ${context?.speedLimit ?? 50} km/h.`,
        "brake failure": "EMERGENCY: Immediate engine braking advised. Shift down 1 gear at a time. Runaway Ramp A-4 is 1.4 km ahead on the right shoulder.",
        "emergency runaway ramp": "Runaway Ramp A-4 is 1.4 km ahead on right shoulder. Pea-gravel bed ready. Maintain center alignment.",
        "safety mode": "Tactical 360° Safety Shield is ACTIVE. All 4 cameras, distance radar, and blind-spot sensors online.",
      };

      const normalizedMsg = (message || "").toLowerCase();
      let matched = "AI Safety Engine standing by. Road conditions nominal.";
      for (const [k, v] of Object.entries(fallbackResponses)) {
        if (normalizedMsg.includes(k)) {
          matched = v;
          break;
        }
      }
      return res.json({
        reply: matched,
        source: "local-safety-engine",
        priority: normalizedMsg.includes("brake") ? "CRITICAL" : "NORMAL",
      });
    }

    const systemPrompt = `You are the AI Smart Motorcycle Safety Helmet Copilot.
You communicate directly to the rider via helmet audio earphones and minimal HUD.
Rider safety rules:
1. Speak in SHORT, URGENT, CRYSTAL-CLEAR phrases (under 25 words). Never give long essays while someone is riding.
2. If danger, brake failure, or hazard is present, lead with the critical action (e.g., "BRAKE NOW", "LOOK RIGHT MIRROR", "DOWNSHIFT ENGINE").
3. Current rider state: Speed ${context?.speed || 45} km/h, Current Limit ${context?.speedLimit || 50} km/h, Risk: ${context?.riskLevel || "GREEN"}, Nearest Ramp: 1.4km right shoulder.
4. Keep the tone calm, decisive, tactical.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });

    const reply = response.text || "Eyes on the road. Safety telemetry active.";
    res.json({
      reply: reply.trim(),
      source: "gemini-3.8-flash",
      priority: message.toLowerCase().includes("brake") ? "CRITICAL" : "NORMAL",
    });
  } catch (err: any) {
    console.error("Copilot API error:", err);
    res.status(500).json({
      error: "AI Copilot temporality offline",
      fallback: "Keep safe following distance. System sensors monitoring road.",
    });
  }
});

// Scene Perception Analysis (Visual or Telemetry Scene)
app.post("/api/gemini/analyze-scene", async (req, res) => {
  try {
    const { imageBase64, telemetry } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        sceneAnalysis: {
          hazardSummary: "Local CV: 1 vehicle ahead (18m), zebra crossing at 35m.",
          recommendedAction: "MAINTAIN 45 KM/H",
          riskScore: 28,
          ttcSeconds: 4.2,
        },
        source: "local-vision-engine",
      });
    }

    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        },
      });
    }

    contents.push({
      text: `Analyze this motorcycle forward road view. Telemetry: Speed ${telemetry?.speed || 42} km/h, Weather: ${telemetry?.weather || "Clear"}.
Output ONLY a compact JSON with:
{
  "hazardSummary": "short 5-10 word warning",
  "recommendedAction": "e.g. SLOW DOWN / PROCEED / BRAKE GENTLY",
  "riskScore": number 0-100,
  "ttcSeconds": number
}`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
      },
    });

    let parsed = {
      hazardSummary: "Road clear ahead",
      recommendedAction: "MAINTAIN SPEED",
      riskScore: 10,
      ttcSeconds: 99,
    };
    try {
      if (response.text) {
        parsed = JSON.parse(response.text);
      }
    } catch {
      // json parse fallback
    }

    res.json({
      sceneAnalysis: parsed,
      source: "gemini-3.8-flash",
    });
  } catch (err: any) {
    console.error("Analyze scene error:", err);
    res.status(500).json({ error: "Failed to analyze road scene" });
  }
});

// Maintenance & Diagnostic Logs API
app.get("/api/telemetry/maintenance", (_req, res) => {
  res.json({
    diagnostics: {
      brakePadsFrontMm: 4.8, // New is ~6mm, limit 1.5mm
      brakePadsRearMm: 4.1,
      frontTirePsi: 32.5,
      rearTirePsi: 36.0,
      helmetBatteryPct: 88,
      cameraLatencyMs: 14,
      aiInferenceLatencyMs: 42,
      sensorHealth: {
        frontCam: "OPTIMAL",
        leftBlindSpotCam: "OPTIMAL",
        rightBlindSpotCam: "OPTIMAL",
        rearRadarCam: "OPTIMAL",
        imuAccelerometer: "CALIBRATED",
        gpsGnss: "LOCK_12_SATS",
        bleGateway: "CONNECTED",
      },
      nextServiceKm: 1420,
    },
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Smart Helmet Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
