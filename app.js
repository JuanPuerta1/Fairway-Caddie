"use strict";

/* =========================
   DATOS Y ESTADO GLOBAL
========================= */

const courseData = [
  { h: 1, p: 4, si: 15 }, { h: 2, p: 4, si: 17 }, { h: 3, p: 4, si: 3 },  { h: 4, p: 4, si: 13 },
  { h: 5, p: 3, si: 9 },  { h: 6, p: 5, si: 1 },  { h: 7, p: 4, si: 7 },  { h: 8, p: 3, si: 11 },
  { h: 9, p: 5, si: 5 },  { h: 10, p: 3, si: 18 }, { h: 11, p: 5, si: 2 }, { h: 12, p: 4, si: 12 },
  { h: 13, p: 4, si: 6 }, { h: 14, p: 4, si: 14 }, { h: 15, p: 5, si: 8 }, { h: 16, p: 4, si: 10 },
  { h: 17, p: 3, si: 16 }, { h: 18, p: 4, si: 4 }
];

let currentHole = 1, startHoleLimit = 1, endHoleLimit = 18;
let hcpRealExact = 24.9, hcpTargetExact = 18.0;

let currentShots = [];
let currentInputScore = 0;
let currentMood = null;
let roundData = {};
let gameHistory = [];
let trainingData = { xp: 0, sessions: [] };

let trainingTimerInterval = null;
let trainingSeconds = 0;

// FIX PRO: estas variables se usan pero no estaban declaradas en tu HTML original
let currentFocus = "putt";
let currentDrills = [];

/* =========================
   LIBRERÍAS DE ENTRENAMIENTO
========================= */

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

/* =========================
   INICIO
========================= */

window.onload = function () {
  if (window.lucide) lucide.createIcons();

  // Splash robusto
  const splash = document.getElementById("splashScreen");
  const home = document.getElementById("homeScreen");
  setTimeout(() => {
    splash.style.opacity = "0";
    setTimeout(() => {
      splash.classList.add("hidden");
      home.classList.remove("hidden");
    }, 1000);
  }, 2000);

  // Handicap display
  const realInput = document.getElementById("handicapRealInput");
  realInput.addEventListener("input", function (e) {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) document.getElementById("realPlayingHcpDisplay").innerText = `Juegas con: ${Math.round(val)} golpes`;
  });

  // Cargar localStorage
  const hist = localStorage.getItem("golfAppHistory");
  if (hist) gameHistory = JSON.parse(hist);

  const train = localStorage.getItem("golfAppTraining");
  if (train) trainingData = JSON.parse(train);

  updateXPDisplay();
  checkSavedGame();
};

/* =========================
   NAVEGACIÓN BÁSICA
========================= */

function checkSavedGame() {
  const savedState = localStorage.getItem("golfAppState_v42");
  const resume = document.getElementById("resumeContainer");

  if (savedState) {
    resume.classList.remove("hidden");
    resume.classList.add("flex");
    const s = JSON.parse(savedState);
    if (s.startHoleLimit === 10) document.getElementById("startRoundBtn").innerText = "AL TEE DEL 10";
  } else {
    resume.classList.add("hidden");
    resume.classList.remove("flex");
  }
}

function discardSavedGame() {
  if (confirm("¿Borrar partida a medias?")) {
    localStorage.removeItem("golfAppState_v42");
    checkSavedGame();
  }
}

function goHome() {
  document.querySelectorAll('div[id$="Screen"], div[id$="Hub"]').forEach((el) => {
    if (el.id !== "splashScreen") el.classList.add("hidden");
    if (el.id === "gameScreen" || el.id === "activeTrainingScreen") el.classList.remove("flex");
  });
  document.getElementById("homeScreen").classList.remove("hidden");
  checkSavedGame();
}

function goToSetup() {
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("setupScreen").classList.remove("hidden");
}

function goToTrainingHub() {
  analyzeForTraining();
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("trainingHub").classList.remove("hidden");
}

