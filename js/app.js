// ==========================================
// INITIALIZE CONFIG & TEXT
// ==========================================
document.body.style.backgroundImage = `url("${CONFIG.wallpaperSrc}")`;
document.getElementById('startUserName').textContent = CONFIG.recipientName;
document.getElementById('finalHeadline').textContent = CONFIG.headline;
document.getElementById('finalWishText').textContent = CONFIG.message;

// ==========================================
// GAME STATE (7 HIDDEN ITEMS)
// ==========================================
const TOTAL_ITEMS = 7;
const foundItems = new Set();
let highestZ = 40;

// ==========================================
// GACHA APP LOGIC (5 PULLS TO GET SIMBA)
// ==========================================
let gachaCount = 0;
let isPulling = false;
const zonkEmojis = ["💨", "🦴", "🥫", "🐟"];

function pullGacha() {
  if (isPulling) return;

  if (foundItems.has('cat')) {
    showToast("Simba sudah masuk ke koleksi party items bubu! 🐈");
    return;
  }

  isPulling = true;
  const stage = document.getElementById('gachaStage');
  const msgBox = document.getElementById('gachaMessage');
  const counterEl = document.getElementById('gachaPullCounter');
  const pullBtn = document.getElementById('gachaPullBtn');

  pullBtn.disabled = true;
  stage.innerHTML = `<div class="gacha-ball shaking">🔮</div>`;
  msgBox.innerHTML = `<i>Membuka kapsul gacha... ✨</i>`;

  setTimeout(() => {
    gachaCount++;
    const idx = Math.min(gachaCount - 1, CONFIG.gachaMessages.length - 1);
    const resultMsg = CONFIG.gachaMessages[idx];
    counterEl.textContent = `Pull: ${Math.min(gachaCount, 5)}/5`;

    if (gachaCount < 5) {
      const zonk = zonkEmojis[(gachaCount - 1) % zonkEmojis.length];
      stage.innerHTML = `<div class="gacha-ball">${zonk}</div>`;
      msgBox.innerHTML = `<b>${resultMsg}</b>`;
      pullBtn.disabled = false;
      isPulling = false;
    } else {
      stage.innerHTML = `
        <div class="simba-plush-wrap">
          <div style="font-size: 54px; line-height: 1;">🐈</div>
          <div class="simba-tag">🧸 Boneka Kucing Oren: SIMBA</div>
        </div>
      `;
      msgBox.innerHTML = `<b style="color:#d95300;">${resultMsg}</b>`;
      pullBtn.textContent = "✅ Simba Didapatkan!";
      collectItem('cat', 'yaay congrats bubu, dapet simba 🐈');
      isPulling = false;
    }
  }, 550);
}

// ==========================================
// MY PICTURES (10-SLOT SLIDESHOW + FILM ROLL)
// ==========================================
let currentPhotoIdx = 0;
const photoStage = document.getElementById('photoStage');
const photoDots = document.getElementById('photoDots');
const photoCounter = document.getElementById('photoCounter');
const photoCaption = document.getElementById('photoCaption');
const photoFilePicker = document.getElementById('photoFilePicker');

function goToPhoto(index) {
  currentPhotoIdx = index;
  renderPhotoSlide();
}

function renderPhotoDots() {
  photoDots.innerHTML = CONFIG.photos.map((_, idx) => `
    <span class="photo-dot ${idx === currentPhotoIdx ? 'active' : ''}"
          title="Photo ${idx + 1}"
          onclick="goToPhoto(${idx})"></span>
  `).join('');
}

