import "./utils/configs";
import { getAbsoluteHref } from "./utils/media-url-utils";
import { isValidSceneUrl } from "./utils/scene-url-utils";
import { spawnChatMessage } from "./react-components/chat-message";
import { SOUND_CHAT_MESSAGE, SOUND_QUACK, SOUND_SPECIAL_QUACK } from "./systems/sound-effects-system";
import ducky from "./assets/models/DuckyMesh.glb";
import { EventTarget } from "event-target-shim";
import { ExitReason } from "./react-components/room/ExitedRoomScreen";
import { LogMessageType } from "./react-components/room/ChatSidebar";

import configs from "./utils/configs";
import { THREE } from "aframe";
import robotSystem from "./systems/robot-tools";


const DIALOGFLOW_SERVER_URL = "https://cybercinity-bot.herokuapp.com/";
const DIALOGFLOW_REQUEST_URL = DIALOGFLOW_SERVER_URL + "api/v1/bot";
const DIALOGFLOW_REQUEST_AUDIO_URL = DIALOGFLOW_SERVER_URL + "api/v1/audio";

var MIME_TYPE_AUDIO  =  "";
const CHUNK_LENGTH = 1800;

let uiRoot;


function randomString(len) {
  const p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return [...Array(len)].reduce(a => a + p[~~(Math.random() * p.length)], "");
}

// Handles user-entered messages
export default class MessageDispatch extends EventTarget {
  constructor(scene, entryManager, hubChannel, remountUI, mediaSearchStore) {
    super();
    this.scene = scene;
    this.entryManager = entryManager;
    this.hubChannel = hubChannel;
    this.remountUI = remountUI;
    this.mediaSearchStore = mediaSearchStore;
    this.presenceLogEntries = [];
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.reader = null;
    this.sessionId = randomString(10);
  }

  addToPresenceLog(entry) {
    entry.key = Date.now().toString();

    this.presenceLogEntries.push(entry);
    this.remountUI({ presenceLogEntries: this.presenceLogEntries });
    if (entry.type === "chat" && this.scene.is("loaded")) {
      this.scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_CHAT_MESSAGE);
    }

