import PatchCord from './patchCord.js';
import InputPedal from './pedals/input.js';
import DistortionPedal from './pedals/distortion.js';
import OutputPedal from './pedals/output.js';
import VolumePedal from './pedals/volume.js';

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const canvas = document.getElementById('canvas');
const playButton = document.getElementById('play')

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

const ctx = canvas.getContext('2d');

let currentMovingRect = null;

const cords = [
  new PatchCord(30, 200),
  new PatchCord(100, 250),
  new PatchCord(200, 300),
]

const pedals = [
  new InputPedal({ x: 50, y: 50, color: '#000', audioCtx }),
  new DistortionPedal({ x: 350, y: 50, color: 'salmon', audioCtx }),
  new VolumePedal({ x: 650, y: 50, color: 'green', audioCtx }),
  new OutputPedal({ x: 950, y: 50, color: '#000', audioCtx }),
];

function drawScene() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  pedals.forEach(pedal => pedal.draw(ctx));
  cords.forEach(cord => cord.draw(ctx));
}

function onMouseMove(e) {
  if (!currentMovingRect) {
    return;
  }

  currentMovingRect.move(e.movementX, e.movementY);
  drawScene();
}

function onMouseUp(e) {
  document.removeEventListener('mousemove', onMouseMove);

  if (!(currentMovingRect instanceof PatchCord)) {
    return;
  }

  plugPatchCableIntoNearestPedal(currentMovingRect);
  drawScene();
}

function plugPatchCableIntoNearestPedal(patchCord) {
  const direction = patchCord.isMovingLeftSide() ? 'left' : 'right';
  const patchCordX = patchCord.isMovingLeftSide() ? patchCord.getLeftCaseX() : patchCord.getRightCaseX();
  const patchCordY = patchCord.isMovingLeftSide() ? patchCord.getLeftCaseY() : patchCord.getRightCaseY();

  if (direction === 'left') {
    patchCord.unplugLeftSide();
  } else {
    patchCord.unplugRightSide();
  }

  const pedal = getPedalToPlugInto(patchCordX, patchCordY, direction);
  if (pedal) {
    if (direction === 'left') {
      patchCord.plugLeftSideIntoPedal(pedal);
      pedal.plugInOutputCord(patchCord);
    } else {
      patchCord.plugRightSideIntoPedal(pedal);
      pedal.plugInInputCord(patchCord);
    }

    drawScene();
  }
}

function onMouseDown(e) {
  const pedalToMove = pedals.find(pedal => pedal.isInside(e.offsetX, e.offsetY));
  const cordToMove = cords.find(cord => cord.isInside(e.offsetX, e.offsetY));

  if (pedalToMove) {
    currentMovingRect = pedalToMove;
  }

  if (cordToMove) {
    cordToMove.setMoving(e.offsetX, e.offsetY);
    currentMovingRect = cordToMove;
  }

  if (pedalToMove || cordToMove) {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}

function getPedalToPlugInto(x, y, cordSide) {
  return pedals.find(pedal => {
    const pedalEdgeX = cordSide === 'left' ? pedal.getRightEdgeX() : pedal.getLeftEdgeX();
    const pedalDeltaX = x - pedalEdgeX;
    const isCloseEnough = Math.abs(pedalDeltaX) < 30;

    if (!isCloseEnough) {
      return false;
    }

    const pedalTopEdge = pedal.getTopEdgeY();
    const pedalBottomEdge = pedal.getBottomEdgeY();
    const isVerticallyWithinPedal = (y > pedalTopEdge) && (y < pedalBottomEdge);

    return isVerticallyWithinPedal;
  });
}

canvas.addEventListener('mousedown', onMouseDown);
drawScene();


let isPlaying = false;

function handlePlayButtonClick() {
  if (isPlaying) {
    playButton.innerHTML = 'Play';
    isPlaying = false;
    audioCtx.suspend();
    return;
  }


  audioCtx.resume();
  playButton.innerHTML = 'Pause';
  isPlaying = true;
}

playButton.addEventListener('click', handlePlayButtonClick);
