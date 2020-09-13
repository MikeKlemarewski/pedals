const height = 200;
const width = 100;

class Pedal {
  constructor({
    x,
    y,
    color = `#${Math.floor(Math.random()*16777215).toString(16)}`,
    audioCtx,
    pedalFunction,
    isInput = false,
    isOutput = false,
  }) {
    this.x = x;
    this.y = y;
    this.color = color;

    this.inputCord = null;
    this.outputCord = null;

    this.isInput = isInput;
    this.isOutput = isOutput;

    this.audioNode = null;
    this.pedalFunction = null;
    if (this.isInput) {
      this.pedalFunction = 'input';
    } else if (this.isOutput) {
      this.pedalFunction = 'output';
    } else {
      this.pedalFunction = pedalFunction;
    }
    this.setupAudioNode(audioCtx);
  }

  setupAudioNode(audioCtx) {
    if (this.pedalFunction === 'input') {
      const oscillator = audioCtx.createOscillator();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(350, audioCtx.currentTime); // value in hertz
      oscillator.start();
  
      this.audioNode = oscillator;
    } else if (this.pedalFunction === 'output') {
      this.audioNode = audioCtx.destination;
    } else if (this.pedalFunction === 'volume') {
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(2, audioCtx.currentTime);

      this.audioNode = gainNode;
    } else if (this.pedalFunction === 'distortion') {
      const distortion = audioCtx.createWaveShaper();

      function makeDistortionCurve(amount) {
        var k = typeof amount === 'number' ? amount : 50,
          n_samples = 44100,
          curve = new Float32Array(n_samples),
          deg = Math.PI / 180,
          i = 0,
          x;
        for ( ; i < n_samples; ++i ) {
          x = i * 2 / n_samples - 1;
          curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }
        return curve;
      };

      distortion.curve = makeDistortionCurve(400);
      this.audioNode = distortion;
    }
  }

  getAudioNode() {
    return this.audioNode;
  }

  getPedalFunction() {
    return this.pedalFunction;
  }

  getLeftEdgeX() {
    return this.x;
  }

  getRightEdgeX() {
    return this.x + width;
  }

  getTopEdgeY() {
    return this.y;
  }

  getBottomEdgeY() {
    return this.y + height;
  }

  getNextPedal() {
    return this.outputCord ? this.outputCord.getOutputPedal() : null;
  }

  getPreviousPedal() {
    return this.inputCord ? this.inputCord.getInputPedal() : null;
  }

  move(x, y) {
    this.x += x;
    this.y += y;

    if (this.inputCord) {
      this.inputCord.moveRightSide(x, y);
    }

    if (this.outputCord) {
      this.outputCord.moveLeftSide(x, y);
    }
  }

  isInside(x, y) {
    if (x < this.x || x > (this.x + width)) {
      return false;
    }
  
    if (y < this.y || y > (this.y + height)) {
      return false;
    }
  
    return true;
  }

  isInputPedal() {
    return this.isInput;
  }

  isOutputPedal() {
    return this.isOutput;
  }

  plugInInputCord(cord) {
    this.inputCord = cord;

    const previousPedal = this.getPreviousPedal();
    if (previousPedal) {
      const previousAudioNode = previousPedal.getAudioNode();
      previousAudioNode.connect(this.audioNode);
    }
  }

  plugInOutputCord(cord) {
    this.outputCord = cord;

    const nextPedal = this.getNextPedal();
    if (nextPedal) {
      this.audioNode.connect(nextPedal.getAudioNode());
    }
  }

  unplugInputCord() {
    const previousPedal = this.getPreviousPedal();
    if (previousPedal) {
      const previousAudioNode = previousPedal.getAudioNode();
      previousAudioNode.disconnect();
    }

    this.inputCord = null;
  }

  unplugOutputCord() {
    const nextPedal = this.getNextPedal();
    if (nextPedal) {
      this.audioNode.disconnect();
    }

    this.outputCord = null;
  }

  draw(ctx) {
    const previousFillStyle = ctx.fillStyle;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, width, height);
    ctx.fillStyle = previousFillStyle;
  }
}

export default Pedal;