    // Fade out and then remove
    setTimeout(() => {
      entry.expired = true;
      this.remountUI({ presenceLogEntries: this.presenceLogEntries });

      setTimeout(() => {
        this.presenceLogEntries.splice(this.presenceLogEntries.indexOf(entry), 1);
        this.remountUI({ presenceLogEntries: this.presenceLogEntries });
      }, 5000);
    }, 20000);
  }

  receive(message) {
    this.addToPresenceLog(message);
    this.dispatchEvent(new CustomEvent("message", { detail: message }));
  }

  log = (messageType, props) => {
    this.receive({ type: "log", messageType, props });
  };

  dispatch = message => {
    if (message.startsWith("/")) {
      const commandParts = message.substring(1).split(/\s+/);
      this.dispatchCommand(commandParts[0], ...commandParts.slice(1));

      document.activeElement.blur(); // Commands should blur
    } 
    else if (message.startsWith("@bot ")) {

      var query = {};
      query.text = message.substring(5);

      this.dispatchBot(query);

      document.activeElement.blur(); // Commands should blur
    }
    else if (message.startsWith("@botstart"))
    {
      this.startRecord();

      document.activeElement.blur(); // Commands should blur
    }
    else if (message.startsWith("@botstop"))
    {
      this.stopRecord();

      document.activeElement.blur(); // Commands should blur
    }  else if (message.startsWith("@teleport ")) {
      const commandParts = message.substring(10).split(/\s+/);
      const url = commandParts[0];

      this.dispatchTeleport(url);
    } else if (message.startsWith("@prof ")) {

      var question = {};

      var gecolabManager = this.scene.systems["gecolab-manager"];

      if (!gecolabManager.isInit())
      {
        console.log("Can not send prof question, Gecolab Manager is not initialized");
        return;
      }

      question.text = message.substring(6);
      question.sender = "unknown";

      if (gecolabManager.isStudent())
      {
        question.sender = gecolabManager.getStudent().firstname + " " +  gecolabManager.getStudent().lastname;
      }
      else if (gecolabManager.isTeacher())
      {
        question.sender = gecolabManager.getTeacher().firstname + " " +  gecolabManager.getTeacher().lastname;
      }

      this.dispatchProfQuestion(question);
    }
    else {
      this.hubChannel.sendMessage(message);
    }
  };

  dispatchCommand = async (command, ...args) => {
    const entered = this.scene.is("entered");
    uiRoot = uiRoot || document.getElementById("ui-root");
    const isGhost = !entered && uiRoot && uiRoot.firstChild && uiRoot.firstChild.classList.contains("isGhost");

    // TODO: Some of the commands below should be available without requiring
    //       room entry. For example, audiomode should not require room entry.
    if (!entered && (!isGhost || command === "duck")) {
      this.log(LogMessageType.roomEntryRequired);
      return;
    }

    const avatarRig = document.querySelector("#avatar-rig");
    const scales = [0.0625, 0.125, 0.25, 0.5, 1.0, 1.5, 3, 5, 7.5, 12.5];
    const curScale = avatarRig.object3D.scale;
    let err;
    let physicsSystem;
    const captureSystem = this.scene.systems["capture-system"];

    switch (command) {
      case "fly":
        if (this.scene.systems["hubs-systems"].characterController.fly) {
          this.scene.systems["hubs-systems"].characterController.enableFly(false);
          this.log(LogMessageType.flyModeDisabled);
        } else {
          if (this.scene.systems["hubs-systems"].characterController.enableFly(true)) {
            this.log(LogMessageType.flyModeEnabled);
          }
        }
        break;
      case "grow":
        for (let i = 0; i < scales.length; i++) {
          if (scales[i] > curScale.x) {
            avatarRig.object3D.scale.set(scales[i], scales[i], scales[i]);
            avatarRig.object3D.matrixNeedsUpdate = true;
            break;
          }
        }

        break;
      case "shrink":
        for (let i = scales.length - 1; i >= 0; i--) {
          if (curScale.x > scales[i]) {
            avatarRig.object3D.scale.set(scales[i], scales[i], scales[i]);
            avatarRig.object3D.matrixNeedsUpdate = true;
            break;
          }
        }

        break;
      case "leave":
        this.entryManager.exitScene();
        this.remountUI({ roomUnavailableReason: ExitReason.left });
        break;
      case "duck":
        spawnChatMessage(getAbsoluteHref(location.href, ducky));
        if (Math.random() < 0.01) {
          this.scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_SPECIAL_QUACK);
        } else {
          this.scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_QUACK);
        }
        break;
      case "debug":
        physicsSystem = document.querySelector("a-scene").systems["hubs-systems"].physicsSystem;
        physicsSystem.setDebug(!physicsSystem.debugEnabled);
        break;
      case "vrstats":
        document.getElementById("stats").components["stats-plus"].toggleVRStats();
        break;
      case "scene":
        if (args[0]) {
          if (await isValidSceneUrl(args[0])) {
            err = this.hubChannel.updateScene(args[0]);
            if (err === "unauthorized") {
              this.log(LogMessageType.unauthorizedSceneChange);
            }
          } else {
            this.log(LogMessageType.inalidSceneUrl);
          }
        } else if (this.hubChannel.canOrWillIfCreator("update_hub")) {
          this.mediaSearchStore.sourceNavigateWithNoNav("scenes", "use");
        }

        break;
      case "rename":
        err = this.hubChannel.rename(args.join(" "));
        if (err === "unauthorized") {
          this.log(LogMessageType.unauthorizedRoomRename);
        }
        break;
      case "capture":
        if (!captureSystem.available()) {
          this.log(LogMessageType.captureUnavailable);
          break;
        }
        if (args[0] === "stop") {
          if (captureSystem.started()) {
            captureSystem.stop();
            this.log(LogMessageType.captureStopped);
          } else {
            this.log(LogMessageType.captureAlreadyStopped);
          }
        } else {
          if (captureSystem.started()) {
            this.log(LogMessageType.captureAlreadyRunning);
          } else {
            captureSystem.start();
            this.log(LogMessageType.captureStarted);
          }
        }
        break;
      case "audiomode":
        {
          const shouldEnablePositionalAudio = window.APP.store.state.preferences.audioOutputMode === "audio";
          window.APP.store.update({
            // TODO: This should probably just be a boolean to disable panner node settings
            // and even if it's not, "audio" is a weird name for the "audioOutputMode" that means
            // "stereo" / "not panner".
            preferences: { audioOutputMode: shouldEnablePositionalAudio ? "panner" : "audio" }
          });
          // TODO: The user message here is a little suspicious. We might be ignoring the
          // user preference (e.g. if panner nodes are broken in safari, then we never create
          // panner nodes, regardless of user preference.)
          // Warning: This comment may be out of date when you read it.
          this.log(
            shouldEnablePositionalAudio ? LogMessageType.positionalAudioEnabled : LogMessageType.positionalAudioDisabled
          );
        }
        break;
      case "audioNormalization":
        {
          if (args.length === 1) {
            const factor = Number(args[0]);
            if (!isNaN(factor)) {
              const effectiveFactor = Math.max(0.0, Math.min(255.0, factor));
              window.APP.store.update({
                preferences: { audioNormalization: effectiveFactor }
              });
              if (factor) {
                this.log(LogMessageType.setAudioNormalizationFactor, { factor: effectiveFactor });
              } else {
                this.log(LogMessageType.audioNormalizationDisabled);
              }
            } else {
              this.log(LogMessageType.audioNormalizationNaN);
            }
          } else {
            this.log(LogMessageType.invalidAudioNormalizationRange);
          }
        }
        break;
    }
  };

  startRecord = async () => 
  {
    console.log("Starting Recording");

    const stream = await navigator.mediaDevices.getUserMedia({audio:true});

    this.mediaRecorder = new MediaRecorder(stream, {mimeType: MIME_TYPE_AUDIO, audioBitsPerSecond: 16000});
    
    this.recordedChunks = [];

    this.mediaRecorder.ondataavailable = this.handleAudioData;
    this.mediaRecorder.onstop = this.handleRecorderStopped;
    this.mediaRecorder.onstart = this.handleRecorderStarted;

    this.mediaRecorder.start();
  }

  dispatchTeleport = async (url) => {

    const isAdmin = configs.isAdmin();


    if (!((url.startsWith("http:") || url.startsWith("https:"))))
    {
      console.log(url + " isn't a correct URL to redirect to");
      return;
    }
    
    if (!isAdmin)
    {
      console.log("This command is only available for Admins...");
      return;
    }

    console.log("Teleporting to " + url);

    this.hubChannel.sendMessage(url, "teleport");
  }

  dispatchProfQuestion = async (question) => {

    console.log(question);

    
  }


  handleAudioData = (event) => 
  {
    console.log("recieved data");
    if (event.data.size  > 0)
      this.recordedChunks.push(event.data);
  }

  handleRecorderStarted = () => {
    
    this.receive({name: "You to CyberBock", type: "chat", body:'🦌🤖❓', sent: true ,sessionId :"bot_question" });

  };

  handleRecorderStopped = () => {
    

    console.log(this.recordedChunks)

    this.reader = new FileReader();

    var blob = new Blob(this.recordedChunks, {
      type: MIME_TYPE_AUDIO
    });

    this.reader.onload = this.onSoundRead;

    this.reader.readAsDataURL(blob); // converts the blob to base64 and calls onload

    

  };

  onSoundRead = () => 
  {
    
    this.receive({name: "You to CyberBock", type: "chat", body:'🦌🤖💬', sent: true ,sessionId :"bot_question" });

    this.dispatchBot({inputAudio:  this.reader.result});
  }

  stopRecord = () => 
  {
    console.log("Stoping Recording");

    if (this.mediaRecorder != null)
    {
      this.mediaRecorder.stop();
    }
  }


  dispatchBot = async (query) => {
 
    const audioListener = this.scene.audioListener;
    

    console.log("User asked for " + query);

    // TODO: Fix sessionID for logged out users
    const sessionId = this.sessionId;
    const audioId = randomString(10);


    var url = `https://${configs.CORS_PROXY_SERVER}/${DIALOGFLOW_REQUEST_URL}?sessionId=${sessionId}`;

    //body.sessionId = sessionId;

    
    if (query.text != undefined)
    {
      //body.text = query.text;

      url += `&text=${encodeURIComponent(query.text)}`;

      const fixedQuery = `${query.text}`;

      // TODO: Localize to different language
      this.receive({name: "You to CyberBock", type: "chat", body:fixedQuery, sent: true ,sessionId :"bot_question" });
    }

    if (query.inputAudio != undefined)
    {
      //body.inputAudio = query.inputAudio;
      url += "&audioId=" + audioId;


      // Send audio Chunks to the server
      let chunkCount = Math.floor(query.inputAudio.length / CHUNK_LENGTH);
      let audioUrl = `https://${configs.CORS_PROXY_SERVER}/${DIALOGFLOW_REQUEST_AUDIO_URL}?audioId=${audioId}&chunkCount=${chunkCount}`;

      for (let i = 0; i < chunkCount; i++)
      {
        let chunk = query.inputAudio.slice(i * CHUNK_LENGTH, (i + 1) * CHUNK_LENGTH);

        const r = await (await fetch(audioUrl + "&chunkId="+ i + "&audioBytes=" + encodeURIComponent(chunk)));

        console.log("Chunk " + i + "/"+ chunkCount + ", " + r.status);

      }

    }
    

    const response = await (await fetch(url)).json();
    
    console.log(response);

    for (var i = 0; i < response.queryResult.fulfillmentMessages.length; i++)
    {
      // Add a delay (async or setTimeout())
      const message = response.queryResult.fulfillmentMessages[i];
      var text = "";

      if (message.message === "simpleResponses")
      {
        text = message.simpleResponses.simpleResponses[0].displayText;
      }
       
      
      if (text != "")
        this.speakChatbot(text, "bot_answer");
    }
    const audioData = response.outputAudio.data;  
    
    const audio = new THREE.Audio(audioListener);    
    const audioContext = THREE.AudioContext.getContext();
    
    var buffer = new Uint8Array( audioData.length );
    buffer.set( new Uint8Array(audioData), 0 );

    audioContext.decodeAudioData(buffer.buffer, function(audioBuffer) {

      audio.buffer = audioBuffer;
      audio.setLoop(false);
      audio.setVolume(0.5);
      audio.play();

    });
    
    
  };

  speakChatbot = (text, sessionId) =>
  {
    this.receive({ name:"CyberBock", type: "chat", body:text, sent: false , sessionId :sessionId});
    
    if (this.scene.systems["robot-tools"].getMyRobot())
    {
      let robotTool = this.scene.systems["robot-tools"].getMyRobot();

      robotTool.components["robot-tool"].onSpeakStarted(text);
    }
  }
}
