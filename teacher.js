'use strict';

/* ══ DATA ══════════════════════════════════════════════════════ */
const CLASSES_DATA = [
  { id:0, lang:'ES', name:'Spanish Morning Session', level:'Intermediate', students:12, schedule:'Mon·Wed·Fri 09:00', duration:60, status:'live', desc:'Conversational practice and grammar review.' },
  { id:1, lang:'ES', name:'Advanced Grammar Workshop', level:'Advanced', students:8, schedule:'Thu 14:00', duration:90, status:'scheduled', desc:'Deep dive into subjunctive and compound tenses.' },
  { id:2, lang:'ES', name:'Spanish Evening — Conversation', level:'Intermediate', students:15, schedule:'Mon·Thu 18:00', duration:60, status:'scheduled', desc:'Free conversation with guided topics.' },
  { id:3, lang:'FR', name:'French Culture & Idioms', level:'Advanced', students:9, schedule:'Tue·Fri 16:00', duration:75, status:'scheduled', desc:'French culture, expressions and idioms.' },
  { id:4, lang:'ES', name:'Beginners Spanish A1', level:'Beginner', students:20, schedule:'Sat 10:00', duration:60, status:'scheduled', desc:'Core vocabulary and basic sentence structure.' },
  { id:5, lang:'ES', name:'Summer Intensive Draft', level:'Intermediate', students:0, schedule:'TBD', duration:120, status:'draft', desc:'Intensive course draft — not yet published.' },
];

const STUDENTS_DATA = [
  { name:'Alex Kim',      initials:'AK', hue:200, lang:'Spanish', level:'Intermediate', streak:14, lastActive:'2 min ago',   progress:78, lessons:23, xp:1840, skills:{Vocab:82, Grammar:75, Listening:70, Speaking:65, Reading:88, Writing:60} },
  { name:'Maria Garcia',  initials:'MG', hue:330, lang:'Spanish', level:'Intermediate', streak:7,  lastActive:'Yesterday',    progress:65, lessons:18, xp:1430, skills:{Vocab:72, Grammar:60, Listening:65, Speaking:55, Reading:75, Writing:50} },
  { name:'Yuki Tanaka',   initials:'YT', hue:280, lang:'Spanish', level:'Intermediate', streak:21, lastActive:'1 hour ago',   progress:42, lessons:10, xp:2840, skills:{Vocab:50, Grammar:45, Listening:38, Speaking:35, Reading:55, Writing:30} },
  { name:'Hassan Al-F.',  initials:'HA', hue:160, lang:'Spanish', level:'Beginner',     streak:5,  lastActive:'3 hours ago',  progress:30, lessons:8,  xp:620,  skills:{Vocab:35, Grammar:28, Listening:32, Speaking:25, Reading:40, Writing:20} },
  { name:'Emma Walker',   initials:'EW', hue:45,  lang:'Spanish', level:'Intermediate', streak:9,  lastActive:'4 hours ago',  progress:71, lessons:20, xp:1210, skills:{Vocab:75, Grammar:68, Listening:72, Speaking:60, Reading:80, Writing:55} },
  { name:'Carlos Reyes',  initials:'CR', hue:0,   lang:'Spanish', level:'Advanced',     streak:3,  lastActive:'2 days ago',   progress:88, lessons:35, xp:1620, skills:{Vocab:90, Grammar:88, Listening:82, Speaking:80, Reading:92, Writing:78} },
  { name:'Léa Bernard',   initials:'LB', hue:250, lang:'French',  level:'Advanced',     streak:18, lastActive:'30 min ago',   progress:91, lessons:41, xp:3100, skills:{Vocab:95, Grammar:92, Listening:88, Speaking:90, Reading:94, Writing:85} },
  { name:'Omar Saleh',    initials:'OS', hue:120, lang:'French',  level:'Intermediate', streak:6,  lastActive:'Yesterday',    progress:54, lessons:14, xp:890,  skills:{Vocab:60, Grammar:50, Listening:55, Speaking:45, Reading:65, Writing:42} },
];

