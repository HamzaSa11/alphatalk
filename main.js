/**
 * TALKORA — Language as a Way of Life
 * main.js — Application logic
 * ─────────────────────────────────────
 * Sections:
 *  1. Custom Cursor
 *  2. Loader
 *  3. Three.js Scene (orb, rings, particles, sprites, lights)
 *  4. Floating UI Glyphs
 *  5. Chat Assistant (Anthropic API)
 *  6. Games Engine
 *     6a. Data (PHRASES, VOCAB, GLYPHS)
 *     6b. Game 1 — Type Racer
 *     6c. Game 2 — Word Flash
 *     6d. Game 3 — Glyph Match
 */

/* ═══════════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════════════ */
const cur = document.getElementById('cur');
const curR = document.getElementById('cur-r');
let mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx+'px'; cur.style.top = my+'px';
});
document.querySelectorAll('button,.n-link').forEach(el => {
  el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
});
(function animCursor(){
  rx += (mx-rx)*.1; ry += (my-ry)*.1;
  curR.style.left = rx+'px'; curR.style.top = ry+'px';
  requestAnimationFrame(animCursor);
})();

/* ═══════════════════════════════════════════════════
   LOADER
═══════════════════════════════════════════════════ */
let prog = 0;
const fill = document.getElementById('lfill');
const lnum = document.getElementById('lnum');
const loaderEl = document.getElementById('loader');
const loadInt = setInterval(()=>{
  prog += Math.random()*3.5 + .5;
  if(prog >= 100){ prog=100; clearInterval(loadInt);
    setTimeout(()=>loaderEl.classList.add('out'), 700);
  }
  fill.style.width = prog+'%';
  lnum.textContent = Math.floor(prog)+'%';
},50);

/* ═══════════════════════════════════════════════════
   THREE.JS
═══════════════════════════════════════════════════ */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0906, 0.028);

const isMobile = innerWidth < 600;
const camera = new THREE.PerspectiveCamera(isMobile ? 70 : 55, innerWidth/innerHeight, .1, 200);
camera.position.set(0, 0, isMobile ? 26 : 22);

// ── CENTRAL ORB
const orbGeo = new THREE.SphereGeometry(3, 80, 80);
const orbMat = new THREE.MeshStandardMaterial({
  color:0x0c0b09, roughness:.05, metalness:.95,
  emissive: new THREE.Color(0x3d2500), emissiveIntensity:.25
});
const orb = new THREE.Mesh(orbGeo, orbMat);
scene.add(orb);

// ── THIN EQUATORIAL RING
const mkRing = (r, tube, color, opac, rx=0, ry=0, rz=0)=>{
  const g = new THREE.TorusGeometry(r, tube, 8, 200);
  const m = new THREE.MeshBasicMaterial({color, transparent:true, opacity:opac});
  const t = new THREE.Mesh(g,m);
  t.rotation.set(rx,ry,rz); scene.add(t); return t;
};
const ring1 = mkRing(4.2, .012, 0xb8935a, .6, Math.PI*.35, 0, .1);
const ring2 = mkRing(5.0, .007, 0xb8935a, .3, -Math.PI*.2, .3, 0);
const ring3 = mkRing(6.0, .004, 0xb8935a, .15, Math.PI*.1, .5, .2);

// ── OUTER WIRE SPHERE
const wGeo = new THREE.SphereGeometry(3.02, 18, 18);
const wMat = new THREE.MeshBasicMaterial({color:0xb8935a, wireframe:true, transparent:true, opacity:.04});
const wire = new THREE.Mesh(wGeo,wMat);
scene.add(wire);

// ── ICOSAHEDRON ACCENT
const icoGeo = new THREE.IcosahedronGeometry(3.3, 1);
const icoMat = new THREE.MeshBasicMaterial({color:0xb8935a, wireframe:true, transparent:true, opacity:.025});
const ico = new THREE.Mesh(icoGeo, icoMat);
scene.add(ico);

