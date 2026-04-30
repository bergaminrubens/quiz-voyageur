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

const simulationTitleEl = document.getElementById("simulationTitle");
const simulationIntroEl = document.getElementById("simulationIntro");
const simulationTableEl = document.getElementById("simulationTable");

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

function shuffleAnswers(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function showQuestion() {
  const current = questions[currentIndex];

  counterEl.textContent = `Question ${currentIndex + 1} / ${questions.length}`;

  const percent = (currentIndex / questions.length) * 100;
  progressFill.style.width = `${percent}%`;

  questionEl.innerHTML = current.question.replace(/\s([?!:;])/g, "&nbsp;$1");
  answersEl.innerHTML = "";

  shuffleAnswers(current.answers).forEach(answer => {
    const button = document.createElement("button");
    button.className = "answer";
    button.innerHTML = `
      ${answer.text}
      <small>${answer.note}</small>
    `;

    button.addEventListener("click", event => {
  event.preventDefault();

  button.classList.remove("answer-hover");
  button.blur();

  if (document.activeElement) {
    document.activeElement.blur();
  }

  scores[answer.type]++;

  setTimeout(() => {
    nextQuestion();
  }, 120);
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
  renderSimulationTable(winner);
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

function renderSimulationTable(type) {
  const profiles = {
    backpacker: {
      label: "Voyageur Backpacker / Aventurier",
      min: 20,
      max: 40
    },
    stratege: {
      label: "Voyageur Mixte / Stratège",
      min: 50,
      max: 80
    },
    confort: {
      label: "Voyageur Confort",
      min: 90,
      max: 150
    }
  };

  const durations = [
    { label: "2 semaines", days: 14 },
    { label: "1 mois", days: 30 },
    { label: "2 mois", days: 60 },
    { label: "3 mois", days: 90 },
    { label: "6 mois", days: 180 },
    { label: "12 mois", days: 365 }
  ];

  const profile = profiles[type];

  simulationTitleEl.textContent = "Combien prévoir selon la durée ?";
  simulationIntroEl.textContent =
    `Pour ton profil ${profile.label}, voici une estimation basée sur ${profile.min}–${profile.max} € par jour.`;

  simulationTableEl.innerHTML = `
    <div class="simulation-row simulation-head">
      <span>Durée</span>
      <span>Total estimé</span>
    </div>
  `;

  durations.forEach(duration => {
    const minTotal = duration.days * profile.min;
    const maxTotal = duration.days * profile.max;

    const row = document.createElement("div");
    row.className = "simulation-row";

    row.innerHTML = `
      <span>${duration.label}</span>
      <strong>${formatNumber(minTotal)} – ${formatEuro(maxTotal)}</strong>
    `;

    simulationTableEl.appendChild(row);
  });
}
function formatNumber(value) {
  return value.toLocaleString("fr-FR");
}

function formatEuro(value) {
  return value.toLocaleString("fr-FR") + " €";
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

/* ANIMATION MOTS INTRO — 4 MOTS VISIBLES, SANS MOT BLOQUÉ */

document.addEventListener("DOMContentLoaded", () => {
  let subtitleItems = [];
  let visibleItems = [];
  let hiddenQueue = [];

  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function getAnimatableItems() {
    return Array.from(document.querySelectorAll(".subtitle span")).filter(item => {
      const style = window.getComputedStyle(item);
      return style.visibility !== "hidden" && style.display !== "none";
    });
  }

  function resetHiddenQueue() {
    hiddenQueue = shuffle(
      subtitleItems.filter(item => !visibleItems.includes(item))
    );
  }

  function initWords() {
    subtitleItems = getAnimatableItems();

    if (!subtitleItems.length) return;

    subtitleItems.forEach(item => {
      item.classList.remove("is-visible");
    });

    visibleItems = shuffle(subtitleItems).slice(0, 4);

    visibleItems.forEach(item => {
      item.classList.add("is-visible");
    });

    resetHiddenQueue();
  }

  function swapOneWord() {
    if (!subtitleItems.length) return;

    if (!hiddenQueue.length) {
      resetHiddenQueue();
    }

    const itemToHide = visibleItems.shift();
    const itemToShow = hiddenQueue.shift();

    itemToHide.classList.remove("is-visible");

    setTimeout(() => {
      itemToShow.classList.add("is-visible");
      visibleItems.push(itemToShow);
    }, 900);
  }

  function loopWords() {
  swapOneWord();

  const base = 2000; // 2 secondes fixes
  const jitter = Math.random() * 300 - 150; // -150ms à +150ms

  const delay = base + jitter;

  setTimeout(loopWords, delay);
}

  initWords();
  setTimeout(loopWords, 2000);
});

function applyFrenchSpacing() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  let node;

  while (node = walker.nextNode()) {
    node.nodeValue = node.nodeValue
      // espace insécable avant : ; ? !
      .replace(/\s*([:;?!])/g, '\u00A0$1')

      // espace insécable avant €
      .replace(/\s*€/g, '\u00A0€')

      // espace insécable avant %
      .replace(/\s*%/g, '\u00A0%');
  }
}

// lance au chargement
window.addEventListener("DOMContentLoaded", applyFrenchSpacing);