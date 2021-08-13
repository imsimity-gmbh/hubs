//TODO_LAURA_SOUND: import your new sounds here !
import { SOUND_MEDIA_LOADED /*, SOUND_MY_SOUND */ } from "../systems/sound-effects-system";

import { cloneObject3D } from "../utils/three-utils";
import { loadModel } from "./gltf-model-plus";
import { waitForDOMContentLoaded } from "../utils/async-utils";
import machineModelSrc from "../assets/machine_with_animations.glb";

const machineModelPromise = waitForDOMContentLoaded().then(() => loadModel(machineModelSrc));

const ANIM_NAMES=[
  "doppeltuer_rechts",
  "doppeltuer_links",
  "arbeitsraum_werkstueck",
  "energiecontainer_tuer",
  "schiebetuer_rechts_02",
  "schiebetuer_links_01",
  "schiebetuer_02",
  "energiecontainer_schiebetuer",
  "antriebsraum_tuer_02",
  "arbeitsraum_tuer",
  "antriebsraum_tuer", 
  "bedienfeld"
  ];

const STEP_START=0;
const STEP_01=1;  //Hauptschalter
const STEP_02=2;  //Not-Halt entriegeln
const STEP_03=3;  //Steurung an 
const STEP_04=4;  //Entriegeld Arbeitsraum
const STEP_05=5;  //Öffnen Arbeitsraumtür
const STEP_06=6;  //Defektes Teil austauschen
const STEP_07=7;  //Entriegeln Schutztür 
const STEP_08=8;  //Bedienfeld um 90 grad
const STEP_09=9;  //Antriebraum öffnen
const STEP_FINISH=10;

const STEPS_COUNT=11;


const ANIM_05="arbeitsraum_tuer";
const ANIM_06="arbeitsraum_werkstueck";
const ANIM_08="bedienfeld";
const ANIM_09="antriebsraum_tuer";



const isMobileVR = AFRAME.utils.device.isMobileVR();

const VIEWFINDER_FPS = 6;
const VIDEO_FPS = 25;
// Prefer h264 if available due to faster decoding speec on most platforms
const videoCodec = ["h264", "vp9,opus", "vp8,opus", "vp9", "vp8"].find(
  codec => window.MediaRecorder && MediaRecorder.isTypeSupported(`video/webm; codecs=${codec}`)
);
const videoMimeType = videoCodec ? `video/webm; codecs=${videoCodec}` : null;
const hasWebGL2 = !!document.createElement("canvas").getContext("webgl2");
const allowVideo = !!videoMimeType && hasWebGL2;


AFRAME.registerComponent("machine-tool", {
  schema: {
    label: { default: "Machine" },
    stepId: { default: 0 },
  },

  init() {

    this.animating = false;
    this.el.object3D.visible = false; // Make invisible until model ready
    this.lastUpdate = performance.now();
    this.localSnapCount = 0; // Counter that is used to arrange photos/videos

   
    this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
    this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

    machineModelPromise.then(model => {
      const mesh = cloneObject3D(model.scene);
      mesh.scale.set(1, 1, 1);
      mesh.matrixNeedsUpdate = true;
      this.el.setObject3D("mesh", mesh);

      this.el.object3D.visible = true;
      this.el.object3D.scale.set(1.0, 1.0, 1.0);
      this.el.object3D.matrixNeedsUpdate = true;

      
      this.el.setAttribute("animation-mixer", {});
      this.el.components["animation-mixer"].initMixer(mesh.animations);

      this.simpleAnim = this.el.components["simple-animation"];
      this.simpleAnim.printAnimations();

      // Callback for when the animation is done
      this.simpleAnim.initFinishedCallback((e) => { this.onAnimationDone(e.action._clip.name);});
      
      this.label = this.el.querySelector(".label");
      this.label.object3D.visible = true;

      this.buttons = [];

      for (let i = 0; i < STEPS_COUNT; i++) {
        this.buttons[i] = this.el.querySelector(".machine-button-" + i);

        if (this.buttons[i])
        {
          this.buttons[i].object3D.addEventListener("interact", () => this.onButtonClick(i));
        }
      }

      //console.log(this.buttons);

      this.deactivateAllButtons();
      this.activateButton(STEP_START);

      this.updateUI();

      this.machineSystem = this.el.sceneEl.systems["machine-tools"];
      this.machineSystem.register(this.el);

    });
  },

  remove() {
    this.machineSystem.deregister(this.el);
  },

  
  
  update() {
    this.updateUI();
  },

  updateUI() {
    if (!this.label) return;

    const label = this.data.label;
    const stepId = this.data.stepId;

    if (label) {
      this.label.setAttribute("text", { value: label, color: "#fafafa" });
    }

    if (this.data.stepId)
    {

    }
  },

  

  tick() {

  },

  onButtonClick(id)
  {

    console.log("button click " + id);

    if (this.animating)
      return;

    
    this.deactivateAllButtons();

    switch (id) {
      case STEP_FINISH:
        this.simpleAnim.resetClips();
        this.activateButton(STEP_START);
        break;
      case STEP_START:
        this.playSound(SOUND_MEDIA_LOADED);
        this.activateButton(STEP_01);
        break;
      case STEP_01:
          this.activateButton(STEP_02);
          break;
      case  STEP_02:
        this.activateButton(STEP_03);
        break;
      case STEP_03:
        this.activateButton(STEP_04);
        break;
      case  STEP_04:
        this.activateButton(STEP_05);
        break;
      case STEP_05:
        this.simpleAnim.playClip(ANIM_05);
        this.animating=true;
        break;
      case  STEP_06:
        this.simpleAnim.playClip(ANIM_06);
        this.animating=true;
        break;
      case STEP_07:
          this.activateButton(STEP_08);
          break;
      case  STEP_08:
        this.simpleAnim.playClip(ANIM_08);
        this.animating=true;
        break;
      case  STEP_09:
        this.simpleAnim.playClip(ANIM_09);
        this.animating=true;
        break;
      default:
        break;
    }
  },

  onAnimationDone(clipName)
  {
    console.log(clipName);

    this.animating = false;

    switch (clipName) {
      case ANIM_05:
        this.activateButton(STEP_06);
        break;
      case ANIM_06:
        this.activateButton(STEP_07);
        break;
      case ANIM_08:
        this.activateButton(STEP_09);
        break;
      case ANIM_09:
        this.activateButton(STEP_FINISH);
        break;
    
      default:
        break;
    }

  },

  deactivateAllButtons()
  { 
    this.buttons.forEach(b => {

      if (b == null)
        return;

      b.object3D.visible = false;
    });
    
  },

  activateButton(buttonId)
  { 
    if (buttonId >= this.buttons.length)
    {
      return;
    }

    var b = this.buttons[buttonId];

    if (b != null)
    {
      b.object3D.visible = true;
    }
  },


  playSound(soundId)
  {
    const sceneEl = this.el.sceneEl;
    sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundId);
  }
});