function resumeGame() {
  const savedState = localStorage.getItem("golfAppState_v42");
  if (!savedState) return;

  const s = JSON.parse(savedState);
  hcpRealExact = s.hcpRealExact;
  hcpTargetExact = s.hcpTargetExact;
  startHoleLimit = s.startHoleLimit;
  endHoleLimit = s.endHoleLimit;
  roundData = s.roundData;
  currentHole = s.currentHole;

  document.getElementById("homeScreen").classList.add("hidden");
  const gs = document.getElementById("gameScreen");
  gs.classList.remove("hidden");
  gs.classList.add("flex");
  loadHole(currentHole);
}

function startNewGame() {
  const realVal = parseFloat(document.getElementById("handicapRealInput").value);
  const targetVal = parseFloat(document.getElementById("handicapTargetInput").value);

  if (isNaN(realVal)) return alert("Pon tu hándicap real");

  hcpRealExact = realVal;
  hcpTargetExact = isNaN(targetVal) ? Math.floor(hcpRealExact) : targetVal;

  roundData = {};
  currentShots = [];
  currentMood = null;

  if (!currentHole || currentHole < startHoleLimit) currentHole = startHoleLimit;

  localStorage.removeItem("golfAppState_v42");

  document.getElementById("setupScreen").classList.add("hidden");
  const gs = document.getElementById("gameScreen");
  gs.classList.remove("hidden");
  gs.classList.add("flex");

  saveState();
  loadHole(currentHole);
}

/* =========================
   JUEGO
========================= */

function calculateNetPar(holeIdx, exactHcp) {
  const playingHcp = Math.round(exactHcp);
  const hole = courseData[holeIdx];

  let strokes = Math.floor(playingHcp / 18);
  if (hole.si <= (playingHcp % 18)) strokes++;

  return hole.p + strokes;
}

function loadHole(num) {
  currentHole = num;
  const idx = num - 1;
  const hole = courseData[idx];
  const personalPar = calculateNetPar(idx, hcpRealExact);

  document.getElementById("holeDisplay").innerText = `Hoyo ${hole.h}`;
  document.getElementById("parDisplay").innerText = hole.p;
  document.getElementById("displayTargetHcp").innerText = Math.round(hcpTargetExact);
  document.getElementById("nextButtonText").innerText = currentHole === endHoleLimit ? "TERMINAR" : "SIGUIENTE";

  if (roundData[currentHole]) {
    currentInputScore = roundData[currentHole].score;
    currentShots = roundData[currentHole].shots;
    currentMood = roundData[currentHole].mood;
  } else {
    currentInputScore = personalPar;
    currentMood = "normal";

    let names = new Array(personalPar).fill("Avance");
    if (personalPar >= 1) names[personalPar - 1] = "Meter Putt";
    if (personalPar >= 2) names[personalPar - 2] = "Lag Putt";
    if (personalPar >= 3) names[personalPar - 3] = "Coger Green";
    if (personalPar >= 4) names[0] = "Salida / Calle";

    currentShots = names.map((n) => ({ name: n, type: "normal", status: "pending" }));
  }

  updateUI();
  saveState();
  document.getElementById("checklistContainer").scrollTop = 0;
}

