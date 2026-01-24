// Tu script original, tal cual, solo que fuera del HTML

const courseData = [
  { h: 1, p: 4, si: 15 }, { h: 2, p: 4, si: 17 }, { h: 3, p: 4, si: 3 }, { h: 4, p: 4, si: 13 },
  { h: 5, p: 3, si: 9 }, { h: 6, p: 5, si: 1 }, { h: 7, p: 4, si: 7 }, { h: 8, p: 3, si: 11 },
  { h: 9, p: 5, si: 5 }, { h: 10, p: 3, si: 18 }, { h: 11, p: 5, si: 2 }, { h: 12, p: 4, si: 12 },
  { h: 13, p: 4, si: 6 }, { h: 14, p: 4, si: 14 }, { h: 15, p: 5, si: 8 }, { h: 16, p: 4, si: 10 },
  { h: 17, p: 3, si: 16 }, { h: 18, p: 4, si: 4 }
];

let currentHole = 1, startHoleLimit = 1, endHoleLimit = 18;
let hcpRealExact = 24.9, hcpTargetExact = 18.0;
let currentShots = [], currentInputScore = 0, currentMood = null, roundData = {}, gameHistory = [], trainingData = { xp: 0, sessions: [] };
let trainingTimerInterval = null, trainingSeconds = 0;

// OJO: en tu código usas currentFocus y currentDrills sin declararlos al inicio.
// Los declaro aquí para evitar bugs silenciosos:
let currentFocus = "putt";
let currentDrills = [];

const drillLibrary = {
  putt: [
    { name: "10 Putts de 1 metro", xp: 50 },
    { name: "10 Putts de 2 metros", xp: 100 },
    { name: "5 Putts Lag (>10m)", xp: 150 },
    { name: "Reloj (3, 6, 9 pies)", xp: 200 }
  ],
  short: [
    { name: "20 Chips rodados (H8/9)", xp: 100 },
    { name: "20 Chips altos (SW)", xp: 150 },
    { name: "10 Sacadas de bunker", xp: 200 },
    { name: "Up & Down (5 veces)", xp: 250 }
  ],
  long: [
    { name: "20 Bolas Hierro 7 (Ritmo)", xp: 100 },
    { name: "10 Drivers (Calle)", xp: 150 },
    { name: "Cambio de objetivo", xp: 150 },
    { name: "Rutina completa (5 bolas)", xp: 200 }
  ]
};

// --- RUTINAS GYM PERSONALIZADAS ---
const gymRoutines = {
  warmup: [
    { name: "Gato-Vaca", reps: "10 reps", xp: 50, intensity: 20, img: "calentamiento.png", tip: "Mobiliza toda la columna. Despacio." },
    { name: "Open Books", reps: "8/lado", xp: 50, intensity: 20, img: "calentamiento.png", tip: "Cadera quieta, solo gira el pecho." },
    { name: "Estiramiento 90/90", reps: "30s/lado", xp: 50, intensity: 30, img: "calentamiento.png", tip: "Clave para rotar sin bloquearse." }
  ],
  day1: [
    { name: "Box Jumps", reps: "3x5", xp: 100, intensity: 90, img: "dia1.png", tip: "Aterriza como un ninja (sin ruido)." },
    { name: "Med Ball Slams", reps: "3x8", xp: 100, intensity: 85, img: "dia1.png", tip: "Rompe el suelo con el balón." },
    { name: "Sentadilla Búlgara", reps: "3x8/pierna", xp: 120, intensity: 80, img: "dia1_2.png", tip: "Equilibrio y fuerza. Pecho erguido." },
    { name: "Pallof Press", reps: "3x15s", xp: 90, intensity: 60, img: "dia1_2.png", tip: "Tus abdominales deben impedir el giro." },
    { name: "Remo Mancuerna", reps: "3x10", xp: 90, intensity: 70, img: "dia1_2.png", tip: "Arranca la motosierra. Espalda plana." }
  ],
  day2: [
    { name: "Lanzamiento Lateral", reps: "3x6/lado", xp: 100, intensity: 90, img: "dia2.png", tip: "Carga atrás y explota como un swing." },
    { name: "Press Pecho Mancuerna", reps: "3x10", xp: 100, intensity: 80, img: "dia2_2.png", tip: "Rango completo de movimiento." },
    { name: "Peso Muerto Rumano", reps: "3x10", xp: 110, intensity: 80, img: "dia2_2.png", tip: "Siente los isquios. Espalda recta." },
    { name: "Hachazos (Woodchops)", reps: "3x10/lado", xp: 90, intensity: 70, img: "dia2.png", tip: "Gira el torso, controla el regreso." }
  ],
  day3: [
    { name: "Kettlebell Swings", reps: "3x15", xp: 120, intensity: 90, img: "dia3.png", tip: "Caderazo. La pesa flota por los glúteos." },
    { name: "Landmine Press", reps: "3x10/brazo", xp: 100, intensity: 75, img: "dia3_2.png", tip: "Inclínate un poco hacia la barra." },
    { name: "Jalón al Pecho", reps: "3x12", xp: 90, intensity: 70, img: "dia3_2.png", tip: "Codos a los bolsillos traseros." },
    { name: "Deadbug", reps: "3x20", xp: 80, intensity: 60, img: "dia3.png", tip: "Espalda baja pegada al suelo SIEMPRE." }
  ]
};