function renderPhotoSlide() {
  const list = CONFIG.photos;
  if (!list.length) return;
  const item = list[currentPhotoIdx];
  const isLastSlide = currentPhotoIdx === list.length - 1;
  const filmFound = foundItems.has('film');

  photoCounter.textContent = `Photo ${currentPhotoIdx + 1} of ${list.length}`;
  photoCaption.textContent = item.caption;

  const hiddenFilmMarkup = (isLastSlide && !filmFound)
    ? `<div class="hidden-film-btn" id="item-film" title="Click to collect Film Roll!" onclick="collectItem('film', 'Vintage Film Roll found in My Pictures!'); this.style.display='none';">🎞️</div>`
    : ``;

  photoStage.innerHTML = `
    <img src="${item.src}" alt="Memory ${currentPhotoIdx + 1}"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
    <div class="photo-placeholder" style="display:none;">
      <div style="font-size:48px;">${item.emoji || '🖼️'}</div>
      <div style="font-size:11.5px; color:#a3c2e0;">Place <b>${item.src}</b> or click <b>Add Photos</b></div>
    </div>
    ${hiddenFilmMarkup}
  `;

  renderPhotoDots();
}

function prevPhoto() {
  currentPhotoIdx = (currentPhotoIdx - 1 + CONFIG.photos.length) % CONFIG.photos.length;
  renderPhotoSlide();
}

function nextPhoto() {
  currentPhotoIdx = (currentPhotoIdx + 1) % CONFIG.photos.length;
  renderPhotoSlide();
}

photoFilePicker.addEventListener('change', (e) => {
  const files = Array.from(e.target.files).slice(0, 10);
  if (!files.length) return;
  files.forEach((file, idx) => {
    if (CONFIG.photos[idx]) {
      CONFIG.photos[idx].src = URL.createObjectURL(file);
      CONFIG.photos[idx].caption = `Memory #${idx + 1} — ${file.name.replace(/\.[^/.]+$/, "")}`;
    }
  });
  currentPhotoIdx = 0;
  renderPhotoSlide();
  showToast(`🖼️ Loaded ${files.length} photo(s) into My Pictures!`);
});

// Wallpaper Picker from Start Menu
document.getElementById('wallpaperPicker').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  document.body.style.backgroundImage = `url("${URL.createObjectURL(file)}")`;
  showToast("🌄 Desktop wallpaper updated!");
});

renderPhotoSlide();

// ==========================================
// REAL HTML5 AUDIO PLAYER
// ==========================================
const audioPlayer = document.getElementById('realAudioPlayer');
const filePicker = document.getElementById('audioFilePicker');
const equalizer = document.getElementById('equalizer');
const musicStatus = document.getElementById('musicStatus');
const timeDisplay = document.getElementById('timeDisplay');
const seekFill = document.getElementById('seekFill');

audioPlayer.src = CONFIG.audioSrc;

function playRealSong() {
  audioPlayer.play().then(() => {
    musicStatus.textContent = "Playing ♫";
    equalizer.classList.add('playing');
  }).catch(() => {
    musicStatus.textContent = "'lagu.mp3' not found";
    showToast("⚠️ Place 'lagu.mp3' inside assets/audio/ or click '📂 Load MP3'.");
  });
}

function pauseRealSong() {
  audioPlayer.pause();
  musicStatus.textContent = "Paused";
  equalizer.classList.remove('playing');
}

function toggleRealSong() {
  if (audioPlayer.paused) playRealSong();
  else pauseRealSong();
}

filePicker.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const objectUrl = URL.createObjectURL(file);
  audioPlayer.src = objectUrl;
  document.getElementById('trackTitle').textContent = `🎵 ${file.name}`;
  playRealSong();
});

audioPlayer.addEventListener('timeupdate', () => {
  if (!audioPlayer.duration) return;
  const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  seekFill.style.width = `${pct}%`;
  const mins = Math.floor(audioPlayer.currentTime / 60).toString().padStart(2, '0');
  const secs = Math.floor(audioPlayer.currentTime % 60).toString().padStart(2, '0');
  timeDisplay.textContent = `${mins}:${secs}`;
});

