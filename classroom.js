'use strict';

/* ══ CLASS DATA ═══════════════════════════════════════════════ */
const CLASSES = [
  {
    id: 0, lang: 'ES', langFull: 'Spanish', badge: 'ES',
    name: 'Spanish Morning Session',
    script: 'Buenos días',
    teacher: { name: 'Sofia Müller', initials: 'SM', hue: 32 },
    topic: 'Conversational · Intermediate',
    students: 12, startOffset: 14 * 60 + 23,
    chatScript: [
      { who: 'teacher', text: '¡Buenos días a todos! Vamos a comenzar con un repaso de ayer.' },
      { who: 'Alex K.', text: 'Buenos días, profesora!' },
      { who: 'Maria G.', text: 'Listo para aprender 🙌' },
      { who: 'teacher', text: 'Hoy practicamos el pretérito indefinido. ¿Quién puede conjugar "hablar"?' },
      { who: 'Yuki T.', text: 'Yo hablé, tú hablaste, él habló…' },
      { who: 'teacher', text: '¡Perfecto, Yuki! Muy bien dicho.' },
      { who: 'Hassan A.', text: 'Qué significa "perfecto" exactamente?' },
      { who: 'teacher', text: 'Great question! It means "perfect" — completo y sin error.' },
      { who: 'Emma W.', text: 'Me encanta esta clase, gracias Sofía!' },
      { who: 'system', text: 'Sofia is sharing their screen' },
      { who: 'teacher', text: 'Ahora miremos la diapositiva — el pretérito indefinido vs. imperfecto.' },
      { who: 'Carlos R.', text: 'La diferencia siempre me confunde un poco…' },
      { who: 'teacher', text: 'Es normal al principio. Regla clave: indefinido = acción terminada. ¿Claro?' },
      { who: 'Carlos R.', text: '¡Sí! Mucho más claro ahora 👍' },
      { who: 'Léa B.', text: 'Tengo una pregunta sobre los verbos irregulares' },
    ]
  },
  {
    id: 1, lang: 'FR', langFull: 'French', badge: 'FR',
    name: 'French Evening Conversation',
    script: 'Bonsoir',
    teacher: { name: 'Pierre Laurent', initials: 'PL', hue: 210 },
    topic: 'Culture & Idioms · Advanced',
    students: 8, startOffset: 2 * 60 + 47,
    chatScript: [
      { who: 'teacher', text: 'Bonsoir tout le monde! Ce soir, on parle d\'expressions idiomatiques.' },
      { who: 'Alex K.', text: 'J\'adore les expressions françaises!' },
      { who: 'teacher', text: 'Commençons: "avoir le cafard" — qu\'est-ce que ça veut dire selon vous?' },
      { who: 'Maria G.', text: 'Avoir... une cafard? Un insecte??' },
      { who: 'teacher', text: 'Bonne intuition! Cafard = cockroach. Mais l\'expression signifie "être déprimé".' },
      { who: 'Emma W.', text: 'Oh intéressant! Merci Pierre.' },
    ]
  },
  {
    id: 2, lang: 'JA', langFull: 'Japanese', badge: 'JA',
    name: 'Japanese for Beginners',
    script: 'はじめまして',
    teacher: { name: 'Yuna Takahashi', initials: 'YT', hue: 340 },
    topic: 'Hiragana & Greetings · Beginner',
    students: 19, startOffset: 31 * 60 + 5,
    chatScript: [
      { who: 'teacher', text: 'おはようございます！Today we finish the hiragana chart. Ready?' },
      { who: 'Alex K.', text: 'はい！I studied all weekend.' },
      { who: 'teacher', text: 'Wonderful! Let\'s start with the "na" row: な、に、ぬ、ね、の' },
      { who: 'Maria G.', text: 'The stroke order for ぬ is tricky...' },
      { who: 'teacher', text: 'Good observation! Watch the loop at the end — it\'s one fluid stroke.' },
    ]
  },
  {
    id: 3, lang: 'AR', langFull: 'Arabic', badge: 'AR',
    name: 'Arabic Culture & Script',
    script: 'مرحبا بكم',
    teacher: { name: 'Hassan Al-Farsi', initials: 'HA', hue: 160 },
    topic: 'Script & Pronunciation · Beginner',
    students: 6, startOffset: 7 * 60 + 18,
    chatScript: [
      { who: 'teacher', text: 'أهلاً وسهلاً! Welcome everyone. Today: the Arabic alphabet, letters 1–5.' },
      { who: 'Emma W.', text: 'Excited to start! This looks so beautiful.' },
      { who: 'teacher', text: 'Arabic is read right-to-left. First letter: أ (Alif). Repeat after me: آ' },
      { who: 'Carlos R.', text: 'This is so different from anything I\'ve studied before!' },
      { who: 'teacher', text: 'That\'s what makes it special! The script is art itself. Let\'s continue.' },
    ]
  }
];

