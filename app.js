/* หน้าแรก การนำทาง และพื้นหลังดาว */
(function () {
  const LABS = {
    safety: window.SafetyLab,
    atom: window.AtomLab,
    bond: window.BondLab,
    mole: window.MoleLab,
    solution: window.SolutionLab
  };
  let cleanup = null;

  function svg(paths) {
    return '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e9d5ff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + paths + "</svg>";
  }

  function nav(active) {
    const item = (hash, name, key) => '<a href="' + hash + '" class="' + (active === key ? "on" : "") + '">' + name + "</a>";
    return '<header class="topnav"><a class="brand" href="#home"><i>' + svg('<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="4" ry="10"/>') + '</i>Chemistry Learning</a><nav class="navlinks">' +
      item("#home", "หน้าแรก", "home") + item("#bank", "คลังโจทย์", "bank") + item("#custom", "ฝึกทำโจทย์", "custom") + item("#lab", "ห้องแล็บ", "lab") + item("#progress", "ความก้าวหน้า", "progress") +
      "</nav></header>";
  }

  function shell(active, inner, wide) {
    return nav(active) + '<div class="shell' + (wide ? " wide" : "") + '">' + inner + "</div>";
  }

  function homeHTML() {
    const st = window.CHEM.stats();
    return '<section class="hero"><div class="hero-copy"><div class="badge"><span class="dot"></span> เรียนเคมีแบบโต้ตอบ</div>' +
      '<h1><span class="a">Chemistry</span><br><span class="b">Learning</span></h1>' +
      '<p class="lead">ฝึกโจทย์เอง หรือเข้าห้องแล็บจำลอง 5 บท</p>' +
      '<div class="cta"><a class="btn btn-primary" href="#start">เริ่มเรียนรู้</a><a class="btn btn-dark" href="#custom">ฝึกทำโจทย์</a></div></div>' +
      '<div class="planet-wrap"><canvas id="hero-canvas" aria-hidden="true"></canvas></div></section>' +
      '<section class="journey"><h2>เลือกทางที่ต้องการ</h2>' +
      '<div class="jgrid"><a class="jcard" href="#custom"><div class="ico">✎</div><h3>ฝึกทำโจทย์</h3><p>พิมพ์โจทย์เอง เลือกสูตร แล้วให้ระบบคำนวณ</p><span>เริ่มฝึก →</span></a>' +
      '<a class="jcard" href="#bank"><div class="ico">☰</div><h3>คลังโจทย์</h3><p>โจทย์พร้อมตรวจคำตอบ ' + window.Practice.count() + ' ข้อ</p><span>เปิดคลัง →</span></a>' +
      '<a class="jcard" href="#lab"><div class="ico">⚗</div><h3>ห้องแล็บ</h3><p>แบบจำลอง 5 บท ปรับค่าแล้วดูผลทันที</p><span>เข้าแล็บ →</span></a>' +
      '<a class="jcard" href="#progress"><div class="ico">▤</div><h3>ความก้าวหน้า</h3><p>ทำแล้ว ' + st.solved + ' ข้อ</p><span>ดูสถิติ →</span></a></div></section>';
  }

  function labIndex() {
    const cards = window.CHEM.LABS.map((lab) => '<a class="jcard lab-link" href="#lab/' + lab.id + '"><div class="lab-no">' + lab.no + '</div><div><h3>' + lab.title + '</h3><p>' + lab.blurb + '</p></div><span class="go">เข้า →</span></a>').join("");
    return '<div class="page-head"><h2>ห้องแล็บ</h2><a class="btn btn-dark" href="#home">← หน้าแรก</a></div><div class="lab-index">' + cards + "</div>";
  }

  function parse() {
    const raw = (location.hash || "#home").replace(/^#/, "");
    const bits = raw.split("/");
    return { name: bits[0] || "home", id: bits[1] || "" };
  }

  function show() {
    if (cleanup) { cleanup(); cleanup = null; }
    const route = parse();
    const root = document.getElementById("app");
    if (route.name === "start") {
      const easy = window.CHEM.PROBLEMS.filter((p) => p.level === "ง่าย");
      const pick = easy[Math.floor(Math.random() * easy.length)] || window.CHEM.PROBLEMS[0];
      location.hash = "practice/" + pick.id;
      return;
    }
    if (route.name === "bank") window.Practice.renderBank(root, shell);
    else if (route.name === "custom") window.Practice.renderCustom(root, shell);
    else if (route.name === "practice") window.Practice.renderPractice(root, shell, route.id);
    else if (route.name === "progress") window.Practice.renderProgress(root, shell);
    else if (route.name === "lab" && LABS[route.id]) {
      root.innerHTML = shell("lab", '<div id="lab-root"></div>', true);
      cleanup = window.LabCore.mountLab(document.getElementById("lab-root"), LABS[route.id]);
    } else if (route.name === "lab") root.innerHTML = shell("lab", '<section class="panel">' + labIndex() + "</section>");
    else {
      root.innerHTML = shell("home", homeHTML());
      cleanup = mountChemHero();
    }
    window.scrollTo(0, 0);
  }

  function mountChemHero() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return function () {};
    const ctx = canvas.getContext("2d");
    const wrap = canvas.parentElement;
    let w = 0;
    let h = 0;
    let raf = 0;
    const t0 = performance.now();
    const electrons = [
      { rx: 118, ry: 46, rot: -0.4, speed: 0.95, r: 5 },
      { rx: 156, ry: 62, rot: 0.55, speed: -0.7, r: 4.5 },
      { rx: 96, ry: 80, rot: 1.15, speed: 1.2, r: 4 }
    ];
    const bubbles = Array.from({ length: 6 }, function (_, i) {
      return { s: 0.22 + (i % 3) * 0.08, p: i * 0.65 };
    });
    function resize() {
      const rect = wrap.getBoundingClientRect();
      w = Math.max(280, rect.width);
      h = Math.max(260, rect.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function dot(x, y, r, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    function loop(now) {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.56;
      const cy = h * 0.46;
      const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 170);
      glow.addColorStop(0, "rgba(192,132,252,0.45)");
      glow.addColorStop(1, "rgba(192,132,252,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 170, 0, Math.PI * 2);
      ctx.fill();
      electrons.forEach(function (e) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(e.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, e.rx, e.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(221, 196, 255, 0.42)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        const a = t * e.speed;
        dot(Math.cos(a) * e.rx, Math.sin(a) * e.ry, e.r, "#f5e9ff");
        ctx.restore();
      });
      const nucleus = ctx.createRadialGradient(cx - 8, cy - 10, 2, cx, cy, 28);
      nucleus.addColorStop(0, "#faf7ff");
      nucleus.addColorStop(0.4, "#d8b4fe");
      nucleus.addColorStop(1, "#6d28d9");
      ctx.fillStyle = nucleus;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();
      const mx = w * 0.8;
      const my = h * 0.74 + Math.sin(t * 1.3) * 6;
      ctx.strokeStyle = "rgba(233,213,255,0.85)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(mx - 26, my - 18);
      ctx.lineTo(mx, my);
      ctx.lineTo(mx + 26, my - 18);
      ctx.stroke();
      dot(mx, my, 13, "#e879f9");
      dot(mx - 26, my - 18, 7, "#f3e8ff");
      dot(mx + 26, my - 18, 7, "#f3e8ff");
      const fx = w * 0.16;
      const fy = h * 0.66;
      ctx.strokeStyle = "rgba(226, 210, 255, 0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx - 8, fy - 78);
      ctx.lineTo(fx - 8, fy - 34);
      ctx.lineTo(fx - 34, fy + 28);
      ctx.quadraticCurveTo(fx, fy + 48, fx + 34, fy + 28);
      ctx.lineTo(fx + 8, fy - 34);
      ctx.lineTo(fx + 8, fy - 78);
      ctx.stroke();
      ctx.fillStyle = "rgba(168,85,247,0.38)";
      ctx.beginPath();
      ctx.moveTo(fx - 26, fy + 4);
      ctx.lineTo(fx - 32, fy + 28);
      ctx.quadraticCurveTo(fx, fy + 44, fx + 32, fy + 28);
      ctx.lineTo(fx + 26, fy + 4);
      ctx.closePath();
      ctx.fill();
      bubbles.forEach(function (b) {
        const p = (t * b.s + b.p) % 1;
        ctx.globalAlpha = 0.85 * (1 - p);
        ctx.strokeStyle = "#f5d0fe";
        ctx.beginPath();
        ctx.arc(fx + Math.sin(t * 2 + b.p) * 7, fy + 24 - p * 86, 2.5 + p * 2.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      raf = requestAnimationFrame(loop);
    }
    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(loop);
    return function () {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }

  function startStars() {
    const c = document.getElementById("stars");
    const ctx = c.getContext("2d");
    let stars = [];
    function resize() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      stars = Array.from({ length: 140 }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: Math.random() * 1.3 + 0.2,
        a: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.2
      }));
    }
    resize();
    window.addEventListener("resize", resize);
    function loop() {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach((st) => {
        st.a += 0.01 * st.s;
        ctx.globalAlpha = 0.25 + Math.abs(Math.sin(st.a)) * 0.75;
        ctx.fillStyle = "#f3e8ff";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  document.addEventListener("click", function () {
    document.querySelectorAll(".cselect.open").forEach((x) => x.classList.remove("open"));
  });
  window.addEventListener("hashchange", show);
  startStars();
  if (!location.hash) location.hash = "home";
  else show();
})();
