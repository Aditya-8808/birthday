const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const photoInput = $('#photoInput');
const galleryGrid = $('#galleryGrid');
const toast = $('#toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// Reveal sections as they enter the viewport.
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => observer.observe(el));

$('#startButton').addEventListener('click', () => {
  $('#message').scrollIntoView({ behavior: 'smooth' });
  burstConfetti(65);
});

// Personalize the name and message directly in the browser.
$('#editMessageButton').addEventListener('click', () => {
  const currentName = $('#heroName').textContent.trim();
  const name = prompt('What should we call your Jiju on the website?', currentName === 'Jiju' ? '' : currentName);
  if (name === null) return;
  const cleanName = name.trim() || 'Jiju';
  $('#heroName').textContent = cleanName;
  $('#footerName').textContent = cleanName.toUpperCase();
  showToast(`Personalized for ${cleanName} ✦`);
  const message = prompt('Write a personal birthday message:', 'Wishing you a year full of happiness, good health, success, and beautiful memories. Thank you for being such a wonderful part of our family. Happy Birthday!');
  if (message && message.trim()) {
    const messageParagraph = $('.message-card > p:not(.signature)');
    messageParagraph.textContent = message.trim();
  }
});

// Photo uploads are local to this open page; clicking a photo opens it larger.
$$('[data-upload-prompt]').forEach(button => button.addEventListener('click', () => photoInput.click()));
photoInput.addEventListener('change', event => {
  const files = [...event.target.files].filter(file => file.type.startsWith('image/'));
  if (!files.length) return;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => addPhoto(e.target.result, file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
    reader.readAsDataURL(file);
  });
  showToast(`${files.length} photo${files.length === 1 ? '' : 's'} added to your memory gallery.`);
  photoInput.value = '';
});

function addPhoto(src, caption) {
  const card = document.createElement('div');
  card.className = 'photo-card uploaded';
  card.innerHTML = `<img alt="${escapeHTML(caption || 'Birthday memory')}" src="${src}"><span class="photo-caption">${escapeHTML(caption || 'A favourite memory')}</span><button class="remove-photo" type="button" aria-label="Remove photo">×</button>`;
  card.querySelector('img').addEventListener('click', () => openLightbox(src));
  card.querySelector('.remove-photo').addEventListener('click', e => { e.stopPropagation(); card.remove(); showToast('Photo removed from the gallery.'); });
  galleryGrid.prepend(card);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function openLightbox(src) {
  $('#lightboxImage').src = src;
  $('#lightbox').classList.add('open');
}
function closeLightbox() { $('#lightbox').classList.remove('open'); $('#lightboxImage').src = ''; }
$('#lightboxClose').addEventListener('click', closeLightbox);
$('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// Let the user select a local music file; browsers require a click before audio plays.
$('#musicButton').addEventListener('click', () => $('#musicInput').click());
$('#musicInput').addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  const audio = $('#backgroundMusic');
  audio.src = URL.createObjectURL(file);
  audio.play().then(() => {
    $('#musicButton').innerHTML = '♫ <span>Music on · click to change</span>';
    showToast('Your birthday soundtrack is playing.');
  }).catch(() => showToast('Music selected. Tap the music button again to play it.'));
});

// Cake wish + confetti finale.
$('#wishButton').addEventListener('click', () => {
  $$('.candle i').forEach(flame => { flame.style.opacity = '0'; flame.style.transform = 'scale(.2)'; });
  $('#wishMessage').textContent = 'Wish made! ✦ May this year bring you more joy than you can imagine.';
  $('#wishButton').innerHTML = 'WISH SENT <span>✦</span>';
  burstConfetti(120);
  showToast('Happy Birthday! May all the good things find you. ✦');
});

function burstConfetti(count) {
  const colours = ['#ff4f91', '#ffe66d', '#5bdcff', '#9b7bff', '#ff9f43', '#7bf1a8', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.background = colours[Math.floor(Math.random() * colours.length)];
    piece.style.setProperty('--x', `${(Math.random() - .5) * window.innerWidth * 1.15}px`);
    piece.style.setProperty('--y', `${(Math.random() - .5) * window.innerHeight * 1.1}px`);
    piece.style.setProperty('--r', `${Math.random() * 900 - 450}deg`);
    piece.style.animationDelay = `${Math.random() * .22}s`;
    piece.style.borderRadius = Math.random() > .5 ? '50%' : '1px';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1900);
  }
}
