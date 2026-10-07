/* Every rig layer reuses the same high-resolution mascot artwork. The SVG clips
   separate its original linework without redrawing the character. */
(() => {
  const stage = document.querySelector('.mascot-strip');
  if (!stage) return;

  const track = stage.querySelector('.mascot-strip-track');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const artwork = './assets/relay-receipt-agent.png';
  const W = 1209;
  const H = 1301;
  let resizeFrame = 0;
  let inView = false;

  function rigMarkup(id) {
    const image = (part, extraClass = '') =>
      `<image class="${extraClass}" href="${artwork}" width="${W}" height="${H}" clip-path="url(#${id}-${part})" />`;
    return `
      <svg class="mascot-rig" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
        <defs>
          <clipPath id="${id}-paper"><path d="M530 340 534 257 583 134 642 80 856 91 811 182 798 363Z"/></clipPath>
          <clipPath id="${id}-bubble"><path d="M176 190H400V371H176Z"/></clipPath>
          <clipPath id="${id}-left-arm"><path d="M129 333 347 324 431 501 473 622 398 747 249 724 170 650Z"/></clipPath>
          <clipPath id="${id}-right-arm"><path d="M688 501 969 505 1135 630 1135 847 1001 898 695 885Z"/></clipPath>
          <clipPath id="${id}-left-leg"><path d="M430 735 657 742 673 873 590 1014 424 1016 423 886Z"/></clipPath>
          <clipPath id="${id}-right-leg"><path d="M575 739 800 737 891 929 866 1031 685 1032 611 891Z"/></clipPath>
          <clipPath id="${id}-left-shoe"><path d="M153 883 597 877 621 1196 163 1196Z"/></clipPath>
          <clipPath id="${id}-right-shoe"><path d="M604 876 1000 857 1010 1197 605 1197Z"/></clipPath>
          <clipPath id="${id}-mouth"><path d="M509 526H641V628H509Z"/></clipPath>
          <mask id="${id}-body-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
            <rect width="${W}" height="${H}" fill="white"/>
            <path d="M530 340 534 257 583 134 642 80 856 91 811 182 798 363Z
              M176 190H400V371H176Z
              M129 333 347 324 431 501 473 622 398 747 249 724 170 650Z
              M688 501 969 505 1135 630 1135 847 1001 898 695 885Z
              M430 735 657 742 673 873 590 1014 424 1016 423 886Z
              M575 739 800 737 891 929 866 1031 685 1032 611 891Z
              M153 883 597 877 621 1196 163 1196Z
              M604 876 1000 857 1010 1197 605 1197Z" fill="black"/>
          </mask>
        </defs>
        <g class="rig-leg rig-leg-right">
          ${image('right-leg')}
          <g class="rig-shoe rig-shoe-right">${image('right-shoe')}</g>
        </g>
        <g class="rig-leg rig-leg-left">
          ${image('left-leg')}
          <g class="rig-shoe rig-shoe-left">${image('left-shoe')}</g>
        </g>
        <g class="rig-arm rig-arm-left">${image('left-arm')}</g>
        <g class="rig-body">
          <path d="M437 385Q487 322 604 322H794Q900 339 906 492V670Q901 786 779 822H536Q408 794 389 675V492Q391 435 437 385Z" fill="#FFFEFA"/>
          <image href="${artwork}" width="${W}" height="${H}" mask="url(#${id}-body-mask)" />
          <rect x="510" y="526" width="131" height="95" fill="#FFFEFA" />
          <g class="rig-mouth">${image('mouth')}</g>
          <g class="rig-blink">
            <ellipse cx="530" cy="490" rx="20" ry="32" fill="#FFFEFA"/>
            <ellipse cx="615" cy="497" rx="20" ry="32" fill="#FFFEFA"/>
            <path d="M515 491q16 9 31 0M600 497q16 9 30 0" fill="none" stroke="#050505" stroke-width="9" stroke-linecap="round"/>
          </g>
        </g>
        <g class="rig-arm rig-arm-right">${image('right-arm')}</g>
        <g class="rig-paper">${image('paper')}</g>
        <g class="rig-bubble">
          ${image('bubble')}
          <circle class="rig-dot rig-dot-1" cx="251" cy="269" r="8" fill="#D8F36A"/>
          <circle class="rig-dot rig-dot-2" cx="290" cy="269" r="8" fill="#D8F36A"/>
          <circle class="rig-dot rig-dot-3" cx="328" cy="269" r="8" fill="#D8F36A"/>
        </g>
      </svg>`;
  }

  function readTuning() {
    const css = getComputedStyle(stage);
    const number = (name, fallback) => {
      const value = Number.parseFloat(css.getPropertyValue(name));
      return Number.isFinite(value) ? value : fallback;
    };
    return {
      speed: Math.max(.04, number('--walk-speed', .15)), // body heights / second
      gap: Math.max(.4, number('--copy-gap', .57)), // fraction of body height
      offsetY: number('--stack-offset-y', 10),
      rotate: number('--stack-rotate', 1.5),
      scale: Math.min(1, Math.max(.9, number('--stack-scale', .97)))
    };
  }

  function build() {
    if (reduced.matches) {
      track.replaceChildren();
      stage.classList.add('is-reduced');
      return;
    }
    stage.classList.remove('is-reduced');
    const tuning = readTuning();
    const height = Math.round(Math.min(226, Math.max(164, stage.clientHeight * .88)));
    const spriteWidth = height * W / H;
    const gap = Math.round(height * tuning.gap);
    const speedPx = height * tuning.speed;
    // Three walking strides fit one copy spacing. The character walks while the
    // track advances, instead of holding a single pose across that distance.
    const stride = gap / 3;
    const cycleSeconds = stride / speedPx; // T = S / v.
    const visibleCopies = Math.ceil((stage.clientWidth + spriteWidth) / gap);
    const count = visibleCopies + 2;
    const period = count * gap;
    stage.style.setProperty('--mascot-height', `${height}px`);
    stage.style.setProperty('--copy-distance', `${gap}px`);
    stage.style.setProperty('--stride-length', `${stride}px`);
    stage.style.setProperty('--walk-cycle', `${cycleSeconds}s`);
    stage.style.setProperty('--strip-duration', `${period / speedPx}s`);
    stage.style.setProperty('--strip-period', `${period}px`);

    const sets = [];
    for (let setIndex = 0; setIndex < 2; setIndex += 1) {
      const set = document.createElement('div');
      set.className = 'mascot-strip-set';
      set.style.left = `${-setIndex * period}px`;
      set.style.width = `${period}px`;
      for (let index = 0; index < count; index += 1) {
        const copy = document.createElement('div');
        const depth = index % 5;
        copy.className = 'mascot-copy';
        copy.style.left = `${index * gap}px`;
        copy.style.width = `${spriteWidth}px`;
        copy.style.height = `${height}px`;
        copy.style.zIndex = String(count - index);
        copy.style.transform = `translate3d(0,${depth * tuning.offsetY}px,0) rotate(${(index % 2 ? -1 : 1) * tuning.rotate}deg) scale(${tuning.scale ** depth})`;
        copy.style.setProperty('--phase', `${-index * cycleSeconds / 8}s`);
        copy.innerHTML = rigMarkup(`relay-rig-${setIndex}-${index}`);
        set.append(copy);
      }
      sets.push(set);
    }
    track.replaceChildren(...sets);
    updatePause();
  }

  function updatePause() {
    stage.classList.toggle('is-paused', !inView || document.hidden);
  }

  const viewObserver = new IntersectionObserver(entries => {
    inView = entries[0]?.isIntersecting ?? false;
    updatePause();
  }, { threshold: 0.02 });
  viewObserver.observe(stage);
  document.addEventListener('visibilitychange', updatePause);
  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(build);
  });
  resizeObserver.observe(stage);
  reduced.addEventListener('change', build);
  build();
})();