// ── PARTICLE FIELD
const PC = 3000;
const pPos = new Float32Array(PC*3);
for(let i=0;i<PC;i++){
  const r=7+Math.random()*35, t=Math.random()*Math.PI*2, p=Math.acos(2*Math.random()-1);
  pPos[i*3]=r*Math.sin(p)*Math.cos(t);
  pPos[i*3+1]=r*Math.sin(p)*Math.sin(t);
  pPos[i*3+2]=r*Math.cos(p);
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
const pMat = new THREE.PointsMaterial({color:0xb8935a, size:.045, transparent:true, opacity:.35, sizeAttenuation:true, depthWrite:false});
const pts = new THREE.Points(pGeo, pMat);
scene.add(pts);

// ── FLOATING TEXT SPRITES
const glyphs = [
  '語','こ','ん','に','ち','は',
  'مر','حب','ا','ب',
  '你','好','漢','字',
  'α','Ω','δ','λ',
  '한','국','어',
  'Ciao','Olá','Hola','Bonjour','Привет',
  'ñ','ü','è','ø'
];
const spriteGroup = [];

function makeSprite(txt, sz=70){
  const cv = document.createElement('canvas');
  cv.width=256; cv.height=128;
  const cx=cv.getContext('2d');
  cx.font = `${sz}px 'Libre Baskerville', serif`;
  cx.fillStyle='#b8935a'; cx.globalAlpha=.55;
  cx.textAlign='center'; cx.textBaseline='middle';
  cx.fillText(txt,128,68);
  const tex = new THREE.CanvasTexture(cv);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map:tex, transparent:true, depthWrite:false}));
  return sp;
}

glyphs.forEach((g,i)=>{
  const sp = makeSprite(g);
  const r=5.8+Math.random()*3.5;
  const theta=Math.random()*Math.PI*2, phi=Math.acos(2*Math.random()-1);
  sp.position.set(r*Math.sin(phi)*Math.cos(theta), r*Math.sin(phi)*Math.sin(theta), r*Math.cos(phi));
  const s=.5+Math.random()*.8;
  sp.scale.set(s*2.2, s, 1);
  sp.userData={r, theta, phi, speed:(Math.random()-.5)*.0007, phase:Math.random()*Math.PI*2};
  scene.add(sp); spriteGroup.push(sp);
});

// ── LIGHTS
scene.add(new THREE.AmbientLight(0x100a04, 1.5));
const l1=new THREE.PointLight(0xe8b86d, 2.5, 25); l1.position.set(6,5,6); scene.add(l1);
const l2=new THREE.PointLight(0xb8935a, 1.8, 18); l2.position.set(-6,-4,4); scene.add(l2);
const l3=new THREE.PointLight(0x0d1a2a, 1.2, 20); l3.position.set(0,-9,-6); scene.add(l3);

// ── MOUSE / TOUCH
const mouse={x:0,y:0};
document.addEventListener('mousemove',e=>{
  mouse.x=(e.clientX/innerWidth-.5)*2;
  mouse.y=-(e.clientY/innerHeight-.5)*2;
});
document.addEventListener('touchmove',e=>{
  const t=e.touches[0];
  mouse.x=(t.clientX/innerWidth-.5)*2;
  mouse.y=-(t.clientY/innerHeight-.5)*2;
},{passive:true});

// ── ANIMATE
let t=0;
(function tick(){
  requestAnimationFrame(tick);
  t+=.008;
  orb.rotation.y+=.0015; orb.rotation.x+=.0006;
  wire.rotation.y-=.002; wire.rotation.x+=.0007;
  ico.rotation.y+=.003; ico.rotation.z+=.001;
  ring1.rotation.z+=.003;
  ring2.rotation.x+=.002; ring2.rotation.y+=.001;
  ring3.rotation.y-=.0015; ring3.rotation.z+=.001;
  pts.rotation.y+=.0003; pts.rotation.x+=.0001;
  l1.position.x=Math.sin(t*.4)*7; l1.position.z=Math.cos(t*.4)*7;

  spriteGroup.forEach(sp=>{
    const d=sp.userData;
    d.theta+=d.speed;
    const wob=Math.sin(t*.6+d.phase)*.4;
    sp.position.set(
      d.r*Math.sin(d.phi)*Math.cos(d.theta),
      d.r*Math.sin(d.phi)*Math.sin(d.theta)+wob,
      d.r*Math.cos(d.phi)
    );
    sp.material.opacity=.15+.4*Math.abs(Math.sin(t*.35+d.phase));
  });

  camera.position.x+=(mouse.x*2.5-camera.position.x)*.018;
  camera.position.y+=(mouse.y*1.8-camera.position.y)*.018;
  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
})();

