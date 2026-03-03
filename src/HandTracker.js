import { Hands } from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';

export class HandTracker {
  constructor(onResults) {
    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });
    this.hands.onResults(onResults);
  }
  start(videoElement) {
    const camera = new cam.Camera(videoElement, {
      onFrame: async () => { await this.hands.send({ image: videoElement }); },
      width: 640, height: 480,
    });
    camera.start();
  }
}