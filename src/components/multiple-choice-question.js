/**
 * // Creates an HTML code snipped with a question and some answers to choose for the user:
 * @component multiple-choice-question
 */

 AFRAME.registerComponent("multiple-choice-question", {
    schema: {
      question_id: {default: 0},
      answer_id: {default: -2},
      answerSelected: {default: false},
      answerSubmitted: {default: false}
    },
  
    init: function() {
      this.submitBtn = this.el.querySelector(".submit-button");
      this.answerOptions = [];
      this.selectedAnswer = -1;
      this.correctAnswer = 2;

      //local version of network-variables:
      this.localAnswerSelected = false;
      this.localAnswerSubmitted = false;

      this.questionText = this.el.querySelector(".question-text");

      //Colors for buttons:
      this.initialColor = "#761614";
      this.selectColor = "#5e656d";
      this.wrongColor = "#23AED9";
      this.rightColor = "#18FF03";


      let answerArea = this.el.querySelector(".answer-area");
      for(let i = 0; i < answerArea.children.length; i++) {
        answerArea.children[i].object3D.addEventListener("interact", () => this.onSelectAnswer(i));
        answerArea.children[i].setAttribute("text-button", {backgroundHoverColor: this.selectColor});
        this.answerOptions.push(answerArea.children[i]);
      }

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

    update() {
      this.updateUI();
    },
  
    updateUI() 
    {
      if(this.localAnswerSelected != this.data.answerSelected) {
        this.renderAnswerButton(this.data.answer_id);
        this.localAnswerSelected = this.data.answerSelected;
      }
     
      if(this.localAnswerSubmitted != this.data.answerSubmitted) {
        this.renderSubmitButton();
        this.localAnswerSubmitted = this.data.answerSubmitted;
      }
    },

    onSelectAnswer(answerId)
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
        NAF.utils.takeOwnership(networkedEl);

        this.el.setAttribute("multiple-choice-question", "answer_id", answerId);
        this.el.setAttribute("multiple-choice-question", "answerSelected", !this.data.answerSelected);  

        this.updateUI();
      });
    },

    onSubmit()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
        NAF.utils.takeOwnership(networkedEl);

        this.el.setAttribute("multiple-choice-question", "answerSubmitted", !this.data.answerSubmitted); 
        
        this.updateUI();
      });
    },

    renderAnswerButton(answerId) 
    {
      this.submitBtn.setAttribute("text-button", {backgroundColor: this.initialColor});

      if(this.selectedAnswer == parseInt(answerId)) {
        this.answerOptions[this.selectedAnswer].setAttribute("text-button", {backgroundColor: this.initialColor});
        this.selectedAnswer = -1;
        console.log(this.selectedAnswer);
        return;
      }

      let clickedAnswer = this.el.querySelector(".answer-option-" + answerId);
      clickedAnswer.setAttribute("text-button", {backgroundColor: this.selectColor});

      this.selectedAnswer = parseInt(answerId);

      for(let i = 0; i < this.answerOptions.length; i++) {
        if(i == this.selectedAnswer)
          continue;
        this.answerOptions[i].setAttribute("text-button", {backgroundColor: this.initialColor});
      }
    },

    renderSubmitButton()
    {
      if(this.selectedAnswer == -1) {
        console.log("No answer selected");
        this.submitBtn.setAttribute("text-button", {backgroundColor: this.initialColor});
        return;
      }

      if(this.selectedAnswer == this.correctAnswer) {
        this.submitBtn.setAttribute("text-button", {backgroundColor: this.rightColor});
        console.log("Correct Answer!");
      }
      else {
        this.submitBtn.setAttribute("text-button", {backgroundColor: this.wrongColor});
        console.log("Wrong Answer");
         // Mannequin
         this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMyMannequin();
         this.mannequin.components["mannequin"].displayMessage(18);
      }

      this.onSubmitCallbacks.forEach(cb => {
        cb(this.correctAnswer, this.selectedAnswer);
      });

      for(let i = 0; i < this.answerOptions.length; i++) {
        this.answerOptions[i].setAttribute("text-button", {backgroundColor: this.initialColor});
      }

      this.selectedAnswer = -1;
    }
  });
  