window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

/* ═══════════════════════════════════════════════════
   FLOATING GLYPHS IN UI
═══════════════════════════════════════════════════ */
const uiGlyphs=['語','مرحبا','Bonjour','你好','Hola','Ciao','한국어','Olá','Привет','Ω','こんにちは','Namaste','Hej','Merhaba','αβγ','漢字','ñ','ü','Cзíme','Γεια'];
const shell = document.getElementById('shell');
function spawnGlyph(){
  const el = document.createElement('div');
  el.className='glyph';
  el.textContent=uiGlyphs[Math.floor(Math.random()*uiGlyphs.length)];
  // Spread across the full canvas, avoiding the very center
  const side = Math.random();
  if(side < 0.25) { el.style.left=(3+Math.random()*18)+'%'; }
  else if(side < 0.5) { el.style.left=(78+Math.random()*18)+'%'; }
  else { el.style.left=(20+Math.random()*60)+'%'; }
  el.style.top=(8+Math.random()*82)+'%';
  el.style.fontSize=(1.2+Math.random()*4)+'rem';
  el.style.opacity='0';
  const dur=9+Math.random()*9;
  el.style.animation=`glyphFloat ${dur}s ease-in-out forwards`;
  shell.appendChild(el);
  setTimeout(()=>el.remove(), dur*1000);
}
setInterval(spawnGlyph, 1800);
// Seed initial glyphs
setTimeout(()=>{ for(let i=0;i<6;i++) setTimeout(spawnGlyph, i*300); }, 3200);

/* ═══════════════════════════════════════════════════
   CHATBOT
═══════════════════════════════════════════════════ */
const chatPanel = document.getElementById('chat');
const chatBtn   = document.getElementById('chat-btn');
const chatClose = document.getElementById('chat-close');
const msgsDiv   = document.getElementById('msgs');
const input     = document.getElementById('chat-input');
const sendBtn   = document.getElementById('send-btn');

chatBtn.addEventListener('click', ()=>{
  chatPanel.classList.add('open');
  chatBtn.style.opacity='0.4';
  input.focus();
});
chatClose.addEventListener('click',()=>{
  chatPanel.classList.remove('open');
  chatBtn.style.opacity='1';
});

// Auto-resize textarea
input.addEventListener('input',()=>{
  input.style.height='auto';
  input.style.height=Math.min(input.scrollHeight,80)+'px';
});
input.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send(); }
});
sendBtn.addEventListener('click',send);

document.querySelectorAll('.quick').forEach(btn=>{
  btn.addEventListener('click',()=>{
    input.value=btn.dataset.q;
    send();
  });
});

let history=[];

function addMsg(role, text){
  const wrap=document.createElement('div');
  wrap.className=`msg ${role}`;
  const roleEl=document.createElement('div');
  roleEl.className='msg-role';
  roleEl.textContent=role==='bot'?'Talkora':'You';
  const body=document.createElement('div');
  body.className='msg-body';
  body.textContent=text;
  wrap.append(roleEl,body);
  msgsDiv.appendChild(wrap);
  msgsDiv.scrollTop=msgsDiv.scrollHeight;
  return body;
}

function showTyping(){
  const wrap=document.createElement('div');
  wrap.className='msg bot'; wrap.id='typing';
  const roleEl=document.createElement('div');
  roleEl.className='msg-role'; roleEl.textContent='Talkora';
  const dots=document.createElement('div');
  dots.className='typing-dots';
  dots.innerHTML='<span></span><span></span><span></span>';
  wrap.append(roleEl,dots);
  msgsDiv.appendChild(wrap);
  msgsDiv.scrollTop=msgsDiv.scrollHeight;
  return wrap;
}

