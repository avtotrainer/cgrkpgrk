document
  .getElementById("verify-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const inputToken = document.getElementById("token").value.trim();
    const resultContainer = document.getElementById("result-container");
    resultContainer.innerHTML = "ტოკენის შემოწმება მიმდინარეობს...";

    try {
      // Fetch all test files from known student list (could be dynamic via API or teacher's index file)
      const knownTests = ["888888-20501055444.json"];

      let found = false;

      for (const file of knownTests) {
        const res = await fetch(`data/tests/${file}`);
        const data = await res.json();

        const { personal_id, test_id, questions, start_time, end_time } = data;

        let score = 0;
        if (data.answers) {
          questions.forEach((q, i) => {
            const userAnswer = data.answers[i];
            if (userAnswer && md5(userAnswer) === q.answer_hash) {
              score += q.points;
            }
          });
        }

        const raw = `${personal_id}|${test_id}|${start_time}|${end_time}|${score}`;
        const computedToken = md5(raw);

        if (computedToken === inputToken) {
          found = true;
          resultContainer.innerHTML = `
          <h2>შედეგი:</h2>
          <p><strong>მოსწავლე:</strong> ${data.student}</p>
          <p><strong>პირადი ნომერი:</strong> ${personal_id}</p>
          <p><strong>ტესტის ნომერი:</strong> ${test_id}</p>
          <p><strong>დაწყების დრო:</strong> ${start_time}</p>
          <p><strong>დასრულების დრო:</strong> ${end_time}</p>
          <p><strong>მიღებული ქულა:</strong> ${score}/${questions.length}</p>
        `;
          break;
        }
      }

      if (!found) {
        resultContainer.innerHTML = "ტოკენი ვერ მოიძებნა ან არასწორია.";
      }
    } catch (err) {
      resultContainer.innerHTML = "შეცდომა ტესტის გადამოწმებისას.";
      console.error(err);
    }
  });
