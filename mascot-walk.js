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
        <clipPath id="walk-paper"><path d="M495 45H940V407H495Z"/></clipPath>
        <clipPath id="walk-bubble"><path d="M176 190H400V371H176Z"/></clipPath>
        <clipPath id="walk-left-arm"><path d="M129 333 347 324 431 501 473 622 398 747 249 724 170 650Z"/></clipPath>
        <clipPath id="walk-right-arm"><path d="M688 501 969 505 1135 630 1135 847 1001 898 695 885Z"/></clipPath>
        <!-- Each leg and its sneaker are one piece. Their overlapping tops sit
             behind the printer body, while the shoes remain fully inside. -->
        <clipPath id="walk-left-leg"><path d="M425 722H655L622 822 592 895 635 900V1210H140V874H351L406 821Z"/></clipPath>
        <clipPath id="walk-right-leg"><path d="M567 723H819L865 862H1023V1210H619V895L579 844Z"/></clipPath>
        <!-- Keep the complete printer body; the earlier inverse limb mask removed
             parts of its face and lower outline when the legs moved. -->
        <clipPath id="walk-body"><path d="M445 314 C510 276 741 270 847 297 C907 312 937 371 939 449 L935 588 L913 705 C899 793 837 837 757 850 L519 849 C443 835 394 798 375 744 L372 507 C374 416 399 351 445 314Z"/></clipPath>
      </defs>
      <g class="walk-leg walk-leg-right">${image('right-leg')}</g>
      <g class="walk-leg walk-leg-left">${image('left-leg')}</g>
      <g class="walk-arm walk-arm-left">${image('left-arm')}</g>
      <g class="walk-body">${image('body')}${image('paper')}</g>
      <g class="walk-arm walk-arm-right">${image('right-arm')}</g>
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