const legendQuotes = {
  great: [
    "Cuanto más entreno, más suerte tengo. – Gary Player",
    "El éxito en este juego depende menos de la fuerza del cuerpo que de la fuerza de la mente. – Arnold Palmer",
    "El golf es el deporte más grande porque es un deporte de uno mismo. – Tiger Woods"
  ],
  good: [
    "El golpe más importante en el golf es el siguiente. – Ben Hogan",
    "El golf es un compromiso entre lo que tu ego quiere que hagas y lo que tu experiencia te dice que hagas. – Robert Trent Jones",
    "La concentración es un antídoto contra la ansiedad. – Jack Nicklaus"
  ],
  tough: [
    "El golf no es un juego de aciertos. Es un juego de fallos. Gana quien falla mejor. – Ben Hogan",
    "Nunca aprendí nada de un torneo que gané. – Bobby Jones",
    "El golf te humilla para enseñarte a levantarte. – Arnold Palmer"
  ]
};

window.onload = function () {
  lucide.createIcons();

  setTimeout(() => {
    document.getElementById("splashScreen").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("splashScreen").classList.add("hidden");
      document.getElementById("homeScreen").classList.remove("hidden");
    }, 1000);
  }, 2000);

  document.getElementById("handicapRealInput").addEventListener("input", function (e) {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) document.getElementById("realPlayingHcpDisplay").innerText = `Juegas con: ${Math.round(val)} golpes`;
  });

  if (localStorage.getItem("golfAppHistory")) gameHistory = JSON.parse(localStorage.getItem("golfAppHistory"));
  if (localStorage.getItem("golfAppTraining")) trainingData = JSON.parse(localStorage.getItem("golfAppTraining"));

  updateXPDisplay();
  checkSavedGame();
};

// === El resto de tu JS original va aquí SIN CAMBIOS ===
// Para no inundarte con miles de líneas duplicadas en un solo mensaje,
// pega a continuación TODO lo que tenías en tu <script> desde:
// function checkSavedGame() { ... }
// hasta el final.
// (Si quieres, pégalo y yo te lo devuelvo ya “ordenado” por módulos.)

function checkSavedGame() {
  const savedState = localStorage.getItem("golfAppState_v42");
  if (savedState) {
    document.getElementById("resumeContainer").classList.remove("hidden");
    document.getElementById("resumeContainer").classList.add("flex");
    const s = JSON.parse(savedState);
    if (s.startHoleLimit === 10) document.getElementById("startRoundBtn").innerText = "AL TEE DEL 10";
  } else {
    document.getElementById("resumeContainer").classList.add("hidden");
    document.getElementById("resumeContainer").classList.remove("flex");
  }
}

/* Pega aquí el resto de tus funciones tal cual (goHome, goToSetup, startNewGame, loadHole, etc.) */