// ==========================================
// HIDDEN OBJECTS COLLECTION LOGIC
// ==========================================
function collectItem(itemKey, message) {
  if (foundItems.has(itemKey)) {
    showToast("You already collected this item!");
    return;
  }

  foundItems.add(itemKey);

  const slot = document.getElementById(`slot-${itemKey}`);
  if (slot) slot.classList.add('found');

  if (itemKey === 'gift') {
    document.getElementById('hiddenGift').style.display = 'none';
  } else if (itemKey === 'film') {
    const filmEl = document.getElementById('item-film');
    if (filmEl) filmEl.style.display = 'none';
  } else if (itemKey !== 'cat') {
    const el = document.getElementById(`item-${itemKey}`);
    if (el) el.style.opacity = '0.3';
  }

  document.getElementById('progressCount').textContent = `${foundItems.size}/${TOTAL_ITEMS}`;
  showToast(`✅ ${message}`);

  if (foundItems.size === TOTAL_ITEMS) {
    unlockBirthdayApp();
  }
}

function unlockBirthdayApp() {
  const cakeIcon = document.getElementById('cakeIcon');
  cakeIcon.classList.remove('locked');
  document.getElementById('cakeIconEmoji').textContent = '🎂';
  setTimeout(() => {
    showToast("🎉 All 7 items collected! Launching BIRTHDAY.exe...");
    openWindow('winCake');
    playRealSong();
    launchConfetti();
  }, 900);
}

function tryOpenCake() {
  if (foundItems.size < TOTAL_ITEMS) {
    showToast(`🔒 Locked! Find ${TOTAL_ITEMS - foundItems.size} more party item(s).`);
  } else {
    openWindow('winCake');
    launchConfetti();
  }
}

function checkVaultPin() {
  const val = document.getElementById('pinInput').value.trim();
  const res = document.getElementById('vaultResult');
  if (val === CONFIG.secretPin) {
    res.innerHTML = `<span style="color:green;font-weight:bold;">PIN Accepted!</span><br><button class="xp-btn" style="margin-top:6px;" onclick="collectItem('key', 'Golden Key found inside the Secret Vault!')">🔑 Grab Key</button>`;
  } else {
    res.innerHTML = `<span style="color:#c92b12;">Incorrect PIN! Check the yellow sticky note.</span>`;
  }
}

function blowCandle() {
  document.getElementById('cakeGraphic').textContent = '🍰';
  showToast("✨ Candles blown! Make a wish!");
  playRealSong();
  launchConfetti();
}

// ==========================================
// WINDOW MANAGEMENT, START MENU & DRAG
// ==========================================
function toggleStartMenu() {
  document.getElementById('startMenu').classList.toggle('open');
}

document.addEventListener('pointerdown', (e) => {
  const menu = document.getElementById('startMenu');
  const btn = document.querySelector('.start-btn');
  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('open');
  }
});

function openWindow(id) {
  const win = document.getElementById(id);
  win.classList.add('open');
  highestZ++;
  win.style.zIndex = highestZ;
}

function closeWindow(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.window').forEach(win => {
  win.addEventListener('pointerdown', () => {
    highestZ++;
    win.style.zIndex = highestZ;
  });
});

document.querySelectorAll('.title-bar').forEach(bar => {
  let isDragging = false;
  let startX, startY, origLeft, origTop;
  const win = document.getElementById(bar.dataset.win);

  bar.addEventListener('pointerdown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origLeft = win.offsetLeft;
    origTop = win.offsetTop;
    bar.setPointerCapture(e.pointerId);
  });

  bar.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    win.style.left = `${origLeft + dx}px`;
    win.style.top = `${Math.max(0, origTop + dy)}px`;
  });

  bar.addEventListener('pointerup', () => {
    isDragging = false;
  });
});

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toastPopup');
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, 3600);
}

function updateClock() {
  const now = new Date();
  document.getElementById('clockTray').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// ==========================================
// CONFETTI CANVAS
// ==========================================
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let pieces = [];

function launchConfetti() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  pieces = [];
  const colors = ['#0054e3', '#389a38', '#ffcc00', '#ff2e93', '#00c2ff'];
  for (let i = 0; i < 100; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 8, h: 6,
      c: colors[i % colors.length],
      vy: 2 + Math.random() * 3,
      vx: -1.5 + Math.random() * 3
    });
  }
  requestAnimationFrame(renderConfetti);
}

function renderConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let active = 0;
  pieces.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < canvas.height) active++;
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });
  if (active > 0) requestAnimationFrame(renderConfetti);
}
