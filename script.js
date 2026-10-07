const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');
const header = document.querySelector('.site-header');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const intro = document.querySelector('#relay-intro');
if (document.documentElement.classList.contains('intro-pending') && intro) {
  const skipIntro = intro.querySelector('.intro-skip');
  const caret = intro.querySelector('.intro-caret');
  const segments = [
    ['intro-typed-name', 'Relay'],
    ['intro-typed-1', ' runs your entire sales process on its own.'],
    ['intro-typed-2', ' It answers questions, recommends products, takes, confirms and places orders, then updates your ERP.'],
    ['intro-typed-3', ' No human needed.'],
    ['intro-typed-4', ' You bring the product and deliver it. '],
    ['intro-typed-5', 'The sales are on us.'],
    ['intro-typed-6', ' Connect your shop and Meta, and watch it work.']
  ];
  const typedNodes = segments.map(([id]) => {
    const node = document.createTextNode('');
    document.getElementById(id).append(node);
    return node;
  });
  const pageBehind = [document.querySelector('.skip-link'), header, document.querySelector('main'), document.querySelector('footer')];
  let introTimer;
  let leaving = false;
  let segmentIndex = 0;
  let characterIndex = 0;
  document.documentElement.classList.add('intro-locked');
  intro.setAttribute('aria-hidden', 'false');
  pageBehind.forEach(element => { if (element) element.inert = true; });
  intro.querySelector('.intro-typed p').append(caret);
  skipIntro.focus({ preventScroll: true });

  function revealSite() {
    if (leaving) return;
    leaving = true;
    window.clearTimeout(introTimer);
    document.documentElement.classList.add('intro-revealing');
    document.documentElement.classList.remove('intro-pending', 'intro-locked');
    pageBehind.forEach(element => { if (element) element.inert = false; });
    const main = document.querySelector('main');
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
    intro.setAttribute('aria-hidden', 'true');
    intro.inert = true;
    window.setTimeout(() => {
      intro.remove();
      document.documentElement.classList.remove('intro-revealing');
    }, reducedMotion.matches ? 620 : 1080);
  }

  function typeNext() {
    if (leaving) return;
    const [, phrase] = segments[segmentIndex];
    typedNodes[segmentIndex].appendData(phrase[characterIndex]);
    characterIndex += 1;
    if (characterIndex === phrase.length) {
      segmentIndex += 1;
      characterIndex = 0;
      if (segmentIndex < segments.length) {
        const nextTarget = document.getElementById(segments[segmentIndex][0]);
        (nextTarget.tagName === 'P' ? nextTarget : nextTarget.parentElement).append(caret);
      } else {
        introTimer = window.setTimeout(revealSite, 800);
        return;
      }
    }
    introTimer = window.setTimeout(typeNext, 24);
  }

  skipIntro.addEventListener('click', revealSite);
  intro.querySelector('.intro-logo').addEventListener('click', event => { event.preventDefault(); revealSite(); });
  if (reducedMotion.matches) {
    segments.forEach(([id, phrase]) => { document.getElementById(id).textContent = phrase; });
    introTimer = window.setTimeout(revealSite, 800);
  } else {
    introTimer = window.setTimeout(typeNext, 100);
  }
}

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  menu.hidden = true;
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  menu.hidden = open;
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) closeMenu();
});
document.addEventListener('click', event => {
  if (!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});

const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 42);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(node => revealObserver.observe(node));

