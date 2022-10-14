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






export var MANNEQUIN_TEXTS = [
  "Um mit dem Experiment zu starten, musst du alle Materialien auf die richtige Stelle auf\n deinem Arbeitsplatz stellen.",
  "Als erstes musst du die Probe kräftig zerkleinern.",
  "Als nächstes musst du deine gemörserte Probe in die Schale einwiegen.",
  "Denk daran deine Waage immer erst auf null zu setzen.",
  "Fülle nun genau 50g deiner Bodenprobe in den Mörser auf der Waage.",
  "Super! Wenn du den Mörser positioniert hast, zündest du den Bunsenbrenner mit\n dem Feuerzeug an und wählst die Stärke der Flamme. Wenn du mit Feuer arbeitest,\n musst du die richtigen Handschuhe anziehen.",
  "Sobald du den Bunsenbrenner angedreht hast, läuft die Zeit.",
  "Rühre die Probe mit dem Glasstab um.",
  "Ich denke, es ist an der Zeit die Temperatur zu messen.",
  "Denk daran die Probe regelmäßig umzurühren!",
  "Denk auch daran, dass du die Temperatur messen solltest, um zu kontrollieren, dass die Probe nicht zu heiß ist.",
  "Und schon bist du fertig. Dreh den Bunsenbrenner herunter und stell die Schale mit Hilfe der Tiegelzange auf den anderen Dreifuß. Jetzt musst du 20 Minuten warten, damit die Bodenprobe abkühlen kann.",
  "Nach dem Abkühlen muss die Probe erneut ausgewogen werden, um die Gewichtsdifferenz zu errechnen.",
  "Setze deine notierten Werte in die Formel ein.",
  "Schau dir die Steckbriefe zu deinem gewählten Ort an und versuche Erklärungen für deinen berechneten Humusgehalt zu finden!",
  "Das hast du wirklich super gemacht! Das Experiment Humusglühen ist jetzt beendet.\n Begib dich nun wieder in den Eingangsbereich. Schau dir die Steckbriefe zu deinem\n gewählten Ort an und versuche Erklärungen für deinen berechneten Humusgehalt zu\n finden!",
  "Du kannst hier das Experiment Humusglühen durchführen. Wenn man den Humusgehalt eines Bodens im Gelände bestimmen will, kann man ihn mit Hilfe einer Farbskala bewerten. Im Labor ist noch eine genauere Methode möglich. ",
  "Jetzt kannst du dich noch entscheiden, welchen Standort du näher untersuchen möchtest.",
  "Dies ist die falsche Antwort",
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
  "Stelle das Thermometer in den Mörser und achte auf die Temperatur.",
  "Haltet den Button 'Rühren' gedrückt, um den Humus gleichmäßig zu erhitzen.",
  "",
  "",
  "Nimm die Schale mit der Tiegelzange und stell ihn auf die Waage. Lies das Gewicht ab und notiere es in deinem Notizbuch.",
  "",
  "",
  "",
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
  
]