const PARTICIPANTS = [
  { name: 'Alex K.',   initials: 'AK', hue: 200,  mic: true,  cam: true  },
  { name: 'Maria G.',  initials: 'MG', hue: 330,  mic: true,  cam: false },
  { name: 'Yuki T.',   initials: 'YT', hue: 280,  mic: false, cam: true  },
  { name: 'Hassan A.', initials: 'HA', hue: 160,  mic: true,  cam: false },
  { name: 'Emma W.',   initials: 'EW', hue: 45,   mic: true,  cam: true  },
  { name: 'Carlos R.', initials: 'CR', hue: 0,    mic: false, cam: false },
  { name: 'Léa B.',    initials: 'LB', hue: 250,  mic: true,  cam: true  },
];

/* ══ STATE ════════════════════════════════════════════════════ */
let currentClass   = null;
let classTimerSec  = 0;
let classTimerInt  = null;
let lobbyTimers    = [];
let chatIdx        = 0;
let chatTimeout    = null;
let speakInterval  = null;
let userMic        = true;
let userCam        = true;
let sidebarOpen    = false;
let activeTab      = 'chat';
let handRaised     = false;
let screenSharing  = false;
let userName       = 'You';
let prejoinMic     = true;
let prejoinCam     = true;
let myHandRaised   = false;
let studentHands   = {};

/* ══ HELPERS ══════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const formatTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}

/* ══ LOBBY ════════════════════════════════════════════════════ */
function initLobby() {
  lobbyTimers.forEach(clearInterval);
  lobbyTimers = [];

  CLASSES.forEach((cls, i) => {
    let elapsed = cls.startOffset;
    const countEl = $(`c${i}-count`);
    const timerEl = $(`c${i}-timer`);
    if (timerEl) timerEl.textContent = formatTime(elapsed);

    const t = setInterval(() => {
      elapsed++;
      if (timerEl) timerEl.textContent = formatTime(elapsed);
      // Occasionally bump student count
      if (Math.random() < .003 && countEl) {
        cls.students = Math.min(cls.students + 1, 30);
        countEl.textContent = cls.students;
      }
    }, 1000);
    lobbyTimers.push(t);
  });

  const clockEl = $('lobby-clock');
  const clockTick = () => {
    const now = new Date();
    if (clockEl) clockEl.textContent = now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  };
  clockTick();
  const clockInt = setInterval(clockTick, 1000);
  lobbyTimers.push(clockInt);

  document.querySelectorAll('.class-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.class);
      openPrejoin(idx);
    });
  });
}

/* ══ PRE-JOIN ═════════════════════════════════════════════════ */
function openPrejoin(classIdx) {
  lobbyTimers.forEach(clearInterval);
  lobbyTimers = [];
  currentClass = CLASSES[classIdx];

  $('pj-lang-badge').textContent    = currentClass.badge;
  $('pj-class-name').textContent    = currentClass.name;
  $('pj-teacher-name').textContent  = currentClass.teacher.name;
  $('pj-teacher-avatar').textContent= currentClass.teacher.initials;
  $('pj-teacher-avatar').style.setProperty('--hue', currentClass.teacher.hue);
  $('pj-topic').textContent         = currentClass.topic;
  $('pj-student-count').textContent = `${currentClass.students} students in session`;

  let elapsed = currentClass.startOffset;
  $('pj-live-time').textContent = `● ${formatTime(elapsed)}`;
  const t = setInterval(() => { elapsed++; $('pj-live-time').textContent = `● ${formatTime(elapsed)}`; }, 1000);
  lobbyTimers.push(t);

  $('pj-avatar').textContent = 'Y';
  prejoinMic = true; prejoinCam = true;
  updatePrejoinMic(); updatePrejoinCam();

  showScreen('screen-prejoin');
}

$('pj-back').addEventListener('click', () => {
  lobbyTimers.forEach(clearInterval); lobbyTimers = [];
  showScreen('screen-lobby');
  initLobby();
});

$('pj-mic-btn').addEventListener('click', () => {
  prejoinMic = !prejoinMic; updatePrejoinMic();
});
$('pj-cam-btn').addEventListener('click', () => {
  prejoinCam = !prejoinCam; updatePrejoinCam();
});

