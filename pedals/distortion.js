import Pedal from "./base.js";

export default class DistortionPedal extends Pedal {
  setupAudioNode(audioCtx) {
    const distortion = audioCtx.createWaveShaper();

    function makeDistortionCurve(amount) {
      const k = typeof amount === 'number' ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;

      for (let i = 0; i < n_samples; ++i ) {
        const x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
      }

      return curve;
    };

    distortion.curve = makeDistortionCurve(400);
    this.audioNode = distortion;
  }
}
