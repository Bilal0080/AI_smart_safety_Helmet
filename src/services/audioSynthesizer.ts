/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertPriority } from "../types";

class AudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastSpokenText: string = "";
  private lastSpokenTime: number = 0;
  private voiceEnabled: boolean = true;

  private initContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play procedural tone according to AlertPriority
   * 1: Info, 2: Caution, 3: Warning, 4: Critical
   */
  public playAlertTone(priority: AlertPriority) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      if (priority === 1) {
        // Soft dual chime (Info)
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (priority === 2) {
        // Caution double beep
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        gain.gain.setValueAtTime(0.12, now + 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (priority === 3) {
        // Warning warble
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(1050, now + 0.1);
        osc.frequency.linearRampToValueAtTime(800, now + 0.2);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (priority === 4) {
        // CRITICAL: Loud rapid double pulse siren
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.type = "square";
        osc2.type = "sawtooth";

        osc1.frequency.setValueAtTime(1174, now); // D6
        osc1.frequency.linearRampToValueAtTime(880, now + 0.18);
        osc2.frequency.setValueAtTime(1250, now);
        osc2.frequency.linearRampToValueAtTime(950, now + 0.18);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.02, now + 0.22);
        gain.gain.setValueAtTime(0.28, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.52);
        osc2.stop(now + 0.52);

        // Also trigger haptic vibration
        this.triggerHaptic([150, 80, 200]);
      }
    } catch (err) {
      console.warn("Audio synthesis error:", err);
    }
  }

  /**
   * Speak short instructions through SpeechSynthesis API
   */
  public speakInstruction(text: string, priority: AlertPriority = 3) {
    if (this.isMuted || !this.voiceEnabled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const now = Date.now();
    // Prevent repetitive chatter if the exact same instruction was spoken in past 3.5 seconds
    if (text === this.lastSpokenText && now - this.lastSpokenTime < 3500) {
      return;
    }
    // Rate limit general speech to prevent overlapping unless it's critical
    if (priority < 4 && now - this.lastSpokenTime < 2200) {
      return;
    }

    try {
      if (priority === 4) {
        // Critical alerts interrupt existing speech immediately
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = priority === 4 ? 1.15 : 1.05;
      utterance.pitch = priority === 4 ? 1.2 : 1.0;
      utterance.volume = 0.9;

      // Select natural english voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      this.lastSpokenText = text;
      this.lastSpokenTime = now;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  }

  public triggerHaptic(pattern: number[] = [100, 50, 100]) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore if disabled by browser policies
      }
    }
  }
}

export const audioSynthesizer = new AudioSynthesizer();
