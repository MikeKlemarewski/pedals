import BasePedal from "./base.js";

export default class VolumePedal extends BasePedal {
  setupAudioNode(audioCtx) {
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(2, audioCtx.currentTime);

    this.audioNode = gainNode;
  }
}