function updatePrejoinMic() {
  const btn = $('pj-mic-btn');
  btn.querySelector('.icon-mic-on').style.display = prejoinMic ? '' : 'none';
  btn.querySelector('.icon-mic-off').style.display = prejoinMic ? 'none' : '';
  btn.classList.toggle('active', prejoinMic);
  btn.classList.toggle('muted', !prejoinMic);
}
function updatePrejoinCam() {
  const btn = $('pj-cam-btn');
  btn.querySelector('.icon-cam-on').style.display = prejoinCam ? '' : 'none';
  btn.querySelector('.icon-cam-off').style.display = prejoinCam ? 'none' : '';
  btn.classList.toggle('active', prejoinCam);
  btn.classList.toggle('muted', !prejoinCam);
  $('pj-camera').style.opacity = prejoinCam ? '1' : '.5';
  $('pj-cam-off').style.display = prejoinCam ? 'none' : '';
}

$('pj-name-input').addEventListener('input', e => {
  userName = e.target.value.trim() || 'You';
  $('pj-avatar').textContent = (userName[0] || 'Y').toUpperCase();
});

$('pj-join-btn').addEventListener('click', () => {
  userName = $('pj-name-input').value.trim() || 'You';
  userMic = prejoinMic; userCam = prejoinCam;
  openClassroom();
});

/* ══ CLASSROOM ════════════════════════════════════════════════ */
function openClassroom() {
  lobbyTimers.forEach(clearInterval); lobbyTimers = [];
  showScreen('screen-classroom');
  $('cr-class-title').textContent = currentClass.name;

  buildStudentGrid();
  buildPeopleList();
  resetControls();

  classTimerSec = 0;
  clearInterval(classTimerInt);
  classTimerInt = setInterval(() => {
    classTimerSec++;
    $('cr-timer').textContent = formatTime(classTimerSec);
  }, 1000);

  $('cr-count').textContent = currentClass.students + 1;
  $('people-count').textContent = currentClass.students + 1;

  startChatScript();
  startSpeakingSimulation();

  // Reset sidebar
  sidebarOpen = false; activeTab = 'chat';
  $('cr-sidebar').classList.remove('open');
  $('stab-chat').classList.add('active'); $('stab-people').classList.remove('active');
  $('tab-chat').classList.add('active'); $('tab-people').classList.remove('active');

  handRaised = false; screenSharing = false; myHandRaised = false;

  addMsg({ who: 'system', text: `You joined the class`, type:'system' });
}

function buildStudentGrid() {
  const grid = $('student-grid');
  grid.innerHTML = '';
  PARTICIPANTS.forEach((p, i) => {
    const tile = document.createElement('div');
    tile.className = 'video-tile' + (p.cam ? '' : ' cam-off');
    tile.id = `student-tile-${i}`;
    tile.innerHTML = `
      <div class="tile-video-bg">
        <div class="tile-avatar" style="--hue:${p.hue}">${p.initials}</div>
      </div>
      <div class="tile-info">
        <div class="tile-name">${p.name}</div>
      </div>
      <div class="tile-speaking-ring"></div>
      <div class="tile-mic-icon${p.mic ? '' : ' muted'}">
        ${p.mic
          ? '<svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>'
          : '<svg viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 10v-1m14 0v1a7 7 0 01-.11 1.23"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>'}
      </div>`;
    grid.appendChild(tile);
  });
  // Add "You" tile
  const youTile = document.createElement('div');
  youTile.id = 'your-tile';
  youTile.className = 'video-tile' + (userCam ? '' : ' cam-off');
  youTile.innerHTML = `
    <div class="tile-video-bg">
      <div class="tile-avatar" style="--hue:200">${(userName[0]||'Y').toUpperCase()}</div>
    </div>
    <div class="tile-info"><div class="tile-name">${userName} (you)</div></div>
    <div class="tile-speaking-ring"></div>
    <div class="tile-mic-icon${userMic ? '' : ' muted'}">
      ${userMic
        ? '<svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>'
        : '<svg viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 10v-1m14 0v1a7 7 0 01-.11 1.23"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>'}
    </div>`;
  grid.appendChild(youTile);
}

