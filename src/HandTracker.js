export class HandTracker {
  constructor(onResults) {
    this.onResults = onResults;
    this.running = false;
  }

  start(videoElement) {
    if (this.running) return;
    this.running = true;

    const waitForMediaPipe = (attempts = 0) => {
      if (window.Hands && window.Camera) {
        this._init(videoElement);
      } else if (attempts < 30) {
        setTimeout(() => waitForMediaPipe(attempts + 1), 200);
      } else {
        console.warn('MediaPipe failed to load from CDN');
      }
    };

    waitForMediaPipe();
  }

  _init(videoElement) {
    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(this.onResults);

    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        if (videoElement.readyState >= 2) {
          await hands.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().catch((err) => {
      console.warn('Camera start error:', err);
    });
  }
}
