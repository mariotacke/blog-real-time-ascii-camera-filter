const video = document.querySelector('#camera-stream');
const hiddenCanvas = document.querySelector('#hidden-canvas');
const outputCanvas = document.querySelector('#output-canvas');
const hiddenContext = hiddenCanvas.getContext('2d');
const outputContext = outputCanvas.getContext('2d');

const constraints = {
  video: {
    width: 256,
    height: 256,
  },
};

const getAverageRGB = (frame) => {
  const length = frame.data.length / 4;

  let r = 0;
  let g = 0;
  let b = 0;

  for (let i = 0; i < length; i++) {
    r += frame.data[i * 4 + 0];
    g += frame.data[i * 4 + 1];
    b += frame.data[i * 4 + 2];
  }

  return {
    r: r / length,
    g: g / length,
    b: b / length,
  };
};

const processFrame = () => {
  const fontHeight = 12;
  const { videoWidth: width, videoHeight: height } = video;

  if (width && height) {
    hiddenCanvas.width = width;
    hiddenCanvas.height = height;
    outputCanvas.width = width;
    outputCanvas.height = height;
    hiddenContext.drawImage(video, 0, 0, width, height);

    outputContext.textBaseline = 'top';
    outputContext.font = `${fontHeight}px Consolas`;

    const text = outputContext.measureText('@');
    const fontWidth = parseInt(text.width);

    outputContext.clearRect(0, 0, width, height);

    for (let y = 0; y < height; y += fontHeight) {
      for (let x = 0; x < width; x += fontWidth) {
        const frameSection = hiddenContext.getImageData(x, y, fontWidth, fontHeight);
        const { r, g, b } = getAverageRGB(frameSection);

        outputContext.fillStyle = `rgb(${r},${g},${b})`;
        // outputContext.fillRect(x, y, fontWidth, fontHeight);
        outputContext.fillText('@', x, y);
      }
    }
  }

  window.requestAnimationFrame(processFrame);
};

navigator.getUserMedia(constraints, function (stream) {
  video.srcObject = stream;
  video.play();
}, function (err) {
  console.error(err);
});

video.addEventListener('play', function () {
  window.requestAnimationFrame(processFrame);
  console.log('Live!');
});