(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     interface sounds (off by default, synthesized, no files)
     ---------------------------------------------------------- */
  var sfxOn = false, ac = null;
  try { sfxOn = localStorage.getItem('koshun-sfx') === 'on'; } catch(e){}

  function tone(freq, dur, type, vol){
    if (!sfxOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, ac.currentTime);
      g.gain.setValueAtTime(vol || 0.05, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + dur);
    } catch(e){}
  }
  var hover   = function(){ tone(880, 0.06, 'square', 0.035); };
  var select  = function(){ tone(440, 0.10, 'square', 0.06); tone(660, 0.14, 'triangle', 0.04); };
  var confirm = function(){ tone(220, 0.22, 'sawtooth', 0.05); };

  var sfxBtn = document.getElementById('sfxBtn');
  if (sfxBtn){
    sfxBtn.setAttribute('aria-pressed', String(sfxOn));
    sfxBtn.addEventListener('click', function(){
      sfxOn = !sfxOn;
      sfxBtn.setAttribute('aria-pressed', String(sfxOn));
      try { localStorage.setItem('koshun-sfx', sfxOn ? 'on' : 'off'); } catch(e){}
      if (sfxOn) select();
    });
  }

  /* ----------------------------------------------------------
     loading screen
     ---------------------------------------------------------- */
  var loader = document.getElementById('loader');
  var done = false;

  function finish(){
    if (done) return;
    done = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', skipKey);
    if (!loader){ document.body.classList.add('js-loaded'); return; }
    loader.classList.add('out');
    setTimeout(function(){
      loader.classList.add('gone');
      document.body.classList.add('js-loaded');
    }, reduce ? 0 : 560);
  }
  function skipKey(e){ if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') finish(); }

  if (reduce || !loader){
    finish();
  } else {
    document.body.style.overflow = 'hidden';
    var bar = loader.querySelector('.ldr-bar > span');
    var pct = 0;
    var step = function(){
      pct += 6 + Math.random() * 16;
      if (pct >= 100){ pct = 100; if (bar) bar.style.width = '100%'; setTimeout(finish, 260); return; }
      if (bar) bar.style.width = pct.toFixed(0) + '%';
      setTimeout(step, 90 + Math.random() * 70);
    };
    setTimeout(step, 240);
    var skipBtn = document.getElementById('skipBtn');
    if (skipBtn) skipBtn.addEventListener('click', finish);
    loader.addEventListener('click', finish);
    document.addEventListener('keydown', skipKey);
  }

  /* ----------------------------------------------------------
     menu transition wipe on nav clicks
     ---------------------------------------------------------- */
  var swipe = document.getElementById('swipe');
  function goTo(hash){
    var target = document.querySelector(hash);
    if (!target) return;
    select();
    if (reduce || !swipe){ target.scrollIntoView(); return; }
    swipe.classList.remove('go');
    void swipe.offsetWidth;
    swipe.classList.add('go');
    setTimeout(function(){ target.scrollIntoView({ behavior:'auto', block:'start' }); }, 270);
  }

  document.querySelectorAll('#rail nav a, #sheet a, .cta-row a').forEach(function(a){
    a.addEventListener('mouseenter', hover);
    a.addEventListener('click', function(e){
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#'){ e.preventDefault(); goTo(href); }
    });
  });

  /* ----------------------------------------------------------
     mobile menu
     ---------------------------------------------------------- */
  var menuBtn = document.getElementById('menuBtn');
  var sheet = document.getElementById('sheet');
  if (menuBtn && sheet){
    menuBtn.addEventListener('click', function(){
      var open = sheet.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'CLOSE' : 'MENU';
      select();
    });
    sheet.addEventListener('click', function(e){
      if (e.target.tagName === 'A'){
        sheet.classList.remove('open');
        menuBtn.setAttribute('aria-expanded','false');
        menuBtn.textContent = 'MENU';
      }
    });
  }

  /* ----------------------------------------------------------
     splash: mask button, or press A
     ---------------------------------------------------------- */
  var attack = document.getElementById('attack');
  function splash(){
    confirm();
    if (attack && !reduce){
      attack.classList.remove('go');
      void attack.offsetWidth;
      attack.classList.add('go');
      setTimeout(function(){ attack.classList.remove('go'); }, 900);
    }
  }
  var mask = document.getElementById('maskBtn');
  if (mask){
    mask.addEventListener('click', function(){
      mask.classList.remove('slash');
      void mask.offsetWidth;
      mask.classList.add('slash');
      splash();
      setTimeout(function(){ window.scrollTo({ top:0, behavior:'smooth' }); }, 200);
    });
  }
  document.addEventListener('keydown', function(e){
    if (!done) return;
    var t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA') return;
    if (e.key === 'a' || e.key === 'A') splash();
  });

  /* ----------------------------------------------------------
     stat bars
     ---------------------------------------------------------- */
  var fills = document.querySelectorAll('.fill');
  function fill(el){ el.style.width = el.dataset.val + '%'; }
  if ('IntersectionObserver' in window){
    var so = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){ fill(en.target); tone(520, 0.08, 'triangle', 0.03); so.unobserve(en.target); }
      });
    }, { threshold:0.4 });
    fills.forEach(function(f){ so.observe(f); });
  } else {
    fills.forEach(fill);
  }

  /* ----------------------------------------------------------
     active nav state
     ---------------------------------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('#rail nav a'));
  var sections = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window){
    var no = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        var i = sections.indexOf(en.target);
        links.forEach(function(l,j){
          if (j === i) l.setAttribute('aria-current','true');
          else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin:'-45% 0px -50% 0px' });
    sections.forEach(function(s){ if (s) no.observe(s); });
  }

  /* ----------------------------------------------------------
     small hover sounds on the rest of the interactive bits
     ---------------------------------------------------------- */
  document.querySelectorAll('.links a, .gear, .hob, .mask').forEach(function(el){
    el.addEventListener('mouseenter', hover);
  });
})();
