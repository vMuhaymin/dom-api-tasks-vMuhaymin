// tools/deadline-check.js
// Usage:
//   node tools/deadline-check.js --deadline 2025-09-29T21:59:59Z --grace 5 --mode ontime
//   node tools/deadline-check.js --deadline 2025-09-29T21:59:59Z --mode late-half
//   node tools/deadline-check.js 2025-09-29T21:59:59Z 5 ontime     // positional also works

"use strict";

const { execSync } = require("node:child_process");

function toMs(iso) {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    throw new Error(`Invalid ISO datetime: "${iso}". Use e.g. 2025-09-30T21:59:59Z or 2025-09-30T23:59:59+02:00`);
  }
  return ms;
}

function latestCommitEpochSec() {
  const out = execSync("git log -1 --format=%ct").toString().trim();
  const n = Number.parseInt(out, 10);
  if (!Number.isFinite(n)) throw new Error("Could not read latest commit time from git.");
  return n;
}

// ---- parse args (flags or positional) ----
const argv = process.argv.slice(2);
let dueISO = null;
let graceMinutes = 0;
let mode = "ontime"; // 'ontime' | 'late-half'

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--deadline" || a === "-d") { dueISO = argv[++i]; }
  else if (a === "--grace" || a === "-g") { graceMinutes = parseInt(argv[++i] || "0", 10) || 0; }
  else if (a === "--mode" || a === "-m") { mode = String(argv[++i] || "ontime"); }
  else if (!a.startsWith("-")) {
    // positional: deadline, grace, mode (in that order)
    if (!dueISO) dueISO = a;
    else if (!graceMinutes) graceMinutes = parseInt(a || "0", 10) || 0;
    else if (!mode) mode = a;
  }
}

try {
  if (!dueISO) {
    console.error("Missing due date.\nExamples:\n  node tools/deadline-check.js --deadline 2025-09-29T21:59:59Z --grace 5 --mode ontime\n  node tools/deadline-check.js 2025-09-29T21:59:59Z 5 late-half");
    process.exit(1);
  }

  const dueMs = toMs(dueISO);
  const effDueMs = dueMs + graceMinutes * 60_000;

  const submittedSec = latestCommitEpochSec();
  const submittedMs = submittedSec * 1000;
  const isOnTime = submittedMs <= effDueMs;
  const isLate   = !isOnTime;

  // Decide pass/fail based on mode
  let pass = false;
  if (mode === "ontime") pass = isOnTime;
  else if (mode === "late-half") pass = isLate;
  else throw new Error(`Unknown mode "${mode}". Use "ontime" or "late-half".`);

  const fmt = (ms) => new Date(ms).toISOString();
  console.log("=== Deadline Check ===");
  console.log(`Mode:            ${mode}`);
  console.log(`Due (input):     ${dueISO}`);
  console.log(`Due (ISO UTC):   ${fmt(dueMs)}`);
  if (graceMinutes) {
    console.log(`Grace (minutes): ${graceMinutes}`);
    console.log(`Effective due:   ${fmt(effDueMs)}`);
  }
  console.log(`Submitted (sec): ${submittedSec}`);
  console.log(`Submitted (ISO): ${fmt(submittedMs)}`);
  console.log(isOnTime ? "Status: ON TIME ✅" : "Status: LATE ❌");
  console.log(pass ? "Result: PASS" : "Result: FAIL");

  process.exit(pass ? 0 : 1);
} catch (err) {
  console.error("Deadline check failed:", err.message);
  process.exit(1);
}
