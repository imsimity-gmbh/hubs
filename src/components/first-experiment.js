/**
 * First Experiment is the mangager class for the experiment
 * @component first-experiment
 */
 
 AFRAME.registerComponent("first-experiment", {
    schema: {
    },
  
    init: function() {
      this.startBtn = this.el.querySelector(".start-button");
      this.startBtn.object3D.addEventListener("click", () => onClickStart());

      this.groundSample1 = this.el.querySelector(".ground-sample-1");
      this.groundSample1.object3D.addEventListener("click", () => onSelectGroundSample(1));

      this.groundSample2 = this.el.querySelector(".ground-sample-2");
      this.groundSample2.object3D.addEventListener("click", () => onSelectGroundSample(2));

      this.groundSample3 = this.el.querySelector(".ground-sample-3");
      this.groundSample3.object3D.addEventListener("click", () => onSelectGroundSample(3));

      this.groundSample1.object3D.visible = false;
      this.groundSample2.object3D.visible = false;
      this.groundSample3.object3D.visible = false;


      this.multipleChoice1 = this.el.querySelector(".multiple-choice-question1");
      this.multipleChoice1.object3D.visible = false;
      //subscribe to multiple-choice:
      if(this.multipleChoice1 != null)
        this.multipleChoice.components["multiple-choice-question"].subscribe("onSubmit", this.onSubmitCallback);
      else 
        console.log("Can't subscribe to multiple-choice callbacks, multiple-choice component not found");

    },
    
  
    tick: function() {

    },

    onClickStart() {
      this.groundSample1.object3D.visible = true;
      this.groundSample2.object3D.visible = true;
      this.groundSample3.object3D.visible = true;
    },

    onSelectGroundSample(id) {
      this.multipleChoice1.object3D.visible = true;
    },

    onSubmitCallback(correctAnswer, selectedAnswer) 
    {
      if(correctAnswer == selectedAnswer)
        console.log("Correct answer submitted");
      else
        console.log("Wrong answer submitted");
    },

  });

  /* Code structure idea:
  - first-experiment.js only contains the parent of all the experiment elements and global stuff like the start-button
  - if an event is triggered (ie. click on start-button) the object(s) that are required are spawned and first-experiment subscribes to the corresponding component-script
  - now all the action related to the spawned entity/component is happening in it's own script and only after recieving a callback from the subscribed script will the first-experiment 
  script initiate the next step
  - example: the selection and display of the ground sample happens in ground-samples.js, the entity which ground-samples.js is attached to is a child of this.el. After selecting one of
  the samples a callback is sent back to first-experiment.js
  - question: should I store the files in a seperate folder, as it will be a lot of stuff?
  - question2: will spawning all the entities of the components of first experiment work?
  */
  