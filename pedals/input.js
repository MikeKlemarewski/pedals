import BasePedal from "./base.js";

export default class InputPedal extends BasePedal {
  setupAudioNode(audioCtx) {
    const oscillator = audioCtx.createOscillator();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(350, audioCtx.currentTime); // value in hertz
    oscillator.start();

    this.audioNode = oscillator;
  }
}