async function send(){
  const text=input.value.trim();
  if(!text) return;
  input.value=''; input.style.height='auto';

  addMsg('user', text);
  history.push({role:'user', content:text});

  const typing=showTyping();

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:1000,
        system:`You are Talkora's language learning assistant — warm, elegant, and deeply knowledgeable. You help learners integrate language practice into their daily routines: morning rituals, commutes, meals, work breaks, evenings, and bedtime. You give practical, imaginative, culturally rich advice tailored to the time of day and the learner's language. Keep answers concise but poetic — 2-4 short paragraphs maximum. Never use bullet lists. Write in flowing prose.`,
        messages: history
      })
    });

    typing.remove();

    if(!res.ok){
      const err=await res.json().catch(()=>({}));
      addMsg('bot', err?.error?.message || 'Something went wrong. Please try again.');
      history.pop();
      return;
    }

    const data=await res.json();
    const reply=data.content?.map(b=>b.text||'').join('').trim();
    addMsg('bot', reply);
    history.push({role:'assistant', content:reply});

  } catch(e){
    typing.remove();
    addMsg('bot','I seem to have lost the connection. Please try again.');
    history.pop();
  }
}

// Start btn opens chat
document.getElementById('start-btn').addEventListener('click',()=>{
  chatPanel.classList.add('open');
  chatBtn.style.opacity='.4';
  input.focus();
  if(history.length===0){
    input.value="I'm starting my language learning journey. Where do I begin?";
  }
});

/* ═══════════════════════════════════════════════════
   GAMES ENGINE
═══════════════════════════════════════════════════ */

// Open/close
const gamesOverlay = document.getElementById('games-overlay');
document.getElementById('nav-games').addEventListener('click', () => gamesOverlay.classList.add('open'));
document.getElementById('games-close').addEventListener('click', () => gamesOverlay.classList.remove('open'));
gamesOverlay.addEventListener('click', e => { if(e.target === gamesOverlay) gamesOverlay.classList.remove('open'); });

// Tab switching
document.querySelectorAll('.g-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.g-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('game-' + tab.dataset.game).classList.add('active');
  });
});

/* ─────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────── */
const PHRASES = {
  es: [
    { text: 'Buenos días, ¿cómo estás hoy?', translation: 'Good morning, how are you today?' },
    { text: 'Me gustaría aprender más idiomas.', translation: 'I would like to learn more languages.' },
    { text: 'La vida es bella cuando hablas otro idioma.', translation: 'Life is beautiful when you speak another language.' },
    { text: 'Cada palabra es una nueva ventana al mundo.', translation: 'Every word is a new window to the world.' },
    { text: 'El conocimiento de idiomas abre puertas.', translation: 'Knowledge of languages opens doors.' },
  ],
  fr: [
    { text: 'Bonjour, comment allez-vous aujourd\u2019hui?', translation: 'Hello, how are you today?' },
    { text: 'Apprendre une langue, c\u2019est vivre une autre vie.', translation: 'Learning a language is living another life.' },
    { text: 'Je voudrais parler français couramment.', translation: 'I would like to speak French fluently.' },
    { text: 'Chaque mot est une nouvelle aventure.', translation: 'Every word is a new adventure.' },
    { text: 'La langue est la clé de la culture.', translation: 'Language is the key to culture.' },
  ],
  ja: [
    { text: 'おはようございます。今日もよい一日を。', translation: 'Good morning. Have a good day today.' },
    { text: '言語を学ぶことは文化を学ぶことです。', translation: 'Learning a language is learning a culture.' },
    { text: '毎日少しずつ練習することが大切です。', translation: 'It is important to practice little by little every day.' },
    { text: 'あなたの夢は何ですか？', translation: 'What is your dream?' },
  ],
  ar: [
    { text: 'صباح الخير، كيف حالك اليوم؟', translation: 'Good morning, how are you today?' },
    { text: 'تعلم اللغة يفتح الأبواب.', translation: 'Learning a language opens doors.' },
    { text: 'كل كلمة جديدة هي نافذة على العالم.', translation: 'Every new word is a window to the world.' },
  ],
  de: [
    { text: 'Guten Morgen, wie geht es Ihnen heute?', translation: 'Good morning, how are you today?' },
    { text: 'Sprachen lernen macht das Leben reicher.', translation: 'Learning languages makes life richer.' },
    { text: 'Jedes Wort ist ein Schlüssel zur Welt.', translation: 'Every word is a key to the world.' },
    { text: 'Ich möchte fließend Deutsch sprechen.', translation: 'I want to speak German fluently.' },
  ],
  it: [
    { text: 'Buongiorno, come stai oggi?', translation: 'Good morning, how are you today?' },
    { text: 'Imparare una lingua è aprire una porta.', translation: 'Learning a language is opening a door.' },
    { text: 'La vita è bella quando parli italiano.', translation: 'Life is beautiful when you speak Italian.' },
    { text: 'Ogni parola è un nuovo mondo.', translation: 'Every word is a new world.' },
  ],
};

