/* Design by Cristina: small helpers. Everything works without this file except the interactive extras. */
(function () {
  var nav = document.getElementById('nav');
  var burger = document.querySelector('.burger');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* "You are a..." finder: shows one shelf of tools at a time */
  var paths = document.querySelectorAll('.path');
  var shelves = document.querySelectorAll('.shelf');
  function setAudience(a) {
    paths.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.aud === a ? 'true' : 'false'); });
    shelves.forEach(function (s) { s.hidden = s.dataset.aud !== a; });
  }
  paths.forEach(function (b) { b.addEventListener('click', function () { setAudience(b.dataset.aud); }); });

  /* Resources topic filter */
  var chips = document.querySelectorAll('.filters .chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      c.setAttribute('aria-pressed', 'true');
      var t = c.dataset.topic;
      document.querySelectorAll('.posts .post').forEach(function (p) {
        p.style.display = (t === 'all' || p.dataset.topic === t) ? '' : 'none';
      });
    });
  });

  /* Contact form: send to Netlify Forms without leaving the page */
  var form = document.getElementById('cform');
  var sent = document.getElementById('sent');
  if (form && sent) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
        .then(function (r) { if (!r.ok) throw new Error('bad'); form.style.display = 'none'; sent.style.display = 'block'; })
        .catch(function () { form.submit(); });
    });
  }

  /* Clarafide demo preview */
  var chipsEl = document.getElementById('chips');
  if (chipsEl) {
    var steps = [
      { q: 'Which of these have you reacted to before?', a: ['Fragrance', 'Latex', 'Nuts', 'Retinol', 'None of these'], m: true },
      { q: 'Are you currently pregnant or nursing?', a: ['Yes', 'No', 'Prefer to discuss'], m: false },
      { q: 'How would you describe your skin today?', a: ['Dry', 'Oily', 'Combination', 'Sensitive'], m: true }
    ];
    var i = 0, done = false;
    var q = document.getElementById('question'), fill = document.getElementById('fill'),
        lab = document.getElementById('stepLabel'), nb = document.getElementById('next');
    var draw = function () {
      var s = steps[i]; done = false;
      q.textContent = s.q; lab.textContent = 'Question ' + (i + 1) + ' of 3';
      fill.style.width = ((i + 1) / 3 * 100) + '%'; chipsEl.innerHTML = '';
      s.a.forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.textContent = t; b.setAttribute('aria-pressed', 'false');
        b.onclick = function () {
          if (!s.m) chipsEl.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        };
        chipsEl.appendChild(b);
      });
      nb.textContent = i === 2 ? 'Submit' : 'Continue';
    };
    nb.onclick = function () {
      if (done) { i = 0; draw(); return; }
      if (i < 2) { i++; draw(); }
      else { done = true; q.textContent = 'All set. Your practitioner has your answers.'; chipsEl.innerHTML = ''; lab.textContent = 'Complete'; fill.style.width = '100%'; nb.textContent = 'Start over'; }
    };
    draw();
  }
})();