function updateUI() {
  document.getElementById("currentHoleScore").innerText = currentInputScore;

  document.querySelectorAll(".mood-btn").forEach((b) => b.classList.remove("selected"));
  if (currentMood) document.getElementById(`mood-${currentMood}`).classList.add("selected");

  const holeTarget = calculateNetPar(currentHole - 1, hcpTargetExact);
  const holePersonal = calculateNetPar(currentHole - 1, hcpRealExact);
  document.getElementById("displayTargetStrokes").innerText = holeTarget;
  document.getElementById("displayPersonalPar").innerText = holePersonal;

  let runningTotal = 0;
  let tempRound = { ...roundData };
  tempRound[currentHole] = { score: currentInputScore };

  for (let i = startHoleLimit; i <= endHoleLimit; i++) {
    if (tempRound[i]) runningTotal += tempRound[i].score;
  }
  document.getElementById("runningScoreDisplay").innerText = runningTotal;

  const list = document.getElementById("checklistContainer");
  list.innerHTML = "";

  let success = 0, activeIdx = -1;

  currentShots.forEach((s, i) => {
    if (s.status === "success") success++;
    if (s.status === "pending" && activeIdx === -1) activeIdx = i;

    const div = document.createElement("div");
    div.className = `p-4 rounded-3xl border mb-3 transition-all relative overflow-hidden ${
      s.status === "pending"
        ? i === activeIdx
          ? "bg-slate-800 border-emerald-500 shadow-lg scale-[1.01] z-10"
          : "bg-slate-900 border-slate-800 opacity-60"
        : s.status === "success"
          ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
          : "bg-slate-900 border-red-900/50"
    }`;

    let html = `<div class="flex justify-between items-center mb-1">
      <span class="text-[9px] font-black uppercase tracking-widest ${s.status === "success" ? "text-emerald-200" : "text-slate-500"}">
        ${s.type === "recovery" ? "RECUPERACIÓN" : `GOLPE ${i + 1}`}
      </span>`;

    if (s.status !== "pending") {
      html += `<button onclick="resetShot(${i})" class="bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-white backdrop-blur-sm transition-colors">
        <i data-lucide="rotate-ccw" class="w-3 h-3"></i></button>`;
    }

    html += `</div><div class="flex justify-between items-center">
      <h3 class="text-lg font-bold tracking-tight ${s.status === "fail" ? "text-slate-500 line-through decoration-red-500" : ""}">${s.name}</h3>`;

    if (s.status === "success") html += `<div class="bg-white/20 p-1 rounded-full"><i data-lucide="check" class="w-4 h-4"></i></div>`;
    else if (s.status === "fail") html += `<div class="bg-red-500/20 p-1 rounded-full"><i data-lucide="x" class="w-4 h-4 text-red-500"></i></div>`;

    html += `</div>`;

    if (s.status === "pending") {
      html += `<div class="flex gap-3 mt-4">
        <button onclick="shot(${i}, true)" class="flex-1 bg-emerald-600 text-white py-2.5 text-xs font-bold rounded-xl shadow-lg hover:bg-emerald-500 transition-colors">CONSEGUIDO</button>
        <button onclick="shot(${i}, false)" class="flex-1 bg-slate-800 text-rose-400 border border-rose-900/50 py-2.5 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-700 transition-colors">FALLO</button>
      </div>`;
    }

    div.innerHTML = html;
    list.appendChild(div);
  });

  const pct = Math.round((success / currentShots.length) * 100) || 0;
  document.getElementById("progressBar").style.width = `${pct}%`;

  if (window.lucide) lucide.createIcons();
}

function shot(i, ok) {
  currentShots[i].status = ok ? "success" : "fail";

  if (ok && "vibrate" in navigator) {
    try { navigator.vibrate(50); } catch (e) {}
  }

  if (!ok) currentShots.splice(i + 1, 0, { name: "Recuperación", type: "recovery", status: "pending" });

  saveState();
  updateUI();
  saveCurrentHoleData();
}

function resetShot(i) {
  const wasFail = currentShots[i].status === "fail";
  currentShots[i].status = "pending";

  if (wasFail && currentShots[i + 1] && currentShots[i + 1].type === "recovery") currentShots.splice(i + 1, 1);

  saveState();
  updateUI();
  saveCurrentHoleData();
}

function adjustScore(d) {
  currentInputScore += d;
  if (currentInputScore < 1) currentInputScore = 1;
  updateUI();
  saveCurrentHoleData();
}

function saveCurrentHoleData() {
  roundData[currentHole] = { score: currentInputScore, mood: currentMood, shots: currentShots };
  saveState();
}

function setMood(m) {
  currentMood = m;
  updateUI();
  saveCurrentHoleData();
}

function nextHole() {
  if (!currentMood && !confirm("¿Sin estado mental?")) return;
  if (!currentMood) currentMood = "normal";

  saveCurrentHoleData();

  if (currentHole < endHoleLimit) {
    getCaddieMessage(currentInputScore - courseData[currentHole - 1].p, currentMood);
  } else {
    showSummary();
  }
}