const VOCAB = {
  es: [
    {w:'mariposa',m:'butterfly'},{w:'cielo',m:'sky'},{w:'luna',m:'moon'},
    {w:'fuego',m:'fire'},{w:'agua',m:'water'},{w:'tierra',m:'earth'},
    {w:'corazón',m:'heart'},{w:'alma',m:'soul'},{w:'sueño',m:'dream'},
    {w:'amor',m:'love'},{w:'paz',m:'peace'},{w:'noche',m:'night'},
  ],
  fr: [
    {w:'papillon',m:'butterfly'},{w:'ciel',m:'sky'},{w:'lune',m:'moon'},
    {w:'feu',m:'fire'},{w:'eau',m:'water'},{w:'terre',m:'earth'},
    {w:'coeur',m:'heart'},{w:'âme',m:'soul'},{w:'rêve',m:'dream'},
    {w:'amour',m:'love'},{w:'paix',m:'peace'},{w:'nuit',m:'night'},
  ],
  ja: [
    {w:'蝶',m:'butterfly'},{w:'空',m:'sky'},{w:'月',m:'moon'},
    {w:'火',m:'fire'},{w:'水',m:'water'},{w:'大地',m:'earth'},
    {w:'心',m:'heart'},{w:'魂',m:'soul'},{w:'夢',m:'dream'},
    {w:'愛',m:'love'},{w:'平和',m:'peace'},{w:'夜',m:'night'},
  ],
  ar: [
    {w:'فراشة',m:'butterfly'},{w:'سماء',m:'sky'},{w:'قمر',m:'moon'},
    {w:'نار',m:'fire'},{w:'ماء',m:'water'},{w:'أرض',m:'earth'},
    {w:'قلب',m:'heart'},{w:'روح',m:'soul'},{w:'حلم',m:'dream'},
    {w:'حب',m:'love'},{w:'سلام',m:'peace'},{w:'ليل',m:'night'},
  ],
  de: [
    {w:'Schmetterling',m:'butterfly'},{w:'Himmel',m:'sky'},{w:'Mond',m:'moon'},
    {w:'Feuer',m:'fire'},{w:'Wasser',m:'water'},{w:'Erde',m:'earth'},
    {w:'Herz',m:'heart'},{w:'Seele',m:'soul'},{w:'Traum',m:'dream'},
    {w:'Liebe',m:'love'},{w:'Frieden',m:'peace'},{w:'Nacht',m:'night'},
  ],
  it: [
    {w:'farfalla',m:'butterfly'},{w:'cielo',m:'sky'},{w:'luna',m:'moon'},
    {w:'fuoco',m:'fire'},{w:'acqua',m:'water'},{w:'terra',m:'earth'},
    {w:'cuore',m:'heart'},{w:'anima',m:'soul'},{w:'sogno',m:'dream'},
    {w:'amore',m:'love'},{w:'pace',m:'peace'},{w:'notte',m:'night'},
  ],
};