function buildPeopleList() {
  const list = $('people-list');
  list.innerHTML = '';
  const all = [
    { name: currentClass.teacher.name, initials: currentClass.teacher.initials, hue: currentClass.teacher.hue, role:'Teacher', mic:true, cam:true },
    ...PARTICIPANTS,
    { name: `${userName} (you)`, initials: (userName[0]||'Y').toUpperCase(), hue:200, role:'Student', mic:userMic, cam:userCam }
  ];
  all.forEach(p => {
    const row = document.createElement('div');
    row.className = 'person-row';
    row.innerHTML = `
      <div class="avatar-xs" style="--hue:${p.hue}">${p.initials}</div>
      <div class="person-info">
        <div class="person-name">${p.name}</div>
        <div class="person-role">${p.role || 'Student'}</div>
      </div>
      <div class="person-icons">
        <div class="person-icon ${p.mic ? 'on' : 'off'}">
          ${p.mic
            ? '<svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>'
            : '<svg viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 10v-1m14 0v1a7 7 0 01-.11 1.23"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>'}
        </div>
        <div class="person-icon ${p.cam ? 'on' : 'off'}">
          ${p.cam
            ? '<svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>'
            : '<svg viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h4a2 2 0 012 2v9.34"/></svg>'}
        </div>
      </div>`;
    list.appendChild(row);
  });
}

/* ── CHAT SCRIPT ─────────────────────────────────────────────── */
function startChatScript() {
  clearTimeout(chatTimeout);
  chatIdx = 0;
  $('cr-msgs').innerHTML = '';
  scheduleNextMsg();
}

function scheduleNextMsg() {
  const script = currentClass.chatScript;
  if (chatIdx >= script.length) return;
  const delay = chatIdx === 0 ? 1200 : (2500 + Math.random() * 4000);
  chatTimeout = setTimeout(() => {
    const entry = script[chatIdx];
    chatIdx++;
    if (entry.type === 'system' || entry.who === 'system') {
      addMsg({ who: 'system', text: entry.text, type: 'system' });
      if (entry.text.includes('screen')) { activateScreenShare(); }
    } else if (entry.who === 'teacher') {
      addMsg({ who: currentClass.teacher.name, text: entry.text, isTeacher: true });
    } else {
      addMsg({ who: entry.who, text: entry.text });
    }
    scheduleNextMsg();
  }, delay);
}

