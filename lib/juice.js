/* FlipStax - Run 5A "juice": the shared visual pieces of the VS card, Brain Beam and Word Warp screens.

   - Sunburst.set(scheme, host): the backdrop - oversized conic-gradient rays turning slowly (one turn in 75 s, transform
     only) in a colour scheme per game ('vs', 'beam', 'warp'); low contrast, a dark vignette in the middle so text on top
     always reads. host: the element it sits in (default: the page, fixed behind the play); null hides it.
     Lite mode and reduced motion: the rays stand still.
   (The feedback effects - Juice.correct / Juice.wrong - are added below by later items.) */
(function(root){
  const els = new Map();   // host element -> its sunburst
  function make(host){
    const d = document.createElement('div');
    d.className = 'sunburst' + (host === document.body ? ' sb-page' : ' sb-in');
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<i class="sb-rays"></i><i class="sb-vignette"></i>';
    host.insertBefore(d, host.firstChild);
    return d;
  }
  const Sunburst = {
    // scheme: 'vs' | 'beam' | 'warp' | null; host: where (default document.body)
    set(scheme, host){
      host = host || document.body;
      let d = els.get(host);
      if (!scheme){ if (d) d.classList.remove('on'); return; }
      if (!d){ d = make(host); els.set(host, d); }
      d.dataset.sb = scheme;
      d.classList.add('on');
    },
    hideAll(){ els.forEach(d=> d.classList.remove('on')); },
  };
  root.Sunburst = Sunburst;
})(typeof window !== 'undefined' ? window : globalThis);