const LESSONS_DATA = [
  { id:0, lang:'Spanish', title:'Pretérito Indefinido — Past Tense', level:'Intermediate', duration:'45 min', status:'published', objectives:'Students will conjugate regular -ar, -er, -ir verbs in the preterite. Distinguish between completed actions and ongoing ones.', vocab:[['hablar','to speak'],['comer','to eat'],['vivir','to live'],['ayer','yesterday'],['la semana pasada','last week']], exercises:[{type:'Translation', content:'Translate: "I spoke with my teacher yesterday."'},{type:'Fill-blank', content:'Yo _____ (comer) pizza anoche.'},{type:'Multiple choice', content:'Which ending for "ellos" with -AR verbs? → -aron'}] },
  { id:1, lang:'Spanish', title:'Ser vs. Estar — The Eternal Debate', level:'Beginner', duration:'60 min', status:'published', objectives:'Students will correctly identify when to use ser vs. estar. Apply rules to describe people, places, and states.', vocab:[['ser','to be (permanent)'],['estar','to be (temporary)'],['cansado','tired'],['médico','doctor'],['en casa','at home']], exercises:[{type:'Translation', content:'Translate: "She is a teacher (profession)."'},{type:'Fill-blank', content:'Él _____ cansado hoy. (ser/estar)'}] },
  { id:2, lang:'French', title:'Les Expressions Idiomatiques', level:'Advanced', duration:'75 min', status:'published', objectives:'Students will recognise and use 15 common French idiomatic expressions in context. Discuss cultural origins.', vocab:[['avoir le cafard','to feel down'],['casser les pieds','to annoy'],['filer à l\'anglaise','to sneak away'],['avoir le cafard','feeling blue']], exercises:[{type:'Translation', content:'Use "avoir le cafard" in a sentence.'},{type:'Multiple choice', content:'What does "filer à l\'anglaise" mean?'}] },
  { id:3, lang:'Spanish', title:'Subjuntivo — Introduction', level:'Advanced', duration:'90 min', status:'draft', objectives:'Draft — in progress. Students will form the present subjunctive and use it in wish/doubt constructions.', vocab:[], exercises:[] },
];

/* ══ STATE ═════════════════════════════════════════════════════ */
let teacherName  = 'Sofia Müller';
let teacherLang  = 'Spanish';
let currentSection = 'dashboard';
let selectedStudent = null;
let selectedLesson  = null;
let sidebarCollapsed = false;
let toastTimeout;
let studentsFilter = { lang:'', level:'', sort:'name', search:'' };

const $ = id => document.getElementById(id);

/* ══ GATE ══════════════════════════════════════════════════════ */
$('gate-enter').addEventListener('click', () => {
  teacherName = $('gate-name').value.trim() || 'Sofia Müller';
  teacherLang = $('gate-lang').value;
  initApp();
  $('gate').classList.remove('active');
  $('app').classList.add('active');
});

$('gate-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('gate-enter').click();
});

/* ══ INIT ══════════════════════════════════════════════════════ */
function initApp() {
  const initials = teacherName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  $('teacher-avatar-sm').textContent = initials;
  $('topbar-avatar').textContent     = initials;
  $('teacher-profile-name').textContent = teacherName;
  $('teacher-profile-role').textContent = `${teacherLang} Teacher`;

  // Dashboard
  const hour = new Date().getHours();
  $('dash-greeting').textContent = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,';
  $('dash-name').innerHTML = teacherName.split(' ')[0] + '.';
  const now = new Date();
  $('dash-date').textContent = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Clock
  const tick = () => { $('topbar-clock').textContent = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); };
  tick(); setInterval(tick, 1000);

  // Wire nav
  document.querySelectorAll('.snav-item').forEach(item => {
    item.addEventListener('click', () => switchSection(item.dataset.section));
  });

  // Wire quick-action buttons and dashboard card-actions
  document.querySelectorAll('[data-section]').forEach(el => {
    if (!el.classList.contains('snav-item')) {
      el.addEventListener('click', () => switchSection(el.dataset.section));
    }
  });

  $('qa-live').addEventListener('click', () => window.location.href = '/classroom.html');
  $('go-live-btn').addEventListener('click', () => window.location.href = '/classroom.html');
  $('logout-btn').addEventListener('click', () => {
    $('app').classList.remove('active');
    $('gate').classList.add('active');
  });

  // Sidebar collapse
  $('sidebar-collapse').addEventListener('click', () => {
    sidebarCollapsed = !sidebarCollapsed;
    document.getElementById('sidebar').classList.toggle('collapsed', sidebarCollapsed);
  });
  $('topbar-menu').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  });

  buildClasses();
  buildStudents();
  buildLessons();
  initModals();

  // Classes tab filter
  document.querySelectorAll('.ftab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterClasses(tab.dataset.filter);
    });
  });

  // Students filters
  $('students-search').addEventListener('input', e => { studentsFilter.search = e.target.value; renderStudents(); });
  $('stu-lang-filter').addEventListener('change', e => { studentsFilter.lang = e.target.value; renderStudents(); });
  $('stu-level-filter').addEventListener('change', e => { studentsFilter.level = e.target.value; renderStudents(); });
  $('stu-sort').addEventListener('change', e => { studentsFilter.sort = e.target.value; renderStudents(); });

  $('sdp-close').addEventListener('click', closeStudentDetail);
  $('le-delete-btn').addEventListener('click', deleteLesson);
  $('le-draft-btn').addEventListener('click', () => saveLessonState('draft'));
  $('le-publish-btn').addEventListener('click', () => saveLessonState('published'));
  $('add-vocab-btn').addEventListener('click', addVocabRow);
  $('add-exercise-btn').addEventListener('click', addExerciseRow);
  $('new-lesson-btn').addEventListener('click', createNewLesson);

  // Period tabs
  document.querySelectorAll('.period-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Simulate live activity
  simulateLiveActivity();
}

