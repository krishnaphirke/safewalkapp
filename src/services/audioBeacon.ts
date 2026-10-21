/**
 * SafeWalk - Audible Safety Alarm & Emergency Siren
 * Uses browser Web Audio API to produce an audible emergency siren beacon.
 */

class AudioBeaconService {
  private audioCtx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private timer: number | null = null;
  private isAlarmPlaying: boolean = false;

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }

  public startSiren(): boolean {
    if (this.isAlarmPlaying) return true;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return false;

      this.audioCtx = new AudioContextClass();
      this.osc = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      this.osc.type = 'sawtooth';
      this.gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

      this.osc.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      this.osc.start();

      let toggle = false;
      const intervalMs = 280;

      this.timer = window.setInterval(() => {
        if (!this.osc || !this.audioCtx) return;
        const freq = toggle ? 720 : 960;
        this.osc.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.05);
        toggle = !toggle;
      }, intervalMs);

      this.isAlarmPlaying = true;
      return true;
    } catch {
      this.isAlarmPlaying = false;
      return false;
    }
  }

  public stopSiren(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {
        // ignore already stopped
      }
      this.osc = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // ignore
      }
      this.gainNode = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
    this.isAlarmPlaying = false;
  }
}

export const audioBeacon = new AudioBeaconService();