function prevHole() {
  saveCurrentHoleData();
  if (currentHole > startHoleLimit) loadHole(currentHole - 1);
}

function finishRoundNow() {
  if (confirm("¿Terminar vuelta?")) {
    saveCurrentHoleData();
    showSummary(true);
  }
}

/* FIX PRO: tu HTML llama a finishTransition() pero no existía */
function finishTransition() {
  const screen = document.getElementById("mindsetScreen");
  if (!screen.classList.contains("hidden")) screen.classList.add("hidden");

  // si estamos en el último hoyo, no avanzamos
  if (currentHole < endHoleLimit) loadHole(currentHole + 1);
}

function getCaddieMessage(diff, mood) {
  let category = "neutral";
  if (diff <= -1) category = "hype";
  else if (diff === 0 && mood !== "angry") category = "good";
  else if (diff >= 2 || mood === "angry") category = "recovery";

  const caddieAI = {
    hype: ["¡Estás en la zona!", "¡Clase mundial!", "Ese sonido ha sido música.", "Mantén este ritmo.", "Caminas distinto hoy."],
    good: ["Muy sólida.", "Estrategia perfecta.", "Confianza a tope.", "Sigue sumando.", "Buen hoyo, mejor actitud."],
    neutral: ["Un golpe a la vez.", "Paciencia y ritmo.", "Confía en tu rutina.", "Visualiza el siguiente.", "Disfruta del paseo."],
    recovery: ["El golf es recuperación.", "Olvida el resultado.", "Respira. Acepta. Avanza.", "No te castigues.", "Borrón y cuenta nueva."]
  };

  const phrases = caddieAI[category];
  const msg = phrases[Math.floor(Math.random() * phrases.length)];

  const iconEl = document.getElementById("mindsetIcon");
  if (category === "hype") iconEl.innerHTML = '<i data-lucide="zap" class="w-16 h-16 text-yellow-400"></i>';
  else if (category === "good") iconEl.innerHTML = '<i data-lucide="thumbs-up" class="w-16 h-16 text-emerald-400"></i>';
  else if (category === "recovery") iconEl.innerHTML = '<i data-lucide="wind" class="w-16 h-16 text-blue-400"></i>';
  else iconEl.innerHTML = '<i data-lucide="sun" class="w-16 h-16 text-orange-300"></i>';

  document.getElementById("mindsetTitle").innerText =
    category === "hype" ? "¡BOOM!" : category === "recovery" ? "CALMA" : "BIEN JUGADO";
  document.getElementById("mindsetBody").innerText = msg;

  const screen = document.getElementById("mindsetScreen");
  screen.classList.remove("hidden");

  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    screen.classList.add("hidden");
    loadHole(currentHole + 1);
  }, 4500);
}

/* =========================
   RESUMEN + STATS + HISTORIAL
========================= */

