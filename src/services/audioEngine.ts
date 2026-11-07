/**
 * High-Precision Audio Engine for Bel Sekolah Otomatis.
 * Uses Web Audio API for harmonic multi-oscillator synthesis (Westminster chimes, ding-dong, electric bells)
 * and plays custom uploaded audio files from IndexedDB or ArrayBuffer.
 */

import { CurrentlySpeakingLanguage, LanguageCode, MultiLanguageText } from '../types';
import { getAudioFile } from './db';
import {
  getPhoneticArabicText,
  getPhoneticMandarinText,
  getSpeechVoiceForLanguage,
  ORDERED_LANGUAGES,
  SUPPORTED_LANGUAGES,
} from './multiLanguageTts';

class SchoolAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isUnlocked: boolean = false;
  private currentActiveSource: AudioBufferSourceNode | OscillatorNode | null = null;
  private customAudioCache: Map<string, AudioBuffer> = new Map();
  private isSpeechCancelled: boolean = false;
  private speechTimeoutId: any = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  // Real-time listener for which language is being spoken currently (for UI banners / overlays)
  public onSpeakingLanguageChange: ((info: CurrentlySpeakingLanguage | null) => void) | null = null;

  constructor() {
    // Lazy initialized on first user gesture
  }

  public initContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      });
    } else {
      this.isUnlocked = true;
    }
    return this.ctx;
  }

  public async unlock(): Promise<boolean> {
    try {
      const ctx = this.initContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Play a short silent buffer to satisfy mobile browser autoplay lock
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      this.isUnlocked = true;
      return true;
    } catch (e) {
      console.warn('AudioContext unlock failed:', e);
      return false;
    }
  }

  public getUnlockedStatus(): boolean {
    return this.isUnlocked && !!this.ctx && this.ctx.state === 'running';
  }

  public isContextRunning(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }

  public async resume(): Promise<void> {
    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.isUnlocked = true;
  }

  public setMasterVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public stopAll() {
    this.isSpeechCancelled = true;
    if (this.speechTimeoutId) {
      clearTimeout(this.speechTimeoutId);
      this.speechTimeoutId = null;
    }
    if (this.currentActiveSource) {
      try {
        this.currentActiveSource.stop();
      } catch {
        // ignore if already stopped
      }
      this.currentActiveSource = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.onSpeakingLanguageChange) {
      this.onSpeakingLanguageChange(null);
    }
  }

  /**
   * Main play entry point for any sound ID (builtin or custom) with 4-Language Speech Synthesis support
   */
  public async playSound(
    soundId: string,
    volume: number = 0.9,
    durationSec?: number,
    speechPhrases?: MultiLanguageText | string,
    ttsVoiceRate: number = 1.0,
    activeLanguages: LanguageCode[] = ['id', 'en', 'ar', 'zh'],
    languageDelayMs: number = 500
  ): Promise<void> {
    this.isSpeechCancelled = false;
    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    this.setMasterVolume(volume);

    // Normalize speechPhrases into MultiLanguageText
    const multiLang: MultiLanguageText | undefined = 
      typeof speechPhrases === 'string'
        ? { id: speechPhrases }
        : speechPhrases;

    // If it's a custom sound from IndexedDB
    if (soundId.startsWith('custom-') || soundId.includes('custom_')) {
      const played = await this.playCustomSound(soundId, volume, durationSec);
      if (played && multiLang && 'speechSynthesis' in window) {
        this.queueMultiLanguageSpeech(multiLang, ttsVoiceRate, (durationSec || 5) * 1000, activeLanguages, languageDelayMs);
      }
      return;
    }

    // Built-in Synthesized Sounds
    switch (soundId) {
      // === Versi Baru (V2.0) ===
      case 'kin-kon-kan-kon-v2':
        await this.playKinKonKanKonV2(volume);
        break;
      case 'tubular-carillon-v2':
        await this.playTubularCarillonV2(volume);
        break;
      case 'celesta-arpeggio-v2':
        await this.playCelestaArpeggioV2(volume);
        break;
      case 'gamelan-pelog-v2':
        await this.playGamelanPelogV2(volume);
        break;
      case 'airport-broadcast-v2':
        await this.playAirportBroadcastV2(volume);
        break;
      case 'traditional-bronze-v2':
        await this.playTraditionalBronzeV2(volume);
        break;
      case 'sports-whistle-v2':
        await this.playSportsWhistleV2(durationSec || 4, volume);
        break;
      case 'bedug-islamic-v2':
        await this.playBedugIslamicV2(volume);
        break;
      case 'digital-tri-tone-v2':
        await this.playDigitalTriToneV2(volume);
        break;

      // === Versi Klasik (V1.0) ===
      case 'westminster-4':
        await this.playWestminster(4, volume);
        break;
      case 'westminster-8':
        await this.playWestminster(8, volume);
        break;
      case 'westminster-16':
        await this.playWestminster(16, volume);
        break;
      case 'chime-2-tone':
        await this.playTwoToneChime(volume);
        break;
      case 'chime-3-tone':
        await this.playThreeToneChime(volume);
        break;
      case 'school-electric':
        await this.playElectricSchoolBell(durationSec || 4, volume);
        break;
      case 'modern-electronic':
        await this.playModernElectronic(volume);
        break;
      case 'short-beep':
        await this.playShortBeep(volume);
        break;
      case 'marimba-peace':
        await this.playMarimbaChime(volume);
        break;
      case 'warning-siren':
        await this.playWarningSiren(durationSec || 6, volume);
        break;
      default:
        await this.playWestminster(4, volume);
        break;
    }

    // Trigger multi-language announcements after chime
    if (multiLang && Object.values(multiLang).some((t) => t && t.trim().length > 0)) {
      let delayMs = 2500;
      if (soundId.includes('16')) delayMs = 7000;
      else if (soundId === 'tubular-carillon-v2') delayMs = 6800;
      else if (soundId === 'kin-kon-kan-kon-v2' || soundId === 'gamelan-pelog-v2' || soundId === 'traditional-bronze-v2' || soundId === 'bedug-islamic-v2') delayMs = 5800;
      else if (soundId.includes('8')) delayMs = 4500;
      else if (soundId === 'celesta-arpeggio-v2' || soundId === 'airport-broadcast-v2' || soundId === 'digital-tri-tone-v2') delayMs = 4000;

      this.queueMultiLanguageSpeech(multiLang, ttsVoiceRate, delayMs, activeLanguages, languageDelayMs);
    }
  }

  /**
   * Queue and sequentially speak multi-language announcements
   */
  public queueMultiLanguageSpeech(
    multiLang: MultiLanguageText,
    rate: number = 1.0,
    initialDelayMs: number = 0,
    activeLanguages: LanguageCode[] = ['id', 'en', 'ar', 'zh'],
    languageDelayMs: number = 500
  ) {
    if (!('speechSynthesis' in window)) return;
    this.isSpeechCancelled = false;

    if (this.speechTimeoutId) {
      clearTimeout(this.speechTimeoutId);
    }

    this.speechTimeoutId = setTimeout(async () => {
      if (this.isSpeechCancelled) return;

      const langsToPlay: Array<{ code: LanguageCode; text: string }> = [];
      const order = activeLanguages && activeLanguages.length > 0 ? activeLanguages : ORDERED_LANGUAGES;

      for (const code of order) {
        const text = multiLang[code];
        if (text && text.trim().length > 0) {
          langsToPlay.push({ code, text: text.trim() });
        }
      }

      if (langsToPlay.length === 0) return;

      // Clear any prior speech session and ensure speech synthesis is unpaused
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }

      for (let i = 0; i < langsToPlay.length; i++) {
        if (this.isSpeechCancelled) break;
        const item = langsToPlay[i];
        const langInfo = SUPPORTED_LANGUAGES[item.code];

        // Update listener with current speaking language
        if (this.onSpeakingLanguageChange) {
          this.onSpeakingLanguageChange({
            code: item.code,
            lang: item.code,
            name: langInfo.name,
            flag: langInfo.flag,
            text: item.text,
          });
        }

        await this.speakUtterancePromise(item.text, item.code, rate);

        if (this.isSpeechCancelled) break;

        // Inter-language pause
        if (i < langsToPlay.length - 1 && languageDelayMs > 0) {
          await new Promise((res) => setTimeout(res, languageDelayMs));
        }
      }

      if (this.onSpeakingLanguageChange) {
        this.onSpeakingLanguageChange(null);
      }
    }, initialDelayMs);
  }

  /**
   * Speak a single utterance with Promise resolution when finished.
   * Features resilient multi-tier fallback:
   * - If native Arabic voice is present, uses authentic Arabic voice.
   * - If Arabic voice is missing in OS/browser or fails with error, automatically speaks
   *   high-clarity phonetic Arabic using the available Indonesian or English TTS engine.
   * - Protects against Chromium speech queue cancellation and V8 garbage-collection bugs.
   */
  private speakUtterancePromise(
    text: string,
    langCode: LanguageCode,
    rate: number = 1.0,
    forcePhonetic: boolean = false
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window) || this.isSpeechCancelled || !text || !text.trim()) {
        resolve();
        return;
      }

      // Resume if browser suspended speech synthesis
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const info = SUPPORTED_LANGUAGES[langCode];
      let spokenText = text.trim();
      let targetLang = info ? info.bcp47 : 'id-ID';
      let selectedVoice = getSpeechVoiceForLanguage(langCode);
      let targetRate = rate;

      // Special handling for Arabic (ar)
      if (langCode === 'ar') {
        const hasNativeVoice = selectedVoice !== null;
        if (forcePhonetic || !hasNativeVoice) {
          // Use high-fidelity phonetic Arabic (sounds clear and natural with Indonesian voice)
          spokenText = getPhoneticArabicText(text);
          targetLang = 'id-ID';
          selectedVoice = getSpeechVoiceForLanguage('id') || getSpeechVoiceForLanguage('en');
          targetRate = Math.min(rate, 0.95); // Measured cadence for dignified announcement
        } else {
          // Native voice available
          targetLang = selectedVoice?.lang || 'ar-SA';
        }
      } else if (langCode === 'zh') {
        const hasNativeVoice = selectedVoice !== null;
        if (forcePhonetic || !hasNativeVoice) {
          spokenText = getPhoneticMandarinText(text);
          targetLang = 'id-ID';
          selectedVoice = getSpeechVoiceForLanguage('id') || getSpeechVoiceForLanguage('en');
          targetRate = Math.min(rate, 0.95);
        } else {
          targetLang = selectedVoice?.lang || 'zh-CN';
        }
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = targetRate;
      utterance.pitch = 1.0;
      utterance.lang = targetLang;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Prevent Chromium V8 GC from garbage-collecting the utterance mid-speech
      this.activeUtterance = utterance;
      (window as any).__activeSpeechSynthesisUtterance = utterance;

      let isFinished = false;
      let keepAliveInterval: any = null;
      let safetyTimeout: any = null;

      const cleanup = () => {
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        if (safetyTimeout) clearTimeout(safetyTimeout);
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
        }
      };

      const finish = () => {
        if (!isFinished) {
          isFinished = true;
          cleanup();
          resolve();
        }
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = (event) => {
        // If native Arabic or Chinese speech fails (e.g. language-unavailable, voice-unavailable, synthesis-failed),
        // seamlessly retry using the phonetic fallback!
        if (!forcePhonetic && (langCode === 'ar' || langCode === 'zh')) {
          console.warn(`[AudioEngine] Native speech error for ${langCode} (${event.error}). Retrying with phonetic voice fallback...`);
          cleanup();
          this.speakUtterancePromise(text, langCode, rate, true).then(resolve);
          return;
        }

        console.warn(`[AudioEngine] Speech error for ${langCode}:`, event.error);
        finish();
      };

      // Chromium keepalive: every 4 seconds, briefly toggle pause/resume if still speaking
      keepAliveInterval = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 4000);

      // Safety timeout: calculated based on text length + generous buffer
      const approxDuration = Math.max(3000, Math.ceil((spokenText.length / 8) * 1000 * (1 / targetRate)));
      safetyTimeout = setTimeout(finish, approxDuration + 2500);

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('[AudioEngine] window.speechSynthesis.speak failed:', err);
        finish();
      }
    });
  }

  /**
   * Speak announcement for a single language (for testing / manual triggers)
   */
  public async speakSingleLanguage(text: string, langCode: LanguageCode, rate: number = 1.0): Promise<void> {
    if (!('speechSynthesis' in window) || !text) return;
    this.isSpeechCancelled = false;
    const langInfo = SUPPORTED_LANGUAGES[langCode];

    // Reset synthesis queue cleanly before single language test
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    if (this.onSpeakingLanguageChange) {
      this.onSpeakingLanguageChange({
        code: langCode,
        lang: langCode,
        name: langInfo ? langInfo.name : 'Suara',
        flag: langInfo ? langInfo.flag : '🔊',
        text,
      });
    }

    await this.speakUtterancePromise(text, langCode, rate);

    if (this.onSpeakingLanguageChange) {
      this.onSpeakingLanguageChange(null);
    }
  }

  /**
   * Legacy single-language helper
   */
  public speakAnnouncement(text: string, rate: number = 1.0, delayMs: number = 0) {
    setTimeout(() => {
      this.speakSingleLanguage(text, 'id', rate);
    }, delayMs);
  }

  /**
   * Realistic Bell Resonator note (Tube Bell / Carillon harmonic model)
   */
  private playBellNote(freq: number, startTime: number, duration: number = 2.5, gainFactor: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Overtones for bell chime (fundamental, tierce, quint, octave, nominal)
    const partials = [
      { ratio: 0.5, gain: 0.4 },  // Hum tone
      { ratio: 1.0, gain: 1.0 },  // Prime / Fundamental
      { ratio: 1.2, gain: 0.6 },  // Tierce (minor 3rd)
      { ratio: 1.5, gain: 0.4 },  // Quint (5th)
      { ratio: 2.0, gain: 0.5 },  // Nominal
      { ratio: 2.76, gain: 0.2 }, // Superquint
      { ratio: 4.07, gain: 0.15 },// Octave nominal
    ];

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.5 * gainFactor, startTime + 0.008); // Sharp hammer strike
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Long resonant decay
    noteGain.connect(this.masterGain);

    partials.forEach((partial) => {
      const osc = ctx.createOscillator();
      const pGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * partial.ratio, startTime);

      pGain.gain.setValueAtTime(partial.gain, startTime);
      pGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * (1 / (partial.ratio * 0.8 + 0.2)));

      osc.connect(pGain);
      pGain.connect(noteGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  /**
   * Westminster Quarters (Big Ben Melody)
   * Notes: G#4 (415Hz), F#4 (370Hz), E4 (330Hz), B3 (247Hz)
   */
  private async playWestminster(quarters: 4 | 8 | 16, volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;

    // Standard Westminster pitches
    const E4 = 329.63;
    const Gs4 = 415.30;
    const Fs4 = 369.99;
    const B3 = 246.94;
    const LowE3 = 164.81;

    // Phrase 1 (4 notes)
    const phrase1 = [
      { f: Gs4, d: 0.7 }, { f: Fs4, d: 0.7 }, { f: E4, d: 0.7 }, { f: B3, d: 1.2 }
    ];
    // Phrase 2 (4 notes)
    const phrase2 = [
      { f: E4, d: 0.7 }, { f: Gs4, d: 0.7 }, { f: Fs4, d: 0.7 }, { f: B3, d: 1.2 }
    ];
    // Phrase 3 (4 notes)
    const phrase3 = [
      { f: E4, d: 0.7 }, { f: Fs4, d: 0.7 }, { f: Gs4, d: 0.7 }, { f: E4, d: 1.2 }
    ];
    // Phrase 4 (4 notes)
    const phrase4 = [
      { f: Gs4, d: 0.7 }, { f: E4, d: 0.7 }, { f: Fs4, d: 0.7 }, { f: B3, d: 1.4 }
    ];

    let sequence: Array<{ f: number; d: number }> = [];
    if (quarters === 4) {
      sequence = [...phrase1];
    } else if (quarters === 8) {
      sequence = [...phrase1, ...phrase2];
    } else {
      sequence = [...phrase1, ...phrase2, ...phrase3, ...phrase4];
    }

    let timeCursor = now;
    sequence.forEach((note) => {
      this.playBellNote(note.f, timeCursor, 3.2, 0.85);
      timeCursor += note.d * 0.95;
    });

    // If 16 notes, add hour toll (Low E3)
    if (quarters === 16) {
      timeCursor += 0.4;
      this.playBellNote(LowE3, timeCursor, 4.5, 1.2);
    }
  }

  /**
   * 2-Tone Resonant Chime (Ding - Dong)
   */
  private async playTwoToneChime(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;
    // High A5 (880Hz) to F5 (698Hz)
    this.playBellNote(880, now, 3.0, 0.9);
    this.playBellNote(698.46, now + 0.8, 3.5, 0.95);
  }

  /**
   * 3-Tone Triad Chime (C5 - E5 - G5 - C6)
   */
  private async playThreeToneChime(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playBellNote(freq, now + idx * 0.45, 2.8, 0.85);
    });
  }

  /**
   * Traditional Electric School Bell (Vibrating metallic hammer mechanism)
   */
  private async playElectricSchoolBell(durationSec: number, volume: number): Promise<void> {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.05;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.85, now + 0.05);
    gain.gain.setValueAtTime(0.85, now + durationSec - 0.1);
    gain.gain.linearRampToValueAtTime(0.0001, now + durationSec);
    gain.connect(this.masterGain);

    // Dual metallic frequencies
    const f1 = 820; // Dome resonance
    const f2 = 1240; // Secondary ring

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(f1, now);
    osc2.frequency.setValueAtTime(f2, now);

    // Rapid hammer tremolo modulation (approx 24-28 strikes per second)
    const tremolo = ctx.createOscillator();
    const tremoloGain = ctx.createGain();
    tremolo.type = 'square';
    tremolo.frequency.setValueAtTime(26, now);

    tremoloGain.gain.setValueAtTime(0.6, now);
    tremolo.connect(tremoloGain.gain);

    osc1.connect(gain);
    osc2.connect(gain);

    osc1.start(now);
    osc2.start(now);
    tremolo.start(now);

    osc1.stop(now + durationSec + 0.1);
    osc2.stop(now + durationSec + 0.1);
    tremolo.stop(now + durationSec + 0.1);
  }

  /**
   * Modern Electronic Synthesizer Chime
   */
  private async playModernElectronic(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;
    const notes = [
      { f: 587.33, t: 0 },    // D5
      { f: 739.99, t: 0.25 }, // F#5
      { f: 880.00, t: 0.50 }, // A5
      { f: 1174.66, t: 0.75 },// D6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      g.gain.setValueAtTime(0, now + n.t);
      g.gain.linearRampToValueAtTime(0.7, now + n.t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + n.t + 2.0);

      osc.connect(g);
      g.connect(this.masterGain!);

      osc.start(now + n.t);
      osc.stop(now + n.t + 2.0);
    });
  }

  /**
   * Short Notification Beep
   */
  private async playShortBeep(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1046.5, now + 0.15);

    g.gain.setValueAtTime(0.6, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(g);
    g.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Marimba pleasant harmonic chords
   */
  private async playMarimbaChime(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;
    const chords = [
      { f: 392.00, t: 0 },    // G4
      { f: 493.88, t: 0.2 },  // B4
      { f: 587.33, t: 0.4 },  // D5
      { f: 783.99, t: 0.6 },  // G5
    ];

    chords.forEach((c) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(c.f, now + c.t);

      g.gain.setValueAtTime(0, now + c.t);
      g.gain.linearRampToValueAtTime(0.75, now + c.t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + c.t + 1.8);

      osc.connect(g);
      g.connect(this.masterGain!);

      osc.start(now + c.t);
      osc.stop(now + c.t + 1.8);
    });
  }

  /**
   * Warning Siren / Alarm
   */
  private async playWarningSiren(durationSec: number, volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency warble 500Hz to 1200Hz back and forth
    for (let t = 0; t < durationSec; t += 1.0) {
      osc.frequency.setValueAtTime(500, now + t);
      osc.frequency.linearRampToValueAtTime(1100, now + t + 0.5);
      osc.frequency.linearRampToValueAtTime(500, now + t + 1.0);
    }

    g.gain.setValueAtTime(0.7, now);
    g.gain.setValueAtTime(0.7, now + durationSec - 0.2);
    g.gain.linearRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(g);
    g.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + durationSec);
  }

  /**
   * Custom Audio File Playback from IndexedDB
   */
  private async playCustomSound(customId: string, volume: number, durationSec?: number): Promise<boolean> {
    try {
      const ctx = this.initContext();
      let audioBuffer = this.customAudioCache.get(customId);

      if (!audioBuffer) {
        const record = await getAudioFile(customId);
        if (!record) {
          console.warn(`Custom audio ${customId} not found in IndexedDB, falling back to Westminster`);
          await this.playWestminster(8, volume);
          return false;
        }

        const arrayBuffer = await record.blob.arrayBuffer();
        audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        this.customAudioCache.set(customId, audioBuffer);
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);

      if (durationSec && durationSec > 0 && durationSec < audioBuffer.duration) {
        gainNode.gain.setValueAtTime(volume, ctx.currentTime + durationSec - 0.5);
        gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + durationSec);
      }

      source.connect(gainNode);
      gainNode.connect(this.masterGain!);

      this.currentActiveSource = source;
      source.start(0);

      if (durationSec && durationSec > 0 && durationSec < audioBuffer.duration) {
        source.stop(ctx.currentTime + durationSec);
      }

      return true;
    } catch (err) {
      console.error('Error playing custom audio file:', err);
      await this.playWestminster(8, volume);
      return false;
    }
  }

  // =========================================================================
  // === VERSI BARU (V2.0) HIGH-DEFINITION SYNTHESIS METHODS ===
  // =========================================================================

  /**
   * V2: Modern Japanese / Asian School Chime (Kin-Kon-Kan-Kon)
   * 8-note melody: D5 - F#5 - E5 - A4 / D5 - E5 - F#5 - D5
   */
  private async playKinKonKanKonV2(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;

    const D5 = 587.33;
    const Fs5 = 739.99;
    const E5 = 659.25;
    const A4 = 440.00;

    // Phrase 1 (4 notes) + Phrase 2 (4 notes)
    const melody = [
      { f: D5, t: 0.0, d: 0.7 },
      { f: Fs5, t: 0.65, d: 0.7 },
      { f: E5, t: 1.30, d: 0.7 },
      { f: A4, t: 1.95, d: 1.3 },
      // Pause
      { f: D5, t: 3.10, d: 0.7 },
      { f: E5, t: 3.75, d: 0.7 },
      { f: Fs5, t: 4.40, d: 0.7 },
      { f: D5, t: 5.05, d: 1.6 },
    ];

    melody.forEach((note) => {
      this.playGlockenspielNote(note.f, now + note.t, 3.2, 0.85);
    });
  }

  /**
   * V2: Glockenspiel / Tube Bell with warm chime overtone structure
   */
  private playGlockenspielNote(freq: number, startTime: number, duration: number = 3.0, gainFactor: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Glockenspiel harmonic model (fundamental + soft metallic 2.76x and 5.4x inharmonic partials)
    const partials = [
      { ratio: 1.0, gain: 1.0 },
      { ratio: 2.0, gain: 0.45 },
      { ratio: 2.76, gain: 0.3 },
      { ratio: 4.0, gain: 0.15 },
      { ratio: 5.4, gain: 0.08 },
    ];

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.55 * gainFactor, startTime + 0.006);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    noteGain.connect(this.masterGain);

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const pGain = ctx.createGain();
      osc.type = p.ratio > 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * p.ratio, startTime);

      pGain.gain.setValueAtTime(p.gain, startTime);
      pGain.gain.exponentialRampToValueAtTime(0.0005, startTime + duration * (1 / (p.ratio * 0.7 + 0.3)));

      osc.connect(pGain);
      pGain.connect(noteGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  /**
   * V2: Grand Cathedral Tubular Bells Carillon
   * Deep resonant brass carillon: F4 - A4 - C5 - F5 arpeggio with long 4.5s decay
   */
  private async playTubularCarillonV2(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;

    const notes = [
      { f: 349.23, t: 0.0 }, // F4
      { f: 440.00, t: 1.1 }, // A4
      { f: 523.25, t: 2.2 }, // C5
      { f: 698.46, t: 3.3 }, // F5
    ];

    notes.forEach((n) => {
      this.playBellNote(n.f, now + n.t, 4.5, 0.95);
    });
  }

  /**
   * V2: Celesta & Glockenspiel Ceria
   * Sparkling crystalline arpeggio (C5 - E5 - G5 - B5 - C6 - E6)
   */
  private async playCelestaArpeggioV2(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;

    const notes = [
      523.25, // C5
      659.25, // E5
      783.99, // G5
      987.77, // B5
      1046.50,// C6
      1318.51,// E6
    ];

    notes.forEach((freq, idx) => {
      const t = now + idx * 0.22;
      // Detuned oscillator pair for shimmer
      [-3, 3].forEach((detune) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);

        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.35, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

        osc.connect(g);
        g.connect(this.masterGain!);

        osc.start(t);
        osc.stop(t + 2.5);
      });
    });
  }

  /**
   * V2: Indonesian Nusantara Gamelan Bonang & Gong Ageng
   * Resonant low Gong Ageng followed by bronze Slendro/Pelog chime notes
   */
  private async playGamelanPelogV2(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;

    // 1. Deep Gong Ageng drone (110Hz sub-bass with gentle acoustic warble)
    const gongGain = ctx.createGain();
    gongGain.gain.setValueAtTime(0, now);
    gongGain.gain.linearRampToValueAtTime(0.8, now + 0.05);
    gongGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);
    gongGain.connect(this.masterGain!);

    const gongOsc1 = ctx.createOscillator();
    const gongOsc2 = ctx.createOscillator();
    gongOsc1.type = 'sine';
    gongOsc2.type = 'triangle';
    gongOsc1.frequency.setValueAtTime(110, now); // Low A2
    gongOsc2.frequency.setValueAtTime(220, now); // Octave

    // Slight frequency modulation for organic beating
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(3.5, now);
    lfoGain.gain.setValueAtTime(1.5, now);
    lfo.connect(gongOsc1.frequency);
    lfo.start(now);
    lfo.stop(now + 5.5);

    gongOsc1.connect(gongGain);
    gongOsc2.connect(gongGain);
    gongOsc1.start(now);
    gongOsc2.start(now);
    gongOsc1.stop(now + 5.5);
    gongOsc2.stop(now + 5.5);

    // 2. Bonang melodic metallophone notes in Slendro scale
    // Frequencies: 560Hz (Barang), 630Hz (Gulu), 720Hz (Dhadha), 840Hz (Lima), 960Hz (Nem)
    const bonangNotes = [
      { f: 560, t: 0.6 },
      { f: 630, t: 1.2 },
      { f: 720, t: 1.8 },
      { f: 840, t: 2.4 },
      { f: 960, t: 3.1 },
    ];

    bonangNotes.forEach((note) => {
      const strikeTime = now + note.t;
      // Bonang has a strong fundamental plus high inharmonic bronze chime partials (2.76x, 4.2x)
      [
        { ratio: 1.0, g: 0.6, type: 'sine' as OscillatorType },
        { ratio: 2.76, g: 0.25, type: 'triangle' as OscillatorType },
        { ratio: 4.20, g: 0.15, type: 'sine' as OscillatorType },
      ].forEach((p) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        osc.type = p.type;
        osc.frequency.setValueAtTime(note.f * p.ratio, strikeTime);

        g.gain.setValueAtTime(0, strikeTime);
        g.gain.linearRampToValueAtTime(p.g, strikeTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 2.8);

        osc.connect(g);
        g.connect(this.masterGain!);

        osc.start(strikeTime);
        osc.stop(strikeTime + 2.8);
      });
    });
  }

  /**
   * V2: Airport & High-Speed Train Station Broadcast Chime
   * 4-note chime: Db5 (554.37) - F5 (698.46) - Ab5 (830.61) - C6 (1046.50)
   */
  private async playAirportBroadcastV2(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;

    const notes = [
      { f: 554.37, t: 0.0 }, // Db5
      { f: 698.46, t: 0.35 },// F5
      { f: 830.61, t: 0.70 },// Ab5
      { f: 1046.50, t: 1.05 },// C6
    ];

    notes.forEach((n) => {
      const t = now + n.t;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, t);

      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.7, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

      osc.connect(g);
      g.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 2.2);
    });
  }

  /**
   * V2: Traditional Heavy Bronze Bell Double Strike
   * Two deep resonant strikes with long lingering warm decay
   */
  private async playTraditionalBronzeV2(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;

    // Strike 1: Eb4 + Bb3
    this.playBellNote(311.13, now, 4.0, 1.0);
    this.playBellNote(233.08, now, 4.5, 0.85);

    // Strike 2: Eb4 + G4 (at +1.8s)
    this.playBellNote(311.13, now + 1.8, 4.5, 1.1);
    this.playBellNote(392.00, now + 1.8, 4.2, 0.95);
  }

  /**
   * V2: Sports & Assembly Pea Whistle (Peluit Wasit & Senam)
   * Two sharp bursts with 22Hz flutter ball modulation
   */
  private async playSportsWhistleV2(durationSec: number, volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;

    // Burst 1: 0.0s - 0.65s, Burst 2: 0.95s - 1.85s
    const bursts = [
      { start: 0.0, len: 0.65 },
      { start: 0.95, len: 0.90 },
    ];

    bursts.forEach((b) => {
      const bStart = now + b.start;
      const bEnd = bStart + b.len;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, bStart);
      gain.gain.linearRampToValueAtTime(0.8, bStart + 0.02);
      gain.gain.setValueAtTime(0.8, bEnd - 0.04);
      gain.gain.linearRampToValueAtTime(0.0001, bEnd);
      gain.connect(this.masterGain!);

      // Dual tones of typical referee pea whistle (2950Hz and 3220Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(2950, bStart);
      osc2.frequency.setValueAtTime(3220, bStart);

      // Pea flutter modulation (22Hz vibrato)
      const flutter = ctx.createOscillator();
      const flutterGain = ctx.createGain();
      flutter.frequency.setValueAtTime(22, bStart);
      flutterGain.gain.setValueAtTime(140, bStart);
      flutter.connect(flutterGain.gain);
      flutter.connect(osc1.frequency);
      flutter.connect(osc2.frequency);

      osc1.connect(gain);
      osc2.connect(gain);

      osc1.start(bStart);
      osc2.start(bStart);
      flutter.start(bStart);

      osc1.stop(bEnd + 0.05);
      osc2.stop(bEnd + 0.05);
      flutter.stop(bEnd + 0.05);
    });
  }

  /**
   * V2: Acoustic Bedug & Chime Ibadah (Sholat & Doa)
   * Authentic wooden bedug drum strike impulse + peaceful prayer chime triad
   */
  private async playBedugIslamicV2(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;

    // 1. Bedug Drum Strike (Low membrane impulse with pitch sweep)
    const bedugGain = ctx.createGain();
    bedugGain.gain.setValueAtTime(0, now);
    bedugGain.gain.linearRampToValueAtTime(0.9, now + 0.015);
    bedugGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    bedugGain.connect(this.masterGain!);

    const bedugOsc = ctx.createOscillator();
    bedugOsc.type = 'sine';
    // Deep downward pitch bend of cowhide leather drum head (95Hz -> 58Hz)
    bedugOsc.frequency.setValueAtTime(95, now);
    bedugOsc.frequency.exponentialRampToValueAtTime(58, now + 0.25);

    bedugOsc.connect(bedugGain);
    bedugOsc.start(now);
    bedugOsc.stop(now + 1.8);

    // Secondary lighter bedug rebound (at t=0.38s)
    const reboundGain = ctx.createGain();
    reboundGain.gain.setValueAtTime(0, now + 0.38);
    reboundGain.gain.linearRampToValueAtTime(0.65, now + 0.395);
    reboundGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    reboundGain.connect(this.masterGain!);

    const reboundOsc = ctx.createOscillator();
    reboundOsc.type = 'sine';
    reboundOsc.frequency.setValueAtTime(85, now + 0.38);
    reboundOsc.frequency.exponentialRampToValueAtTime(56, now + 0.6);

    reboundOsc.connect(reboundGain);
    reboundOsc.start(now + 0.38);
    reboundOsc.stop(now + 1.6);

    // 2. Sacred Peaceful Melodic Chime Triad (F4, A4, C5) starting at t=1.1s
    const chimeStart = now + 1.1;
    [
      { f: 349.23, d: 0.0 }, // F4
      { f: 440.00, d: 0.4 }, // A4
      { f: 523.25, d: 0.8 }, // C5
    ].forEach((c) => {
      this.playBellNote(c.f, chimeStart + c.d, 3.8, 0.8);
    });
  }

  /**
   * V2: Digital High-Definition FM Tri-Tone Chime
   * Pristine modern FM bell synthesis with 3 ascending chords
   */
  private async playDigitalTriToneV2(volume: number): Promise<void> {
    const ctx = this.initContext();
    const now = ctx.currentTime + 0.05;

    const notes = [
      { f: 622.25, t: 0.0 }, // Eb5
      { f: 783.99, t: 0.28 },// G5
      { f: 932.33, t: 0.56 },// Bb5
      { f: 1244.51, t: 0.84 },// Eb6
    ];

    notes.forEach((n) => {
      const t = now + n.t;

      // FM Synthesis: Carrier + Modulator
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const noteGain = ctx.createGain();

      carrier.type = 'sine';
      modulator.type = 'sine';

      carrier.frequency.setValueAtTime(n.f, t);
      modulator.frequency.setValueAtTime(n.f * 3.5, t); // Metallic ratio

      modGain.gain.setValueAtTime(n.f * 2.2, t);
      modGain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      noteGain.gain.setValueAtTime(0, t);
      noteGain.gain.linearRampToValueAtTime(0.65, t + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

      carrier.connect(noteGain);
      noteGain.connect(this.masterGain!);

      modulator.start(t);
      carrier.start(t);
      modulator.stop(t + 2.4);
      carrier.stop(t + 2.4);
    });
  }
}

export const audioEngine = new SchoolAudioEngine();
