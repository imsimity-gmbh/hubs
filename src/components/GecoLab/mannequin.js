import { waitForDOMContentLoaded } from "../../utils/async-utils";
import { loadModel } from ".././gltf-model-plus";
import { cloneObject3D } from "../../utils/three-utils";
import { sleep } from "../../utils/async-utils";
import anime from "animejs";

import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY, MANNEQUIN_BUBBLE_LOW, MANNEQUIN_BUBBLE_HIGH } from "../../utils/imsimity";

import { SOUND_CHAT_MESSAGE } from "../../systems/sound-effects-system";

import robotModelSrc from "../../assets/robot.glb";


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
        this.mannequinManager.register(this.el);

        this.isSpeaking = false;
        
        robotModelPromise.then(model => {
            const mesh = cloneObject3D(model.scene);
            mesh.scale.set(1.75, 1.75, 1.75);
            mesh.matrixNeedsUpdate = true;
            this.mannequin.setObject3D("mesh", mesh);
      
            this.mannequin.object3D.visible = true;
            this.mannequin.object3D.scale.set(1.0, 1.0, 1.0);
            this.mannequin.object3D.matrixNeedsUpdate = true;
            
            this.mannequin.setAttribute("animation-mixer", {});
            this.mannequin.components["animation-mixer"].initMixer(mesh.animations);
      
            this.simpleAnim = this.mannequin.components["simple-animation"];
            this.simpleAnim.printAnimations();
        });
    },



    displayMessage: async function(text, duration = 10.0, position = 0)
    {
        if (!this.isSpeaking)
        {
            this.displayMessageCoroutine(text, duration, position)
            return;
        }
        else
        {
            // Wait 200 ms and try again
            await sleep(200);

            this.displayMessage(text, duration, position);
        }
    },

    displayMessageCoroutine :  async function(text, duration, position)
    {
        this.isSpeaking = true;

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
        this.simpleAnim.playClip("robotAction", true);

        // Show the text
        this.textBox.object3D.visible = true;
        this.textInput.setAttribute("text", { value: text });

        // Wait for the delay
        await sleep(1000 * duration);

        // Remove the text
        this.textBox.object3D.visible = false;
        
        
        this.simpleAnim.resetClips();
        //TODO: Animate back the bubble
        this.playSound(SOUND_CHAT_MESSAGE);


        this.isSpeaking = false;
    },

    playSound(soundId)
    {
      const sceneEl = this.el.sceneEl;
      sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundId);
    },
});