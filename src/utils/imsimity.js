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

export var IMSIMITY_INIT_DELAY = 500;

export var MANNEQUIN_BUBBLE_LOW = 0;
export var MANNEQUIN_BUBBLE_HIGH = 1;






export var MANNEQUIN_TEXTS = [
  "Du wirst das Experiment Humusglühen durchführen. Um den Humusgehalt eines\nBodens im Gelände zu bestimmen kann man ihn mit Hilfe einer Farbskala bewerten.\nAllerdings ist durch das Glühen der Bodenprobe im Labor ein noch genaueres Ergebnis möglich.",
  "Jetzt kannst du dich noch entscheiden, welchen Standort du näher untersuchen\n möchtest. Damit du dich leichter entscheiden kannst, findest du unter dem Standort\n weitere Informationen.",
  "Um mit dem Experiment zu starten, musste du alle Materialien auf die richtige Stelle auf\n deinem Arbeitsplatz stellen.",
  "Als erstes musst du deine Bodenprobe in eine Mörserschale geben und die Probe kräftig\n zerkleinern. Du kannst erst mit der Probe weitermachen, wenn die Probe ganz fein ist\n  und sich keine Steine mehr darin befinden!",
  "Platziere die Waage auf der angezeigten Stelle auf deinem Tisch. Denk daran deine\nWaage immer erst auf null zu setzen. Dafür musst du die Taste TARA drücken. Stell\n deinen Tiegel mit der gemörserten Probe auf die Waage und notiere das Gewicht in\n deinem Notizbuch. Anschließend die Waage erneut auf null setzen (TARA). Nun füllst du\n genau 50g von deiner Probe in den Tiegel.",
  "Super! Du nimmst jetzt den Tiegel und stellst ihn auf den Dreifuß mit aufgelegter Platte.",
  "Als nächstes zündest du den Bunsenbrenner mit dem Feuerzeug an und wählst die\n Stärke der Flamme. Wenn du mit Feuer arbeitest, musst du die richtigen Handschuhe\n anziehen.",
  "Sobald du den Bunsenbrenner angemacht hast, läuft die Zeit.",
  "Rühr die Probe langsam mit dem Glasstab um. Wenn du fertig bist, kannst du den\n Glasstab wieder hinlegen.",
  "Ich denke es ist an der Zeit die Temperatur zu messen.",
  "Denk daran die Probe regelmäßig umzurühren! Denk auch daran, dass du die\n Temperatur messen solltest, um zu schauen, ob die Probe nicht zu heiß ist.",
  "Und schon bist du fertig. Das ging doch recht schnell, oder? Dreh den Bunsenbrenner\n herunter und stell den Tiegel mit Hilfe der Tiegelzange auf den anderen Dreifuß. Jetzt\n musst du 20 Minuten warten, damit die Bodenprobe abkühlen kann.",
  "Nimm den Tiegel mit der Tiegelzange und stell ihn auf die Waage. Denk daran die\n Waage auf null zu setzen (TARA). Lies das Gewicht ab und notiere es in deinem\n Notizbuch.",
  "Wähle nun die richtige Formel, um den Humusgehalt zu berechnen. Setze die Werte\n in die Formel und du kennst den Humusgehalt deines Bodens!"
]

