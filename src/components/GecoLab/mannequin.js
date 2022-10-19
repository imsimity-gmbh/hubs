import { waitForDOMContentLoaded } from "../../utils/async-utils";
import { loadModel } from ".././gltf-model-plus";
import { cloneObject3D } from "../../utils/three-utils";
import { sleep } from "../../utils/async-utils";
import anime from "animejs";

import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY, MANNEQUIN_BUBBLE_LOW, MANNEQUIN_BUBBLE_HIGH, MANNEQUIN_TEXTS, MANNEQUIN_TEXTS_BUBBLES, MANNEQUIN_TEXTS_EXTRA, getExperimentDataFromParent } from "../../utils/imsimity";

import { SOUND_CHAT_MESSAGE } from "../../systems/sound-effects-system";

import robotModelSrc from "../../assets/models/GecoLab/geco_avatar.glb";


const mannequinBubbleLowPosition = new THREE.Vector3(-0.1, 0.5, -0.3);
const mannequinBubbleHighPosition = new THREE.Vector3(-1, 1.3, 0.15);

const robotModelPromise = waitForDOMContentLoaded().then(() => loadModel(robotModelSrc));

AFRAME.registerComponent("mannequin", {
    schema: {
    },

    init: function() {
        
        this.mannequin = this.el.querySelector(".mannequin-model");
        this.textBox = this.el.querySelector(".mannequin-textbox");
        this.textInput = this.el.querySelector(".mannequin-text");

        this.textBox.object3D.visible = false;

        this.mannequinManager = this.el.sceneEl.systems["mannequin-manager"];
        
        this.moreButton = this.el.querySelector(".mannequin-moreinfo");
        this.moreButton.object3D.addEventListener("interact", () => this.displayMore());

        this.moreButtonText = this.el.querySelector('.mannequin-moreinfo-text')

        this.currentTextId = -1;
        this.showingMore = false;

        robotModelPromise.then(model => {

            const mesh = cloneObject3D(model.scene);
            mesh.scale.set(0.5, 0.5, 0.5);
            mesh.matrixNeedsUpdate = true;
            this.mannequin.setObject3D("mesh", mesh);
      
            this.mannequin.object3D.visible = true;
            this.mannequin.object3D.scale.set(1.0, 1.0, 1.0);
            this.mannequin.object3D.matrixNeedsUpdate = true;
            
            this.mannequin.setAttribute("animation-mixer", {});
            this.mannequin.components["animation-mixer"].initMixer(mesh.animations);
      
            this.simpleAnim = this.mannequin.components["simple-animation"];
            this.simpleAnim.playClip("Key|Take 001|BaseLayer", true);
            this.simpleAnim.printAnimations();
        
        });

        setTimeout(() => {

            this.experimentData = getExperimentDataFromParent(this.el);

            console.log(this.experimentData);

            this.mannequinManager.register(this.el, this.experimentData);

        }, IMSIMITY_INIT_DELAY);
    },



    displayMessage: async function(textId)
    {
        if(textId >= 0)
            this.displayMessageCoroutine(textId);
        else{
            this.textBox.object3D.visible = false;
            this.playSound(SOUND_CHAT_MESSAGE);
        }
    },

    displayMessageCoroutine :  async function(textId)
    {
        var position = MANNEQUIN_TEXTS_BUBBLES[textId];
        var text = MANNEQUIN_TEXTS[textId];

        this.showingMore = false;

        // Only Show "More" button if there is more information available
        var moreInfoTextAvailable = MANNEQUIN_TEXTS_EXTRA[textId] != "";
        this.moreButton.object3D.visible = moreInfoTextAvailable;
        this.moreButtonText.setAttribute("text", { value: "Tipp"});

        this.currentTextId = textId;

        //TODO: Move the Bubble
        if (position == MANNEQUIN_BUBBLE_LOW)
        {
            this.textBox.setAttribute("position", {x: mannequinBubbleLowPosition.x, y: mannequinBubbleLowPosition.y, z: mannequinBubbleLowPosition.z});
        }
        else if (position == MANNEQUIN_BUBBLE_HIGH)
        {
            this.textBox.setAttribute("position", {x: mannequinBubbleHighPosition.x, y: mannequinBubbleHighPosition.y, z: mannequinBubbleHighPosition.z});
        }

        //TODO: Animate the bubble 
        this.playSound(SOUND_CHAT_MESSAGE);

        // Show the text
        this.textBox.object3D.visible = true;
        this.textInput.setAttribute("text", { value: text });
    },

    displayMore : function()
    {
        this.showingMore = !this.showingMore;

        var text = (this.showingMore == true) ? MANNEQUIN_TEXTS_EXTRA[this.currentTextId] : MANNEQUIN_TEXTS[this.currentTextId];

        var buttonText = (this.showingMore == true) ? "Weniger" : "Tipp";
        
        this.moreButtonText.setAttribute("text", { value: buttonText});

        this.textInput.setAttribute("text", { value: text });
    },


    playSound(soundId)
    {
      const sceneEl = this.el.sceneEl;
      sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundId);
    },

    remove()
    {
        console.log("removing mannequin");
        this.mannequinManager.deregister(this.el, this.experimentData);
    }
});