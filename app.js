// --- Simple PWA Egg Timer with cute animations & sounds ---
const ringFill = document.getElementById('ringFill');
const timeLeftEl = document.getElementById('timeLeft');
const startBtn  = document.getElementById('startBtn');
const pauseBtn  = document.getElementById('pauseBtn');
const resetBtn  = document.getElementById('resetBtn');
const soundOn   = document.getElementById('soundOn');
const crackPath = document.getElementById('crack');
const eggSvg    = document.querySelector('.egg');
const confetti  = document.getElementById('confetti');

let totalMs = 6 * 60_000; // default 6 minutes
let endAt = null;
let paused = true;
let remainingMs = totalMs;
let rafId = null;

document.querySelectorAll('.preset-grid button').forEach(b=>{
  b.addEventListener('click', ()=>{
    setDuration(+b.dataset.min * 60_000);
  });
});

document.getElementById('customForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const mins = Math.max(1, Math.min(60, +document.getElementById('customMin').value || 1));
  setDuration(mins * 60_000);
});

startBtn.addEventListener('click', () => {
  if (paused) {
    // iOS needs a user gesture before audio can start later
    primeAudio();
    startTimer();
  } else {
    // restart from full
    setDuration(totalMs);
    startTimer();
  }
});
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', ()=> setDuration(totalMs));

function setDuration(ms){
  totalMs = ms;
  remainingMs = ms;
  paused = true;
  endAt = null;
  updateUI(1);
  eggSvg.classList.remove('cracking');
  crackPath.style.opacity = 0;
  cancelAnimationFrame(rafId);
}

function startTimer(){
  if (!endAt) endAt = Date.now() + remainingMs;
  paused = false;
  tick();
}

function pauseTimer(){
  if (paused) return;
  paused = true;
  remainingMs = Math.max(0, endAt - Date.now());
  cancelAnimationFrame(rafId);
}

function tick(){
  if (paused) return;
  const ms = Math.max(0, endAt - Date.now());
  remainingMs = ms;
  const progress = 1 - (ms / totalMs || 0);
  updateUI(progress);

  if (ms <= 0){
    finish();
  } else {
    rafId = requestAnimationFrame(tick);
  }
}

function updateUI(progress){
  // ring
  const deg = Math.round(progress * 360);
  ringFill.style.setProperty('background',
    `conic-gradient(var(--ring-fg) 0deg ${deg}deg, var(--ring-bg) ${deg}deg 360deg)`);
  // time
  const mm = Math.floor(remainingMs/60000);
  const ss = Math.floor((remainingMs%60000)/1000);
  timeLeftEl.textContent = `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

function finish(){
  paused = true;
  remainingMs = 0;
  updateUI(1);

  // cute crack animation
  eggSvg.classList.add('cracking');
  crackPath.style.opacity = 1;

  // confetti!
  burstConfetti();

  // sound / vibration
  if (soundOn.checked) ding();
  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
}

// Cute “ding” using Web Audio (no external file needed)
let audioCtx;
function primeAudio(){
  // Create and resume once after a user gesture for iOS
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function ding(){
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.0);
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 1.05);
}

// Simple confetti
function rand(min,max){ return Math.random()*(max-min)+min; }
function burstConfetti(){
  for (let i=0; i<80; i++){
    const c = document.createElement('div');
    c.className = 'confetto';
    c.style.left = rand(10,90) + 'vw';
    c.style.top  = '-5vh';
    c.style.background = `hsl(${Math.floor(rand(0,360))} 80% 60%)`;
    c.style.animationDuration = rand(1.8,3.2)+'s';
    c.style.setProperty('--x', (rand(-40,40))+'vw');
    confetti.appendChild(c);
    setTimeout(()=> c.remove(), 3500);
  }
}

// Keep screen awake where supported (Android). iOS Safari doesn’t support Wake Lock.
let wakeLock = null;
if ('wakeLock' in navigator) {
  const requestLock = async () => { try { wakeLock = await navigator.wakeLock.request('screen'); } catch {}
    if (wakeLock) wakeLock.addEventListener('release', ()=> (wakeLock=null)); };
  document.addEventListener('visibilitychange', ()=> { if (!document.hidden && !wakeLock) requestLock(); });
  requestLock();
}
