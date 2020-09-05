const video = document.getElementById('video')
video.setAttribute('autoplay', '');
video.setAttribute('muted', '');
video.setAttribute('playsinline', '');

const possibleExpressions = {
  NEUTRAL: 'neutral',
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  FEARFUL: 'fearful',
  DISGUSTED: 'disgusted',
  SURPRISED: 'surprised',
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "facingMode"
    }
  }).then(stream => {
    console.log(stream);
    video.srcObject = stream;
  }).catch(err => {
    console.error(err);
  })
}
video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.getElementsByClassName('videoWrapper')[0].append(canvas)
  const displaySize = { width: video.offsetWidth, height: video.offsetHeight }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async function () {

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

    document.getElementById("loading").innerText = "";
    document.getElementsByClassName("controls")[0].style.opacity = "1";

    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    if (detections[0]) {
      expressions = detections[0].expressions;
      changeDOM(getExpression(expressions));
    }
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 1500);
})

function switchVideo(sv) {
  if (sv.checked)
    document.getElementById("video").style.opacity = "1";
  else document.getElementById("video").style.opacity = "0";
}
function switchCanvas(sc) {
  if (sc.checked)
    document.getElementsByTagName("canvas")[0].style.opacity = "1";
  else document.getElementsByTagName("canvas")[0].style.opacity = "0";
}

function getExpression(expressions) {
  let expression;
  if (expressions)
    expression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
  else expression = null
  return expression;
}

function changeDOM(exp) {

  switch (exp) {
    case possibleExpressions.ANGRY:
      backgroud("#eb445a");
      title("😡")
      break;
    case possibleExpressions.DISGUSTED:
      backgroud("#28ba62");
      title("🤢")
      break;
    case possibleExpressions.FEARFUL:
      backgroud("#1e2023");
      title("😨")
      break;
    case possibleExpressions.NEUTRAL:
      backgroud("#92949c");
      title("😐")
      break;
    case possibleExpressions.SAD:
      backgroud("#4854e0");
      title("😞")
      break;
    case possibleExpressions.SURPRISED:
      backgroud("#ffc409");
      title("😱")
      break;
    case possibleExpressions.HAPPY:
      backgroud("#2dd36f");
      title("🤣")
      break;
  }
}

function backgroud(bg) {
  document.body.style.background = bg;
}

function title(exp) {
  document.getElementById("expression").innerHTML = exp;
}