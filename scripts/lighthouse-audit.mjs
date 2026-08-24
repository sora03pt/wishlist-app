import { spawn, spawnSync } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "lighthouse-reports");
const targetUrl = process.env.LIGHTHOUSE_URL ?? "http://localhost:3200/login";
const runCount = 3;
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

const categoryThresholds = {
  accessibility: 0.95,
  "best-practices": 0.95,
  performance: 0.95,
  seo: 0.95,
};

function median(values) {
  const sortedValues = [...values].sort((left, right) => left - right);
  return sortedValues[Math.floor(sortedValues.length / 2)];
}

async function waitForServer(url) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });

      if (response.status < 500) {
        return;
      }
    } catch {
      // The production server can take a few seconds to become ready in CI.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function runAudit() {
  await rm(outputDirectory, { force: true, recursive: true });
  await mkdir(outputDirectory, { recursive: true });

  const reports = [];

  for (let run = 1; run <= runCount; run += 1) {
    const outputPath = path.join(outputDirectory, `login-run-${run}`);
    const result = spawnSync(
      npxCommand,
      [
        "--yes",
        "lighthouse@13.4.1",
        targetUrl,
        "--preset=desktop",
        "--output=json",
        "--output=html",
        `--output-path=${outputPath}`,
        "--chrome-flags=--headless --no-sandbox --disable-gpu",
        "--quiet",
      ],
      { cwd: projectRoot, stdio: "inherit" },
    );

    if (result.status !== 0) {
      throw new Error(`Lighthouse run ${run} failed.`);
    }

    reports.push(
      JSON.parse(await readFile(`${outputPath}.report.json`, "utf8")),
    );
  }

  const categoryScores = Object.fromEntries(
    Object.keys(categoryThresholds).map((category) => [
      category,
      median(reports.map((report) => report.categories[category].score)),
    ]),
  );
  const metrics = {
    cls: median(
      reports.map(
        (report) => report.audits["cumulative-layout-shift"].numericValue,
      ),
    ),
    lcp: median(
      reports.map(
        (report) => report.audits["largest-contentful-paint"].numericValue,
      ),
    ),
    tbt: median(
      reports.map(
        (report) => report.audits["total-blocking-time"].numericValue,
      ),
    ),
  };

  console.table(
    Object.fromEntries(
      Object.entries(categoryScores).map(([category, score]) => [
        category,
        Math.round(score * 100),
      ]),
    ),
  );
  console.table({
    CLS: metrics.cls.toFixed(3),
    "LCP (ms)": Math.round(metrics.lcp),
    "TBT (ms)": Math.round(metrics.tbt),
  });

  const failures = Object.entries(categoryThresholds)
    .filter(([category, threshold]) => categoryScores[category] < threshold)
    .map(
      ([category, threshold]) =>
        `${category}: ${(categoryScores[category] * 100).toFixed(0)} < ${threshold * 100}`,
    );

  if (metrics.cls > 0.1) {
    failures.push(`CLS: ${metrics.cls.toFixed(3)} > 0.1`);
  }

  if (metrics.lcp > 2_500) {
    console.warn(`Warning: median LCP is ${Math.round(metrics.lcp)} ms.`);
  }

  if (metrics.tbt > 300) {
    console.warn(`Warning: median TBT is ${Math.round(metrics.tbt)} ms.`);
  }

  if (failures.length > 0) {
    throw new Error(`Lighthouse thresholds failed:\n${failures.join("\n")}`);
  }
}

const server = spawn(npmCommand, ["run", "start", "--", "--port", "3200"], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

try {
  await waitForServer(targetUrl);
  await runAudit();
} finally {
  server.kill("SIGTERM");
}
