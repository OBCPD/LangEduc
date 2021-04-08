//Teachable Machine model Url
const URL = "https://teachablemachine.withgoogle.com/models/0VVapoU7Y/";

//Connecting with Sashido server
Parse.initialize(
  "QXmlDnE7daKvXNZSzWDqu4ETRQJjT9TFVRMVNSpS",
  "nZWhqfsMjfdTtzXqwAWiHV9hTJfMNjWRTTUVMRNF"
);
Parse.serverURL =
  "https://pg-app-ux3nnb9n64wcjhjysie6zdc5fdd1x8.scalabl.cloud/1/";

async function logIn() {
  const username = document.getElementById("username").value;
  const pass = document.getElementById("pass").value;
  const formContainer = document.getElementById("form-container");
  const container = document.getElementById("container");
  let span = document.getElementById("returnMsg");

  const onFulfilled = () => {
    formContainer.parentNode.removeChild(formContainer);
    container.className = "";
  };

  const onRejected = () => {
    span.textContent = "Wrong user or password";
    span.className = "redSpan";
  };

  const user = await Parse.User.logIn(username, pass).then(
    onFulfilled,
    onRejected
  );
}
async function signUp() {
  const username = document.getElementById("username").value;
  const pass = document.getElementById("pass").value;
  let span = document.getElementById("returnMsg");
  const user = new Parse.User();
  user.set("username", username);
  user.set("password", pass);

  try {
    await user.signUp();
    span.textContent = "Successfully signed Up";
    span.className = "blueSpan";
  } catch (error) {
    span.textContent = "Error: " + error.code + " " + error.message;
    span.className = "redSpan";
  }
}

let model, webcam, labelContainer, maxPredictions;
let startCamFlag = true,
  startUpFlag = true;

let language = "ENG",
  languageCont = 0;

let camButton = document.getElementById("camButton"),
  upButton = document.getElementById("upButton");

function languageHandler() {
  languageCont += 1;
  if (languageCont == 0) {
    language = "ENG";
  } else if (languageCont == 1) {
    language = "PORT";
    document.getElementById("lang").textContent = "Português";

    if (camButton.textContent == "Start Webcam") {
      camButton.textContent = "Começar Webcam";
    } else {
      camButton.textContent = "Parar";
    }

    if (upButton.textContent == "Upload Image") {
      upButton.textContent = "Enviar imagem";
    } else {
      upButton.textContent = "Fechar";
    }
  } else if (languageCont == 2) {
    language = "SPA";
    document.getElementById("lang").textContent = "Español";
    if (camButton.textContent == "Começar Webcam") {
      camButton.textContent = "Comenzar Webcam";
    } else {
      camButton.textContent = "Detener";
    }

    if (upButton.textContent == "Enviar imagem") {
      upButton.textContent = "Cargar imagen";
    } else {
      upButton.textContent = "Cerrar";
    }
  } else {
    language = "ENG";
    document.getElementById("lang").textContent = "English";
    if (camButton.textContent == "Comenzar Webcam") {
      camButton.textContent = "Start Webcam";
    } else {
      camButton.textContent = "Stop";
    }

    if (upButton.textContent == "Cargar imagen") {
      upButton.textContent = "Upload Image";
    } else {
      upButton.textContent = "Close";
    }
    languageCont = 0;
  }
}

function startCamHandler() {
  if (startUpFlag) {
    if (startCamFlag) init();
    else stop();
    startCamFlag = !startCamFlag;
  }
}

function startUpHandler() {
  if (startCamFlag) {
    if (startUpFlag) openUploadImage();
    else closeUploadImage();
    startUpFlag = !startUpFlag;
  }
}

function openUploadImage() {
  document.getElementById("inp").className = "";
  document.getElementById("canvas").className = "";

  if (language == "ENG") upButton.textContent = "Close";
  else if (language == "PORT") upButton.textContent = "Fechar";
  else if (language == "SPA") upButton.textContent = "Cerrar";
}
function closeUploadImage() {
  labelContainer = document.getElementById("label-container");
  let canvas = document.getElementById("canvas"),
    input = document.getElementById("inp");

  //Hiding input
  input.className = "d-none";
  input.value = null;

  //Removing Label
  labelContainer.className = "d-none";
  if (labelContainer.children.length > 0)
    labelContainer.removeChild(labelContainer.children[0]);
  canvas.className = "d-none";

  //Clear canvas
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (language == "ENG") upButton.textContent = "Upload Image";
  else if (language == "PORT") upButton.textContent = "Enviar imagem";
  else if (language == "SPA") upButton.textContent = "Cargar imagen";
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

  if (language == "ENG") camButton.textContent = "Stop";
  else if (language == "PORT") camButton.textContent = "Parar";
  else if (language == "SPA") camButton.textContent = "Detener";

  document.getElementById("webcam-container").className = "";
  document.getElementById("label-container").className = "";
}

async function stop() {
  await webcam.stop();
  document.getElementById("webcam-container").removeChild(webcam.canvas);

  labelContainer = document.getElementById("label-container");
  console.log(labelContainer.children);

  labelContainer.removeChild(labelContainer.children[0]);

  if (language == "ENG") camButton.textContent = "Start Webcam";
  else if (language == "PORT") camButton.textContent = "Começar Webcam";
  else if (language == "SPA") camButton.textContent = "Comenzar Webcam";

  document.getElementById("webcam-container").className = "d-none";
  document.getElementById("label-container").className = "d-none";
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict(imageModel = webcam.canvas) {
  let highestProbability;
  let lastProbability = 0;
  // predict can take in an image, video or canvas html element

  const prediction = await model.predict(imageModel);
  console.log(prediction);
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

//Uploading Image

document.getElementById("inp").onchange = function (e) {
  var img = new Image();
  img.onload = draw;
  img.onerror = failed;
  img.src = window.URL.createObjectURL(this.files[0]);
};
async function draw() {
  var canvas = document.getElementById("canvas");
  canvas.width = this.width;
  canvas.height = this.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(this, 0, 0);

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  labelContainer = document.getElementById("label-container");
  labelContainer.appendChild(document.createElement("div"));

  labelContainer.className = "";
  await predict(canvas);
}
function failed() {
  console.error("The provided file couldn't be loaded as an Image media");
}
