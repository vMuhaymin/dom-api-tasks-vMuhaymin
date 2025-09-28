// __tests__/rubric-flex.test.js
// Flexible, behavior-based checks that target script.js (no fallback)

const fs = require("fs");
const path = require("path");

// Minimal DOM for the features we test
const html = `
<section id="t1"><p id="t1-msg"></p></section>
<section id="t2"><p id="t2-status">Click the button…</p><button id="t2-btn">Click me</button></section>
<section id="t3">
  <button id="t3-loadQuote">Inspire Me ✨</button>
  <p id="t3-quote"></p>
  <p id="t3-author"></p>
</section>
<section id="t4">
  <span id="t4-temp">—</span>
  <span id="t4-hum">—</span>
  <span id="t4-wind">—</span>
  <p id="t4-err"></p>
  <button id="t4-loadWx">Check Weather ☁️</button>
</section>
`;

function fireDOMContentLoaded() {
  document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
}

// Cross-env microtask flush (avoid setImmediate)
const flush = () => new Promise((r) => setTimeout(r, 0));

const STUDENT_FILE = "../script.js";
const STUDENT_FILE_ABS = path.join(__dirname, STUDENT_FILE);

function loadStudentScript() {
  if (!fs.existsSync(STUDENT_FILE_ABS)) {
    throw new Error("script.js not found at repo root.");
  }
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(STUDENT_FILE);
}

/* ---------- 1) TODOs Completion (flex) ---------- */
test("TODOs Completion (flex)", () => {
  if (!fs.existsSync(STUDENT_FILE_ABS)) {
    throw new Error("script.js not found at repo root.");
  }
  const src = fs.readFileSync(STUDENT_FILE_ABS, "utf8");
  expect(src.trim().length).toBeGreaterThan(50); // non-empty

  // Allow a few TODO markers if present; keep flexible
  const todoCount = (src.match(/TODO/gi) || []).length;
  expect(todoCount).toBeLessThanOrEqual(5);

  // Evidence of real implementation (no exact strings required)
  expect(src).toMatch(/addEventListener\s*\(\s*['"]click['"]/);
  expect(src).toMatch(/fetch\s*\(/);
});

/* ---------- 2) Correctness of output (flex) ---------- */
describe("Correctness of output (flex)", () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = html;
  });

  test("Welcome shows some text on load", () => {
    loadStudentScript();
    fireDOMContentLoaded();
    const msg = document.getElementById("t1-msg");
    const text = (msg.textContent || msg.innerHTML || "").trim();
    expect(text.length).toBeGreaterThan(0);
  });

  test("Clicking Interaction button changes the displayed text", () => {
    loadStudentScript();
    fireDOMContentLoaded();
    const btn = document.getElementById("t2-btn");
    const status = document.getElementById("t2-status");
    const before = (status.textContent || status.innerHTML || "").trim();
    btn.click();
    const after = (status.textContent || status.innerHTML || "").trim();
    expect(after).not.toEqual(before);     // any change is fine
    expect(after.length).toBeGreaterThan(0);
  });

  test("Quote button produces a quote + author (fetch mocked, flexible)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ quote: "Test quote", author: "Tester", content: "Test quote" })
    });
    loadStudentScript();
    fireDOMContentLoaded();
    const btn = document.getElementById("t3-loadQuote");
    const quote = document.getElementById("t3-quote");
    const author = document.getElementById("t3-author");
    btn.click();
    await flush();
    const qText = (quote.textContent || quote.innerHTML || "").trim();
    const aText = (author.textContent || author.innerHTML || "").trim();
    expect(qText.length).toBeGreaterThan(0);
    expect(aText.length).toBeGreaterThan(0);
  });

  test("Weather button shows numbers for temp, humidity, wind (fetch mocked, flexible)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ main: { temp: 31.2, humidity: 55 }, wind: { speed: 4.8 } })
    });
    loadStudentScript();
    fireDOMContentLoaded();
    const btn = document.getElementById("t4-loadWx");
    const temp = document.getElementById("t4-temp");
    const hum  = document.getElementById("t4-hum");
    const wind = document.getElementById("t4-wind");
    btn.click();
    await flush();
    const num = /[-+]?[0-9]*\.?[0-9]+/;
    expect((temp.textContent || "").match(num)).toBeTruthy();
    expect((hum.textContent  || "").match(num)).toBeTruthy();
    expect((wind.textContent || "").match(num)).toBeTruthy();
  });
});

/* ---------- 3) Code Quality (flex) ---------- */
test("Code Quality (flex)", () => {
  if (!fs.existsSync(STUDENT_FILE_ABS)) {
    throw new Error("script.js not found at repo root.");
  }
  const src = fs.readFileSync(STUDENT_FILE_ABS, "utf8");

  // Not tiny, not absurdly huge
  expect(src.length).toBeGreaterThan(80);
  expect(src.length).toBeLessThan(200000);

  // Uses modern declarations somewhere
  expect(/(\blet\b|\bconst\b)/.test(src)).toBe(true);

  // Avoid classic anti-patterns
  expect(src).not.toMatch(/\bdocument\.write\s*\(/i);
  expect(src).not.toMatch(/\balert\s*\(/i);
});