function showSummary(earlyFinish = false) {
  try {
    saveCurrentHoleData();

    let score = 0, totalPar = 0, strokesReal = 0, strokesTarget = 0, played = 0;
    const limit = earlyFinish ? currentHole : endHoleLimit;

    const visualContainer = document.getElementById("visualRoundSummary");
    visualContainer.innerHTML = "";

    const safeStart = parseInt(startHoleLimit);
    const safeEnd = parseInt(limit);

    for (let i = safeStart; i <= safeEnd; i++) {
      if (!roundData[i]) continue;

      const hScore = roundData[i].score || 0;
      const hPar = courseData[i - 1] ? courseData[i - 1].p : 4;

      score += hScore;
      totalPar += hPar;

      const sR = calculateNetPar(i - 1, hcpRealExact);
      const sT = calculateNetPar(i - 1, hcpTargetExact);

      strokesReal += sR;
      strokesTarget += sT;
      played++;

      const diff = hScore - hPar;

      let bgColor = "bg-slate-800 border-slate-700";
      let textColor = "text-slate-400";
      if (diff <= -1) { bgColor = "bg-sky-900/50 border-sky-700"; textColor = "text-sky-300"; }
      else if (diff === 0) { bgColor = "bg-emerald-900/50 border-emerald-700"; textColor = "text-emerald-300"; }
      else if (diff >= 2) { bgColor = "bg-rose-900/50 border-rose-800"; textColor = "text-rose-400"; }

      visualContainer.innerHTML += `
        <div class="flex-shrink-0 w-24 h-20 rounded-2xl border ${bgColor} flex flex-col items-center justify-center snap-center">
          <span class="text-[9px] font-bold uppercase opacity-50 mb-0.5">Hoyo ${i}</span>
          <span class="text-2xl font-black ${textColor} leading-none">${hScore}</span>
          <span class="text-[10px] font-bold bg-black/20 px-1.5 rounded opacity-60 mt-1">Par ${hPar}</span>
        </div>`;
    }

    document.getElementById("holesPlayedText").innerText = `${played} HOYOS JUGADOS`;
    document.getElementById("finalGross").innerText = `${score} / ${totalPar}`;
    document.getElementById("resTargetPts").innerText = strokesTarget;
    document.getElementById("resRealPts").innerText = strokesReal;

    const verdictEl = document.getElementById("finalVerdictDisplay");
    const diffTarget = score - strokesTarget;

    if (diffTarget <= 0) {
      verdictEl.className = "text-center bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-2xl mb-4";
      verdictEl.innerHTML = `<h3 class="text-emerald-400 font-black text-xl uppercase tracking-widest mb-1">¡OBJETIVO CUMPLIDO!</h3><p class="text-xs text-emerald-200">Has ganado por ${Math.abs(diffTarget)} golpes</p>`;
    } else {
      verdictEl.className = "text-center bg-orange-500/10 border border-orange-500/50 p-4 rounded-2xl mb-4";
      verdictEl.innerHTML = `<h3 class="text-orange-400 font-black text-xl uppercase tracking-widest mb-1">OBJETIVO NO ALCANZADO</h3><p class="text-xs text-orange-200">Te han sobrado ${diffTarget} golpes</p>`;
    }

    const msgEl = document.getElementById("challengeMsg");
    let quoteCategory = "good";
    if (score <= strokesReal) quoteCategory = "great";
    else if (score > strokesReal + 5) quoteCategory = "tough";

    const qList = legendQuotes[quoteCategory] || legendQuotes.good;
    msgEl.innerText = qList[Math.floor(Math.random() * qList.length)];

    document.getElementById("gameScreen").classList.add("hidden");
    const ss = document.getElementById("summaryScreen");
    ss.classList.remove("hidden");
    ss.classList.add("flex");
  } catch (e) {
    console.error(e);
    alert("Error crítico al generar resumen. Se mostrará pantalla incompleta.");
    document.getElementById("gameScreen").classList.add("hidden");
    const ss = document.getElementById("summaryScreen");
    ss.classList.remove("hidden");
    ss.classList.add("flex");
  }
}