/* ══ SECTION SWITCHING ═════════════════════════════════════════ */
function switchSection(name) {
  if (!name) return;
  currentSection = name;
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.snav-item').forEach(i => i.classList.remove('active'));
  const sec = $(`section-${name}`);
  if (sec) sec.classList.add('active');
  const navItem = document.querySelector(`.snav-item[data-section="${name}"]`);
  if (navItem) navItem.classList.add('active');
  $('topbar-breadcrumb').textContent = name.charAt(0).toUpperCase() + name.slice(1);
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('mobile-open');
  // Close student detail
  if (name !== 'students') closeStudentDetail();
}

/* ══ CLASSES ═══════════════════════════════════════════════════ */
function buildClasses() {
  renderClasses(CLASSES_DATA);
}

function renderClasses(list) {
  const container = $('classes-list');
  container.innerHTML = '';
  list.forEach(cls => {
    const row = document.createElement('div');
    row.className = 'class-row';
    row.dataset.id = cls.id;
    const chipClass = cls.status === 'live' ? 'live' : cls.status === 'draft' ? 'draft' : 'scheduled';
    const chipText = cls.status === 'live' ? '● Live' : cls.status === 'draft' ? 'Draft' : 'Scheduled';
    const startAction = cls.status === 'live'
      ? `<button class="cr-action primary" onclick="window.location.href='/classroom.html'">Join Live →</button>`
      : cls.status === 'draft'
        ? `<button class="cr-action" onclick="publishClass(${cls.id})">Publish</button>`
        : `<button class="cr-action" onclick="startClass(${cls.id})">Start</button>`;
    row.innerHTML = `
      <div class="class-row-badge">${cls.lang}</div>
      <div class="class-row-info">
        <div class="class-row-name">${cls.name}</div>
        <div class="class-row-meta">${cls.level} · ${cls.schedule} · ${cls.duration} min</div>
      </div>
      <div class="class-row-stats">
        <div class="cr-stat"><div class="cr-stat-val">${cls.students}</div><div class="cr-stat-lab">Students</div></div>
        <div class="cr-stat"><div class="cr-stat-val">${cls.duration}m</div><div class="cr-stat-lab">Duration</div></div>
      </div>
      <div class="class-row-status"><span class="status-chip ${chipClass}">${chipText}</span></div>
      <div class="class-row-actions">
        ${startAction}
        <button class="cr-action" onclick="editClass(${cls.id})">Edit</button>
        <button class="cr-action danger" onclick="deleteClass(${cls.id})">Remove</button>
      </div>`;
    container.appendChild(row);
  });
  if (list.length === 0) {
    container.innerHTML = '<div style="padding:2rem;text-align:center;font-family:var(--mono);font-size:.5rem;letter-spacing:.2em;text-transform:uppercase;color:var(--text-dim)">No classes found</div>';
  }
}

