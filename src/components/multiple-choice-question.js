/**
 * // Creates an HTML code snipped with a question and some answers to choose for the user:
 * @component multiple-choice-question
 */

 AFRAME.registerComponent("multiple-choice-question", {
    schema: {
      question_id: {default: 0},
      answer_id: {default: 0}
    },
  
    init: function() {
      this.submitBtn = this.el.querySelector(".submit-button");
      this.answerOptions = [];
      this.selectedAnswer = 0;

      this.questionText = this.el.querySelector(".question-text");

      //Colors for buttons:
      this.initialColor = "#375413";
      this.selectColor = "#214221";
      this.wrongColor = "#a81c03";
      this.rightColor = "#18ff03";


      let answerArea = this.el.querySelector(".answer-area");
      for(let i = 0; i < answerArea.children.length; i++) {
        answerArea.children[i].object3D.addEventListener("interact", () => this.onSelectAnswer(answerArea.children[i].id));
        answerArea.children[i].setAttribute("text-button", {backgroundHoverColor: this.selectColor});
        this.answerOptions.push(answerArea.children[i]);
      }
      console.log(this.answerOptions);

      this.submitBtn.object3D.addEventListener("interact", () => this.onSubmit());

      //Array for onSubmit-Observer:
      this.onSubmitCallbacks = [];
    },

    subscribe(eventName, fn)
    {
      switch(eventName) {
        case "onSubmit":
          this.onSubmitCallbacks.push(fn);
          break;
      }
    },

    unsubscribe(eventName, fn)
    {
      switch(eventName) {
        case "onSubmit":
          let index = this.onSubmitCallbacks.indexOf(fn);
          this.onSubmitCallbacks.splice(index, 1);
          break;
      }
    },
  
    tick: function() {

     
    },

    onSelectAnswer(answerId)
    {
      this.submitBtn.setAttribute("text-button", {backgroundColor: this.initialColor});

      if(this.selectedAnswer == parseInt(answerId)) {
        this.answerOptions[(this.selectedAnswer - 1)].setAttribute("text-button", {backgroundColor: this.initialColor});
        this.selectedAnswer = 0;
        console.log(this.selectedAnswer);
        return;
      }

      let clickedAnswer = this.el.querySelector(".answer-option-" + answerId);
      clickedAnswer.setAttribute("text-button", {backgroundColor: this.selectColor});

      this.selectedAnswer = parseInt(answerId);

      for(let i = 0; i < this.answerOptions.length; i++) {
        if((i+1) == this.selectedAnswer)
          continue;
        this.answerOptions[i].setAttribute("text-button", {backgroundColor: this.initialColor});
      }

      console.log(this.selectedAnswer);
    },

    onSubmit()
    {
      console.log("submit");
      if(this.selectedAnswer == 0) {
        console.log("No answer selected");
        this.submitBtn.setAttribute("text-button", {backgroundColor: this.initialColor});
        return;
      }

      if(this.selectedAnswer == this.data.answer_id) {
        this.submitBtn.setAttribute("text-button", {backgroundColor: this.rightColor});
        console.log("Correct Answer!");
      }
      else {
        this.submitBtn.setAttribute("text-button", {backgroundColor: this.wrongColor});
        console.log("Wrong Answer");
      }

      this.onSubmitCallbacks.forEach(cb => {
        cb(this.data.answer_id, this.selectedAnswer);
      });

      for(let i = 0; i < this.answerOptions.length; i++) {
        this.answerOptions[i].setAttribute("text-button", {backgroundColor: this.initialColor});
      }
      this.selectedAnswer = 0;
    }
  });
  