function openStats() {
  let failures = { long: 0, short: 0, putt: 0 };

  for (let i = startHoleLimit; i <= endHoleLimit; i++) {
    if (roundData[i] && roundData[i].shots) {
      roundData[i].shots.forEach((sh) => {
        let name = sh.name.toLowerCase();
        let type = "long";
        if (name.includes("putt")) type = "putt";
        else if (name.includes("green") || name.includes("recup") || name.includes("aprox")) type = "short";

        if (sh.status === "fail") failures[type]++;
      });
    }
  }

  const totalFail = failures.long + failures.short + failures.putt;
  const bar = document.getElementById("failureDistributionBar");
  bar.innerHTML = "";

  if (totalFail > 0) {
    const pLong = (failures.long / totalFail) * 100;
    const pShort = (failures.short / totalFail) * 100;
    const pPutt = (failures.putt / totalFail) * 100;
    if (pLong > 0) bar.innerHTML += `<div style="width:${pLong}%" class="h-full bg-blue-500"></div>`;
    if (pShort > 0) bar.innerHTML += `<div style="width:${pShort}%" class="h-full bg-orange-400"></div>`;
    if (pPutt > 0) bar.innerHTML += `<div style="width:${pPutt}%" class="h-full bg-emerald-500"></div>`;
  } else {
    bar.innerHTML = `<div class="w-full h-full flex items-center justify-center text-[10px] opacity-30">Sin datos de fallos</div>`;
  }

  const cards = document.getElementById("failureCards");
  cards.innerHTML = "";

  const createCard = (title, count, total, colorClass) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const isPriority = pct >= 40 && total > 2;
    const bg = isPriority ? "bg-red-900/20 border-red-800" : "card";

    return `
      <div class="p-4 rounded-2xl ${bg} flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-2 h-10 rounded-full ${colorClass}"></div>
          <div>
            <p class="font-bold">${title}</p>
            <p class="text-xs opacity-50">${count} Fallos</p>
          </div>
        </div>
        <div class="text-right">
          ${isPriority ? '<span class="text-[9px] font-black text-red-400 uppercase tracking-wide block mb-1">⚠️ PRIORIDAD</span>' : ""}
          <span class="text-2xl font-black ${isPriority ? "text-red-400" : ""}">${pct}%</span>
        </div>
      </div>`;
  };

  cards.innerHTML += createCard("Juego Largo", failures.long, totalFail, "bg-blue-500");
  cards.innerHTML += createCard("Juego Corto", failures.short, totalFail, "bg-orange-400");
  cards.innerHTML += createCard("Putt", failures.putt, totalFail, "bg-emerald-500");

  const maxFail = Math.max(failures.long, failures.short, failures.putt);
  let recs = [];

  if (maxFail > 0) {
    if (failures.putt === maxFail) recs.push("Green: Demasiados putts. Dedica tiempo a distancias cortas.");
    else if (failures.short === maxFail) recs.push("Juego Corto: Pierdes golpes recuperando.");
    else recs.push("Salidas: Asegura calle, no busques distancia.");
  } else {
    recs.push("No hay suficientes datos de golpes marcados.");
  }

  document.getElementById("coachRecommendations").innerHTML = recs.map((r) => `<p>${r}</p>`).join("");
  document.getElementById("statsScreen").classList.remove("hidden");
}

function closeOverlay(id) {
  document.getElementById(id).classList.add("hidden");
}

function hardReset() {
  if (confirm("¿Descartar partida?")) {
    localStorage.removeItem("golfAppState_v42");
    location.reload();
  }
}

function saveAndFinish() {
  const gross = parseInt(document.getElementById("finalGross").innerText.split("/")[0]);
  const stbReal = parseInt(document.getElementById("resRealPts").innerText);

  const rec = {
    date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    gross: gross,
    stableford: stbReal,
    holes: `${startHoleLimit}-${currentHole}`
  };

  gameHistory.push(rec);
  localStorage.setItem("golfAppHistory", JSON.stringify(gameHistory));
  localStorage.removeItem("golfAppState_v42");
  location.reload();
}

function showHistory() {
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("setupScreen").classList.add("hidden");

  const hs = document.getElementById("historyScreen");
  hs.classList.remove("hidden");
  hs.classList.add("flex");

  renderHist();
}

function closeHistory() {
  document.getElementById("historyScreen").classList.add("hidden");
  document.getElementById("homeScreen").classList.remove("hidden");
}

function clearHistory() {
  if (confirm("¿Borrar historial?")) {
    localStorage.removeItem("golfAppHistory");
    gameHistory = [];
    renderHist();
  }
}

