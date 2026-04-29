let questions = [];
let currentIndex = 0;

let scores = {
  backpacker: 0,
  confort: 0,
  stratege: 0
};

const screens = {
  intro: document.getElementById("intro"),
  quiz: document.getElementById("quiz"),
  result: document.getElementById("result")
};

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const counterEl = document.getElementById("counter");
const progressFill = document.getElementById("progressFill");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");

const resultTitleEl = document.getElementById("resultTitle");
const resultTextEl = document.getElementById("resultText");
const winnerSentenceEl = document.getElementById("winnerSentence");
const resultIconEl = document.getElementById("resultIcon");
const barsEl = document.getElementById("bars");
const resultExtraEl = document.getElementById("resultExtra");

fetch("./questions.json")
  .then(response => response.json())
  .then(data => {
    questions = data;
  })
  .catch(error => {
    console.error(error);
    document.body.innerHTML = "<h1>Erreur : impossible de charger questions.json</h1>";
  });

startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", restartQuiz);

function startQuiz() {
  currentIndex = 0;

  scores = {
    backpacker: 0,
    confort: 0,
    stratege: 0
  };

  showScreen("quiz");
  showQuestion();
}

function showQuestion() {
  const current = questions[currentIndex];

  counterEl.textContent = `Question ${currentIndex + 1} / ${questions.length}`;

  const percent = (currentIndex / questions.length) * 100;
  progressFill.style.width = `${percent}%`;

  questionEl.innerHTML = current.question.replace(/\s([?!:;])/g, "&nbsp;$1");
  answersEl.innerHTML = "";

  current.answers.forEach(answer => {
    const button = document.createElement("button");
    button.className = "answer";
    button.innerHTML = `
      ${answer.text}
      <small>${answer.note}</small>
    `;

    button.addEventListener("click", () => {
      scores[answer.type]++;
      nextQuestion();
    });

    answersEl.appendChild(button);
  });
}

function nextQuestion() {
  currentIndex++;

  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    progressFill.style.width = "100%";
    showResult();
  }
}

function showResult() {
  const winner = getWinner();
  const profile = getProfileContent(winner);

  resultTitleEl.textContent = profile.title;
  resultTextEl.textContent = profile.text;
  winnerSentenceEl.innerHTML = profile.winnerSentence;
  resultExtraEl.innerHTML = profile.extra;

  resultIconEl.className = `travel-icon result-icon ${winner}`;

  renderBars(winner);
  showScreen("result");
}

function renderBars(winner) {
  const total = questions.length;

  const labels = {
  backpacker: "Voyageur Backpacker / Aventurier",
  stratege: "Voyageur Mixte / Stratège",
  confort: "Voyageur Confort"
};

  const order = ["backpacker", "stratege", "confort"];

  barsEl.innerHTML = "";

  order.forEach(type => {
    const percent = Math.round((scores[type] / total) * 100);

    const row = document.createElement("div");
    row.className = "bar-row";

    row.innerHTML = `
      <div class="bar-head">
        <span>${labels[type]}</span>
        <span>${scores[type]} pts · ${percent}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${percent}%"></div>
      </div>
    `;

    if (type === winner) {
      row.classList.add("winner-row");
    }

    barsEl.appendChild(row);
  });
}

function getWinner() {
  let winner = "backpacker";
  let max = scores.backpacker;

  Object.keys(scores).forEach(type => {
    if (scores[type] > max) {
      max = scores[type];
      winner = type;
    }
  });

  return winner;
}

function getProfileContent(type) {
  const profiles = {
    backpacker: {
      title: "Voyageur Backpacker / Aventurier",
      text:
        "Tu voyages pour sentir le réel : routes longues, imprévus, rencontres, street food, scooters, auberges et journées qui partent dans tous les sens.",
      winnerSentence:
        "Ton score te classe surtout comme <strong>Voyageur Backpacker / Aventurier</strong> : tu privilégies la liberté, l’intensité et les souvenirs bruts.",
      extra: ""
    },
    confort: {
      title: "Voyageur Confort",
      text:
        "Tu veux profiter sans te cramer. Tu acceptes de payer plus pour mieux dormir, mieux manger, mieux récupérer et éviter les galères inutiles.",
      winnerSentence:
        "Ton score te classe surtout comme <strong>Voyageur Confort</strong> : tu voyages pour être bien, pas pour subir.",
      extra: ""
    },
    stratege: {
      title: "Voyageur Mixte / Stratège",
      text:
        "Tu alternes naturellement les styles : parfois simple, parfois plus confortable, parfois intense. Tu passes d’un extrême à l’autre selon l’envie et le moment.",
      winnerSentence:
        "Ton score te classe surtout comme <strong>Voyageur Mixte / Stratège</strong> : tu fais les deux extrêmes, et souvent pas sous le coup du hasard.",
      extra: ""
    }
  };

  return profiles[type];
}

function restartQuiz() {
  startQuiz();
}

function showScreen(name) {
  Object.values(screens).forEach(screen => {
    screen.classList.remove("active");
  });

  screens[name].classList.add("active");
}