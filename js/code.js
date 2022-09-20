const elements = {
  attemptContainer: document.querySelector("#attempt-container"),
  input1: document.querySelector("#letter-1"),
  input2: document.querySelector("#letter-2"),
  input3: document.querySelector("#letter-3"),
  input4: document.querySelector("#letter-4"),
  input5: document.querySelector("#letter-5"),
  results: document.querySelector("#result-container"),
  add: document.querySelector("#add-button"),
  clear: document.querySelector("#clear-button"),
};

let attempts = [];
let results = words;
let attempt = new Attempt();

function renderAttempts() {
  elements.attemptContainer.innerHTML = "";
  for (const currentAttempt of attempts) {
    elements.attemptContainer.innerHTML += `<div class="attempt">
      <div class="${currentAttempt.letters[0].state}">${currentAttempt.letters[0].letter}</div>
      <div class="${currentAttempt.letters[1].state}">${currentAttempt.letters[1].letter}</div>
      <div class="${currentAttempt.letters[2].state}">${currentAttempt.letters[2].letter}</div>
      <div class="${currentAttempt.letters[3].state}">${currentAttempt.letters[3].letter}</div>
      <div class="${currentAttempt.letters[4].state}">${currentAttempt.letters[4].letter}</div>
    </div>`;
  }
}

function clearValues() {
  for (let i = 1; i <= 5; i++) {
    elements[`input${i}`].value = "";
  }
}

elements.add.addEventListener("click", () => {
  if (attempt.isValid()) {
    attempts.push(attempt);
    attempt = new Attempt();
    renderAttempts();
    clearValues();
    document.dispatchEvent(new Event("letters-updated"));
    renderResults();
  }
});

elements.clear.addEventListener("click", () => {
  attempts = [];
  attempt = new Attempt()
  renderAttempts();
  clearValues();
  clearResults();
  enterAttempt(getRandomWord(results));
  document.dispatchEvent(new Event("letters-updated"));
});

document.addEventListener("letters-updated", () => {
  for (let i = 1; i <= 5; i++) {
    const index = i - 1;
    const element = elements[`input${i}`];
    if (attempt.hasLetterAtIndex(index)) {
      element.classList = attempt.letters[index].state;
    } else {
      element.classList = "";
    }
  }

  elements.add.classList = attempt.isValid() ? "" : "button-disabled";
});

function debounce(func, timeout = 1000) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

for (let i = 1; i <= 5; i++) {
  const element = elements[`input${i}`];
  const index = i - 1;

  element.addEventListener("click", () => {
    if (attempt.hasLetterAtIndex(index)) {
      attempt.toggleLetterState(index);
    }
  });

  element.addEventListener("input", () => {
    element.value = (element.value || "").toUpperCase();
    if (!!element.value) {
      attempt.setLetter(index, element.value, LETTER_STATE.absent);
    } else {
      attempt.removeLetter(index);
    }

    if (i < 5) {
      console.log(`Moving to input ${i + 1}`);
      elements[`input${i + 1}`].focus();
    }
  });

  console.log(`Added event listeners for input ${i}`);
}

function getFilteredWords() {
  const absentLetters = attempts.flatMap((currentAttempt) =>
    currentAttempt.getAbsentLetters()
  );

  const correctLetters = attempts.flatMap((currentAttempt) =>
    currentAttempt.getCorrectLetters()
  );

  const presentLetters = attempts.flatMap((currentAttempt) =>
    currentAttempt.getPresentLetters()
  );

  const trulyAbsentLetters = absentLetters.filter((letter) => {
    if (correctLetters.includes(letter) || presentLetters.includes(letter)) {
      return false;
    }
    return true;
  });

  return results.filter((lowercaseWord) => {
    const word = lowercaseWord.toUpperCase();
    for (const absentLetter of trulyAbsentLetters) {
      if (word.indexOf(absentLetter) >= 0) {
        return false;
      }
    }

    for (const attempt of attempts) {
      for (let i = 0; i < 5; i++) {
        const letter = attempt.letters[i];

        if (letter.isCorrect()) {
          if (word.charAt(i) !== letter.letter) {
            return false;
          }
        }

        if (letter.isPresent()) {
          if (word.charAt(i) === letter.letter) {
            return false;
          } else if (word.indexOf(letter.letter) < 0) {
            return false;
          }
        }

        if (letter.isAbsent()) {
          if (word.charAt(i) === letter.letter) {
            return false;
          }
        }
      }
    }

    return true;
  });
}

function renderResults() {
  results = getFilteredWords();
  console.log(`Matched ${results.length} results`);
  let resultsToRender = results;
  if (results.length > 100) {
    console.log(`Only displaying random 100 results.`);
    resultsToRender = resultsToRender.slice(0, 100);
  }
  elements.results.innerHTML = "";

  if (resultsToRender.length === 0) {
    elements.results.innerHTML = "No results.";
  } else {
    for (const word of resultsToRender) {
      elements.results.innerHTML += `<li onclick="enterAttempt('${word.toUpperCase()}')">${word}</li>`;
    }
  }
  enterAttempt(getRandomWord(results));
}

function getRandomWord(listOfWords) {
  return listOfWords[Math.floor(Math.random() * listOfWords.length)];
}

function enterAttempt(word) {
  for (let i = 0; i < 5; i++) {
    elements[`input${i + 1}`].value = word.charAt(i).toUpperCase();
    const isCorrect = attempts.length && attempts[attempts.length - 1].letters[i].state === LETTER_STATE.correct;
    attempt.setLetter(i, word.charAt(i).toUpperCase(), isCorrect? LETTER_STATE.correct : LETTER_STATE.absent);
  }
}

function clearResults() {
  results = words;
  elements.results.innerHTML = "";
}

enterAttempt(getRandomWord(results));