function filterClasses(filter) {
  if (filter === 'all') renderClasses(CLASSES_DATA);
  else renderClasses(CLASSES_DATA.filter(c => c.status === filter));
}

window.startClass = (id) => { showToast('Opening classroom…'); setTimeout(() => window.location.href = '/classroom.html', 600); };
window.publishClass = (id) => {
  const cls = CLASSES_DATA.find(c => c.id === id);
  if (cls) { cls.status = 'scheduled'; renderClasses(CLASSES_DATA); showToast(`${cls.name} published`); }
};
window.editClass = (id) => { showToast('Edit mode — coming soon'); };
window.deleteClass = (id) => {
  const idx = CLASSES_DATA.findIndex(c => c.id === id);
  if (idx > -1) { const name = CLASSES_DATA[idx].name; CLASSES_DATA.splice(idx, 1); renderClasses(CLASSES_DATA); showToast(`"${name}" removed`); }
};

/* ── NEW CLASS MODAL ─────────────────────────────────────────── */
$('new-class-btn').addEventListener('click', () => openModal('new-class-modal'));
$('nc-submit').addEventListener('click', () => {
  const name = $('nc-name').value.trim();
  if (!name) { showToast('Please enter a class name'); return; }
  const newCls = {
    id: CLASSES_DATA.length,
    lang: $('nc-lang').value.slice(0,2).toUpperCase(),
    name, level: $('nc-level').value,
    students: 0, schedule: $('nc-schedule').value || 'TBD',
    duration: parseInt($('nc-duration').value) || 60,
    status: 'draft', desc: $('nc-desc').value
  };
  CLASSES_DATA.push(newCls);
  renderClasses(CLASSES_DATA);
  closeModal('new-class-modal');
  showToast(`"${name}" created as draft`);
  ['nc-name','nc-desc','nc-schedule','nc-max','nc-duration'].forEach(id => { const el = $(id); if(el) el.value = ''; });
});

/* ══ STUDENTS ══════════════════════════════════════════════════ */
function buildStudents() { renderStudents(); }

