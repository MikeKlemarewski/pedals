const height = 200;
const width = 100;

export default class BasePedal {
  constructor({
    x,
    y,
    color = `#${Math.floor(Math.random()*16777215).toString(16)}`,
    audioCtx,
  }) {
    this.x = x;
    this.y = y;
    this.color = color;

    this.inputCord = null;
    this.outputCord = null;

    this.audioNode = null;

    this.setupAudioNode(audioCtx);
  }

  setupAudioNode() {
    throw Error('Pleeze implement setupAudioNode 🙏')
  }

  getAudioNode() {
    return this.audioNode;
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