const promiseLines = Array.from(document.querySelectorAll('.promise-line'));
const promiseImages = Array.from(document.querySelectorAll('.promise-image'));
const promiseSection = document.querySelector('.promise');
const promiseNumber = document.querySelector('.promise-topline .corner-number');
const promiseProgress = document.querySelector('.promise-progress');
let promiseFrame = 0;
let promiseActive = -1;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
// The same ease-out curve used by the section's CSS interactions, sampled against scroll.
function promiseEase(value) {
  const x = clamp(value, 0, 1);
  let t = x;
  for (let n = 0; n < 5; n++) {
    const estimate = 3 * .22 * (1 - t) * (1 - t) * t + 3 * .36 * (1 - t) * t * t + t * t * t;
    const slope = 3 * .22 * (1 - t) * (1 - t) + 6 * (.36 - .22) * (1 - t) * t + 3 * (1 - .36) * t * t;
    t = clamp(t - (estimate - x) / Math.max(slope, .001), 0, 1);
  }
  return 3 * (1 - t) * (1 - t) * t + 3 * (1 - t) * t * t + t * t * t; // cubic-bezier(.22, 1, .36, 1)
}
function updatePromise() {
  promiseFrame = 0;
  const sectionRect = promiseSection.getBoundingClientRect();
  if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) return;
  const trigger = window.innerHeight * .42;
  const centers = promiseLines.map(line => {
    const rect = line.getBoundingClientRect();
    return rect.top + rect.height / 2;
  });
  const rowHeight = promiseLines[0].getBoundingClientRect().height || 1;
  const slideProgress = clamp((trigger - centers[0]) / rowHeight, 0, promiseLines.length - 1);
  const active = Math.round(slideProgress);
  promiseLines.forEach((line, index) => {
    const image = promiseImages[index];
    const raw = index - slideProgress;
    const phase = clamp(raw, -1.35, 1.35);
    line.classList.toggle('is-active', index === active);
    image.classList.toggle('is-active', index === active);
    if (reducedMotion.matches) return;

    // Neighboring images remain visible together during each hand-off.
    const imageStrength = Math.pow(clamp(1 - Math.abs(raw) / 1.35, 0, 1), .7);
    const imageX = Math.sign(phase) * Math.pow(Math.abs(phase) / 1.35, 1.6) * 1.35;
    image.style.setProperty('--image-opacity', imageStrength.toFixed(3));
    image.style.setProperty('--image-x', imageX.toFixed(3));
    image.style.setProperty('--image-y', phase.toFixed(3));
    image.style.setProperty('--image-scale', (1 - Math.min(Math.abs(phase), 1) * .22).toFixed(3));
    image.style.setProperty('--parallax', (-phase).toFixed(3));
    image.style.zIndex = String(Math.round(20 - Math.abs(raw) * 10));
    const mobileImage = line.querySelector('.promise-mobile-image');
    mobileImage.style.setProperty('--mobile-opacity', (.28 + imageStrength * .72).toFixed(3));
    mobileImage.style.setProperty('--mobile-y', phase.toFixed(3));
    mobileImage.style.setProperty('--mobile-scale', (1 - Math.min(Math.abs(phase), 1) * .08).toFixed(3));

    // Scroll-distance offsets correspond to an image → heading → body stagger.
    const headingStrength = promiseEase(clamp(1 - Math.abs(raw + .12) / 1.15, 0, 1));
    const bodyStrength = promiseEase(clamp(1 - Math.abs(raw + .27) / 1.15, 0, 1));
    line.style.setProperty('--heading-y', `${(phase * 33).toFixed(2)}px`);
    line.style.setProperty('--heading-scale', (1 - Math.min(Math.abs(phase), 1) * .1).toFixed(3));
    line.style.setProperty('--heading-opacity', (.72 + headingStrength * .28).toFixed(3));
    line.style.setProperty('--body-y', `${(phase * 48).toFixed(2)}px`);
    line.style.setProperty('--body-opacity', (.36 + bodyStrength * .64).toFixed(3));
  });
  if (active !== promiseActive) {
    promiseActive = active;
    promiseNumber.textContent = `0${active + 1} / 0${promiseLines.length}`;
    promiseNumber.setAttribute('aria-label', `Slide ${active + 1} of ${promiseLines.length}`);
    promiseProgress.setAttribute('aria-valuenow', String(active + 1));
  }
  const journey = slideProgress / Math.max(promiseLines.length - 1, 1);
  promiseProgress.style.setProperty('--progress', (.25 + .75 * journey).toFixed(3));
}
function requestPromiseUpdate() {
  if (!promiseFrame) promiseFrame = window.requestAnimationFrame(updatePromise);
}
window.addEventListener('scroll', requestPromiseUpdate, { passive: true });
window.addEventListener('resize', requestPromiseUpdate);
requestPromiseUpdate();

const flowBoard = document.querySelector('.flow-board');
const languageCards = Array.from(document.querySelectorAll('.language-card'));
const flowProgress = document.querySelector('.flow-progress span');
const replayButton = document.querySelector('.replay-button');
const orderSource = document.querySelector('#order-source');
let flowTimers = [];

function clearFlow() {
  flowTimers.forEach(timer => window.clearTimeout(timer));
  flowTimers = [];
  flowProgress.style.transition = 'none';
  flowProgress.style.width = '0';
  void flowProgress.offsetWidth;
}

function selectLanguage(index) {
  languageCards.forEach((card, cardIndex) => {
    const active = cardIndex === index;
    card.classList.toggle('is-active', active);
    card.setAttribute('aria-pressed', String(active));
  });
  orderSource.textContent = languageCards[index].dataset.language.toUpperCase();
}

function playFlow() {
  clearFlow();
  if (reducedMotion.matches) {
    selectLanguage(0);
    flowProgress.style.width = '100%';
    return;
  }
  flowProgress.style.transition = 'width 6s linear';
  flowProgress.style.width = '100%';
  languageCards.forEach((card, index) => {
    flowTimers.push(window.setTimeout(() => selectLanguage(index), 250 + index * 950));
  });
}

const flowObserver = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) {
    playFlow();
    flowObserver.disconnect();
  }
}, { threshold: 0.28 });
flowObserver.observe(flowBoard);
replayButton.addEventListener('click', playFlow);
languageCards.forEach((card, index) => card.addEventListener('click', () => {
  clearFlow();
  selectLanguage(index);
  flowProgress.style.width = '100%';
}));
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    playFlow();
  }
  requestPromiseUpdate();
});

document.querySelectorAll('.brand-toggle').forEach(brand => {
  brand.addEventListener('pointerdown', event => {
    brand.dataset.touchPointer = String(event.pointerType === 'touch');
  });
  brand.addEventListener('click', event => {
    const touched = brand.dataset.touchPointer === 'true' || window.matchMedia('(hover: none)').matches;
    brand.dataset.touchPointer = 'false';
    if (touched && !brand.classList.contains('is-open')) {
      event.preventDefault();
      brand.classList.add('is-open');
    }
  });
});
document.addEventListener('click', event => {
  document.querySelectorAll('.brand-toggle.is-open').forEach(brand => {
    if (!brand.contains(event.target)) brand.classList.remove('is-open');
  });
});

document.querySelectorAll('img[src^="https://cdn.simpleicons.org/"]').forEach(image => {
  image.addEventListener('error', () => image.classList.add('asset-missing'));
});
