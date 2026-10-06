/* ข้อมูลเคมี คลังโจทย์ และตัวตรวจสมการ */
(function () {
  const ORBITALS = [
    { id: "1s", n: 1, l: "s", cap: 2 },
    { id: "2s", n: 2, l: "s", cap: 2 },
    { id: "2p", n: 2, l: "p", cap: 6 },
    { id: "3s", n: 3, l: "s", cap: 2 },
    { id: "3p", n: 3, l: "p", cap: 6 },
    { id: "4s", n: 4, l: "s", cap: 2 },
    { id: "3d", n: 3, l: "d", cap: 10 },
    { id: "4p", n: 4, l: "p", cap: 6 }
  ];
  const LNUM = { s: 0, p: 1, d: 2, f: 3 };
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";

  const RAW = [
    [1, "H", "ไฮโดรเจน", 1.008, 1, 1, "s", 2.20, 1312, 31, 53, -1, "อโลหะ"],
    [2, "He", "ฮีเลียม", 4.003, 18, 1, "s", -1, 2372, 28, 0, -1, "อโลหะ"],
    [3, "Li", "ลิเทียม", 6.94, 1, 2, "s", 0.98, 520, 128, 60, 76, "โลหะ"],
    [4, "Be", "เบริลเลียม", 9.012, 2, 2, "s", 1.57, 899, 96, 0, 45, "โลหะ"],
    [5, "B", "โบรอน", 10.81, 13, 2, "p", 2.04, 801, 84, 27, 27, "กึ่งโลหะ"],
    [6, "C", "คาร์บอน", 12.011, 14, 2, "p", 2.55, 1086, 76, 122, 16, "อโลหะ"],
    [7, "N", "ไนโตรเจน", 14.007, 15, 2, "p", 3.04, 1402, 71, 0, 146, "อโลหะ"],
    [8, "O", "ออกซิเจน", 15.999, 16, 2, "p", 3.44, 1314, 66, 141, 140, "อโลหะ"],
    [9, "F", "ฟลูออรีน", 18.998, 17, 2, "p", 3.98, 1681, 57, 328, 133, "อโลหะ"],
    [10, "Ne", "นีออน", 20.180, 18, 2, "p", -1, 2081, 58, 0, -1, "อโลหะ"],
    [11, "Na", "โซเดียม", 22.990, 1, 3, "s", 0.93, 496, 166, 53, 102, "โลหะ"],
    [12, "Mg", "แมกนีเซียม", 24.305, 2, 3, "s", 1.31, 738, 141, 0, 72, "โลหะ"],
    [13, "Al", "อะลูมิเนียม", 26.982, 13, 3, "p", 1.61, 577, 121, 42, 54, "โลหะ"],
    [14, "Si", "ซิลิคอน", 28.085, 14, 3, "p", 1.90, 786, 111, 134, 40, "กึ่งโลหะ"],
    [15, "P", "ฟอสฟอรัส", 30.974, 15, 3, "p", 2.19, 1012, 107, 72, 38, "อโลหะ"],
    [16, "S", "กำมะถัน", 32.06, 16, 3, "p", 2.58, 1000, 105, 200, 184, "อโลหะ"],
    [17, "Cl", "คลอรีน", 35.45, 17, 3, "p", 3.16, 1251, 102, 349, 181, "อโลหะ"],
    [18, "Ar", "อาร์กอน", 39.948, 18, 3, "p", -1, 1521, 106, 0, -1, "อโลหะ"],
    [19, "K", "โพแทสเซียม", 39.098, 1, 4, "s", 0.82, 419, 203, 48, 138, "โลหะ"],
    [20, "Ca", "แคลเซียม", 40.078, 2, 4, "s", 1.00, 590, 176, 2, 100, "โลหะ"],
    [21, "Sc", "สแกนเดียม", 44.956, 3, 4, "d", 1.36, 633, 170, 18, 75, "โลหะ"],
    [22, "Ti", "ไทเทเนียม", 47.867, 4, 4, "d", 1.54, 659, 160, 8, 61, "โลหะ"],
    [23, "V", "วาเนเดียม", 50.942, 5, 4, "d", 1.63, 651, 153, 51, 54, "โลหะ"],
    [24, "Cr", "โครเมียม", 51.996, 6, 4, "d", 1.66, 653, 139, 65, 62, "โลหะ"],
    [25, "Mn", "แมงกานีส", 54.938, 7, 4, "d", 1.55, 717, 139, 0, 67, "โลหะ"],
    [26, "Fe", "เหล็ก", 55.845, 8, 4, "d", 1.83, 762, 132, 16, 61, "โลหะ"],
    [27, "Co", "โคบอลต์", 58.933, 9, 4, "d", 1.88, 760, 126, 64, 65, "โลหะ"],
    [28, "Ni", "นิกเกิล", 58.693, 10, 4, "d", 1.91, 737, 124, 112, 69, "โลหะ"],
    [29, "Cu", "ทองแดง", 63.546, 11, 4, "d", 1.90, 745, 132, 119, 77, "โลหะ"],
    [30, "Zn", "สังกะสี", 65.38, 12, 4, "d", 1.65, 906, 122, 0, 74, "โลหะ"],
    [31, "Ga", "แกลเลียม", 69.723, 13, 4, "p", 1.81, 579, 122, 29, 62, "โลหะ"],
    [32, "Ge", "เจอร์เมเนียม", 72.630, 14, 4, "p", 2.01, 762, 120, 119, 53, "กึ่งโลหะ"],
    [33, "As", "สารหนู", 74.922, 15, 4, "p", 2.18, 947, 119, 78, 46, "กึ่งโลหะ"],
    [34, "Se", "ซีลีเนียม", 78.971, 16, 4, "p", 2.55, 941, 120, 195, 198, "อโลหะ"],
    [35, "Br", "โบรมีน", 79.904, 17, 4, "p", 2.96, 1140, 120, 325, 196, "อโลหะ"],
    [36, "Kr", "คริปทอน", 83.798, 18, 4, "p", 3.00, 1351, 116, 0, -1, "อโลหะ"]
  ];

  const USES = {
    H: "เชื้อเพลิงและการผลิตแอมโมเนีย",
    He: "ลูกโป่งและระบบหล่อเย็น",
    Li: "แบตเตอรี่ลิเทียม",
    C: "พื้นฐานของสารอินทรีย์และเชื้อเพลิง",
    N: "ปุ๋ยและบรรยากาศ",
    O: "การหายใจและการเผาไหม้",
    Na: "หลอดไฟไอโซเดียมให้แสงสีเหลือง",
    Cl: "ฆ่าเชื้อในน้ำและผลิตพอลิเมอร์",
    K: "ปุ๋ยและให้สีม่วงในพลุ",
    Ca: "กระดูก ปูนซีเมนต์ และสีส้มแดงในพลุ",
    Fe: "โครงสร้างเหล็กและฮีโมโกลบิน",
    Cu: "สายไฟและสีเขียวน้ำเงินในพลุ",
    Ne: "ป้ายไฟสีส้มแดง",
    Zn: "ชุบกันสนิม",
    Al: "อากาศยานและกระป๋อง",
    Si: "ชิปและแก้ว",
    F: "ยาสีฟันและพอลิเมอร์",
    P: "ปุ๋ยและดีเอ็นเอ",
    S: "กรดซัลฟิวริกและยางวัลคะไนซ์",
    Br: "สารหน่วงไฟและน้ำยาถ่ายรูป"
  };

  const ELEMENTS = RAW.map((r) => ({
    z: r[0], s: r[1], name: r[2], m: r[3], g: r[4], p: r[5], b: r[6],
    en: r[7], ie: r[8], radius: r[9], ea: r[10], ir: r[11], kind: r[12],
    use: USES[r[1]] || "ใช้ศึกษาแนวโน้มสมบัติตามหมู่และคาบ"
  }));

  const AR = {};
  ELEMENTS.forEach((e) => { AR[e.s] = e.m; });

  function sup(n) {
    return String(n).replace(/\d/g, (d) => SUP[d]);
  }

  function aufbau(electrons) {
    const fill = {};
    let left = electrons;
    ORBITALS.forEach((o) => {
      const take = Math.max(0, Math.min(o.cap, left));
      fill[o.id] = take;
      left -= take;
    });
    return fill;
  }

  function electronFill(Z, charge) {
    const q = charge || 0;
    let fill;
    if (Z === 24) fill = { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "4s": 1, "3d": 5, "4p": 0 };
    else if (Z === 29) fill = { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "4s": 1, "3d": 10, "4p": 0 };
    else fill = aufbau(Z);
    if (q > 0) {
      let left = q;
      const order = ORBITALS.slice().sort((a, b) => b.n - a.n || LNUM[b.l] - LNUM[a.l]);
      order.forEach((o) => {
        if (!left) return;
        const have = fill[o.id] || 0;
        const take = Math.min(have, left);
        fill[o.id] = have - take;
        left -= take;
      });
    } else if (q < 0) {
      let left = -q;
      ORBITALS.forEach((o) => {
        if (!left) return;
        const room = o.cap - (fill[o.id] || 0);
        const add = Math.min(room, left);
        fill[o.id] = (fill[o.id] || 0) + add;
        left -= add;
      });
    }
    const text = ORBITALS.filter((o) => fill[o.id]).map((o) => o.id + sup(fill[o.id])).join(" ");
    return { fill, text, electrons: Z - q };
  }

  function parseFormula(str) {
    let i = 0;
    function readNum() {
      let n = "";
      while (i < str.length && /[0-9]/.test(str[i])) n += str[i++];
      return n ? parseInt(n, 10) : 1;
    }
    function readEl() {
      let s = str[i++];
      if (i < str.length && /[a-z]/.test(str[i])) s += str[i++];
      return s;
    }
    function readGroup() {
      const map = {};
      while (i < str.length && str[i] !== ")") {
        if (str[i] === "(") {
          i++;
          const inner = readGroup();
          if (str[i] === ")") i++;
          const num = readNum();
          Object.keys(inner).forEach((k) => { map[k] = (map[k] || 0) + inner[k] * num; });
        } else {
          const el = readEl();
          const num = readNum();
          map[el] = (map[el] || 0) + num;
        }
      }
      return map;
    }
    return readGroup();
  }

  function molarMass(formula) {
    const map = parseFormula(formula);
    let sum = 0;
    Object.keys(map).forEach((k) => {
      if (!AR[k]) throw new Error("ไม่รู้จักธาตุ " + k);
      sum += AR[k] * map[k];
    });
    return { map, mass: sum };
  }

  function groupLabel(g) {
    const map = { 1: "1A", 2: "2A", 13: "3A", 14: "4A", 15: "5A", 16: "6A", 17: "7A", 18: "8A" };
    if (map[g]) return map[g];
    if (g >= 3 && g <= 12) return "แทรนซิชัน";
    return String(g);
  }

  function wavelengthToRGB(wavelength) {
    let r = 0, g = 0, b = 0;
    if (wavelength >= 380 && wavelength < 440) { r = -(wavelength - 440) / 60; b = 1; }
    else if (wavelength < 490) { g = (wavelength - 440) / 50; b = 1; }
    else if (wavelength < 510) { g = 1; b = -(wavelength - 510) / 20; }
    else if (wavelength < 580) { r = (wavelength - 510) / 70; g = 1; }
    else if (wavelength < 645) { r = 1; g = -(wavelength - 645) / 65; }
    else if (wavelength <= 780) r = 1;
    let f = 1;
    if (wavelength < 420) f = 0.3 + 0.7 * (wavelength - 380) / 40;
    else if (wavelength > 700) f = 0.3 + 0.7 * (780 - wavelength) / 80;
    const to = (c) => Math.round(255 * Math.pow(Math.max(0, c) * Math.max(0, f), 0.8));
    return "rgb(" + to(r) + "," + to(g) + "," + to(b) + ")";
  }

  function rydbergNm(nf, ni) {
    const R = 1.097e7;
    return 1e9 / (R * (1 / (nf * nf) - 1 / (ni * ni)));
  }

  const FNS = { sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp, log: Math.log10, ln: Math.log, pow: Math.pow };

  function evalExpr(input, vars) {
    let s = String(input).replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "");
    const eq = s.indexOf("=");
    if (eq >= 0) s = s.slice(eq + 1);
    let i = 0;
    function parseExpr() {
      let v = parseTerm();
      while (s[i] === "+" || s[i] === "-") {
        const op = s[i++];
        const r = parseTerm();
        v = op === "+" ? v + r : v - r;
      }
      return v;
    }
    function parseTerm() {
      let v = parsePow();
      while (s[i] === "*" || s[i] === "/") {
        const op = s[i++];
        const r = parsePow();
        v = op === "*" ? v * r : v / r;
      }
      return v;
    }
    function parsePow() {
      let v = parseUnary();
      if (s[i] === "^") { i++; v = Math.pow(v, parsePow()); }
      return v;
    }
    function parseUnary() {
      if (s[i] === "+") { i++; return parseUnary(); }
      if (s[i] === "-") { i++; return -parseUnary(); }
      return parsePrimary();
    }
    function parsePrimary() {
      if (s[i] === "(") {
        i++;
        const v = parseExpr();
        if (s[i] !== ")") throw new Error("วงเล็บไม่ครบ");
        i++;
        return v;
      }
      if (s[i] && /[0-9.]/.test(s[i])) {
        let t = "";
        while (i < s.length && /[0-9.]/.test(s[i])) t += s[i++];
        if (s[i] === "e" || s[i] === "E") {
          t += s[i++];
          if (s[i] === "+" || s[i] === "-") t += s[i++];
          while (i < s.length && /[0-9]/.test(s[i])) t += s[i++];
        }
        const n = parseFloat(t);
        if (!isFinite(n)) throw new Error("ตัวเลขไม่ถูกต้อง");
        return n;
      }
      if (s[i] && /[A-Za-z_]/.test(s[i])) {
        let name = "";
        while (i < s.length && /[A-Za-z0-9_]/.test(s[i])) name += s[i++];
        if (s[i] === "(") {
          i++;
          const args = [];
          if (s[i] !== ")") {
            args.push(parseExpr());
            while (s[i] === ",") { i++; args.push(parseExpr()); }
          }
          if (s[i] !== ")") throw new Error("วงเล็บฟังก์ชันไม่ครบ");
          i++;
          if (!FNS[name]) throw new Error("ไม่รู้จักฟังก์ชัน " + name);
          return FNS[name].apply(null, args);
        }
        if (name === "PI" || name === "pi") return Math.PI;
        if (!(name in vars)) throw new Error("ไม่รู้จักตัวแปร " + name);
        return Number(vars[name]);
      }
      throw new Error("ยังอ่านสมการไม่สำเร็จ");
    }
    if (!s) throw new Error("ยังไม่ได้พิมพ์สมการ");
    const value = parseExpr();
    if (i !== s.length) throw new Error("สมการมีส่วนที่อ่านไม่ได้");
    if (!isFinite(value)) throw new Error("ผลลัพธ์ไม่เป็นจำนวนจริง");
    return value;
  }

  function close(a, b) {
    if (!isFinite(a) || !isFinite(b)) return false;
    const scale = Math.max(1, Math.abs(b));
    return Math.abs(a - b) <= 0.005 * scale + 1e-6;
  }

  function closeVal(a, b) {
    if (!isFinite(a) || !isFinite(b)) return false;
    return Math.abs(a - b) <= Math.max(1e-6, 0.005 * Math.max(1, Math.abs(b)));
  }

  function formatNum(n, digits) {
    if (!isFinite(n)) return "—";
    if (digits < 0) {
      if (n === 0) return "0";
      const exp = Math.floor(Math.log10(Math.abs(n)));
      const m = n / Math.pow(10, exp);
      return m.toFixed(3) + " × 10<sup>" + exp + "</sup>";
    }
    return n.toFixed(digits);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, seed) {
    const a = arr.slice();
    const rnd = rng(seed);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function v(id, label, value, unit, options, given) {
    return { id, label, value, unit, options: options || [unit], given: given !== false };
  }

  function scopeOf(p, overrides) {
    const scope = {};
    (p.constants || []).forEach((c) => { scope[c.id] = c.value; });
    p.vars.forEach((item) => { if (item.given) scope[item.id] = item.value; });
    if (overrides) Object.keys(overrides).forEach((k) => { scope[k] = overrides[k]; });
    return scope;
  }

  function buildProblem(spec) {
    const p = Object.assign({}, spec);
    p.constants = p.constants || [];
    const got = evalExpr(p.expr, scopeOf(p));
    if (!isFinite(got)) throw new Error("bad answer " + p.id);
    p.answer = got;
    p.formulas = shuffle(p.formulas, hash(p.id));
    if (p.formulas.filter((f) => f.ok).length !== 1) throw new Error("formula flag " + p.id);
    p.hints = p.hints || [
      "เริ่มจากแยกให้ได้ว่าโจทย์ให้ค่าอะไร และต้องการหาอะไร",
      "จัดรูปเป็น " + (p.exprHtml || p.expr)
    ];
    return p;
  }

  const U = {
    molL: ["mol/L", "g/L", "%"],
    mL: ["mL", "L", "cm³"],
    L: ["L", "mL", "mol"],
    g: ["g", "kg", "mg"],
    gmol: ["g/mol", "kg/mol", "g"],
    mol: ["mol", "g", "อนุภาค"],
    pct: ["%", "g", "mol"],
    ev: ["eV", "J", "nm"],
    nm: ["nm", "m", "eV"],
    c: ["°C", "K", "°F"],
    atm: ["atm", "Pa", "mmHg"],
    none: ["—"]
  };

  const problems = [];
  function add(spec) { problems.push(buildProblem(spec)); }

  add({
    id: "safe-err-1", chapter: "ความปลอดภัยและทักษะปฏิบัติการ", topic: "ความคลาดเคลื่อนของการวัด", level: "ง่าย",
    title: "ร้อยละความคลาดเคลื่อนของกระบอกตวง",
    blurb: "กระบอกตวง 100 mL คลาดเคลื่อนได้ ±0.5 mL คิดเป็นกี่เปอร์เซ็นต์",
    context: "การเลือกเครื่องแก้ว · ความปลอดภัยและทักษะปฏิบัติการ",
    stem: "กระบอกตวงขนาด 100 mL มีความคลาดเคลื่อนสูงสุด 0.50 mL จงหาร้อยละความคลาดเคลื่อนเทียบกับค่าจริง",
    vars: [v("d", "ΔV (ความคลาดเคลื่อน)", 0.50, "mL", U.mL), v("Vt", "V (ค่าจริง)", 100, "mL", U.mL), v("C", "C (ความเข้มข้น)", 0.1, "mol/L", U.molL, false)],
    target: { id: "pct", label: "ร้อยละความคลาดเคลื่อน", unit: "%" },
    targetOptions: [{ id: "pct", label: "ร้อยละความคลาดเคลื่อน" }, { id: "Vt", label: "ปริมาตรจริง" }, { id: "d", label: "ความคลาดเคลื่อน" }],
    formulas: [
      { html: "%Error = |ΔV| / V × 100", ok: true },
      { html: "%Error = V / |ΔV| × 100", ok: false },
      { html: "%Error = |ΔV| × V", ok: false },
      { html: "%Error = |ΔV| + V", ok: false }
    ],
    expr: "d/Vt*100", exprHtml: "ΔV / V × 100", digits: 2
  });

  add({
    id: "safe-err-2", chapter: "ความปลอดภัยและทักษะปฏิบัติการ", topic: "ความคลาดเคลื่อนของการวัด", level: "ง่าย",
    title: "ความแม่นของปิเปต 10 mL",
    blurb: "ปิเปต ±0.02 mL จาก 10.00 mL เป็นร้อยละเท่าใด",
    context: "เครื่องแก้วปริมาตรแน่นอน · ความปลอดภัยและทักษะปฏิบัติการ",
    stem: "ปิเปตแบบปริมาตรเดียว 10.00 mL มีความคลาดเคลื่อน ±0.020 mL จงหาร้อยละความคลาดเคลื่อน",
    vars: [v("d", "ΔV (ความคลาดเคลื่อน)", 0.020, "mL", U.mL), v("Vt", "V (ค่าจริง)", 10.00, "mL", U.mL), v("m", "m (มวล)", 5, "g", U.g, false)],
    target: { id: "pct", label: "ร้อยละความคลาดเคลื่อน", unit: "%" },
    targetOptions: [{ id: "pct", label: "ร้อยละความคลาดเคลื่อน" }, { id: "d", label: "ความคลาดเคลื่อน" }, { id: "m", label: "มวล" }],
    formulas: [
      { html: "%Error = |ΔV| / V × 100", ok: true },
      { html: "%Error = |ΔV| × 100", ok: false },
      { html: "%Error = V − ΔV", ok: false },
      { html: "%Error = ΔV × V / 100", ok: false }
    ],
    expr: "d/Vt*100", exprHtml: "ΔV / V × 100", digits: 2,
    note: "สารละลายมาตรฐานต้องใช้ปิเปตและขวดกำหนดปริมาตร ไม่ใช้บีกเกอร์หรือกระบอกตวง"
  });

  add({
    id: "safe-err-3", chapter: "ความปลอดภัยและทักษะปฏิบัติการ", topic: "ความคลาดเคลื่อนของการวัด", level: "ปานกลาง",
    title: "อ่านปริมาตรได้ 48.5 แต่ค่าจริง 50.0",
    blurb: "เทียบค่าทดลองกับค่าจริง แล้วคิดร้อยละความคลาดเคลื่อน",
    context: "การบันทึกผล · ความปลอดภัยและทักษะปฏิบัติการ",
    stem: "นักเรียนอ่านปริมาตรได้ 48.5 mL ทั้งที่ค่าจริงคือ 50.0 mL จงหาร้อยละความคลาดเคลื่อน",
    vars: [v("Ve", "Vexp (ค่าทดลอง)", 48.5, "mL", U.mL), v("Vt", "Vtrue (ค่าจริง)", 50.0, "mL", U.mL), v("t", "t (เวลา)", 15, "s", ["s", "min"], false)],
    target: { id: "pct", label: "ร้อยละความคลาดเคลื่อน", unit: "%" },
    targetOptions: [{ id: "pct", label: "ร้อยละความคลาดเคลื่อน" }, { id: "Ve", label: "ค่าทดลอง" }, { id: "Vt", label: "ค่าจริง" }],
    formulas: [
      { html: "%Error = |V<sub>exp</sub> − V<sub>true</sub>| / V<sub>true</sub> × 100", ok: true },
      { html: "%Error = |V<sub>exp</sub> − V<sub>true</sub>| × 100", ok: false },
      { html: "%Error = V<sub>exp</sub> / V<sub>true</sub>", ok: false },
      { html: "%Error = V<sub>true</sub> − V<sub>exp</sub>", ok: false }
    ],
    expr: "abs(Ve-Vt)/Vt*100", exprHtml: "abs(Vexp − Vtrue) / Vtrue × 100", digits: 2
  });

  add({
    id: "safe-err-4", chapter: "ความปลอดภัยและทักษะปฏิบัติการ", topic: "ความคลาดเคลื่อนของการวัด", level: "ปานกลาง",
    title: "ขวดกำหนดปริมาตร 250 mL",
    blurb: "ความคลาดเคลื่อน ±0.12 mL ของขวดวัดปริมาตรคิดเป็นร้อยละ",
    context: "การเตรียมสารละลายมาตรฐาน · ความปลอดภัยและทักษะปฏิบัติการ",
    stem: "ขวดกำหนดปริมาตร 250.0 mL มีความคลาดเคลื่อน ±0.12 mL จงหาร้อยละความคลาดเคลื่อนสูงสุด",
    vars: [v("d", "ΔV (ความคลาดเคลื่อน)", 0.12, "mL", U.mL), v("Vt", "V (ค่าจริง)", 250.0, "mL", U.mL), v("C", "C (ความเข้มข้น)", 1, "mol/L", U.molL, false)],
    target: { id: "pct", label: "ร้อยละความคลาดเคลื่อน", unit: "%" },
    targetOptions: [{ id: "pct", label: "ร้อยละความคลาดเคลื่อน" }, { id: "Vt", label: "ปริมาตร" }, { id: "C", label: "ความเข้มข้น" }],
    formulas: [
      { html: "%Error = |ΔV| / V × 100", ok: true },
      { html: "%Error = V / ΔV", ok: false },
      { html: "%Error = ΔV × V × 100", ok: false },
      { html: "%Error = 100 − ΔV", ok: false }
    ],
    expr: "d/Vt*100", exprHtml: "ΔV / V × 100", digits: 3
  });

  [
    ["atom-a-1", 11, 12, "โซเดียม"],
    ["atom-a-2", 17, 18, "คลอรีน"],
    ["atom-a-3", 26, 30, "เหล็ก"]
  ].forEach((row) => {
    add({
      id: row[0], chapter: "อะตอมและสมบัติของธาตุ", topic: "สัญลักษณ์นิวเคลียร์", level: "ง่าย",
      title: "เลขมวลของ" + row[3],
      blurb: "เลขมวลคือผลรวมโปรตอนกับนิวตรอน ไม่ใช่มวลเป็นกรัม",
      context: "อนุภาคในอะตอม · อะตอมและสมบัติของธาตุ",
      stem: "ไอโซโทปหนึ่งของ" + row[3] + "มีโปรตอน " + row[1] + " อนุภาค และนิวตรอน " + row[2] + " อนุภาค จงหาเลขมวล A",
      vars: [v("Z", "Z (เลขอะตอม)", row[1], "—", ["—"]), v("n", "n (นิวตรอน)", row[2], "—", ["—"]), v("m", "m (มวลกรัม)", 1, "g", U.g, false)],
      target: { id: "A", label: "A (เลขมวล)", unit: "" },
      targetOptions: [{ id: "A", label: "A (เลขมวล)" }, { id: "Z", label: "Z (เลขอะตอม)" }, { id: "n", label: "จำนวนนิวตรอน" }],
      formulas: [
        { html: "A = Z + n", ok: true },
        { html: "A = Z × n", ok: false },
        { html: "A = n − Z", ok: false },
        { html: "A = Z / n", ok: false }
      ],
      expr: "Z+n", exprHtml: "Z + n", digits: 0,
      note: "เลขมวลเป็นจำนวนโปรตอนรวมนิวตรอน ไม่ใช่มวลจริงของอะตอมหน่วยกรัม"
    });
  });

  [
    ["atom-avg-1", 35, 75, 37, 25, "คลอรีน"],
    ["atom-avg-2", 63, 69, 65, 31, "ทองแดง"],
    ["atom-avg-3", 10, 20, 11, 80, "โบรอน"]
  ].forEach((row) => {
    add({
      id: row[0], chapter: "อะตอมและสมบัติของธาตุ", topic: "มวลอะตอมเฉลี่ย", level: "ปานกลาง",
      title: "มวลอะตอมเฉลี่ยของ" + row[5],
      blurb: "ถ่วงน้ำหนักมวลไอโซโทปด้วยร้อยละในธรรมชาติ",
      context: "ไอโซโทป · อะตอมและสมบัติของธาตุ",
      stem: row[5] + "มีไอโซโทปมวล " + row[1] + " อยู่ " + row[2] + "% และมวล " + row[3] + " อยู่ " + row[4] + "% จงหามวลอะตอมเฉลี่ย",
      vars: [
        v("m1", "m₁ (มวลไอโซโทป 1)", row[1], "—", ["—"]),
        v("p1", "%₁ (ความอุดมสมบูรณ์)", row[2], "%", U.pct),
        v("m2", "m₂ (มวลไอโซโทป 2)", row[3], "—", ["—"]),
        v("p2", "%₂ (ความอุดมสมบูรณ์)", row[4], "%", U.pct),
        v("Z", "Z (เลขอะตอม)", 1, "—", ["—"], false)
      ],
      target: { id: "avg", label: "มวลอะตอมเฉลี่ย", unit: "" },
      targetOptions: [{ id: "avg", label: "มวลอะตอมเฉลี่ย" }, { id: "m1", label: "มวลไอโซโทปที่ 1" }, { id: "p1", label: "ร้อยละไอโซโทป" }],
      formulas: [
        { html: "มวลเฉลี่ย = (m₁×%₁ + m₂×%₂) / 100", ok: true },
        { html: "มวลเฉลี่ย = (m₁ + m₂) / 2", ok: false },
        { html: "มวลเฉลี่ย = m₁×%₁ + m₂×%₂", ok: false },
        { html: "มวลเฉลี่ย = (m₁×%₂ + m₂×%₁) / 100", ok: false }
      ],
      expr: "(m1*p1+m2*p2)/100", exprHtml: "(m₁×%₁ + m₂×%₂) / 100", digits: 2
    });
  });

  [[2, 3], [2, 4], [2, 5]].forEach((pair, idx) => {
    add({
      id: "atom-wave-" + (idx + 1), chapter: "อะตอมและสมบัติของธาตุ", topic: "สเปกตรัมของธาตุ", level: "ยาก",
      title: "ความยาวคลื่นเส้นบาลเมอร์ n = " + pair[1],
      blurb: "อิเล็กตรอนของไฮโดรเจนตกจาก n = " + pair[1] + " มายัง n = 2",
      context: "สมการริดเบิร์ก · อะตอมและสมบัติของธาตุ",
      stem: "อิเล็กตรอนของไฮโดรเจนเปลี่ยนจากระดับ n = " + pair[1] + " มาที่ n = " + pair[0] + " จงหาความยาวคลื่นของแสงที่คายออกมา เป็นนาโนเมตร โดย R<sub>H</sub> = 1.097×10⁷ m⁻¹",
      vars: [v("nf", "n_f (ระดับสุดท้าย)", pair[0], "—", ["—"]), v("ni", "n_i (ระดับต้น)", pair[1], "—", ["—"]), v("Z", "Z (เลขอะตอม)", 1, "—", ["—"], false)],
      constants: [{ id: "RH", value: 1.097e7, label: "R_H", unit: "1/m" }],
      target: { id: "lam", label: "λ (ความยาวคลื่น)", unit: "nm" },
      targetOptions: [{ id: "lam", label: "λ (ความยาวคลื่น)" }, { id: "ni", label: "ระดับพลังงานต้น" }, { id: "nf", label: "ระดับพลังงานสุดท้าย" }],
      formulas: [
        { html: "1/λ = R<sub>H</sub> (1/n<sub>f</sub>² − 1/n<sub>i</sub>²)", ok: true },
        { html: "λ = R<sub>H</sub> (n<sub>i</sub> − n<sub>f</sub>)", ok: false },
        { html: "1/λ = R<sub>H</sub> (1/n<sub>i</sub>² − 1/n<sub>f</sub>²)", ok: false },
        { html: "λ = 13.6 / n²", ok: false }
      ],
      expr: "1/(RH*(1/nf^2-1/ni^2))*1e9",
      exprHtml: "1 / (RH × (1/nf^2 − 1/ni^2)) × 1e9",
      digits: 1
    });
  });

  [[1, 2], [2, 3]].forEach((pair, idx) => {
    add({
      id: "atom-de-" + (idx + 1), chapter: "อะตอมและสมบัติของธาตุ", topic: "สเปกตรัมของธาตุ", level: "ปานกลาง",
      title: "พลังงานโฟตอนจาก n = " + pair[1] + " → " + pair[0],
      blurb: "พลังงานที่คายออกมาของไฮโดรเจนตามแบบจำลองโบร์",
      context: "ระดับพลังงานโบร์ · อะตอมและสมบัติของธาตุ",
      stem: "อิเล็กตรอนไฮโดรเจนตกจาก n = " + pair[1] + " มา n = " + pair[0] + " จงหาพลังงานของโฟตอนที่ปล่อยออกมา หน่วย eV",
      vars: [v("nf", "n_f", pair[0], "—", ["—"]), v("ni", "n_i", pair[1], "—", ["—"]), v("lam", "λ", 500, "nm", U.nm, false)],
      target: { id: "dE", label: "ΔE (พลังงานโฟตอน)", unit: "eV" },
      targetOptions: [{ id: "dE", label: "ΔE (พลังงานโฟตอน)" }, { id: "ni", label: "n ต้น" }, { id: "lam", label: "ความยาวคลื่น" }],
      formulas: [
        { html: "ΔE = 13.6 (1/n<sub>f</sub>² − 1/n<sub>i</sub>²)", ok: true },
        { html: "ΔE = −13.6 / n<sub>i</sub>²", ok: false },
        { html: "ΔE = 13.6 (n<sub>i</sub> − n<sub>f</sub>)", ok: false },
        { html: "ΔE = 13.6 (1/n<sub>i</sub>² − 1/n<sub>f</sub>²)", ok: false }
      ],
      expr: "13.6*(1/nf^2-1/ni^2)", exprHtml: "13.6 × (1/nf^2 − 1/ni^2)", digits: 3,
      note: "ในแบบจำลองกลุ่มหมอก อิเล็กตรอนไม่ได้โคจรเป็นวงกลมคงที่เหมือนดาวเคราะห์"
    });
  });

  [
    ["bond-en-1", 3.16, 0.93, "NaCl"],
    ["bond-en-2", 3.44, 2.20, "O–H"],
    ["bond-en-3", 2.55, 2.55, "C–C"]
  ].forEach((row) => {
    add({
      id: row[0], chapter: "พันธะเคมี", topic: "สภาพขั้วของพันธะ", level: row[3] === "C–C" ? "ง่าย" : "ปานกลาง",
      title: "ผลต่าง EN ของ " + row[3],
      blurb: "ใช้ผลต่างอิเล็กโทรเนกาติวิตีแยกชนิดพันธะ",
      context: "อิเล็กโทรเนกาติวิตี · พันธะเคมี",
      stem: "พันธะ " + row[3] + " มีค่า EN ของอะตอมเท่ากับ " + row[1].toFixed(2) + " และ " + row[2].toFixed(2) + " จงหา ΔEN",
      vars: [v("EN1", "EN₁", row[1], "—", ["—"]), v("EN2", "EN₂", row[2], "—", ["—"]), v("mu", "μ (ไดโพล)", 1.5, "D", ["D", "C"], false)],
      target: { id: "dEN", label: "ΔEN", unit: "" },
      targetOptions: [{ id: "dEN", label: "ΔEN" }, { id: "EN1", label: "EN ของอะตอมแรก" }, { id: "mu", label: "ไดโพลโมเมนต์" }],
      formulas: [
        { html: "ΔEN = |EN₁ − EN₂|", ok: true },
        { html: "ΔEN = EN₁ × EN₂", ok: false },
        { html: "ΔEN = EN₁ + EN₂", ok: false },
        { html: "ΔEN = EN₁ / EN₂", ok: false }
      ],
      expr: "abs(EN1-EN2)", exprHtml: "abs(EN1 − EN2)", digits: 2
    });
  });

  [[1.9, "Na–Cl โดยประมาณ"], [1.2, "H–Cl โดยประมาณ"]].forEach((row, idx) => {
    add({
      id: "bond-ion-" + (idx + 1), chapter: "พันธะเคมี", topic: "สภาพขั้วของพันธะ", level: "ยาก",
      title: "ร้อยละลักษณะไอออนิก " + row[1],
      blurb: "ประมาณ % ionic character จาก ΔEN",
      context: "สมการพอลิง · พันธะเคมี",
      stem: "พันธะหนึ่งมี ΔEN = " + row[0].toFixed(1) + " จงประมาณร้อยละลักษณะไอออนิกจากสูตรของพอลิง",
      vars: [v("dEN", "ΔEN", row[0], "—", ["—"]), v("EN1", "EN₁", 3, "—", ["—"], false)],
      target: { id: "pic", label: "% ลักษณะไอออนิก", unit: "%" },
      targetOptions: [{ id: "pic", label: "% ลักษณะไอออนิก" }, { id: "dEN", label: "ΔEN" }, { id: "EN1", label: "EN" }],
      formulas: [
        { html: "%ionic = (1 − e<sup>−0.25(ΔEN)²</sup>) × 100", ok: true },
        { html: "%ionic = ΔEN × 100", ok: false },
        { html: "%ionic = ΔEN² × 100", ok: false },
        { html: "%ionic = (1 − ΔEN) × 100", ok: false }
      ],
      expr: "(1-exp(-0.25*dEN^2))*100", exprHtml: "(1 − exp(−0.25×dEN^2)) × 100", digits: 2,
      note: "โมเลกุลที่มีพันธะมีขั้วอาจไม่มีขั้วทั้งโมเลกุล ถ้ารูปร่างสมมาตรจนเวกเตอร์หักล้างกัน เช่น CO₂"
    });
  });

  [
    ["mole-n-1", 18.0, 18.015, "น้ำ"],
    ["mole-n-2", 44.0, 44.01, "คาร์บอนไดออกไซด์"],
    ["mole-n-3", 58.44, 58.44, "โซเดียมคลอไรด์"]
  ].forEach((row) => {
    add({
      id: row[0], chapter: "โมลและสูตรเคมี", topic: "การเปลี่ยนหน่วยโมล", level: "ง่าย",
      title: "จำนวนโมลของ" + row[3],
      blurb: "แปลงมวล " + row[1] + " g เป็นโมล",
      context: "แนวคิดโมล · โมลและสูตรเคมี",
      stem: "สาร " + row[3] + " มวล " + row[1] + " g มีมวลโมลาร์ " + row[2] + " g/mol จงหาจำนวนโมล",
      vars: [v("m", "m (มวล)", row[1], "g", U.g), v("M", "M (มวลโมลาร์)", row[2], "g/mol", U.gmol), v("V", "V (ปริมาตร)", 22.4, "L", U.L, false)],
      target: { id: "n", label: "n (จำนวนโมล)", unit: "mol" },
      targetOptions: [{ id: "n", label: "n (จำนวนโมล)" }, { id: "m", label: "มวล" }, { id: "V", label: "ปริมาตรแก๊ส" }],
      formulas: [
        { html: "n = m / M", ok: true },
        { html: "n = m × M", ok: false },
        { html: "n = M / m", ok: false },
        { html: "n = m × 22.4", ok: false }
      ],
      expr: "m/M", exprHtml: "m / M", digits: 3,
      note: "1 โมลของสารทุกชนิดมีจำนวนอนุภาคเท่ากัน แต่มวลไม่เท่ากัน"
    });
  });

  [[0.25], [2]].forEach((row, idx) => {
    add({
      id: "mole-N-" + (idx + 1), chapter: "โมลและสูตรเคมี", topic: "การเปลี่ยนหน่วยโมล", level: "ปานกลาง",
      title: "จำนวนอนุภาคจาก " + row[0] + " mol",
      blurb: "คูณด้วยเลขอาโวกาโดร",
      context: "เลขอาโวกาโดร · โมลและสูตรเคมี",
      stem: "สารชนิดหนึ่งมีปริมาณ " + row[0] + " mol จงหาจำนวนอนุภาค โดย N<sub>A</sub> = 6.022×10²³ mol⁻¹",
      vars: [v("n", "n (จำนวนโมล)", row[0], "mol", U.mol), v("M", "M (มวลโมลาร์)", 18, "g/mol", U.gmol, false)],
      constants: [{ id: "NA", value: 6.022e23, label: "N_A", unit: "1/mol" }],
      target: { id: "N", label: "N (จำนวนอนุภาค)", unit: "อนุภาค" },
      targetOptions: [{ id: "N", label: "N (จำนวนอนุภาค)" }, { id: "n", label: "จำนวนโมล" }, { id: "M", label: "มวลโมลาร์" }],
      formulas: [
        { html: "N = n × N<sub>A</sub>", ok: true },
        { html: "N = n / N<sub>A</sub>", ok: false },
        { html: "N = n × M", ok: false },
        { html: "N = N<sub>A</sub> / n", ok: false }
      ],
      expr: "n*NA", exprHtml: "n × NA", digits: -1
    });
  });

  [[1.5, "STP", 22.4, "mole-stp-1"], [3, "STP", 22.4, "mole-stp-2"], [2, "RTP", 24.5, "mole-rtp-1"]].forEach((row) => {
    add({
      id: row[3], chapter: "โมลและสูตรเคมี", topic: "ปริมาตรแก๊ส", level: row[1] === "RTP" ? "ยาก" : "ปานกลาง",
      title: "ปริมาตรแก๊ส " + row[0] + " mol ที่ " + row[1],
      blurb: row[1] === "STP" ? "ใช้ 22.4 L/mol เฉพาะที่ STP" : "ที่ RTP ใช้ 24.5 L/mol ไม่ใช่ 22.4",
      context: "แก๊สอุดมคติ · โมลและสูตรเคมี",
      stem: "แก๊ส " + row[0].toFixed(2) + " mol อยู่ที่สภาวะ " + row[1] + " (" + (row[1] === "STP" ? "0 °C, 1 atm" : "25 °C, 1 atm") + ") จงหาปริมาตร",
      vars: [v("n", "n (จำนวนโมล)", row[0], "mol", U.mol), v("Vm", "Vₘ (ปริมาตรโมลาร์)", row[2], "L/mol", ["L/mol", "mL/mol"], true), v("P", "P (ความดัน)", 2, "atm", U.atm, false)],
      target: { id: "V", label: "V (ปริมาตร)", unit: "L" },
      targetOptions: [{ id: "V", label: "V (ปริมาตร)" }, { id: "n", label: "จำนวนโมล" }, { id: "P", label: "ความดัน" }],
      formulas: [
        { html: "V = n × V<sub>m</sub>", ok: true },
        { html: "V = n / V<sub>m</sub>", ok: false },
        { html: "V = n × 22.4 เสมอทุกสภาวะ", ok: false },
        { html: "V = V<sub>m</sub> / n", ok: false }
      ],
      expr: "n*Vm", exprHtml: "n × Vm", digits: 2,
      note: "22.4 L/mol ใช้กับแก๊สที่ STP เท่านั้น ที่ RTP ใช้ประมาณ 24.5 L/mol"
    });
  });

  [
    ["mole-pct-1", "น้ำ", 1, 15.999, 18.015, "ออกซิเจน"],
    ["mole-pct-2", "มีเทน", 1, 12.011, 16.043, "คาร์บอน"],
    ["mole-pct-3", "คาร์บอนไดออกไซด์", 2, 15.999, 44.009, "ออกซิเจน"]
  ].forEach((row) => {
    add({
      id: row[0], chapter: "โมลและสูตรเคมี", topic: "ร้อยละโดยมวล", level: "ปานกลาง",
      title: "ร้อยละโดยมวลของ" + row[5] + "ใน" + row[1],
      blurb: "เทียบมวลของธาตุนั้นใน 1 โมลกับมวลสูตร",
      context: "องค์ประกอบร้อยละ · โมลและสูตรเคมี",
      stem: "ใน " + row[1] + " มีอะตอม" + row[5] + " " + row[2] + " อะตอม มวลอะตอม " + row[3] + " และมวลสูตร " + row[4] + " g/mol จงหาร้อยละโดยมวลของ" + row[5],
      vars: [v("a", "a (จำนวนอะตอม)", row[2], "—", ["—"]), v("Ar", "Aᵣ", row[3], "g/mol", U.gmol), v("Mr", "Mᵣ", row[4], "g/mol", U.gmol)],
      target: { id: "pct", label: "ร้อยละโดยมวล", unit: "%" },
      targetOptions: [{ id: "pct", label: "ร้อยละโดยมวล" }, { id: "Mr", label: "มวลสูตร" }, { id: "a", label: "จำนวนอะตอม" }],
      formulas: [
        { html: "%X = a × A<sub>r</sub> / M<sub>r</sub> × 100", ok: true },
        { html: "%X = A<sub>r</sub> / a × 100", ok: false },
        { html: "%X = M<sub>r</sub> / (a × A<sub>r</sub>) × 100", ok: false },
        { html: "%X = a + A<sub>r</sub> + M<sub>r</sub>", ok: false }
      ],
      expr: "a*Ar/Mr*100", exprHtml: "a × Ar / Mr × 100", digits: 2
    });
  });

  [[180, 30, "กลูโคส"], [92, 46, "สารประกอบหนึ่ง"]].forEach((row, idx) => {
    add({
      id: "mole-emp-" + (idx + 1), chapter: "โมลและสูตรเคมี", topic: "สูตรเอมพิริกัลและสูตรโมเลกุล", level: "ปานกลาง",
      title: "ตัวคูณสูตรโมเลกุลของ" + row[2],
      blurb: "n = มวลโมเลกุล ÷ มวลสูตรเอมพิริกัล",
      context: "สูตรเคมี · โมลและสูตรเคมี",
      stem: row[2] + "มีมวลโมเลกุล " + row[0] + " g/mol และมวลของสูตรเอมพิริกัล " + row[1] + " g/mol จงหาตัวคูณ n ของสูตรโมเลกุล",
      vars: [v("Mm", "M (มวลโมเลกุล)", row[0], "g/mol", U.gmol), v("Me", "Mₑ (มวลสูตรอย่างง่าย)", row[1], "g/mol", U.gmol), v("a", "a (จำนวนอะตอม)", 2, "—", ["—"], false)],
      target: { id: "n", label: "n (ตัวคูณ)", unit: "" },
      targetOptions: [{ id: "n", label: "n (ตัวคูณสูตรโมเลกุล)" }, { id: "Mm", label: "มวลโมเลกุล" }, { id: "Me", label: "มวลสูตรเอมพิริกัล" }],
      formulas: [
        { html: "n = M<sub>molecular</sub> / M<sub>empirical</sub>", ok: true },
        { html: "n = M<sub>empirical</sub> / M<sub>molecular</sub>", ok: false },
        { html: "n = M<sub>molecular</sub> − M<sub>empirical</sub>", ok: false },
        { html: "n = M<sub>molecular</sub> × M<sub>empirical</sub>", ok: false }
      ],
      expr: "Mm/Me", exprHtml: "Mm / Me", digits: 0,
      note: "สูตรเอมพิริกัลคืออัตราส่วนอย่างต่ำ สูตรโมเลกุลอาจเป็นทวีคูณของสูตรนั้น"
    });
  });

  [
    ["sol-prep-1", "NaOH", 40.00, 0.50, 250, "ง่าย"],
    ["sol-prep-2", "NaOH", 40.00, 0.10, 500, "ง่าย"],
    ["sol-prep-3", "HCl", 36.46, 0.20, 250, "ปานกลาง"],
    ["sol-prep-4", "KMnO4", 158.03, 0.020, 500, "ยาก"]
  ].forEach((row) => {
    add({
      id: row[0], chapter: "สารละลาย", topic: "การเตรียมสารละลาย", level: row[5],
      title: "ชั่ง " + row[1] + " เพื่อเตรียมสารละลาย",
      blurb: "เตรียม " + row[3].toFixed(2) + " M ปริมาตร " + row[4] + " mL",
      context: "การเตรียมจากสารบริสุทธิ์ · สารละลาย",
      stem: "ต้องการเตรียมสารละลาย " + row[1] + " ความเข้มข้น " + row[3].toFixed(3) + " mol/L ปริมาตร " + row[4].toFixed(1) + " mL มวลโมเลกุล " + row[2].toFixed(2) + " g/mol จะต้องชั่งของแข็งกี่กรัม",
      vars: [v("C", "C (ความเข้มข้น)", row[3], "mol/L", U.molL), v("V", "V (ปริมาตร)", row[4], "mL", U.mL), v("Mw", "M_w (มวลโมเลกุล)", row[2], "g/mol", U.gmol), v("rho", "ρ (ความหนาแน่น)", 1, "g/mL", ["g/mL", "kg/L"], false)],
      target: { id: "m", label: "m (มวลสาร)", unit: "g" },
      targetOptions: [{ id: "m", label: "m (มวลสาร)" }, { id: "n", label: "n (จำนวนโมล)" }, { id: "C", label: "ความเข้มข้น" }],
      formulas: [
        { html: "m = C × V × M<sub>w</sub> / 1000", ok: true },
        { html: "m = C × M<sub>w</sub> / V", ok: false },
        { html: "m = C × V × 1000 / M<sub>w</sub>", ok: false },
        { html: "m = V × M<sub>w</sub> / C", ok: false }
      ],
      expr: "C*V*Mw/1000", exprHtml: "C × V × Mw / 1000", digits: 2,
      note: "การเตรียมให้แม่นต้องใช้ขวดกำหนดปริมาตร ไม่ใช้บีกเกอร์เป็นเครื่องตวงสุดท้าย"
    });
  });

  [
    ["sol-M-1", 5.00, 40.00, 250],
    ["sol-M-2", 4.00, 58.44, 500]
  ].forEach((row) => {
    add({
      id: row[0], chapter: "สารละลาย", topic: "หน่วยความเข้มข้น", level: "ปานกลาง",
      title: "หาโมลาริตีจากมวลที่ชั่ง",
      blurb: "ละลาย " + row[1] + " g แล้วปรับปริมาตร " + row[3] + " mL",
      context: "โมลาริตี · สารละลาย",
      stem: "ชั่งสารมวลโมเลกุล " + row[2].toFixed(2) + " g/mol ได้ " + row[1].toFixed(2) + " g แล้วปรับปริมาตรเป็น " + row[3] + " mL จงหาความเข้มข้นโมลาร์",
      vars: [v("g", "m (มวล)", row[1], "g", U.g), v("Mw", "M_w", row[2], "g/mol", U.gmol), v("V", "V (ปริมาตร)", row[3], "mL", U.mL)],
      target: { id: "M", label: "M (โมลาริตี)", unit: "mol/L" },
      targetOptions: [{ id: "M", label: "M (โมลาริตี)" }, { id: "g", label: "มวล" }, { id: "V", label: "ปริมาตร" }],
      formulas: [
        { html: "M = m × 1000 / (M<sub>w</sub> × V<sub>mL</sub>)", ok: true },
        { html: "M = m × V / M<sub>w</sub>", ok: false },
        { html: "M = M<sub>w</sub> × V / m", ok: false },
        { html: "M = m / V", ok: false }
      ],
      expr: "g*1000/(Mw*V)", exprHtml: "g × 1000 / (Mw × V)", digits: 3
    });
  });

  [
    [2.00, 0.20, 250, "sol-dil-1"],
    [1.00, 0.10, 500, "sol-dil-2"],
    [4.00, 0.50, 200, "sol-dil-3"],
    [10.00, 0.25, 100, "sol-dil-4"]
  ].forEach((row) => {
    add({
      id: row[3], chapter: "สารละลาย", topic: "การเจือจาง", level: "ปานกลาง",
      title: "ปริมาตรสารตั้งต้นสำหรับการเจือจาง",
      blurb: "จาก " + row[0].toFixed(2) + " M ให้ได้ " + row[1].toFixed(2) + " M จำนวน " + row[2] + " mL",
      context: "C₁V₁ = C₂V₂ · สารละลาย",
      stem: "มีสารละลายเข้มข้น " + row[0].toFixed(2) + " M ต้องการเจือจางให้ได้ " + row[1].toFixed(2) + " M ปริมาตร " + row[2].toFixed(1) + " mL ต้องใช้สารละลายตั้งต้นกี่มิลลิลิตร",
      vars: [v("C1", "C₁", row[0], "mol/L", U.molL), v("C2", "C₂", row[1], "mol/L", U.molL), v("V2", "V₂", row[2], "mL", U.mL), v("Mw", "M_w", 36.46, "g/mol", U.gmol, false)],
      target: { id: "V1", label: "V₁ (ปริมาตรตั้งต้น)", unit: "mL" },
      targetOptions: [{ id: "V1", label: "V₁ (ปริมาตรตั้งต้น)" }, { id: "V2", label: "V₂ (ปริมาตรสุดท้าย)" }, { id: "C2", label: "C₂" }],
      formulas: [
        { html: "V₁ = C₂ × V₂ / C₁", ok: true },
        { html: "V₁ = C₁ × V₂ / C₂", ok: false },
        { html: "V₁ = C₁ × C₂ × V₂", ok: false },
        { html: "V₁ = C₁ × V₂ × C₂ / 1000", ok: false }
      ],
      expr: "C2*V2/C1", exprHtml: "C2 × V2 / C1", digits: 2,
      note: "ตอนเจือจาง จำนวนโมลของตัวละลายไม่ลดลง ปริมาตรรวมต่างหากที่เพิ่มขึ้น และต้องเทกรดลงในน้ำ"
    });
  });

  [[2.00, 50, 250], [5.00, 20, 200]].forEach((row, idx) => {
    add({
      id: "sol-c2-" + (idx + 1), chapter: "สารละลาย", topic: "การเจือจาง", level: "ปานกลาง",
      title: "ความเข้มข้นหลังเจือจาง",
      blurb: "นำสาร " + row[0] + " M จำนวน " + row[1] + " mL ไปปรับเป็น " + row[2] + " mL",
      context: "การเจือจาง · สารละลาย",
      stem: "ปิเปตสารละลาย " + row[0].toFixed(2) + " M มา " + row[1].toFixed(1) + " mL แล้วปรับปริมาตรเป็น " + row[2].toFixed(1) + " mL จงหาความเข้มข้นใหม่",
      vars: [v("C1", "C₁", row[0], "mol/L", U.molL), v("V1", "V₁", row[1], "mL", U.mL), v("V2", "V₂", row[2], "mL", U.mL)],
      target: { id: "C2", label: "C₂ (ความเข้มข้นใหม่)", unit: "mol/L" },
      targetOptions: [{ id: "C2", label: "C₂ (ความเข้มข้นใหม่)" }, { id: "C1", label: "C₁" }, { id: "V2", label: "V₂" }],
      formulas: [
        { html: "C₂ = C₁ × V₁ / V₂", ok: true },
        { html: "C₂ = C₁ × V₂ / V₁", ok: false },
        { html: "C₂ = V₁ / V₂", ok: false },
        { html: "C₂ = C₁ + V₁ / V₂", ok: false }
      ],
      expr: "C1*V1/V2", exprHtml: "C1 × V1 / V2", digits: 3
    });
  });

  [[18.0, 180.16, 200], [5.844, 58.44, 100]].forEach((row, idx) => {
    add({
      id: "sol-m-" + (idx + 1), chapter: "สารละลาย", topic: "หน่วยความเข้มข้น", level: "ยาก",
      title: "โมลาลิตีของสารละลาย",
      blurb: "คิดต่อมวลตัวทำละลาย 1 kg ไม่ใช่ต่อปริมาตรสารละลาย",
      context: "โมลาลิตี · สารละลาย",
      stem: "ละลายตัวละลายมวลโมเลกุล " + row[1] + " g/mol จำนวน " + row[0] + " g ในน้ำ " + row[2] + " g จงหาโมลาลิตี",
      vars: [v("g", "m (มวลตัวละลาย)", row[0], "g", U.g), v("Mw", "M_w", row[1], "g/mol", U.gmol), v("W", "W (มวลตัวทำละลาย)", row[2], "g", U.g)],
      target: { id: "molal", label: "m (โมลาลิตี)", unit: "mol/kg" },
      targetOptions: [{ id: "molal", label: "m (โมลาลิตี)" }, { id: "g", label: "มวลตัวละลาย" }, { id: "W", label: "มวลตัวทำละลาย" }],
      formulas: [
        { html: "m = มวลตัวละลาย × 1000 / (M<sub>w</sub> × มวลตัวทำละลาย)", ok: true },
        { html: "m = M<sub>w</sub> × มวลตัวทำละลาย / มวลตัวละลาย", ok: false },
        { html: "m = มวลตัวละลาย / มวลตัวทำละลาย", ok: false },
        { html: "m = มวลตัวละลาย × M<sub>w</sub> / 1000", ok: false }
      ],
      expr: "g*1000/(Mw*W)", exprHtml: "g × 1000 / (Mw × W)", digits: 3,
      note: "โมลาริตีคิดต่อปริมาตรสารละลายจึงเปลี่ยนตามอุณหภูมิ ส่วนโมลาลิตีคิดต่อมวลตัวทำละลาย"
    });
  });

  [[0.50, 1, 0.512], [0.25, 2, 0.512]].forEach((row, idx) => {
    add({
      id: "sol-tb-" + (idx + 1), chapter: "สารละลาย", topic: "สมบัติคอลลิเกทีฟ", level: "ยาก",
      title: "จุดเดือดใหม่ของสารละลายในน้ำ",
      blurb: "ΔT คือส่วนที่เพิ่มขึ้น ต้องบวกกับ 100 °C",
      context: "การเพิ่มจุดเดือด · สารละลาย",
      stem: "สารละลายในน้ำมีโมลาลิตี " + row[0].toFixed(2) + " mol/kg และ van't Hoff factor i = " + row[1] + " โดย K<sub>b</sub> ของน้ำ = " + row[2] + " °C/m จงหาจุดเดือดใหม่",
      vars: [v("molal", "m (โมลาลิตี)", row[0], "mol/kg", ["mol/kg", "mol/L"]), v("i", "i (แฟกเตอร์)", row[1], "—", ["—"]), v("Kb", "K_b", row[2], "°C/m", ["°C/m", "°C"])],
      target: { id: "Tb", label: "T_b (จุดเดือดใหม่)", unit: "°C" },
      targetOptions: [{ id: "Tb", label: "จุดเดือดใหม่" }, { id: "dT", label: "เฉพาะ ΔT_b" }, { id: "molal", label: "โมลาลิตี" }],
      formulas: [
        { html: "T<sub>b</sub> = 100 + i × K<sub>b</sub> × m", ok: true },
        { html: "T<sub>b</sub> = i × K<sub>b</sub> × m", ok: false },
        { html: "T<sub>b</sub> = 100 − i × K<sub>b</sub> × m", ok: false },
        { html: "T<sub>b</sub> = 100 × i × K<sub>b</sub> × m", ok: false }
      ],
      expr: "100+i*Kb*molal", exprHtml: "100 + i × Kb × molal", digits: 3,
      note: "ΔT_b ไม่ใช่จุดเดือดใหม่ ต้องนำไปบวกกับจุดเดือดของตัวทำละลายบริสุทธิ์"
    });
  });

  add({
    id: "sol-tf-1", chapter: "สารละลาย", topic: "สมบัติคอลลิเกทีฟ", level: "ยาก",
    title: "จุดเยือกแข็งของสารละลายน้ำตาล",
    blurb: "จุดเยือกแข็งลดลงจาก 0 °C",
    context: "การลดจุดเยือกแข็ง · สารละลาย",
    stem: "สารละลายกลูโคสในน้ำมีโมลาลิตี 0.50 mol/kg ไม่แตกตัว (i = 1) และ K<sub>f</sub> ของน้ำ = 1.86 °C/m จงหาจุดเยือกแข็งใหม่",
    vars: [v("molal", "m", 0.50, "mol/kg", ["mol/kg", "mol/L"]), v("i", "i", 1, "—", ["—"]), v("Kf", "K_f", 1.86, "°C/m", ["°C/m", "°C"])],
    target: { id: "Tf", label: "T_f (จุดเยือกแข็งใหม่)", unit: "°C" },
    targetOptions: [{ id: "Tf", label: "จุดเยือกแข็งใหม่" }, { id: "molal", label: "โมลาลิตี" }, { id: "Kf", label: "K_f" }],
    formulas: [
      { html: "T<sub>f</sub> = 0 − i × K<sub>f</sub> × m", ok: true },
      { html: "T<sub>f</sub> = i × K<sub>f</sub> × m", ok: false },
      { html: "T<sub>f</sub> = 0 + i × K<sub>f</sub> × m", ok: false },
      { html: "T<sub>f</sub> = K<sub>f</sub> / m", ok: false }
    ],
    expr: "0-i*Kf*molal", exprHtml: "0 − i × Kf × molal", digits: 3
  });

  add({
    id: "sol-pi-1", chapter: "สารละลาย", topic: "สมบัติคอลลิเกทีฟ", level: "ยาก",
    title: "ความดันออสโมติก",
    blurb: "Π = iMRT ที่ 25 °C",
    context: "ออสโมซิส · สารละลาย",
    stem: "สารละลายกลูโคส 0.100 mol/L ไม่แตกตัว (i = 1) ที่ 298 K โดย R = 0.0821 L·atm/(mol·K) จงหาความดันออสโมติก",
    vars: [v("M", "M (โมลาริตี)", 0.100, "mol/L", U.molL), v("i", "i", 1, "—", ["—"]), v("T", "T (อุณหภูมิ)", 298, "K", ["K", "°C"])],
    constants: [{ id: "R", value: 0.0821, label: "R", unit: "L·atm/(mol·K)" }],
    target: { id: "Pi", label: "Π (ความดันออสโมติก)", unit: "atm" },
    targetOptions: [{ id: "Pi", label: "ความดันออสโมติก" }, { id: "M", label: "โมลาริตี" }, { id: "T", label: "อุณหภูมิ" }],
    formulas: [
      { html: "Π = i × M × R × T", ok: true },
      { html: "Π = M × R / T", ok: false },
      { html: "Π = i × R × T / M", ok: false },
      { html: "Π = i × M × T", ok: false }
    ],
    expr: "i*M*R*T", exprHtml: "i × M × R × T", digits: 3
  });

  add({
    id: "sol-x-1", chapter: "สารละลาย", topic: "หน่วยความเข้มข้น", level: "ปานกลาง",
    title: "เศษส่วนโมลของตัวละลาย",
    blurb: "X = n ตัวละลาย / โมลรวม",
    context: "เศษส่วนโมล · สารละลาย",
    stem: "สารละลายมีตัวละลาย 0.20 mol และตัวทำละลาย 4.80 mol จงหาเศษส่วนโมลของตัวละลาย",
    vars: [v("ns", "n<sub>solute</sub>", 0.20, "mol", U.mol), v("nv", "n<sub>solvent</sub>", 4.80, "mol", U.mol), v("V", "V", 100, "mL", U.mL, false)],
    target: { id: "X", label: "X (เศษส่วนโมล)", unit: "" },
    targetOptions: [{ id: "X", label: "เศษส่วนโมลของตัวละลาย" }, { id: "ns", label: "โมลตัวละลาย" }, { id: "nv", label: "โมลตัวทำละลาย" }],
    formulas: [
      { html: "X = n<sub>solute</sub> / (n<sub>solute</sub> + n<sub>solvent</sub>)", ok: true },
      { html: "X = n<sub>solute</sub> / n<sub>solvent</sub>", ok: false },
      { html: "X = n<sub>solute</sub> × n<sub>solvent</sub>", ok: false },
      { html: "X = n<sub>solvent</sub> / n<sub>solute</sub>", ok: false }
    ],
    expr: "ns/(ns+nv)", exprHtml: "ns / (ns + nv)", digits: 3
  });

  const STEPS = ["วิเคราะห์โจทย์", "เลือกสูตร", "จัดรูปสมการ", "แทนค่า", "คำนวณ"];

  const Store = {
    key: "chem-learning-v1",
    load() {
      try {
        const raw = JSON.parse(localStorage.getItem(this.key));
        if (!raw || typeof raw !== "object") throw new Error("empty");
        raw.mistakes = raw.mistakes || [];
        raw.solved = raw.solved || {};
        raw.hints = raw.hints || 0;
        raw.times = raw.times || [];
        return raw;
      } catch (e) {
        return { mistakes: [], solved: {}, hints: 0, times: [] };
      }
    },
    save(data) {
      try { localStorage.setItem(this.key, JSON.stringify(data)); } catch (e) { /* ignore quota */ }
    },
    fail(problem, step) {
      const data = this.load();
      data.mistakes.push({ id: problem.id, step: step, topic: problem.topic, chapter: problem.chapter });
      if (data.mistakes.length > 400) data.mistakes = data.mistakes.slice(-400);
      this.save(data);
    },
    hint() {
      const data = this.load();
      data.hints += 1;
      this.save(data);
    },
    success(problem, sec) {
      const data = this.load();
      if (!data.solved[problem.id]) {
        data.solved[problem.id] = { sec: sec, topic: problem.topic, chapter: problem.chapter, at: Date.now() };
        data.times.push(sec);
      }
      this.save(data);
    },
    reset() { localStorage.removeItem(this.key); }
  };

  function stats() {
    const data = Store.load();
    const solvedIds = Object.keys(data.solved);
    const mistakeIds = {};
    data.mistakes.forEach((m) => { mistakeIds[m.id] = true; });
    const unsolvedWrong = Object.keys(mistakeIds).filter((id) => !data.solved[id]).length;
    const attempted = solvedIds.length + unsolvedWrong;
    const stepCount = {};
    const topicCount = {};
    STEPS.forEach((s) => { stepCount[s] = 0; });
    data.mistakes.forEach((m) => {
      stepCount[m.step] = (stepCount[m.step] || 0) + 1;
      topicCount[m.topic] = (topicCount[m.topic] || 0) + 1;
    });
    let weakStep = STEPS[0];
    let weakN = -1;
    Object.keys(stepCount).forEach((k) => { if (stepCount[k] > weakN) { weakN = stepCount[k]; weakStep = k; } });
    let weakTopic = "—";
    let topicN = 0;
    Object.keys(topicCount).forEach((k) => { if (topicCount[k] > topicN) { topicN = topicCount[k]; weakTopic = k; } });
    const avg = data.times.length ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length) : 0;
    return {
      solved: solvedIds.length,
      total: problems.length,
      accuracy: attempted ? Math.round(100 * solvedIds.length / attempted) : 0,
      hints: data.hints,
      wrongOpen: unsolvedWrong,
      failEvents: data.mistakes.length,
      avg: avg,
      weakStep: weakStep,
      weakN: Math.max(0, weakN),
      weakTopic: weakTopic,
      topicN: topicN,
      solvedMap: data.solved
    };
  }

  const CHEMICALS = [
    { id: "HCl", name: "กรดไฮโดรคลอริก", formula: "HCl", mw: 36.46, kind: "กรดเข้มข้น", color: "#d7e7a4",
      ghs: ["กัดกร่อน", "ระคายเคือง"], nfpa: { h: 3, f: 0, r: 1, s: "COR" },
      sds: "ไอระคายเคืองระบบทางเดินหายใจ กัดผิวหนังและตา ใช้ในตู้ดูดควัน สวมแว่นตา ถุงมือ และเสื้อกาวน์ หากสัมผัสผิวหนังให้ล้างน้ำมากอย่างน้อย 15 นาที",
      ppe: "แว่นตา ถุงมือทนสารเคมี เสื้อกาวน์ ตู้ดูดควัน" },
    { id: "NaOH", name: "โซเดียมไฮดรอกไซด์", formula: "NaOH", mw: 40.00, kind: "เบสเข้มข้น", color: "#f4f4f4",
      ghs: ["กัดกร่อน"], nfpa: { h: 3, f: 0, r: 1, s: "" },
      sds: "ของแข็งและสารละลายกัดเนื้อเยื่อ ดูดความชื้น เมื่อละลายน้ำคายความร้อน ห้ามสะเทินบนผิวหนัง ให้ล้างน้ำปริมาณมาก",
      ppe: "แว่นตา ถุงมือ เสื้อกาวน์" },
    { id: "EtOH", name: "เอทานอล", formula: "C2H5OH", mw: 46.07, kind: "สารไวไฟ", color: "#e7f6ff",
      ghs: ["ไวไฟ", "ระคายเคือง"], nfpa: { h: 2, f: 3, r: 0, s: "" },
      sds: "ของเหลวไวไฟสูง ไอหนักกว่าอากาศเล็กน้อยและติดไฟได้ เก็บให้ห่างจากเปลวไฟ ไฟเล็กใช้ถังดับเพลิงชนิดคาร์บอนไดออกไซด์หรือผงเคมีแห้ง",
      ppe: "แว่นตา ถุงมือ เก็บห่างแหล่งจุดระเบิด" },
    { id: "KMnO4", name: "โพแทสเซียมเปอร์แมงกาเนต", formula: "KMnO4", mw: 158.03, kind: "สารออกซิไดส์", color: "#6b2d86",
      ghs: ["ออกซิไดส์", "ระคายเคือง", "สิ่งแวดล้อม"], nfpa: { h: 2, f: 0, r: 1, s: "OX" },
      sds: "ตัวออกซิไดส์รุนแรง ทำปฏิกิริยากับสารอินทรีย์และสารรีดิวซ์ได้รุนแรง สารละลายสีม่วงเข้ม เป็นอันตรายต่อสิ่งมีชีวิตในน้ำ",
      ppe: "แว่นตา ถุงมือ ห้ามเก็บรวมกับสารไวไฟ" },
    { id: "H2SO4", name: "กรดซัลฟิวริก", formula: "H2SO4", mw: 98.08, kind: "กรดเข้มข้น", color: "#f6f1dc",
      ghs: ["กัดกร่อน"], nfpa: { h: 3, f: 0, r: 2, s: "W" },
      sds: "กรดแก่คายความร้อนรุนแรงเมื่อเจือจาง ต้องเทกรดลงในน้ำช้า ๆ ห้ามเทน้ำลงในกรด หากถูกผิวหนังให้ล้างน้ำมากทันทีอย่างน้อย 15 นาที",
      ppe: "แว่นตา ถุงมือ เสื้อกาวน์ หน้ากากหากมีไอ" },
    { id: "CuSO4", name: "คอปเปอร์(II) ซัลเฟต", formula: "CuSO4", mw: 159.61, kind: "พิษต่อสิ่งแวดล้อม", color: "#2f7fd0",
      ghs: ["ระคายเคือง", "สิ่งแวดล้อม"], nfpa: { h: 2, f: 0, r: 0, s: "" },
      sds: "เป็นพิษเมื่อกลืน และเป็นอันตรายต่อสิ่งมีชีวิตในน้ำมาก ห้ามเทลงอ่างทิ้งทั่วไป ต้องแยกภาชนะของเสีย",
      ppe: "แว่นตา ถุงมือ และแยกทิ้งของเสีย" }
  ];

  const GLASSWARE = [
    { id: "beaker", name: "บีกเกอร์", precise: false, tol: 5, capacity: 100, decimals: 0, note: "กะปริมาตรคร่าว ๆ ไม่ใช้เตรียมสารมาตรฐาน" },
    { id: "cylinder", name: "กระบอกตวง", precise: false, tol: 0.5, capacity: 100, decimals: 1, note: "100 mL ± 0.5 mL เหมาะกับปริมาตรโดยประมาณ" },
    { id: "pipette", name: "ปิเปตแบบปริมาตรเดียว", precise: true, tol: 0.02, capacity: 10, decimals: 2, note: "10.00 mL ± 0.02 mL ใช้กับปริมาตรแน่นอน" },
    { id: "burette", name: "บิวเรต", precise: true, tol: 0.05, capacity: 50, decimals: 2, note: "50.00 mL ± 0.05 mL อ่านได้ทศนิยม 2 ตำแหน่ง" },
    { id: "flask", name: "ขวดกำหนดปริมาตร", precise: true, tol: 0.12, capacity: 250, decimals: 2, note: "250.0 mL ± 0.12 mL ใช้ปรับปริมาตรสุดท้าย" }
  ];

  const SOLVENTS = [
    { id: "water", name: "น้ำ", formula: "H2O", mw: 18.015, tb: 100, tf: 0, kb: 0.512, kf: 1.86, color: "#8ecbff" },
    { id: "benzene", name: "เบนซีน", formula: "C6H6", mw: 78.11, tb: 80.1, tf: 5.5, kb: 2.53, kf: 5.12, color: "#f3e7b0" },
    { id: "ethanol", name: "เอทานอล", formula: "C2H5OH", mw: 46.07, tb: 78.4, tf: -114.1, kb: 1.22, kf: 1.99, color: "#d9f4ff" },
    { id: "chex", name: "ไซโคลเฮกเซน", formula: "C6H12", mw: 84.16, tb: 80.7, tf: 6.5, kb: 2.79, kf: 20.2, color: "#efe6ff" }
  ];

  const SOLUTES = [
    { id: "glucose", name: "กลูโคส", formula: "C6H12O6", mw: 180.16, i: 1, kind: "ไม่แตกตัว" },
    { id: "urea", name: "ยูเรีย", formula: "CH4N2O", mw: 60.06, i: 1, kind: "ไม่แตกตัว" },
    { id: "sucrose", name: "ซูโครส", formula: "C12H22O11", mw: 342.30, i: 1, kind: "ไม่แตกตัว" },
    { id: "nacl", name: "โซเดียมคลอไรด์", formula: "NaCl", mw: 58.44, i: 2, kind: "แตกตัว" },
    { id: "cacl2", name: "แคลเซียมคลอไรด์", formula: "CaCl2", mw: 110.98, i: 3, kind: "แตกตัว" }
  ];

  const COMPOUNDS = [
    { id: "H2O", name: "น้ำ", formula: "H2O" },
    { id: "CO2", name: "คาร์บอนไดออกไซด์", formula: "CO2" },
    { id: "CH4", name: "มีเทน", formula: "CH4" },
    { id: "C6H12O6", name: "กลูโคส", formula: "C6H12O6" },
    { id: "NaCl", name: "โซเดียมคลอไรด์", formula: "NaCl" },
    { id: "CaCO3", name: "แคลเซียมคาร์บอเนต", formula: "CaCO3" },
    { id: "C2H5OH", name: "เอทานอล", formula: "C2H5OH" },
    { id: "NH3", name: "แอมโมเนีย", formula: "NH3" }
  ];

  const LABS = [
    { id: "safety", no: "01", title: "ความปลอดภัยและทักษะในปฏิบัติการ", en: "Safety and Skills", minutes: 12, blurb: "สัญลักษณ์ GHS และ NFPA การอ่านเมนิสคัส การเจือจางกรด และการปฐมพยาบาล" },
    { id: "atom", no: "02", title: "อะตอมและสมบัติของธาตุ", en: "Atomic Structure", minutes: 12, blurb: "แบบจำลองอะตอม การจัดเรียงอิเล็กตรอน สเปกตรัม และแนวโน้มในตารางธาตุ" },
    { id: "bond", no: "03", title: "พันธะเคมี", en: "Chemical Bonding", minutes: 12, blurb: "พันธะไอออนิก โคเวเลนต์ โลหะ รูปร่าง VSEPR สภาพขั้ว และแรงระหว่างโมเลกุล" },
    { id: "mole", no: "04", title: "โมลและสูตรเคมี", en: "Moles and Formulas", minutes: 10, blurb: "มวลอะตอมเฉลี่ย วงแปลงหน่วยโมล ร้อยละโดยมวล และสูตรเอมพิริกัล" },
    { id: "solution", no: "05", title: "สารละลาย", en: "Solutions", minutes: 12, blurb: "หน่วยความเข้มข้น การเจือจาง กราฟสภาพละลายได้ และสมบัติคอลลิเกทีฟ" }
  ];

  const IE_ANOMALIES = [4, 5, 7, 8, 12, 13, 15, 16];

  function F(id, chapter, title, html, vars, solve, hints, mistake) {
    return { id: id, chapter: chapter, title: title, html: html, vars: vars, solve: solve, hints: hints, mistake: mistake };
  }
  function fv(id, label, unit) { return { id: id, label: label, unit: unit }; }

  const FORMULAS = [
    F("err", "ความปลอดภัยและทักษะปฏิบัติการ", "ร้อยละความคลาดเคลื่อน",
      "%Error = |ค่าทดลอง − ค่าจริง| / ค่าจริง × 100",
      [fv("Ve", "ค่าทดลอง", ""), fv("Vt", "ค่าจริง", ""), fv("pct", "% ความคลาดเคลื่อน", "%")],
      { pct: ["abs(Ve-Vt)/Vt*100", "|Ve − Vt| / Vt × 100"], Ve: ["Vt*(1+pct/100)", "Vt × (1 + pct / 100)"], Vt: ["Ve/(1+pct/100)", "Ve / (1 + pct / 100)"] },
      ["เทียบส่วนต่างกับค่าจริงเสมอ", "จัดรูปเป็น abs(Ve−Vt) / Vt × 100", "ตัวแปรคำตอบอยู่ฝั่งซ้ายอย่างเดียว"],
      "อุปกรณ์วัดปริมาตรประมาณอย่างบีกเกอร์ไม่เหมาะกับงานที่ต้องการความแม่นยำสูง"),
    F("massnum", "อะตอมและสมบัติของธาตุ", "เลขมวล",
      "A = Z + n",
      [fv("A", "A เลขมวล", ""), fv("Z", "Z เลขอะตอม", ""), fv("n", "n นิวตรอน", "")],
      { A: ["Z+n", "Z + n"], Z: ["A-n", "A − n"], n: ["A-Z", "A − Z"] },
      ["เลขมวลคือจำนวนโปรตอนบวกนิวตรอน ไม่ใช่มวลเป็นกรัม", "ถ้าโจทย์ถามนิวตรอน ให้ย้าย Z ไปอีกฝั่ง", "n = A − Z"],
      "เลขมวลไม่ใช่น้ำหนักจริงของอะตอมในหน่วยกรัม"),
    F("avgmass", "อะตอมและสมบัติของธาตุ", "มวลอะตอมเฉลี่ย",
      "มวลเฉลี่ย = (m₁p₁ + m₂p₂) / 100",
      [fv("avg", "มวลอะตอมเฉลี่ย", ""), fv("m1", "มวลไอโซโทป 1", ""), fv("p1", "% ไอโซโทป 1", "%"), fv("m2", "มวลไอโซโทป 2", ""), fv("p2", "% ไอโซโทป 2", "%")],
      { avg: ["(m1*p1+m2*p2)/100", "(m1 × p1 + m2 × p2) / 100"] },
      ["ถ่วงน้ำหนักด้วยร้อยละในธรรมชาติ", "หารด้วย 100 เพราะ p เป็นร้อยละ", "(m1×p1 + m2×p2) / 100"],
      "มวลอะตอมในตารางธาตุเป็นค่าเฉลี่ย ไม่ใช่มวลของไอโซโทปชนิดเดียว"),
    F("bohr", "อะตอมและสมบัติของธาตุ", "พลังงานระดับของโบร์",
      "Eₙ = −13.6 / n²",
      [fv("E", "E พลังงาน", "eV"), fv("n", "n ระดับพลังงาน", "")],
      { E: ["-13.6/(n*n)", "−13.6 / n²"] },
      ["พลังงานมีค่าเป็นลบ และเข้าใกล้ศูนย์เมื่อ n มาก", "ยกกำลังสองที่ระดับพลังงานก่อนหาร", "E = −13.6 / n^2"],
      "อิเล็กตรอนไม่ได้โคจรเป็นวงกลมคงที่แบบดาวเคราะห์ในแบบจำลองกลุ่มหมอก"),
    F("rydberg", "อะตอมและสมบัติของธาตุ", "ความยาวคลื่นจากริดเบิร์ก",
      "1/λ = R<sub>H</sub> (1/n<sub>f</sub>² − 1/n<sub>i</sub>²)",
      [fv("lam", "λ ความยาวคลื่น", "nm"), fv("nf", "n สุดท้าย", ""), fv("ni", "n เริ่มต้น", "")],
      { lam: ["1e9/(1.097e7*(1/(nf*nf)-1/(ni*ni)))", "10⁹ / [R<sub>H</sub> (1/nf² − 1/ni²)]"] },
      ["n ต้นต้องสูงกว่า n สุดท้ายสำหรับการคายแสง", "R<sub>H</sub> = 1.097×10⁷ m⁻¹ แล้วแปลงเป็นนาโนเมตร", "λ(nm) = 1e9 / (1.097e7 × (1/nf² − 1/ni²))"],
      "สีของเส้นสเปกตรัมขึ้นกับความต่างระดับพลังงาน ไม่ใช่สีของธาตุทั้งก้อน"),
    F("photon", "อะตอมและสมบัติของธาตุ", "พลังงานโฟตอนจากระดับพลังงาน",
      "ΔE = 13.6 (1/n<sub>f</sub>² − 1/n<sub>i</sub>²)",
      [fv("dE", "ΔE", "eV"), fv("nf", "n สุดท้าย", ""), fv("ni", "n เริ่มต้น", "")],
      { dE: ["13.6*(1/(nf*nf)-1/(ni*ni))", "13.6 × (1/nf² − 1/ni²)"] },
      ["ΔE คือพลังงานที่คายเมื่ออิเล็กตรอนตกสู่ระดับต่ำกว่า", "จัดรูปจาก E = −13.6/n²", "ΔE = 13.6 (1/nf² − 1/ni²)"],
      "การคายแสงเกิดตอนกลับสู่ระดับต่ำกว่า ไม่ใช่ตอนดูดพลังงาน"),
    F("den", "พันธะเคมี", "ผลต่างอิเล็กโทรเนกาติวิตี",
      "ΔEN = |EN₁ − EN₂|",
      [fv("dEN", "ΔEN", ""), fv("EN1", "EN อะตอม 1", ""), fv("EN2", "EN อะตอม 2", "")],
      { dEN: ["abs(EN1-EN2)", "|EN1 − EN2|"] },
      ["ใช้ค่าสัมบูรณ์ เพราะผลต่างไม่มีทิศในสูตรนี้", "ΔEN &lt; 0.5 ไม่มีขั้ว, 0.5–1.7 มีขั้ว, &gt; 1.7 เข้าใกลไอออนิก", "dEN = abs(EN1−EN2)"],
      "พันธะมีขั้วไม่ได้รับประกันว่าโมเลกุลทั้งก้อนมีขั้ว ถ้ารูปร่างสมมาตรเวกเตอร์หักล้างกัน"),
    F("ionic", "พันธะเคมี", "ร้อยละลักษณะไอออนิก",
      "% ไอออนิก = (1 − e^(−0.25 ΔEN²)) × 100",
      [fv("pic", "% ลักษณะไอออนิก", "%"), fv("dEN", "ΔEN", "")],
      { pic: ["(1-exp(-0.25*dEN*dEN))*100", "(1 − e^(−0.25 ΔEN²)) × 100"] },
      ["ยิ่ง ΔEN มาก ร้อยละไอออนิกยิ่งสูง", "ยกกำลังสองที่ ΔEN ก่อนคูณ 0.25", "(1 − exp(−0.25 × dEN²)) × 100"],
      "สารไอออนิกนำไฟฟ้าได้เมื่อหลอมเหลวหรือละลายน้ำ ไม่ใช่ทุกสถานะ"),
    F("mole-n", "โมลและสูตรเคมี", "จำนวนโมลจากมวล",
      "n = m / M",
      [fv("n", "n จำนวนโมล", "mol"), fv("m", "m มวล", "g"), fv("M", "M มวลโมลาร์", "g/mol")],
      { n: ["m/M", "m / M"], m: ["n*M", "n × M"], M: ["m/n", "m / n"] },
      ["1 โมลมีจำนวนอนุภาคเท่ากัน แต่คนละสารมีมวลไม่เท่ากัน", "หน่วยมวลเป็นกรัม และมวลโมลาร์เป็น g/mol", "n = m / M"],
      "1 โมลของทุกสารไม่ได้มีมวลเท่ากัน"),
    F("mole-N", "โมลและสูตรเคมี", "จำนวนอนุภาค",
      "N = n × N<sub>A</sub>",
      [fv("N", "N จำนวนอนุภาค", "อนุภาค"), fv("n", "n จำนวนโมล", "mol")],
      { N: ["n*6.022e23", "n × 6.022×10²³"], n: ["N/6.022e23", "N / 6.022×10²³"] },
      ["N<sub>A</sub> ≈ 6.022×10²³ อนุภาคต่อโมล", "ถ้าได้จำนวนอนุภาคมา ให้หารด้วย N<sub>A</sub>", "N = n × 6.022e23"],
      "โมลนับจำนวนอนุภาค ไม่ได้หมายถึงมวล 1 กรัม"),
    F("gas-stp", "โมลและสูตรเคมี", "ปริมาตรแก๊สที่ STP",
      "V = n × 22.4",
      [fv("V", "V ปริมาตร", "L"), fv("n", "n จำนวนโมล", "mol")],
      { V: ["n*22.4", "n × 22.4"], n: ["V/22.4", "V / 22.4"] },
      ["22.4 L/mol ใช้ได้เฉพาะแก๊สที่ STP (0 °C, 1 atm)", "ของแข็งและของเหลวใช้สูตรนี้ไม่ได้", "V = n × 22.4"],
      "22.4 ลิตรต่อโมลใช้ไม่ได้กับทุกอุณหภูมิ"),
    F("gas-rtp", "โมลและสูตรเคมี", "ปริมาตรแก๊สที่ RTP",
      "V = n × 24.5",
      [fv("V", "V ปริมาตร", "L"), fv("n", "n จำนวนโมล", "mol")],
      { V: ["n*24.5", "n × 24.5"], n: ["V/24.5", "V / 24.5"] },
      ["RTP ในชุดนี้คือ 25 °C และ 1 atm ใช้ 24.5 L/mol", "อย่าสลับกับ 22.4 ของ STP", "V = n × 24.5"],
      "เปลี่ยนอุณหภูมิแล้วปริมาตรโมลาร์ของแก๊สเปลี่ยนตาม"),
    F("masspct", "โมลและสูตรเคมี", "ร้อยละโดยมวลของธาตุ",
      "%X = a × A<sub>r</sub> / M<sub>r</sub> × 100",
      [fv("pct", "% โดยมวล", "%"), fv("a", "a จำนวนอะตอม", ""), fv("Ar", "Aᵣ มวลอะตอม", ""), fv("Mr", "Mᵣ มวลสูตร", "")],
      { pct: ["a*Ar/Mr*100", "a × Ar / Mr × 100"] },
      ["คูณจำนวนอะตอมของธาตุนั้นในสูตรก่อน", "หารด้วยมวลสูตรทั้งก้อน แล้วคูณ 100", "pct = a × Ar / Mr × 100"],
      "สูตรเอมพิริกัลคืออัตราส่วนอย่างต่ำ ไม่จำเป็นต้องเท่าสูตรโมเลกุล"),
    F("efmf", "โมลและสูตรเคมี", "ตัวคูณสูตรโมเลกุล",
      "n = M<sub>โมเลกุล</sub> / M<sub>เอมพิริกัล</sub>",
      [fv("n", "n ตัวคูณ", ""), fv("Mm", "มวลโมเลกุล", "g/mol"), fv("Me", "มวลสูตรเอมพิริกัล", "g/mol")],
      { n: ["Mm/Me", "Mm / Me"], Mm: ["n*Me", "n × Me"] },
      ["สูตรโมเลกุล = (สูตรเอมพิริกัล)<sub>n</sub>", "n ควรได้ใกล้จำนวนเต็ม", "n = Mm / Me"],
      "สูตรอย่างง่ายกับสูตรโมเลกุลเป็นสิ่งเดียวกันก็ต่อเมื่อ n = 1"),
    F("prep", "สารละลาย", "มวลสารเพื่อเตรียมสารละลาย",
      "m = C × V × M<sub>w</sub> / 1000",
      [fv("m", "m มวลสาร", "g"), fv("C", "C ความเข้มข้น", "mol/L"), fv("V", "V ปริมาตร", "mL"), fv("Mw", "Mw มวลโมเลกุล", "g/mol")],
      {
        m: ["C*V*Mw/1000", "C × V × Mw / 1000"],
        C: ["m*1000/(V*Mw)", "m × 1000 / (V × Mw)"],
        V: ["m*1000/(C*Mw)", "m × 1000 / (C × Mw)"],
        Mw: ["m*1000/(C*V)", "m × 1000 / (C × V)"]
      },
      ["V ในสูตรนี้เป็นมิลลิลิตร จึงต้องหาร 1000", "ถ้าโจทย์ถามมวล ให้เหลือ m ฝั่งซ้าย", "m = C × V × Mw / 1000"],
      "การเตรียมสารมาตรฐานต้องใช้ปิเปตหรือขวดกำหนดปริมาตร ไม่ใช้บีกเกอร์ตวง"),
    F("dilute", "สารละลาย", "การเจือจาง",
      "C₁V₁ = C₂V₂",
      [fv("C1", "C₁ ความเข้มข้นต้น", "mol/L"), fv("V1", "V₁ ปริมาตรต้น", "mL"), fv("C2", "C₂ ความเข้มข้นใหม่", "mol/L"), fv("V2", "V₂ ปริมาตรใหม่", "mL")],
      {
        C1: ["C2*V2/V1", "C2 × V2 / V1"],
        V1: ["C2*V2/C1", "C2 × V2 / C1"],
        C2: ["C1*V1/V2", "C1 × V1 / V2"],
        V2: ["C1*V1/C2", "C1 × V1 / C2"]
      },
      ["จำนวนโมลของตัวละลายไม่หายไปเมื่อเติมตัวทำละลาย", "ย้ายตัวที่ต้องการหาข้ามเครื่องหมายเท่ากับ แล้วหารด้วยตัวที่คูณอยู่", "เช่น V1 = C2 × V2 / C1"],
      "เจือจางกรดเข้มข้นให้เทกรดลงในน้ำช้า ๆ ห้ามเทน้ำลงในกรด"),
    F("molal", "สารละลาย", "โมลาลิตี",
      "m = n × 1000 / W",
      [fv("molal", "m โมลาลิตี", "mol/kg"), fv("n", "n โมลตัวละลาย", "mol"), fv("W", "W มวลตัวทำละลาย", "g")],
      { molal: ["n*1000/W", "n × 1000 / W"], n: ["molal*W/1000", "m × W / 1000"], W: ["n*1000/molal", "n × 1000 / m"] },
      ["โมลาลิตีคิดต่อมวลตัวทำละลาย 1 kg ไม่ใช่ต่อปริมาตรสารละลาย", "W ในสูตรนี้เป็นกรัม จึงคูณ 1000", "molal = n × 1000 / W"],
      "โมลาริตีกับโมลาลิตีไม่เท่ากันเสมอ เพราะตัวหนึ่งอิงปริมาตร อีกตัวอิงมวล"),
    F("tb", "สารละลาย", "จุดเดือดของสารละลาย",
      "T<sub>b</sub> = T<sub>b</sub>° + i × K<sub>b</sub> × m",
      [fv("Tb", "Tb จุดเดือดใหม่", "°C"), fv("Tb0", "Tb° ของตัวทำละลาย", "°C"), fv("i", "i แฟกเตอร์แวนต์ฮอฟฟ์", ""), fv("Kb", "Kb", "°C/m"), fv("molal", "m โมลาลิตี", "mol/kg")],
      { Tb: ["Tb0+i*Kb*molal", "Tb° + i × Kb × m"], molal: ["(Tb-Tb0)/(i*Kb)", "(Tb − Tb°) / (i × Kb)"] },
      ["ΔTb คือส่วนที่เพิ่มขึ้น ต้องบวกกลับเข้าจุดเดือดของตัวทำละลาย", "สารไม่แตกตัวใช้ i = 1", "Tb = Tb0 + i × Kb × molal"],
      "ΔTb ไม่ใช่จุดเดือดใหม่ ต้องนำไปบวกกับจุดเดือดของตัวทำละลายบริสุทธิ์"),
    F("tf", "สารละลาย", "จุดเยือกแข็งของสารละลาย",
      "T<sub>f</sub> = T<sub>f</sub>° − i × K<sub>f</sub> × m",
      [fv("Tf", "Tf จุดเยือกแข็งใหม่", "°C"), fv("Tf0", "Tf° ของตัวทำละลาย", "°C"), fv("i", "i แฟกเตอร์แวนต์ฮอฟฟ์", ""), fv("Kf", "Kf", "°C/m"), fv("molal", "m โมลาลิตี", "mol/kg")],
      { Tf: ["Tf0-i*Kf*molal", "Tf° − i × Kf × m"] },
      ["จุดเยือกแข็งลดลง จึงเป็นเครื่องหมายลบ", "น้ำบริสุทธิ์ใช้ Tf° = 0", "Tf = Tf0 − i × Kf × molal"],
      "สารละลายเยือกแข็งที่อุณหภูมิสูงขึ้นไม่ได้ มันเยือกแข็งต่ำกว่าตัวทำละลายบริสุทธิ์"),
    F("osm", "สารละลาย", "ความดันออสโมติก",
      "Π = i × M × R × T",
      [fv("Pi", "Π ความดันออสโมติก", "atm"), fv("i", "i", ""), fv("M", "M โมลาริตี", "mol/L"), fv("R", "R", "L·atm/(mol·K)"), fv("T", "T อุณหภูมิ", "K")],
      { Pi: ["i*M*R*T", "i × M × R × T"], M: ["Pi/(i*R*T)", "Π / (i × R × T)"] },
      ["อุณหภูมิต้องเป็นเคลวิน", "R ที่ให้หน่วย atm คือ 0.0821", "Π = i × M × R × T"],
      "ความดันออสโมติกขึ้นกับจำนวนอนุภาคของตัวละลาย ไม่ใช่สีหรือชนิดของสารโดยตรง"),
    F("molex", "สารละลาย", "เศษส่วนโมล",
      "X = n<sub>ตัวละลาย</sub> / (n<sub>ตัวละลาย</sub> + n<sub>ตัวทำละลาย</sub>)",
      [fv("X", "X เศษส่วนโมล", ""), fv("ns", "n ตัวละลาย", "mol"), fv("nv", "n ตัวทำละลาย", "mol")],
      { X: ["ns/(ns+nv)", "ns / (ns + nv)"], ns: ["X*nv/(1-X)", "X × nv / (1 − X)"] },
      ["ตัวหารคือโมลรวม ไม่ใช่โมลตัวทำละลายอย่างเดียว", "เศษส่วนโมลไม่มีหน่วย และรวมทุกองค์ประกอบได้ 1", "X = ns / (ns + nv)"],
      "เศษส่วนโมลไม่ใช่ร้อยละโดยมวล")
  ];

  const api = {
    ORBITALS, ELEMENTS, AR, CHEMICALS, GLASSWARE, SOLVENTS, SOLUTES, COMPOUNDS, LABS, STEPS, PROBLEMS: problems,
    FORMULAS, IE_ANOMALIES, Store, stats, evalExpr, close, closeVal, formatNum, esc, electronFill, parseFormula, molarMass,
    groupLabel, wavelengthToRGB, rydbergNm, sup, scopeOf
  };

  if (typeof window !== "undefined") window.CHEM = api;
  if (typeof module !== "undefined" && module.exports) {
    const bad = [];
    problems.forEach((p) => {
      try {
        const sets = [scopeOf(p)];
        const a1 = {};
        const a2 = {};
        p.vars.forEach((item) => {
          if (!item.given) return;
          a1[item.id] = item.value === 0 ? 2 : item.value * 1.7 + 0.3;
          a2[item.id] = item.value === 0 ? 5 : item.value * 0.45 + 1.1;
        });
        sets.push(scopeOf(p, a1), scopeOf(p, a2));
        const base = evalExpr(p.expr, sets[0]);
        if (!close(base, p.answer)) bad.push(p.id + " answer");
        sets.forEach((sc) => {
          const v1 = evalExpr(p.expr, sc);
          if (!isFinite(v1)) bad.push(p.id + " nan");
        });
      } catch (e) {
        bad.push(p.id + " " + e.message);
      }
    });
    if (bad.length) {
      console.error(bad.join("\n"));
      process.exit(1);
    }
    console.log("OK " + problems.length + " problems");
    module.exports = api;
  }
})();
