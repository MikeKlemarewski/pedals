import BasePedal from "./base.js";

export default class OutputPedal extends BasePedal {
  setupAudioNode(audioCtx) {
    this.audioNode = audioCtx.destination;
  }
}