function renderHist() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  let scores = gameHistory.filter((g) => g.gross).map((g) => g.gross);
  document.getElementById("histBestGross").innerText = scores.length > 0 ? Math.min(...scores) : "--";

  gameHistory.slice().reverse().forEach((g) => {
    const isStbOnly = g.gross === undefined;
    list.innerHTML += `
      <div class="card p-4 rounded-2xl flex justify-between items-center shadow-sm">
        <div>
          <p class="text-[10px] opacity-50 font-bold uppercase tracking-wider mb-0.5">${g.date}</p>
          <p class="text-xs font-bold opacity-70">Hoyos ${g.holes}</p>
        </div>
        <div class="text-right">
          <span class="block font-black text-lg">${isStbOnly ? "-" : g.gross} <span class="text-[10px] opacity-50 font-normal">GOLPES</span></span>
          <span class="block text-xs font-bold text-emerald-500">${g.stableford || g.score} Pts</span>
        </div>
      </div>`;
  });

  const container = document.getElementById("chartContainer");
  container.innerHTML = "";

  if (scores.length < 2) {
    container.innerHTML = '<span class="flex items-center justify-center h-full w-full">Juega más partidas</span>';
    return;
  }

  const max = Math.max(...scores) + 2;
  const min = Math.min(...scores) - 2;
  const w = container.clientWidth;
  const h = container.clientHeight;
  const range = max - min;
  const stepX = w / (scores.length - 1);

  let points = "";
  let areaPoints = `0,${h} `;

  scores.forEach((s, i) => {
    const x = i * stepX;
    const y = h - ((s - min) / range) * h;
    points += `${x},${y} `;
    areaPoints += `${x},${y} `;
  });

  areaPoints += `${w},${h}`;

  container.innerHTML = `
    <svg width="100%" height="100%" style="overflow:visible">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:#10b981;stop-opacity:0" />
        </linearGradient>
      </defs>
      <path d="${areaPoints}" fill="url(#grad)" />
      <polyline points="${points}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="${(scores.length - 1) * stepX}" cy="${h - ((scores[scores.length - 1] - min) / range) * h}" r="4" fill="white" stroke="#10b981" stroke-width="2" />
    </svg>`;
}

/* =========================
   ENTRENAMIENTO
========================= */

function analyzeForTraining() {
  const r = Math.random();
  if (r < 0.33) setTrainingRecommendation("putt", "Estadísticas sugieren mejorar putt.");
  else if (r < 0.66) setTrainingRecommendation("short", "Recuperación es clave hoy.");
  else setTrainingRecommendation("long", "Afianza tu swing largo.");
}

function setTrainingRecommendation(type, reason) {
  currentFocus = type;

  let title = "";
  if (type === "putt") title = "Putting Master";
  else if (type === "short") title = "Wedge Wizard";
  else title = "Iron Striker";

  document.getElementById("trainingFocusTitle").innerText = title;
  document.getElementById("trainingFocusReason").innerText = reason;
}

function forceTraining(type) {
  setTrainingRecommendation(type, "Sesión manual.");
  startTrainingSession(type);
}

function switchTrainingTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.getElementById(`tab-${tab}`).classList.add("active");

  if (tab === "golf") {
    document.getElementById("golfTrainingContent").classList.remove("hidden");
    document.getElementById("gymTrainingContent").classList.add("hidden");
  } else {
    document.getElementById("golfTrainingContent").classList.add("hidden");
    document.getElementById("gymTrainingContent").classList.remove("hidden");
  }
}

function startGymSession(day) {
  currentFocus = "gym";

  document.getElementById("trainingHub").classList.add("hidden");
  const ats = document.getElementById("activeTrainingScreen");
  ats.classList.remove("hidden");
  ats.classList.add("flex");

  const list = document.getElementById("drillsContainer");
  list.innerHTML = "";

  let routines = gymRoutines[day];
  let title = day === "day1" ? "D1: Fuerza" : day === "day2" ? "D2: Potencia" : day === "day3" ? "D3: Conexión" : "Calentamiento";
  document.getElementById("sessionTitle").innerText = title;

  currentDrills = JSON.parse(JSON.stringify(routines));

  currentDrills.forEach((drill, idx) => {
    let intensityBar = `<div class="flex gap-0.5 mt-2 h-1.5 w-16 opacity-50">`;
    for (let k = 0; k < 5; k++) {
      let color = k * 20 < drill.intensity ? "bg-violet-400" : "bg-slate-700";
      intensityBar += `<div class="flex-1 rounded-full ${color}"></div>`;
    }
    intensityBar
