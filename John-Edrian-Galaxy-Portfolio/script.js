const $ = (s) => document.querySelector(s);
$("#year").textContent = new Date().getFullYear();

const menuToggle = $("#menuToggle");
const nav = $("#nav");
menuToggle.addEventListener("click", () => {
  const opened = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(opened));
  menuToggle.textContent = opened ? "✕" : "☰";
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

const themeToggle = $("#themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const light = document.body.classList.contains("light");
  themeToggle.innerHTML = light ? "☾ <span>Theme</span>" : "☼ <span>Theme</span>";
});

const revealItems = document.querySelectorAll(".content-section, .game-wrap, .final-cta, .moment-card, .value-card");
revealItems.forEach(item => item.classList.add("reveal"));
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else revealItems.forEach(item => item.classList.add("visible"));

// Stardust game with restart/reset controls and a clean play state.
const board = $("#gameBoard"), target = $("#starTarget"), start = $("#startGame"), reset = $("#resetGame");
const scoreText = $("#score"), timeText = $("#timeLeft"), message = $("#gameMessage"), status = $("#gameStatus");
let score = 0, time = 15, active = false, clock = null, jumpTimer = null;
function moveStar() {
  if (!active) return;
  const rect = board.getBoundingClientRect();
  const x = 18 + Math.random() * Math.max(10, rect.width - 58);
  const y = 76 + Math.random() * Math.max(10, rect.height - 125);
  target.style.left = `${x}px`; target.style.top = `${y}px`;
}
function stopGameTimers() { clearInterval(clock); clearInterval(jumpTimer); clock = null; jumpTimer = null; }
function resetGame() {
  stopGameTimers(); active = false; score = 0; time = 15;
  scoreText.textContent = '0'; timeText.textContent = '15';
  target.hidden = true; message.hidden = false;
  message.querySelector('strong').textContent = 'Your mini mission awaits.';
  message.querySelector('span').textContent = 'Press start to launch.';
  start.innerHTML = 'Start side quest <span>↗</span>';
  start.disabled = false; status.textContent = 'Ready when you are.';
}
function endGame() {
  active = false; stopGameTimers(); target.hidden = true; message.hidden = false;
  message.querySelector('strong').textContent = `Mission complete: ${score} stardust!`;
  message.querySelector('span').textContent = score >= 12 ? 'Amazing reflexes, cosmic explorer!' : 'Nice run. Try again and beat your score.';
  start.innerHTML = 'Play again <span>↗</span>'; start.disabled = false;
  status.textContent = `Final score: ${score}. Press reset to clear your score.`;
}
start.addEventListener('click', () => {
  stopGameTimers(); score = 0; time = 15; active = true;
  scoreText.textContent = '0'; timeText.textContent = '15';
  message.hidden = true; target.hidden = false;
  start.innerHTML = 'Playing… <span>✦</span>'; start.disabled = true;
  status.textContent = 'Go! Catch as many stars as you can.';
  moveStar(); jumpTimer = setInterval(moveStar, 850);
  clock = setInterval(() => { time--; timeText.textContent = time; if (time <= 0) endGame(); }, 1000);
});
reset.addEventListener('click', resetGame);
target.addEventListener('click', () => {
  if (!active) return; score++; scoreText.textContent = score;
  target.textContent = Math.random() > .7 ? '✧' : '✦'; moveStar();
});
board.addEventListener('click', event => { if (active && event.target === board) status.textContent = 'Almost! Tap the glowing star itself.'; });

// Family gallery modal: galaxy transition, zoomed photo, and selectable family list.
const familyModal = document.querySelector('#familyModal');
const openFamily = document.querySelector('#openFamily');
const closeFamily = document.querySelector('#closeFamily');
const largeFamilyPhoto = document.querySelector('#familyLargePhoto');
const familyRole = document.querySelector('#familyRole');
const familyButtons = document.querySelectorAll('.family-member');
let previouslyFocused = null;
function showFamilyModal(){previouslyFocused=document.activeElement;familyModal.classList.add('open');familyModal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');closeFamily.focus();}
function hideFamilyModal(){familyModal.classList.remove('open');familyModal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');if(previouslyFocused)previouslyFocused.focus();}
openFamily.addEventListener('click',showFamilyModal);closeFamily.addEventListener('click',hideFamilyModal);
familyModal.addEventListener('click',event=>{if(event.target===familyModal)hideFamilyModal();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&familyModal.classList.contains('open'))hideFamilyModal();});
familyButtons.forEach(button=>{button.setAttribute('aria-pressed',button.classList.contains('active')?'true':'false');button.addEventListener('click',()=>{familyButtons.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-pressed','false');});button.classList.add('active');button.setAttribute('aria-pressed','true');largeFamilyPhoto.style.opacity='0';largeFamilyPhoto.style.transform='scale(.86) rotate(-2deg)';window.setTimeout(()=>{largeFamilyPhoto.src=button.dataset.photo;largeFamilyPhoto.alt=button.dataset.name;familyRole.textContent=button.dataset.name;largeFamilyPhoto.style.opacity='';largeFamilyPhoto.style.transform='';largeFamilyPhoto.style.animation='none';void largeFamilyPhoto.offsetWidth;largeFamilyPhoto.style.animation='';},140);});});

// Favorite music player opens only when the visitor chooses it, and stops on close.
const musicModal = document.querySelector('#musicModal');
const openMusic = document.querySelector('#openMusic');
const closeMusic = document.querySelector('#closeMusic');
const favoriteMusicFrame = document.querySelector('#favoriteMusicFrame');
let musicPreviousFocus = null;
function showMusicModal(){
  musicPreviousFocus = document.activeElement;
  favoriteMusicFrame.currentTime = 0;
  const playAttempt = favoriteMusicFrame.play();
  if (playAttempt && typeof playAttempt.catch === 'function') playAttempt.catch(()=>{});
  musicModal.classList.add('open');
  musicModal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  closeMusic.focus();
}
function hideMusicModal(){
  musicModal.classList.remove('open');
  musicModal.setAttribute('aria-hidden','true');
  favoriteMusicFrame.pause();
  favoriteMusicFrame.currentTime = 0;
  document.body.classList.remove('modal-open');
  if(musicPreviousFocus) musicPreviousFocus.focus();
}
openMusic.addEventListener('click',showMusicModal);
closeMusic.addEventListener('click',hideMusicModal);
musicModal.addEventListener('click',event=>{if(event.target===musicModal)hideMusicModal();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&musicModal.classList.contains('open'))hideMusicModal();});
