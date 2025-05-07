const params = new URLSearchParams(window.location.search);
const testId = params.get("code");
const personalId = params.get("id");
const testFile = `data/tests/${testId}-${personalId}.json`;

let currentQuestion = 0;
let answers = [];
let testData = null;
let startTime = new Date();

function renderQuestion() {
  const q = testData.questions[currentQuestion];
  const container = document.getElementById("question-container");
  container.innerHTML = `
    <p class="question-number">ᲙᲘᲗᲮᲕᲐ № ${currentQuestion + 1} / ${testData.questions.length}</p>    
    <p class="question-text animate">${q.question}</p>
    <div class="options">
      ${q.options
        .map(
          (opt, index) => `
        <div class="option-with-label">
          <div class="option-label">${index + 1}.</div>
          <button class="option-button ${answers[currentQuestion] === opt ? "selected" : ""}">${opt}</button>
        </div>`,
        )
        .join("")}
    </div>
  `;

  const optionElements = document.querySelectorAll(".option-with-label");
  optionElements.forEach((el) => {
    el.classList.remove("show");
    el.style.display = "none";
  });

  setTimeout(() => {
    optionElements.forEach((el, index) => {
      el.style.display = "flex";
      setTimeout(() => {
        el.classList.add("show");
      }, index * 100);
    });
  }, 50);

  document.querySelectorAll(".option-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      answers[currentQuestion] = e.target.textContent;
      updateProgress();
      e.target.blur();

      if (currentQuestion < testData.questions.length - 1) {
        currentQuestion++;
        renderQuestion();
      }
    });
  });

  document.querySelectorAll(".option-button").forEach((btn) => btn.blur());

  const questionEl = document.querySelector(".question-text");
  if (questionEl) {
    questionEl.classList.remove("animate");
    void questionEl.offsetWidth;
    questionEl.classList.add("animate");
  }
}

function updateProgress() {
  const progressBar = document.getElementById("progress-bar");
  const filled = answers.filter((a) => a !== undefined).length;
  const percent = Math.floor((filled / testData.questions.length) * 100);

  if (window.innerWidth <= 600) {
    progressBar.style.height = `${percent}%`;
    progressBar.style.width = `100%`;
  } else {
    progressBar.style.width = `${percent}%`;
    progressBar.style.height = `100%`;
  }

  progressBar.style.backgroundColor =
    filled === testData.questions.length ? "green" : "#e74c3c";
}

function showTestData(data) {
  testData = data;
  document.getElementById("student-name").textContent = data.student;
  document.getElementById("test-id").textContent = data.test_id;
  document.getElementById("total-questions").textContent =
    data.questions.length;
  answers = new Array(data.questions.length);
  renderQuestion();
  updateProgress();
}

function validateTime(data) {
  const now = new Date();
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);

  const nowUTC = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
  );

  return nowUTC >= start && nowUTC <= end;
}

function finishTest() {
  const total = testData.questions.length;
  let score = 0;

  testData.questions.forEach((q, i) => {
    const userAnswer = answers[i];
    const hash = userAnswer ? md5(userAnswer) : "";
    if (hash === q.answer_hash) {
      score += q.points;
    }
  });

  const endTime = new Date();
  const tokenRaw = `${personalId}|${testId}|${startTime.toISOString()}|${endTime.toISOString()}|${score}`;
  const token = md5(tokenRaw);

  testData.answers = answers;

  const container = document.getElementById("question-container");
  container.innerHTML = `
    <div id="completion-message" class="show">
      ტესტი დასრულებულია!<br />ქულა: ${score}/${total}<br />ტოკენი: ${token}
    </div>
  `;

  updateProgress();
}

fetch(testFile)
  .then((res) => res.json())
  .then((data) => {
    if (!validateTime(data)) {
      alert("ტესტის დრო არასწორია ან ამოიწურა.");
      window.location.href = "index.html";
    } else {
      showTestData(data);
    }
  })
  .catch((err) => {
    alert("ტესტის ფაილის წაკითხვის შეცდომა.");
    console.error(err);
    window.location.href = "index.html";
  });

document.getElementById("prev-question").addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
    updateProgress();
  }
});

document.getElementById("next-question").addEventListener("click", () => {
  if (currentQuestion < testData.questions.length - 1) {
    currentQuestion++;
    renderQuestion();
    updateProgress();
  }
});

document.getElementById("finish-test").addEventListener("click", () => {
  if (confirm("დარწმუნებული ხარ, რომ გსურს ტესტის დასრულება?")) {
    finishTest();
  }
});