function renderStudents() {
  let list = [...STUDENTS_DATA];
  if (studentsFilter.search) {
    const q = studentsFilter.search.toLowerCase();
    list = list.filter(s => s.name.toLowerCase().includes(q));
  }
  if (studentsFilter.lang) list = list.filter(s => s.lang === studentsFilter.lang);
  if (studentsFilter.level) list = list.filter(s => s.level === studentsFilter.level);
  if (studentsFilter.sort === 'progress') list.sort((a,b) => b.progress - a.progress);
  else if (studentsFilter.sort === 'streak') list.sort((a,b) => b.streak - a.streak);
  else if (studentsFilter.sort === 'active') list.sort((a,b) => a.lastActive.localeCompare(b.lastActive));
  else list.sort((a,b) => a.name.localeCompare(b.name));

  const tbody = $('students-tbody');
  tbody.innerHTML = '';
  list.forEach((s, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="stu-name-cell">
          <div class="act-avatar" style="--hue:${s.hue}">${s.initials}</div>
          <span class="stu-name">${s.name}</span>
          <span class="stu-lang-badge">${s.lang.slice(0,2).toUpperCase()}</span>
        </div>
      </td>
      <td><span class="stu-lang-badge">${s.lang}</span></td>
      <td><span class="stu-level">${s.level}</span></td>
      <td><span class="stu-streak">${s.streak > 0 ? '🔥' : ''} ${s.streak}d</span></td>
      <td><span class="stu-active">${s.lastActive}</span></td>
      <td>
        <div class="stu-progress-wrap">
          <div class="stu-prog-track"><div class="stu-prog-fill" style="width:${s.progress}%"></div></div>
          <span class="stu-prog-pct">${s.progress}%</span>
        </div>
      </td>
      <td><button class="stu-view-btn" data-idx="${idx}">View →</button></td>`;
    tr.querySelector('.stu-view-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openStudentDetail(s);
    });
    tr.addEventListener('click', () => openStudentDetail(s));
    tbody.appendChild(tr);
  });
}

function openStudentDetail(s) {
  selectedStudent = s;
  $('sdp-avatar').textContent = s.initials;
  $('sdp-avatar').style.setProperty('--hue', s.hue);
  $('sdp-name').textContent = s.name;
  $('sdp-role').textContent = `${s.lang} · ${s.level}`;
  $('sdp-streak').textContent = s.streak;
  $('sdp-lessons').textContent = s.lessons;
  $('sdp-xp').textContent = s.xp.toLocaleString();
  $('sdp-notes').value = s.notes || '';

  const skillsEl = $('sdp-skills');
  skillsEl.innerHTML = '';
  Object.entries(s.skills).forEach(([skill, pct]) => {
    const row = document.createElement('div');
    row.className = 'sdp-skill-row';
    row.innerHTML = `<div class="sdp-skill-name">${skill}</div><div class="sdp-skill-track"><div class="sdp-skill-fill" style="width:${pct}%"></div></div><div class="sdp-skill-pct">${pct}%</div>`;
    skillsEl.appendChild(row);
  });

  document.getElementById('student-detail').classList.add('open');
}

function closeStudentDetail() {
  document.getElementById('student-detail').classList.remove('open');
  selectedStudent = null;
}

document.querySelector('.sdp-save-notes').addEventListener('click', () => {
  if (selectedStudent) { selectedStudent.notes = $('sdp-notes').value; showToast('Notes saved'); }
});

/* ══ LESSONS ═══════════════════════════════════════════════════ */
function buildLessons() { renderLessonList(); }

function renderLessonList() {
  const list = $('lesson-list');
  list.innerHTML = '';
  LESSONS_DATA.forEach(lesson => {
    const card = document.createElement('div');
    card.className = `lesson-card${selectedLesson && selectedLesson.id === lesson.id ? ' active' : ''}`;
    card.dataset.id = lesson.id;
    card.innerHTML = `
      <div class="lc-lang">${lesson.lang}</div>
      <div class="lc-title">${lesson.title}</div>
      <div class="lc-meta">${lesson.duration} · Updated recently</div>
      <div class="lc-status">
        <span class="lc-level">${lesson.level}</span>
        <span class="${lesson.status === 'published' ? 'lc-pub' : 'lc-draft'}">${lesson.status === 'published' ? '● Published' : 'Draft'}</span>
      </div>`;
    card.addEventListener('click', () => openLessonEditor(lesson));
    list.appendChild(card);
  });
}

function openLessonEditor(lesson) {
  selectedLesson = lesson;
  renderLessonList(); // re-render to update active state

  $('le-placeholder').style.display = 'none';
  $('le-form').style.display = 'flex';
  $('le-title').value = lesson.title;
  $('le-lang').value = lesson.lang;
  $('le-level').value = lesson.level;
  $('le-duration-edit').value = lesson.duration;
  $('le-objectives').value = lesson.objectives;

  // Vocab
  const vList = $('vocab-list');
  vList.innerHTML = '';
  lesson.vocab.forEach(([native, target]) => addVocabRow(native, target));

  // Exercises
  const eList = $('exercise-list');
  eList.innerHTML = '';
  lesson.exercises.forEach(ex => addExerciseRow(ex.type, ex.content));
}

function createNewLesson() {
  const newLesson = {
    id: LESSONS_DATA.length,
    lang:'Spanish', title:'New Lesson', level:'Beginner',
    duration:'45 min', status:'draft',
    objectives:'', vocab:[], exercises:[]
  };
  LESSONS_DATA.unshift(newLesson);
  buildLessons();
  openLessonEditor(newLesson);
  showToast('New lesson created');
}

function saveLessonState(status) {
  if (!selectedLesson) return;
  selectedLesson.title    = $('le-title').value || selectedLesson.title;
  selectedLesson.lang     = $('le-lang').value;
  selectedLesson.level    = $('le-level').value;
  selectedLesson.duration = $('le-duration-edit').value;
  selectedLesson.objectives = $('le-objectives').value;
  selectedLesson.status   = status;

  // Collect vocab
  const rows = $('vocab-list').querySelectorAll('.vocab-row');
  selectedLesson.vocab = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('.vocab-input');
    if (inputs[0].value) selectedLesson.vocab.push([inputs[0].value, inputs[1]?.value || '']);
  });

  renderLessonList();
  showToast(status === 'published' ? 'Lesson published!' : 'Draft saved');
}

function deleteLesson() {
  if (!selectedLesson) return;
  const idx = LESSONS_DATA.findIndex(l => l.id === selectedLesson.id);
  if (idx > -1) {
    const title = selectedLesson.title;
    LESSONS_DATA.splice(idx, 1);
    selectedLesson = null;
    $('le-form').style.display = 'none';
    $('le-placeholder').style.display = '';
    renderLessonList();
    showToast(`"${title}" deleted`);
  }
}

function addVocabRow(native='', target='') {
  const vList = $('vocab-list');
  const row = document.createElement('div');
  row.className = 'vocab-row';
  row.innerHTML = `
    <input class="vocab-input" type="text" placeholder="Native word" value="${native}">
    <span class="vocab-sep">→</span>
    <input class="vocab-input" type="text" placeholder="Target language" value="${target}">
    <button class="vocab-remove" title="Remove">×</button>`;
  row.querySelector('.vocab-remove').addEventListener('click', () => row.remove());
  vList.appendChild(row);
}

function addExerciseRow(type='Translation', content='') {
  const TYPES = ['Translation','Fill-blank','Multiple choice','Speaking'];
  const eList = $('exercise-list');
  const row = document.createElement('div');
  row.className = 'exercise-row';
  const typeSelect = `<select class="ex-type" style="font-family:var(--mono);font-size:.42rem;letter-spacing:.1em;background:transparent;border:1px solid var(--gold-dim);color:var(--gold);padding:.2rem .5rem;cursor:pointer;outline:none;-webkit-appearance:none;">${TYPES.map(t => `<option${t===type?' selected':''}>${t}</option>`).join('')}</select>`;
  row.innerHTML = `${typeSelect}<input class="vocab-input ex-content" type="text" placeholder="Exercise prompt…" value="${content}" style="flex:1;padding:.4rem 0;border-bottom:1px solid rgba(184,147,90,.12);font-size:.82rem;"><button class="vocab-remove" title="Remove">×</button>`;
  row.querySelector('.vocab-remove').addEventListener('click', () => row.remove());
  eList.appendChild(row);
}

/* ══ MODALS ════════════════════════════════════════════════════ */
function initModals() {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
  });
}

function openModal(id) { const el = $(id); if (el) el.classList.add('open'); }
function closeModal(id) { const el = $(id); if (el) el.classList.remove('open'); }

/* ══ TOAST ═════════════════════════════════════════════════════ */
function showToast(text) {
  const el = $('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ══ LIVE ACTIVITY SIMULATION ══════════════════════════════════ */
function simulateLiveActivity() {
  const events = [
    { who:'Emma Walker',   initials:'EW', hue:45,  action:'submitted a vocabulary quiz', score:'good', scoreText:'+14 XP' },
    { who:'Omar Saleh',    initials:'OS', hue:120,  action:'joined Spanish Morning', score:'', scoreText:'' },
    { who:'Carlos Reyes',  initials:'CR', hue:0,    action:'achieved 100% on grammar test', score:'great', scoreText:'100%' },
    { who:'Léa Bernard',   initials:'LB', hue:250,  action:'completed 5 new flashcards', score:'good', scoreText:'+22 XP' },
    { who:'Maria Garcia',  initials:'MG', hue:330,  action:'raised a hand in class', score:'', scoreText:'' },
  ];
  let idx = 0;
  setInterval(() => {
    const ev = events[idx % events.length];
    const list = $('activity-list');
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.style.opacity = '0';
    item.style.transition = 'opacity .5s';
    item.innerHTML = `
      <div class="act-avatar" style="--hue:${ev.hue}">${ev.initials}</div>
      <div class="act-body">
        <div class="act-name">${ev.who} <span class="act-action">${ev.action}</span></div>
        <div class="act-time">just now</div>
      </div>
      ${ev.scoreText ? `<div class="act-score ${ev.score}">${ev.scoreText}</div>` : ''}`;
    list.insertBefore(item, list.firstChild);
    requestAnimationFrame(() => { item.style.opacity = '1'; });
    // Keep list trimmed
    while (list.children.length > 8) list.removeChild(list.lastChild);
    idx++;
  }, 12000);
}

/* ══ INIT ON LOAD ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Focus name input
  const nameInput = $('gate-name');
  if (nameInput) { nameInput.focus(); nameInput.select(); }
});
