export function isNullUndefinedOrEmpty(value) { 
  return (value == null || value == undefined || value == "");
}

export const redirectTo = url =>  
{
  console.log("Redirecting");
  console.log(url);

  if (typeof document !== "undefined") {
    document.location.replace(url);
  }
}
  
export var HEROKU_UPLOAD_URI = "https://gecolab-dashboard.herokuapp.com/api/v1/upload";

export var HEROKU_POST_UPLOAD_URI = "https://gecolab-dashboard.herokuapp.com/api/v1/post/upload";

export var HEROKU_DELETE_UPLOAD_URI = "https://gecolab-dashboard.herokuapp.com/api/v1/delete/upload";

export var IMSIMITY_INIT_DELAY = 500;

export var MANNEQUIN_BUBBLE_LOW = 0;
export var MANNEQUIN_BUBBLE_HIGH = 1;


function createId(length) {
  var result           = '';
  var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function userFromPresence(id, presence, mySessionId) 
{
  const meta = presence.metas[presence.metas.length - 1];
  
  return { id: id, isMe: mySessionId === id, ...meta };
}

function formatUserArray(users)
{
  var arr = [];

  for(var i = 0; i < users.length; i++)
  {
    if(users[i].presence == "room")
    {
      var data = {
        label: users[i].profile.displayName,
        value: {
          context: users[i].context,
          id: users[i].id,
          isMe: users[i].isMe,
          profile: users[i].profile,
        }
      }

      arr.push(data);
    }
  }

  return arr;
}




export function encodeNetworkId(part, groupCode, position)
{
  return part + "-" + groupCode + "-" + position + "-" + createId(7);
}

export function decodeNetworkId(networkId)
{
  var params = networkId.split("-");
  var data = {};

  data.part = params[0];
  data.groupCode = params[1];
  data.position = params[2];
  data.id = params[3];

  return data;
}

export function getNetworkIdFromEl(el)
{
  var networked = el.components["networked"];

  if (networked == null)
  {
    console.error("networked is undefined for " + el.localName);
    return "";
  }

  return networked.data.networkId;
}


// a parent searching function, to figure out what's our closest first-experiment-0X, and return the groupCode from this one
export function getGroupCodeFromParent(entity)
{
  var data = getExperimentDataFromParent(entity);

  if (data == null)
    return null;

  return data.groupCode;
}

export function spawnOrDeleteExperiment(position, groupCode, scene)
{
  console.log("Spawning or Deleting Experiment for positon " + position);
  if (position === "position_01") {
    scene.emit("action_toggle_first_experiment_01", groupCode);
    scene.emit("action_toggle_first_experiment_01_start", groupCode);
  }
  else if (position === "position_02") {
    scene.emit("action_toggle_first_experiment_02", groupCode);
    scene.emit("action_toggle_first_experiment_02_start", groupCode);
  }
}

export function getUsersFromPresences(presences, sessionId)
{
  var users = Object.entries(presences).map(([id, presence]) => {
    return userFromPresence(id, presence, sessionId);
  });

  users = formatUserArray(users);

  return users;
}

export function getExperimentDataFromParent(entity)
{
  var parent = null;


  parent = entity.closest('#first-experiment-wrapper');

  if (parent != null)
  {
    return parent.components['first-experiment'].experimentData;
  }

  parent = entity.closest('#first-experiment-01-wrapper');

  if (parent != null)
  {
    return parent.components['first-experiment-01'].experimentData;
  }

  parent = entity.closest('#first-experiment-02-wrapper');

  if (parent != null)
  {
    return parent.components['first-experiment-02'].experimentData;
  }

  parent = entity.closest('#first-experiment-03-wrapper');

  if (parent != null)
  {
    return parent.components['first-experiment-03'].experimentData;
  }

  parent = entity.closest('#first-experiment-04-wrapper');

  if (parent != null)
  {
    return parent.components['first-experiment-04'].experimentData;
  }

  parent = entity.closest('#first-experiment-05-wrapper');

  if (parent != null)
  {
    return parent.components['first-experiment-05'].experimentData;
  }

  parent = entity.closest('#first-experiment-06-wrapper');

  if (parent != null)
  {
    return parent.components['first-experiment-06'].experimentData;
  }


  return null;
}

export var MANNEQUIN_TEXTS = [
  "Um mit dem Experiment zu starten, musste du alle Materialien an der richtigen Stelle positionieren. Dafür musst du die Gegenstände greifen und zu dem blauen Hologramm ziehen. Wenn das Hologramm grün ist, kannst du deinen Gegenstand loslassen und den nächsten Gegenstand greifen.",
  "Als erstes musst du die Probe kräftig zerkleinern.",
  "Als nächstes musst du deine gemörserte Probe in die Schale einwiegen. Dafür musst du deinen Löffel zunächst im Mörser positionieren. Platziere die Waage auf der angezeigten Stelle auf deinem Tisch. Notiere das Gewicht vom Mörser in deinem Notizbuch!",
  "Denk daran deine Waage immer erst auf null zu setzen.",
  "Fülle nun genau 50g deiner Bodenprobe in den Mörser auf der Waage.",
  "Super! Wenn du den Mörser positioniert hast, zündest du den Bunsenbrenner mit dem Feuerzeug an, legst das Feuerzeug wieder zurück und wählst die Stärke der Flamme. Wenn du mit Feuer arbeitest, musst du die richtigen Handschuhe anziehen.",
  "Sobald du den Bunsenbrenner angedreht hast, läuft die Zeit.",
  "Rühre die Probe mit dem Glasstab um.",
  "Ich denke, es ist an der Zeit die Temperatur zu messen. Entferne zuerst den Glasstab aus dem Mörser und leg ihn zurück auf die Arbeitsfläche.",
  "Denk daran die Probe regelmäßig umzurühren!",
  "Denk auch daran, dass du die Temperatur messen solltest, um zu kontrollieren, dass die Probe nicht zu heiß ist. Sollte die Temperatur über 500°C liegen musst du den Bunsenbrenner nach unten drehen. Leg das Thermometer wieder auf der Arbeitsfläche ab und rühr die Probe noch einmal mit dem Glasstab um.",
  "Und schon bist du fertig. Dreh den Bunsenbrenner herunter und stell die Schale mit Hilfe der Tiegelzange auf den anderen Dreifuß und leg die Tiegelzange wieder ab. Jetzt musst du 20 Minuten warten, damit die Bodenprobe abkühlen kann.",
  "Nach dem Abkühlen muss die Probe erneut ausgewogen werden, um die Gewichtsdifferenz zu errechnen.",
  "Setze deine notierten Werte in die Formel ein.",
  "Schau dir die Steckbriefe zu deinem gewählten Ort an und versuche Erklärungen für deinen berechneten Humusgehalt zu finden!",
  "Das hast du wirklich super gemacht! Das Experiment Humusglühen ist jetzt beendet. Begib dich nun wieder in den Eingangsbereich. Schau dir die Steckbriefe zu deinem gewählten Ort an und versuche Erklärungen für deinen berechneten Humusgehalt zu finden!",
  "Wenn man den Humusgehalt eines Bodens im Gelände bestimmen will, kann man ihn mit Hilfe einer Farbskala bewerten. Im Labor ist noch eine genauere Methode möglich.",
  "Jetzt kannst du dich noch entscheiden, welchen Standort du näher untersuchen möchtest.",
  "Dies ist die falsche Antwort",
  "Hi! Schön, dass du den Weg in unser virtuelles Lehr-Lern-Labor gefunden hast. Ich bin die Laborleitung und werde dir durch meine Anleitung helfen das Experiment Humusglühen durchzuführen. An einigen Stellen wirst du den Button „Tipp“ sehen, der dir weitere Hilfestellungen geben wird.",
]


export var MANNEQUIN_TEXTS_EXTRA = [
  "",
  "Stelle den Mörser und Stößel auf das Hologramm. Du kannst erst mit der Probe weitermachen, wenn die Probe ganz fein ist und sich keine groben Partikel mehr darin befinden! Diese würden das Ergebnis verfälschen.",
  "Platziere die Waage auf der angezeigten Stelle auf deinem Tisch. Notiere das Gewicht vom Mörser in deinem Notizbuch.",
  "Dafür musst du die Taste „TARA“ drücken.",
  "Notiere das Gewicht in deinem Notizbuch.",
  "",
  "",
  "Haltet den Button 'Rühren' gedrückt, um den Humus gleichmäßig zu erhitzen.",
  "Stelle das Thermometer in den Mörser und achte auf die Temperatur. Lege das Thermometer anschließend wieder auf die Arbeitsfläche.",
  "Haltet den Button 'Rühren' gedrückt, um den Humus gleichmäßig zu erhitzen.",
  "",
  "",
  "Nimm die Schale mit der Tiegelzange und stell sie auf die Waage. Lies das Gewicht ab und notiere es in deinem Notizbuch.",
  "",
  "",
  "",
  "Mithilfe eines Bunsenbrenners wird die Bodenprobe für 25 Minuten erhitzt. Humus besteht aus abgestorbenen pflanzlichen und tierischen Stoffen und ist brennbar. Durch das Ausglühen kann über den Gewichtsverlust der prozentualen Humusgehalt der Probe berechnet werden. Und genau das werden wir jetzt im Labor machen!\n      ",
  "",
  "",
  "",
]

export var MANNEQUIN_TEXTS_BUBBLES = [
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_HIGH,
  MANNEQUIN_BUBBLE_LOW,
  MANNEQUIN_BUBBLE_HIGH,
  
]

