const motorImage = document.getElementById("motorImage");
const resultText = document.getElementById("result");
const scoreText = document.getElementById("score");
const highscoreText = document.getElementById("highscore");
const startBtn = document.getElementById("startBtn");

// PLAK HIER JE TEACHABLE MACHINE URL
const URL = "PASTE_YOUR_MODEL_URL_HERE/";

let recognizer;
let currentMotor;
let score = 0;

const motors = [
  {
    brand: "Kawasaki",
    image: "images/kawasaki.jpg"
  },
  {
    brand: "Honda",
    image: "images/Honda.avif"
  },
  {
    brand: "Yamaha",
    image: "images/Yamaha.jpg"
  },
  {
    brand: "BMW",
    image: "images/Bmw.avif"
  },
  {
    brand: "Ducati",
    image: "images/Ducati.jpg"
  }
];

// Highscore laden
let highscore = localStorage.getItem("highscore") || 0;
highscoreText.textContent = highscore;

// Random motor tonen
function showRandomMotor() {
  currentMotor = motors[Math.floor(Math.random() * motors.length)];
  motorImage.src = currentMotor.image;
}

showRandomMotor();

// Teachable Machine laden
async function createModel() {
  const checkpointURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  recognizer = speechCommands.create(
    "BROWSER_FFT",
    undefined,
    checkpointURL,
    metadataURL
  );

  await recognizer.ensureModelLoaded();

  startListening();
}

// Stem luisteren
function startListening() {
  recognizer.listen(result => {

    const scores = result.scores;
    let highestScore = 0;
    let prediction = "";

    for (let i = 0; i < scores.length; i++) {

      if (scores[i] > highestScore) {
        highestScore = scores[i];
        prediction = recognizer.wordLabels()[i];
      }
    }

    if (highestScore > 0.75) {

      checkAnswer(prediction);

    }

  }, {
    includeSpectrogram: false,
    probabilityThreshold: 0.75,
    invokeCallbackOnNoiseAndUnknown: true,
    overlapFactor: 0.5
  });
}

// Controle antwoord
function checkAnswer(prediction) {

  if (prediction === currentMotor.brand) {

    resultText.innerHTML = "✅ Correct!";
    score++;

    scoreText.textContent = score;

    if (score > highscore) {
      highscore = score;
      localStorage.setItem("highscore", highscore);
      highscoreText.textContent = highscore;
    }

  } else {

    resultText.innerHTML = `❌ Wrong! Correct answer: ${currentMotor.brand}`;

  }

  setTimeout(() => {
    showRandomMotor();
    resultText.innerHTML = "Say the motorcycle brand...";
  }, 2000);
}

startBtn.addEventListener("click", () => {
  createModel();
  startBtn.disabled = true;
});