/* The original mascot image supplies every moving part. SVG clips create a
   small rig without redrawing the character or replacing its line art. */
(() => {
  const card = document.querySelector('.mascot-card');
  const mount = card?.querySelector('.mascot-walk-animated');
  if (!card || !mount) return;

  const artwork = './assets/relay-receipt-agent.png';
  const W = 1209;
  const H = 1301;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let artworkReady = false;
  let inView = false;

  const image = part =>
    `<image href="${artwork}" width="${W}" height="${H}" clip-path="url(#walk-${part})" />`;

  const rig = `
    <svg class="mascot-walk-rig" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
      <defs>
        <clipPath id="walk-paper"><path d="M530 340 534 257 583 134 642 80 856 91 811 182 798 363Z"/></clipPath>
        <clipPath id="walk-bubble"><path d="M176 190H400V371H176Z"/></clipPath>
        <clipPath id="walk-left-arm"><path d="M129 333 347 324 431 501 473 622 398 747 249 724 170 650Z"/></clipPath>
        <clipPath id="walk-right-arm"><path d="M688 501 969 505 1135 630 1135 847 1001 898 695 885Z"/></clipPath>
        <clipPath id="walk-left-leg"><path d="M430 735 657 742 673 873 590 1014 424 1016 423 886Z"/></clipPath>
        <clipPath id="walk-right-leg"><path d="M575 739 800 737 891 929 866 1031 685 1032 611 891Z"/></clipPath>
        <clipPath id="walk-left-shoe"><path d="M153 883 597 877 621 1196 163 1196Z"/></clipPath>
        <clipPath id="walk-right-shoe"><path d="M604 876 1000 857 1010 1197 605 1197Z"/></clipPath>
        <mask id="walk-body-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
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
      <g class="walk-leg walk-leg-right">
        ${image('right-leg')}
        <g class="walk-shoe walk-shoe-right">${image('right-shoe')}</g>
      </g>
      <g class="walk-leg walk-leg-left">
        ${image('left-leg')}
        <g class="walk-shoe walk-shoe-left">${image('left-shoe')}</g>
      </g>
      <g class="walk-arm walk-arm-left">${image('left-arm')}</g>
      <g class="walk-body">
        <path d="M437 385Q487 322 604 322H794Q900 339 906 492V670Q901 786 779 822H536Q408 794 389 675V492Q391 435 437 385Z" fill="#FFFEFA"/>
        <image href="${artwork}" width="${W}" height="${H}" mask="url(#walk-body-mask)" />
      </g>
      <g class="walk-arm walk-arm-right">${image('right-arm')}</g>
      <g class="walk-paper">${image('paper')}</g>
      <g class="walk-bubble">${image('bubble')}</g>
    </svg>`;

  function updateMotion() {
    if (artworkReady && !reducedMotion.matches && !mount.hasChildNodes()) {
      mount.innerHTML = rig;
    }
    card.classList.toggle('is-walking', artworkReady && !reducedMotion.matches);
    card.classList.toggle('is-paused', !inView || document.hidden);
  }

  const source = new Image();
  source.addEventListener('load', () => {
    artworkReady = true;
    updateMotion();
  }, { once: true });
  source.src = artwork;

  new IntersectionObserver(entries => {
    inView = entries[0]?.isIntersecting ?? false;
    updateMotion();
  }, { threshold: 0.02 }).observe(card);
  document.addEventListener('visibilitychange', updateMotion);
  reducedMotion.addEventListener('change', updateMotion);
})();
