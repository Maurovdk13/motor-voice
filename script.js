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
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200"
  },
  {
    brand: "Honda",
    image: "https://images.unsplash.com/photo-1517846693594-1567da72af75?q=80&w=1200"
  },
  {
    brand: "Yamaha",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1200"
  },
  {
    brand: "BMW",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200"
  },
  {
    brand: "Ducati",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200"
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