const GLYPHS = {
  ja: [
    {char:'あ',ans:'a'},{char:'い',ans:'i'},{char:'う',ans:'u'},{char:'え',ans:'e'},
    {char:'お',ans:'o'},{char:'か',ans:'ka'},{char:'き',ans:'ki'},{char:'く',ans:'ku'},
    {char:'け',ans:'ke'},{char:'こ',ans:'ko'},{char:'さ',ans:'sa'},{char:'し',ans:'shi'},
    {char:'す',ans:'su'},{char:'せ',ans:'se'},{char:'そ',ans:'so'},{char:'た',ans:'ta'},
    {char:'な',ans:'na'},{char:'に',ans:'ni'},{char:'は',ans:'ha'},{char:'ま',ans:'ma'},
  ],
  ar: [
    {char:'ا',ans:'alif'},{char:'ب',ans:'ba'},{char:'ت',ans:'ta'},{char:'ث',ans:'tha'},
    {char:'ج',ans:'jim'},{char:'ح',ans:'ha'},{char:'خ',ans:'kha'},{char:'د',ans:'dal'},
    {char:'ر',ans:'ra'},{char:'ز',ans:'zay'},{char:'س',ans:'sin'},{char:'ش',ans:'shin'},
    {char:'ع',ans:'ayn'},{char:'غ',ans:'ghayn'},{char:'ف',ans:'fa'},{char:'ق',ans:'qaf'},
  ],
  zh: [
    {char:'人',ans:'rén (person)'},{char:'山',ans:'shān (mountain)'},{char:'水',ans:'shuǐ (water)'},
    {char:'火',ans:'huǒ (fire)'},{char:'木',ans:'mù (wood)'},{char:'日',ans:'rì (sun)'},
    {char:'月',ans:'yuè (moon)'},{char:'大',ans:'dà (big)'},{char:'小',ans:'xiǎo (small)'},
    {char:'心',ans:'xīn (heart)'},{char:'天',ans:'tiān (sky)'},{char:'地',ans:'dì (earth)'},
  ],
  gr: [
    {char:'α',ans:'alpha'},{char:'β',ans:'beta'},{char:'γ',ans:'gamma'},{char:'δ',ans:'delta'},
    {char:'ε',ans:'epsilon'},{char:'ζ',ans:'zeta'},{char:'η',ans:'eta'},{char:'θ',ans:'theta'},
    {char:'λ',ans:'lambda'},{char:'μ',ans:'mu'},{char:'π',ans:'pi'},{char:'σ',ans:'sigma'},
    {char:'φ',ans:'phi'},{char:'χ',ans:'chi'},{char:'ψ',ans:'psi'},{char:'ω',ans:'omega'},
  ],
};

function shuffle(arr){ return [...arr].sort(()=>Math.random()-.5); }
function pick(arr, n){ return shuffle(arr).slice(0,n); }

/* ─────────────────────────────────────────────────
   GAME 1 — TYPE RACER
───────────────────────────────────────────────── */
let racerActive=false, racerStartTime=0, racerErrors=0, racerTotal=0, racerScore=0;
let racerPhrase='', racerTranslation='', racerIdx=0;

const racerPhraseEl = document.getElementById('racer-phrase');
const racerTransEl  = document.getElementById('racer-translation');
const racerInputEl  = document.getElementById('racer-input');
const racerProgEl   = document.getElementById('racer-prog');
const racerWpmEl    = document.getElementById('racer-wpm');
const racerAccEl    = document.getElementById('racer-acc');
const racerScoreEl  = document.getElementById('racer-score');
const racerStartBtn = document.getElementById('racer-start');

function racerLoadPhrase(){
  const lang = document.getElementById('racer-lang').value;
  const pool = PHRASES[lang] || PHRASES.es;
  const p = pool[Math.floor(Math.random()*pool.length)];
  racerPhrase = p.text;
  racerTranslation = p.translation;
  racerIdx = 0; racerErrors = 0; racerTotal = 0;
  racerTransEl.textContent = p.translation;
  racerRenderPhrase();
  racerProgEl.style.width = '0%';
  racerWpmEl.textContent = '–'; racerAccEl.textContent = '–';
}

