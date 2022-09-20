const LETTER_STATE = {
  absent: "absent",
  present: "present",
  correct: "correct",
};

class Letter {
  constructor(letter, state = LETTER_STATE.absent) {
    this.letter = letter;
    this.state = state;
  }

  toggleState() {
    switch (this.state) {
      case LETTER_STATE.absent:
        this.state = LETTER_STATE.present;
        break;
      case LETTER_STATE.present:
        this.state = LETTER_STATE.correct;
        break;
      case LETTER_STATE.correct:
        this.state = LETTER_STATE.absent;
        break;
    }
  }

  isPresent() {
    return this.state === LETTER_STATE.present;
  }

  isCorrect() {
    return this.state === LETTER_STATE.correct;
  }

  isAbsent() {
    return this.state === LETTER_STATE.absent;
  }
}

class Attempt {
  constructor(
    letters = [undefined, undefined, undefined, undefined, undefined]
  ) {
    this.letters = letters;
  }

  setLetter(index, letter, state = LETTER_STATE.forbidden) {
    if (index > 4 || index < 0) {
      console.error(`Letter index must be between 0 and 5, but was ${index}`);
      return;
    }

    if (letter.length !== 1) {
      console.error(`Letter length must be 1, but was ${index}`);
      return;
    }

    this.letters[index] = new Letter(letter, state);
    document.dispatchEvent(new Event("letters-updated"));
  }

  removeLetter(index) {
    this.letters[index] = undefined;
    document.dispatchEvent(new Event("letters-updated"));
  }

  hasLetterAtIndex(index) {
    return !!this.letters[index];
  }

  toggleLetterState(index) {
    this.letters[index].toggleState();
    document.dispatchEvent(new Event("letters-updated"));
  }

  getAbsentLetters() {
    return this.letters.filter(letter => letter.isAbsent()).map(letter => letter.letter);
  }

  getCorrectLetters() {
    return this.letters.filter(letter => letter.isCorrect()).map(letter => letter.letter);
  }

  getPresentLetters() {
    return this.letters.filter(letter => letter.isPresent()).map(letter => letter.letter);
  }

  isValid() {
    for (const letter of this.letters) {
      if (!letter) {
        return false;
      }
    }
    return true;
  }
}
