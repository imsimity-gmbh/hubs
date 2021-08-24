//TODO_LAURA_SOUND: import your new sounds here !
import { SOUND_MEDIA_LOADED, SOUND_ERROR_BUTTON, SOUND_SUCCESS_BUTTON } from "../systems/sound-effects-system";

import { cloneObject3D } from "../utils/three-utils";
import { loadModel } from "./gltf-model-plus";
import { waitForDOMContentLoaded } from "../utils/async-utils";
import machineModelSrc from "../assets/machine_with_animations.glb";

const machineModelPromise = waitForDOMContentLoaded().then(() => loadModel(machineModelSrc));

// not used
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
const STEP_START_CLICKED=11;
const STEP_BEFORE_06=12;
const STEP_AFTER_06=13;

const STEPS_COUNT=14;


const ANIM_05=1;
const ANIM_06=2;
const ANIM_08=3;
const ANIM_09=4;

const ANIMS=["","arbeitsraum_tuer","arbeitsraum_werkstueck","bedienfeld","antriebsraum_tuer"]

// TODO_LAURA_FAKEBUTTONS
// so far, there is only one error message, and its in english... I'm sure you could find something more clever than I did, and in german !
const ERROR_MESSAGES=[
  "", //START
  "Schalten Sie zuerst den\n Hauptschalter ein.", //1
  "Entriegeln Sie den Not-Halt.", //2
  "Schalten Sie die Steuerung an.", //3
  "Entriegeln Sie die\n Arbeitsraumschutztuer, bevor\n Sie die Tuer oeffnen.", //4
  "Oeffnen Sie die\n Arbeitsraumschutztuer um mit der\n Wartung fortzufahren.", //5
  "", 
  "Entriegeln Sie die Schutztuer.", //7
  "Drehen Sie das Bedienfeld\n um an den Antriebsraum zu\n gelangen.", //8
  "", 
  "",
  "",
  "Schalten Sie die Maschine aus,\n bevor Sie sie austauschen", 
];

const INFO_MESSAGES=[
  "", //START
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "", 
  "", 
  "", //FINISH
];

/*

Some old camera components relics

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
*/

