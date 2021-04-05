const URL = "https://teachablemachine.withgoogle.com/models/0VVapoU7Y/";

let model, webcam, labelContainer, maxPredictions;
let startFlag = true;

let language = "ENG",
  languageCont = 0;

function languageHandler() {
  languageCont += 1;
  console.log(languageCont);
  if (languageCont == 0) {
    language = "ENG";
  } else if (languageCont == 1) {
    language = "PORT";
    document.getElementById("lang").textContent = "Português";
    if (document.getElementById("button").textContent == "Start") {
      document.getElementById("button").textContent = "Começar";
    } else {
      document.getElementById("button").textContent = "Parar";
    }
  } else if (languageCont == 2) {
    language = "SPA";
    document.getElementById("lang").textContent = "Español";
    if (document.getElementById("button").textContent == "Começar") {
      document.getElementById("button").textContent = "Comenzar";
    } else {
      document.getElementById("button").textContent = "Detener";
    }
  } else {
    language = "ENG";
    document.getElementById("lang").textContent = "English";
    if (document.getElementById("button").textContent == "Comenzar") {
      document.getElementById("button").textContent = "Start";
    } else {
      document.getElementById("button").textContent = "Stop";
    }
    languageCont = 0;
  }
}

function startHandler() {
  if (startFlag) {
    init();
  } else {
    stop();
  }
  startFlag = !startFlag;
}
// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(400, 400, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");

  labelContainer.appendChild(document.createElement("div"));

  if (language == "ENG") document.getElementById("button").textContent = "Stop";
  else if (language == "PORT")
    document.getElementById("button").textContent = "Parar";
  else if (language == "SPA")
    document.getElementById("button").textContent = "Detener";

  document.getElementById("webcam-container").className = "";
  document.getElementById("label-container").className = "";
}

async function stop() {
  await webcam.stop();
  document.getElementById("webcam-container").removeChild(webcam.canvas);

  labelContainer = document.getElementById("label-container");
  console.log(labelContainer.children);

  while (labelContainer.children.length > 0) {
    labelContainer.removeChild(labelContainer.children[0]);
  }

  if (language == "ENG")
    document.getElementById("button").textContent = "Start";
  else if (language == "PORT")
    document.getElementById("button").textContent = "Começar";
  else if (language == "SPA")
    document.getElementById("button").textContent = "Comenzar";

  document.getElementById("webcam-container").className = "d-none";
  document.getElementById("label-container").className = "d-none";
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  let highestProbability;
  let lastProbability = 0;
  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability.toFixed(2) > lastProbability)
      highestProbability = i;
    lastProbability = prediction[i].probability.toFixed(2);
  }
  const className = prediction[highestProbability].className;
  let classNameShow = "";
  if (language == "ENG") {
    for (let i = 0; i < className.length; i++) {
      if (className[i] == ",") break;
      classNameShow += className[i];
    }
  } else if (language == "PORT") {
    let auxCont = 0;
    for (let i = 0; i < className.length; i++) {
      if (className[i] == ",") {
        auxCont++;
      } else if (auxCont == 1) classNameShow += className[i];
    }
  } else if (language == "SPA") {
    let auxCont = 0;
    for (let i = 0; i < className.length; i++) {
      if (className[i] == ",") {
        auxCont++;
      } else if (auxCont == 2) classNameShow += className[i];
    }
  }
  labelContainer.childNodes[0].innerHTML = classNameShow;
}