function addMsg({ who, text, isTeacher=false, isSelf=false, type='' }) {
  const msgs = $('cr-msgs');
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const div = document.createElement('div');
  div.className = `cr-msg${isSelf ? ' self' : ''}${type==='system' ? ' system-msg' : ''}`;
  if (type === 'system') {
    div.innerHTML = `<div class="cr-msg-body">— ${text} —</div>`;
  } else {
    div.innerHTML = `
      <div class="cr-msg-head">
        <span class="cr-msg-name${isTeacher ? ' teacher' : ''}${isSelf ? ' self' : ''}">${who}</span>
        <span class="cr-msg-time">${timeStr}</span>
      </div>
      <div class="cr-msg-body">${text}</div>`;
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;

  if (!isSelf && !sidebarOpen && type !== 'system') {
    showNotif(`${who}: ${text.slice(0,40)}${text.length>40?'…':''}`);
  }
}

/* ── SPEAKING SIMULATION ────────────────────────────────────── */
function startSpeakingSimulation() {
  clearInterval(speakInterval);
  const teacherTile = $('teacher-tile');
  const tiles = [teacherTile, ...[0,1,2,3,4,5,6].map(i => $(`student-tile-${i}`))].filter(Boolean);

  speakInterval = setInterval(() => {
    tiles.forEach(t => t && t.classList.remove('speaking'));
    // Teacher speaks 50% of the time
    if (Math.random() < .5) {
      teacherTile && teacherTile.classList.add('speaking');
    } else {
      // Random student speaks
      const eligible = PARTICIPANTS.filter(p => p.mic);
      if (eligible.length > 0) {
        const rnd = Math.floor(Math.random() * eligible.length);
        const idx = PARTICIPANTS.indexOf(eligible[rnd]);
        const t = $(`student-tile-${idx}`);
        t && t.classList.add('speaking');
      }
    }
  }, 2800);
}

/* ── SCREEN SHARE SIMULATION ─────────────────────────────────── */
function activateScreenShare() {
  const ss = $('screen-share-content');
  if (ss) { ss.style.display = 'flex'; screenSharing = true; }
  setTimeout(() => {
    if (ss) { ss.style.display = 'none'; screenSharing = false; }
    addMsg({ who: 'system', text: 'Sofia stopped sharing their screen', type:'system' });
  }, 25000);
}

/* ── CONTROLS ────────────────────────────────────────────────── */
function resetControls() {
  const micBtn = $('ctrl-mic');
  const camBtn = $('ctrl-cam');
  micBtn.classList.toggle('active', userMic);
  micBtn.classList.toggle('toggled-off', !userMic);
  camBtn.classList.toggle('active', userCam);
  camBtn.classList.toggle('toggled-off', !userCam);
  updateControlIcon(micBtn, userMic);
  updateControlIcon(camBtn, userCam);
}

function updateControlIcon(btn, isOn) {
  const on = btn.querySelector('.icon-on');
  const off = btn.querySelector('.icon-off');
  if (on) on.style.display = isOn ? '' : 'none';
  if (off) off.style.display = isOn ? 'none' : '';
}

$('ctrl-mic').addEventListener('click', () => {
  userMic = !userMic;
  const btn = $('ctrl-mic');
  btn.classList.toggle('active', userMic);
  btn.classList.toggle('toggled-off', !userMic);
  updateControlIcon(btn, userMic);
  showNotif(userMic ? 'Microphone on' : 'Microphone muted');
  // Update your tile mic icon
  const yourTile = $('your-tile');
  if (yourTile) {
    const micIcon = yourTile.querySelector('.tile-mic-icon');
    if (micIcon) micIcon.classList.toggle('muted', !userMic);
  }
});

$('ctrl-cam').addEventListener('click', () => {
  userCam = !userCam;
  const btn = $('ctrl-cam');
  btn.classList.toggle('active', userCam);
  btn.classList.toggle('toggled-off', !userCam);
  updateControlIcon(btn, userCam);
  showNotif(userCam ? 'Camera on' : 'Camera off');
  const yourTile = $('your-tile');
  if (yourTile) yourTile.classList.toggle('cam-off', !userCam);
});

$('ctrl-share').addEventListener('click', () => {
  const btn = $('ctrl-share');
  screenSharing = !screenSharing;
  btn.classList.toggle('hand-on', screenSharing);
  const ss = $('screen-share-content');
  if (ss) ss.style.display = screenSharing ? 'flex' : 'none';
  showNotif(screenSharing ? 'You are sharing your screen' : 'Stopped sharing');
  if (screenSharing) {
    addMsg({ who: 'system', text: `${userName} is sharing their screen`, type:'system' });
  }
});

$('ctrl-hand').addEventListener('click', () => {
  myHandRaised = !myHandRaised;
  const btn = $('ctrl-hand');
  btn.classList.toggle('hand-on', myHandRaised);
  const toast = $('hand-toast');
  if (myHandRaised) {
    toast.classList.add('show');
    addMsg({ who: 'system', text: `${userName} raised their hand ✋`, type:'system' });
    setTimeout(() => { toast.classList.remove('show'); }, 5000);
  } else {
    toast.classList.remove('show');
  }
});

$('ctrl-chat').addEventListener('click', () => {
  toggleSidebar('chat');
});
$('ctrl-people').addEventListener('click', () => {
  toggleSidebar('people');
});

function toggleSidebar(tab) {
  if (!sidebarOpen) {
    sidebarOpen = true;
    $('cr-sidebar').classList.add('open');
    $('ctrl-chat').classList.toggle('sidebar-open', tab === 'chat');
    $('ctrl-people').classList.toggle('sidebar-open', tab === 'people');
    switchTab(tab);
  } else if (activeTab === tab) {
    sidebarOpen = false;
    $('cr-sidebar').classList.remove('open');
    $('ctrl-chat').classList.remove('sidebar-open');
    $('ctrl-people').classList.remove('sidebar-open');
  } else {
    switchTab(tab);
    $('ctrl-chat').classList.toggle('sidebar-open', tab === 'chat');
    $('ctrl-people').classList.toggle('sidebar-open', tab === 'people');
  }
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.stab').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-content').forEach(s => s.classList.remove('active'));
  $(`stab-${tab}`).classList.add('active');
  $(`tab-${tab}`).classList.add('active');
  if (tab === 'chat') {
    const msgs = $('cr-msgs');
    msgs.scrollTop = msgs.scrollHeight;
  }
}

document.querySelectorAll('.stab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

/* ── CHAT INPUT ──────────────────────────────────────────────── */
const chatInput = $('cr-chat-input');
const sendBtn   = $('cr-send-btn');

function sendChatMsg() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMsg({ who: userName, text, isSelf: true });
  chatInput.value = '';
}

sendBtn.addEventListener('click', sendChatMsg);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMsg(); } });

/* ── LEAVE ───────────────────────────────────────────────────── */
function leaveClass() {
  clearInterval(classTimerInt);
  clearInterval(speakInterval);
  clearTimeout(chatTimeout);
  showScreen('screen-lobby');
  initLobby();
}
$('cr-leave-btn').addEventListener('click', leaveClass);
$('ctrl-leave').addEventListener('click', leaveClass);

/* ── NOTIFICATION TOAST ──────────────────────────────────────── */
let notifTimeout;
function showNotif(text) {
  const el = $('notif-toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ══ INIT ═════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLobby();
});
