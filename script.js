const motorImage = document.getElementById("motorImage");
const resultText = document.getElementById("result");
const scoreText = document.getElementById("score");
const highscoreText = document.getElementById("highscore");
const startBtn = document.getElementById("startBtn");

// JOUW TEACHABLE MACHINE URL
const URL = "https://teachablemachine.withgoogle.com/models/lvYjdFs9u/";

// Variabelen
let recognizer;
let currentMotor;
let score = 0;
let canGuess = true;

// Motoren lijst
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

// MODEL LADEN
async function createModel() {

  try {

    const checkpointURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    recognizer = speechCommands.create(
      "BROWSER_FFT",
      undefined,
      checkpointURL,
      metadataURL
    );

    await recognizer.ensureModelLoaded();

    console.log("MODEL LOADED");

    startListening();

  } catch (error) {

    console.error("ERROR LOADING MODEL:", error);

  }
}

// STEM LUISTEREN
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

    console.log("Prediction:", prediction);
    console.log("Confidence:", highestScore);

    // Alleen accepteren als AI zeker genoeg is
    if (
      highestScore > 0.90 &&
      canGuess &&
      prediction !== "Achtergrondruis"
    ) {

      canGuess = false;

      checkAnswer(prediction);

    }

  }, {
    includeSpectrogram: true,
    probabilityThreshold: 0.90,
    invokeCallbackOnNoiseAndUnknown: false,
    overlapFactor: 0.3
  });

}

// ANTWOORD CONTROLEREN
function checkAnswer(prediction) {

  if (prediction === currentMotor.brand) {

    resultText.innerHTML = "✅ Correct!";

    score++;

    scoreText.textContent = score;

    // Highscore update
    if (score > highscore) {

      highscore = score;

      localStorage.setItem("highscore", highscore);

      highscoreText.textContent = highscore;

    }

  } else {

    resultText.innerHTML = `❌ Wrong! Correct answer: ${currentMotor.brand}`;

  }

  // Nieuwe motor na 2 seconden
  setTimeout(() => {

    showRandomMotor();

    resultText.innerHTML = "Say the motorcycle brand...";

    canGuess = true;

  }, 2000);

}

// START BUTTON
startBtn.addEventListener("click", async () => {

  await createModel();

  startBtn.disabled = true;

});