function racerRenderPhrase(){
  const chars = racerPhrase.split('');
  racerPhraseEl.innerHTML = chars.map((ch, i) => {
    let cls = '';
    if(i < racerIdx) cls = 'correct';
    else if(i === racerIdx) cls = 'cursor';
    return `<span class="${cls}">${ch === ' ' ? '&nbsp;' : ch}</span>`;
  }).join('');
}

racerInputEl.addEventListener('input', () => {
  if(!racerActive) return;
  const typed = racerInputEl.value;
  const expected = racerPhrase.slice(0, typed.length);

  if(!racerStartTime) racerStartTime = Date.now();

  // Count only newly typed chars
  racerTotal = typed.length;
  let errs = 0;
  for(let i=0;i<typed.length;i++) if(typed[i] !== racerPhrase[i]) errs++;
  racerErrors = errs;

  // Find how many correct from start
  let correct = 0;
  for(let i=0;i<typed.length;i++){
    if(typed[i]===racerPhrase[i]) correct++;
    else break;
  }
  racerIdx = correct;

  // WPM
  const elapsed = (Date.now()-racerStartTime)/60000;
  const wpm = elapsed > 0 ? Math.round((correct/5)/elapsed) : 0;
  const acc = racerTotal > 0 ? Math.round(((racerTotal-racerErrors)/racerTotal)*100) : 100;
  racerWpmEl.textContent = wpm;
  racerAccEl.textContent = acc+'%';
  racerProgEl.style.width = Math.round((correct/racerPhrase.length)*100)+'%';

  racerRenderPhrase();

  // Completed
  if(correct >= racerPhrase.length){
    racerActive = false;
    racerInputEl.disabled = true;
    const bonus = Math.max(0, 100 - racerErrors*5);
    racerScore += wpm + bonus;
    racerScoreEl.textContent = racerScore;
    racerStartBtn.textContent = 'Next Phrase →';
    racerTransEl.textContent = '✓ ' + racerTranslation + ' — ' + wpm + ' WPM!';
  }
});

racerStartBtn.addEventListener('click', () => {
  racerActive = true; racerStartTime = 0;
  racerInputEl.disabled = false;
  racerInputEl.value = '';
  racerInputEl.focus();
  racerStartBtn.textContent = 'Begin Race';
  racerLoadPhrase();
});
racerLoadPhrase();

/* ─────────────────────────────────────────────────
   GAME 2 — WORD FLASH
───────────────────────────────────────────────── */
let flashScore=0, flashStreak=0, flashActive=false, flashTimer=null, flashCurrent=null, flashPool=[];

const flashWordEl   = document.getElementById('flash-word');
const flashFillEl   = document.getElementById('flash-timer-fill');
const flashChoicesEl= document.getElementById('flash-choices');
const flashScoreEl  = document.getElementById('flash-score');
const flashStreakEl = document.getElementById('flash-streak');
const flashStartBtn = document.getElementById('flash-start');

function flashLoad(){
  if(!flashActive) return;
  const lang = document.getElementById('flash-lang').value;
  const pool = VOCAB[lang] || VOCAB.es;
  flashCurrent = pool[Math.floor(Math.random()*pool.length)];
  flashWordEl.textContent = flashCurrent.w;

  // 4 choices: 1 correct + 3 random wrong
  const others = pool.filter(v=>v!==flashCurrent);
  const choices = shuffle([flashCurrent, ...pick(others,3)]);
  flashChoicesEl.innerHTML='';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className='flash-choice';
    btn.textContent = c.m;
    btn.addEventListener('click', () => flashAnswer(btn, c));
    flashChoicesEl.appendChild(btn);
  });

  // Timer 7s
  clearTimeout(flashTimer);
  flashFillEl.style.transition='none';
  flashFillEl.style.width='100%';
  setTimeout(()=>{
    flashFillEl.style.transition=`width 7s linear`;
    flashFillEl.style.width='0%';
  },30);
  flashTimer = setTimeout(()=>{
    if(flashActive){ flashStreak=0; flashStreakEl.textContent=flashStreak; flashLoad(); }
  }, 7000);
}

