#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "../..");
const runtimeRoot = `/tmp/sentinelcore-dev-${process.getuid?.() ?? "local"}`;
const composeArgs = ["compose", "-p", "sentinelcore", "-f", `${runtimeRoot}/docker-compose.yml`];
const mode = process.argv[2] ?? "start";

const color = {
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  dim: "\u001b[2m",
  reset: "\u001b[0m",
};

function note(message) {
  console.log(`${color.cyan}◆${color.reset} ${message}`);
}

function success(message) {
  console.log(`${color.green}✓${color.reset} ${message}`);
}

function command(file, args, options = {}) {
  const result = spawnSync(file, args, {
    cwd: options.cwd ?? projectRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0 && !options.allowFailure) {
    const detail = options.capture ? result.stderr?.trim() : "";
    throw new Error(`${file} exited with status ${result.status}${detail ? `: ${detail}` : ""}`);
  }
  return result;
}

function dockerReady() {
  return command("docker", ["info"], { capture: true, allowFailure: true }).status === 0;
}

async function ensureDocker() {
  if (dockerReady()) {
    success("Docker is ready");
    return;
  }

  if (process.platform !== "darwin") {
    throw new Error("Docker is not running. Start Docker, then run npm run dev again.");
  }

  note("Starting Docker Desktop…");
  command("open", ["-a", "Docker"]);

  for (let attempt = 0; attempt < 45; attempt += 1) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 2000));
    if (dockerReady()) {
      success("Docker Desktop is ready");
      return;
    }
  }

  throw new Error("Docker Desktop did not become ready within 90 seconds.");
}

function requireEnvironment() {
  if (!existsSync(resolve(projectRoot, ".env"))) {
    throw new Error(".env is missing. Copy .env.example to .env, then run npm run dev again.");
  }
}

function syncRuntime() {
  note(`Preparing Docker runtime in ${runtimeRoot}`);
  mkdirSync(runtimeRoot, { recursive: true });

  for (const directory of ["backend", "frontend"]) {
    const destination = resolve(runtimeRoot, directory);
    mkdirSync(destination, { recursive: true });
    command("rsync", [
      "-a",
      "--delete",
      "--exclude", "node_modules",
      "--exclude", "dist",
      "--exclude", "__pycache__",
      "--exclude", ".pytest_cache",
      `${resolve(projectRoot, directory)}/`,
      `${destination}/`,
    ]);
  }

  copyFileSync(resolve(projectRoot, "docker-compose.yml"), resolve(runtimeRoot, "docker-compose.yml"));
  copyFileSync(resolve(projectRoot, ".env"), resolve(runtimeRoot, ".env"));
  success("Source synchronized");
}

function compose(...args) {
  return command("docker", [...composeArgs, ...args]);
}

async function waitForSite() {
  note("Waiting for http://localhost…");
  for (let attempt = 0; attempt < 45; attempt += 1) {
    const response = command(
      "curl",
      ["-fsS", "-o", "/dev/null", "-w", "%{http_code}", "http://localhost/"],
      { capture: true, allowFailure: true },
    );
    if (response.stdout?.trim() === "200") {
      success("SentinelCore is ready at http://localhost");
      return;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 1500));
  }
  throw new Error("The stack started, but http://localhost did not become ready.");
}

function repositoryUrl() {
  const result = command("git", ["remote", "get-url", "origin"], { capture: true, allowFailure: true });
  const remote = result.stdout?.trim();
  if (!remote) return "https://github.com/rashiyaom/SentinelCore";
  if (remote.startsWith("git@github.com:")) return `https://github.com/${remote.slice(15).replace(/\.git$/, "")}`;
  return remote.replace(/\.git$/, "");
}

function openWorkspace() {
  if (process.env.SENTINELCORE_NO_OPEN === "1" || process.platform !== "darwin") return;
  command("open", ["http://localhost"]);
  command("open", [repositoryUrl()]);
  success("Opened localhost and GitHub");
}

async function start() {
  requireEnvironment();
  await ensureDocker();
  syncRuntime();
  note("Starting database, Redis, backend, worker, helper, frontend, and nginx…");
  compose("up", "-d", "--build", "--remove-orphans");
  await waitForSite();
  openWorkspace();

  console.log(`\n${color.green}SentinelCore development stack is running.${color.reset}`);
  console.log(`${color.dim}Website: http://localhost`);
  console.log(`GitHub:  ${repositoryUrl()}`);
  console.log(`Stop:    npm run dev:stop${color.reset}\n`);

  if (process.env.SENTINELCORE_NO_FOLLOW !== "1") {
    note("Following service logs — press Ctrl+C to leave the servers running");
    compose("logs", "-f", "--tail", "80");
  }
}

async function stop() {
  await ensureDocker();
  if (!existsSync(resolve(runtimeRoot, "docker-compose.yml"))) {
    throw new Error("No SentinelCore runtime was found. The stack is already stopped.");
  }
  compose("down");
  success("SentinelCore stopped");
}

async function status() {
  await ensureDocker();
  if (!existsSync(resolve(runtimeRoot, "docker-compose.yml"))) {
    console.log("SentinelCore has not been started with npm run dev yet.");
    return;
  }
  compose("ps");
}

async function logs() {
  await ensureDocker();
  if (!existsSync(resolve(runtimeRoot, "docker-compose.yml"))) {
    throw new Error("Run npm run dev once before requesting logs.");
  }
  compose("logs", "-f", "--tail", "120");
}

try {
  if (mode === "start") await start();
  else if (mode === "stop") await stop();
  else if (mode === "status") await status();
  else if (mode === "logs") await logs();
  else throw new Error(`Unknown command: ${mode}`);
} catch (error) {
  console.error(`\n${color.yellow}SentinelCore could not start:${color.reset} ${error.message}`);
  process.exitCode = 1;
}