AFRAME.registerComponent("machine-tool", {
  schema: {
    label: { default: "Maschine" },
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
      this.label.object3D.visible = false;

      this.buttons = [];
      this.fakebuttons = [];
      this.screens =[];
      this.texts =[];
      this.localAnimId = -1;


      for (let i = 0; i < STEPS_COUNT; i++) {
        this.buttons[i] = this.el.querySelector(".machine-button-" + i);
        this.fakebuttons[i] = this.el.querySelector(".machine-fakebutton-" + i);
        this.screens[i] = this.el.querySelector(".machine-screen-" + i);
        this.texts[i] = this.el.querySelector(".machine-text-" + i);

        if (this.buttons[i])
        {
          this.buttons[i].object3D.addEventListener("interact", () => this.onButtonClick(i));
        }

        if (this.fakebuttons[i])
        {
          this.fakebuttons[i].object3D.addEventListener("interact", () => this.onFakeButtonClick(i));
        }

        if (this.screens[i])
        {
          this.screens[i].object3D.addEventListener("interact", () => this.onButtonClick(i));
        }

        if (this.texts[i])
        {
          this.texts[i].object3D.addEventListener("interact", () => this.onButtonClick(i));
        }
      }

      //TODO_LAURA_TEXT
      // the texts are quite rough in the current state... I think you could do a better job that I did by checking the doc here:
      // https://aframe.io/docs/1.2.0/components/text.html
      // and updating the machine's texts html, with maybe a fixed witdh, better alignement

      this.startText = this.el.querySelector(".machine-text-start");
      this.infoText= this.el.querySelector(".machine-text-info");
      this.errorText= this.el.querySelector(".machine-text-error");
      this.endText = this.el.querySelector(".machine-text-end");
      
      
      this.startText.setAttribute("text", { value: "Im Betrieb wurde festgestellt, dass die Spannvorrichtung der Maschine nicht ordnungsgemaess funktioniert. Bauen Sie die Spannvorrichtung unter Beruecksichtigung der Sicherheitsvorschriften aus." }); 
      this.endText.setAttribute("text", { value: "Gute Arbeit. Sie haben die Spannvorrichtung erfolgreich ausgebaut." }); 


      //TODO_LAURA_TEXT
      // for debbuging, maybe comment the next line, so that the texts are not hidden when it loads ;)
      this.hideAllTexts();

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
    
    const hasAnim = this.data.stepId !== Infinity;

    if (!this.label || !this.simpleAnim) 
      return;

    const label = this.data.label;
    const stepId = this.data.stepId;

    if (label) {
      this.label.setAttribute("text", { value: label, color: "#fafafa" });
    }

    

    if (!hasAnim)
      return;
    
    if (this.localAnimId != this.data.stepId)
    {
      console.log(this.data.stepId);

      if (this.data.stepId == -1)
      {
        this.simpleAnim.resetClips();
        return;
      }

      
      if (!ANIMS[this.data.stepId] || ANIMS[this.data.stepId]=="")
        return;

      this.simpleAnim.playClip(ANIMS[this.data.stepId]);
      this.localAnimId = this.data.stepId;
    } 
    
  },

  

  tick() {

  },

  onButtonClick(id)
  {


    console.log("button click " + id);

    if (this.animating)
      return;
    
    this.hideAllTexts();

    this.deactivateAllButtons();

    this.deactivateAllScreens();

    switch (id) {
      case STEP_FINISH:
        this.playSound(SOUND_SUCCESS_BUTTON);
        this.endText.object3D.visible = false;
        this.resetAnimation();
        this.activateButton(STEP_START);
        break;
      case STEP_START:
        this.playSound(SOUND_MEDIA_LOADED);
        this.startText.object3D.visible = true;
        this.activateButton(STEP_START_CLICKED);
        this.activateScreen(STEP_START_CLICKED);
        break;
      case STEP_START_CLICKED:
        this.playSound(SOUND_SUCCESS_BUTTON);
        this.startText.object3D.visible = false;
        this.activateButton(STEP_01);
        this.activateScreen(STEP_01);
        break;
      case STEP_01:
          this.playSound(SOUND_SUCCESS_BUTTON);
          this.activateButton(STEP_02);
          break;
      case  STEP_02:
        this.playSound(SOUND_SUCCESS_BUTTON);
        this.activateButton(STEP_03);
        break;
      case STEP_03:
        this.playSound(SOUND_SUCCESS_BUTTON);
        this.activateButton(STEP_04);
        this.activateScreen(STEP_04);
        break;
      case  STEP_04:
        this.playSound(SOUND_SUCCESS_BUTTON);
        this.activateButton(STEP_05);
        break;
      case STEP_05:
        this.playSound(SOUND_SUCCESS_BUTTON);
        this.activateAnimation(ANIM_05); //this.simpleAnim.playClip(ANIM_05);
        this.animating=true;
        break;
      case  STEP_BEFORE_06:
          this.playSound(SOUND_SUCCESS_BUTTON);
          this.activateButton(STEP_06);
          break;
      case  STEP_06:
        this.playSound(SOUND_SUCCESS_BUTTON);
        this.activateAnimation(ANIM_06); //his.simpleAnim.playClip(ANIM_06);
        this.animating=true;
        break;
      case  STEP_AFTER_06:
          this.playSound(SOUND_SUCCESS_BUTTON);
          this.activateButton(STEP_07);
          break;
      case STEP_07:
          this.playSound(SOUND_SUCCESS_BUTTON);
          this.activateButton(STEP_08);
          break;
      case  STEP_08:
        this.playSound(SOUND_SUCCESS_BUTTON);
        this.activateAnimation(ANIM_08); //this.simpleAnim.playClip(ANIM_08);
        this.animating=true;
        break;
      case  STEP_09:
        this.playSound(SOUND_SUCCESS_BUTTON);
        this.activateAnimation(ANIM_09); //this.simpleAnim.playClip(ANIM_09);
        this.animating=true;
        break;
      default:
        break;
    }
  },


  activateAnimation(animId)
  {
    this.el.setAttribute("machine-tool", "stepId", animId);
  },

  resetAnimation()
  {
    this.el.setAttribute("machine-tool", "stepId", -1);
  },

  onFakeButtonClick(id)
  {
    this.hideAllTexts();

    console.log("fake button click " + id);

    if (this.animating)
      return;

    this.playErrorMessage(id);
    this.playSound(SOUND_ERROR_BUTTON);
  },

  onAnimationDone(clipName)
  {
    console.log(clipName);

    this.animating = false;

    switch (clipName) {
      case ANIMS[ANIM_05]:
        this.activateButton(STEP_BEFORE_06);
        break;
      case ANIMS[ANIM_06]:
        this.activateButton(STEP_AFTER_06);
        break;
      case ANIMS[ANIM_08]:
        this.activateButton(STEP_09);
        break;
      case ANIMS[ANIM_09]:
        this.endText.object3D.visible = true;
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

    this.fakebuttons.forEach(fb => {
      if (fb == null)
      return;

      fb.object3D.visible = false;
    });
    
  },

  activateButton(buttonId)
  { 
    if (buttonId >= this.buttons.length)
    {
      return;
    }

    var b = this.buttons[buttonId];
    var fb = this.fakebuttons[buttonId];

    // if the button does exist, we make it visible
    if (b != null)
    {
      b.object3D.visible = true;
    }

    // if there is even a fake button for this step, we display it as well
    if (fb != null)
    {
      fb.object3D.visible = true;
    }
  },

  //TODO: If we want changing screens on the machines display we need this code and entitys in hub.html (TODO_LAURA_SPRITE) - generating new spritesheets currently not possible
  deactivateAllScreens()
  { 
    this.screens.forEach(s => {

      if (s == null)
        return;

      s.object3D.visible = false;
    });

  },

  activateScreen(screenId)
  { 
    if (screenId >= this.screens.length)
    {
      return;
    }

    var s = this.screens[screenId];

    // if the screen does exist, we make it visible
    if (s != null)
    {
      s.object3D.visible = true;
    }
  },


  playSound(soundId)
  {
    const sceneEl = this.el.sceneEl;
    sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundId);
  },

  playErrorMessage(id)
  {
    // if the error message is empty, we don't display anything
    if (ERROR_MESSAGES[id] == "")
      return;

    //TODO_LAURA_SOUND maybe play an "error" sound when such button is pressed ? (ie, creating a new sound, and using the playSound() method to trigger it)
      
    var message = ERROR_MESSAGES[id];

    this.errorText.object3D.visible = true;
    this.errorText.setAttribute("text", { value: message });
  },

  // TODO_LAURA: not used yet, but if you need to display a text in white (currently), you can use this function (maybe after a button press ? who knows)
  playInfoMessage(id)
  {
    if (INFO_MESSAGES[id] == "")
      return;
   
    var message = INFO_MESSAGES[id];

    this.infoText.object3D.visible = true;
    this.infoText.setAttribute("text", { value: message });
  },

  hideAllTexts()
  {
    this.startText.object3D.visible = false;
    this.infoText.object3D.visible = false;
    this.errorText.object3D.visible = false;
    this.endText.object3D.visible = false;
  }
});