function flashAnswer(btn, chosen){
  clearTimeout(flashTimer);
  document.querySelectorAll('.flash-choice').forEach(b => b.disabled=true);
  if(chosen.m === flashCurrent.m){
    btn.classList.add('correct');
    flashScore+=10+flashStreak*2;
    flashStreak++;
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.flash-choice').forEach(b=>{
      if(b.textContent===flashCurrent.m) b.classList.add('correct');
    });
    flashStreak=0;
  }
  flashScoreEl.textContent=flashScore;
  flashStreakEl.textContent=flashStreak;
  setTimeout(flashLoad, 900);
}

flashStartBtn.addEventListener('click', ()=>{
  flashActive=true; flashScore=0; flashStreak=0;
  flashScoreEl.textContent=0; flashStreakEl.textContent=0;
  flashStartBtn.style.display='none';
  flashLoad();
});

/* ─────────────────────────────────────────────────
   GAME 3 — GLYPH MATCH
───────────────────────────────────────────────── */
let glyphScore=0, glyphLives=3, glyphActive=false, glyphCurrent=null;

const glyphCharEl  = document.getElementById('glyph-char');
const glyphPromptEl= document.getElementById('glyph-prompt');
const glyphGridEl  = document.getElementById('glyph-grid');
const glyphScoreEl = document.getElementById('glyph-score');
const glyphLivesEl = document.getElementById('glyph-lives');
const glyphStartBtn= document.getElementById('glyph-start');

function glyphLoad(){
  if(!glyphActive) return;
  const lang = document.getElementById('glyph-lang').value;
  const pool = GLYPHS[lang] || GLYPHS.ja;
  glyphCurrent = pool[Math.floor(Math.random()*pool.length)];
  glyphCharEl.textContent = glyphCurrent.char;
  glyphCharEl.classList.remove('pop');
  void glyphCharEl.offsetWidth;
  glyphCharEl.classList.add('pop');

  const prompt = lang==='zh' ? 'Choose the correct pronunciation & meaning'
    : lang==='gr' ? 'Choose the correct Greek letter name'
    : 'Choose the correct romanization';
  glyphPromptEl.textContent = prompt;

  const others = pool.filter(g=>g!==glyphCurrent);
  const opts = shuffle([glyphCurrent, ...pick(others,3)]);
  glyphGridEl.innerHTML='';
  opts.forEach(opt=>{
    const btn=document.createElement('button');
    btn.className='glyph-opt';
    btn.textContent=opt.ans;
    btn.addEventListener('click',()=>glyphAnswer(btn,opt));
    glyphGridEl.appendChild(btn);
  });
}

function glyphAnswer(btn, chosen){
  document.querySelectorAll('.glyph-opt').forEach(b=>b.disabled=true);
  if(chosen.ans===glyphCurrent.ans){
    btn.classList.add('correct');
    glyphScore+=15;
    glyphScoreEl.textContent=glyphScore;
    setTimeout(glyphLoad,700);
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.glyph-opt').forEach(b=>{
      if(b.textContent===glyphCurrent.ans) b.classList.add('correct');
    });
    glyphLives--;
    glyphLivesEl.textContent='♥'.repeat(Math.max(0,glyphLives))+'♡'.repeat(Math.max(0,3-glyphLives));
    if(glyphLives<=0){
      glyphActive=false;
      setTimeout(()=>{
        glyphCharEl.textContent='✕';
        glyphPromptEl.textContent='Game over! Score: '+glyphScore;
        glyphGridEl.innerHTML='';
        glyphStartBtn.textContent='Play Again';
        glyphStartBtn.style.display='block';
      },800);
    } else {
      setTimeout(glyphLoad,1000);
    }
  }
}

glyphStartBtn.addEventListener('click',()=>{
  glyphActive=true; glyphScore=0; glyphLives=3;
  glyphScoreEl.textContent=0;
  glyphLivesEl.textContent='♥♥♥';
  glyphStartBtn.style.display='none';
  glyphLoad();
});