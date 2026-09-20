import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const workspaceDirectories = ["apps", "packages"];
const errors = [];
const packages = new Map();

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function collectPackageFiles(directory) {
  const absoluteDirectory = path.join(root, directory);
  if (!fs.existsSync(absoluteDirectory)) return;

  for (const entry of fs.readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const absolutePath = path.join(absoluteDirectory, entry.name);
    if (entry.isDirectory()) {
      if (!new Set(["node_modules", ".next", "dist"]).has(entry.name)) {
        collectPackageFiles(path.relative(root, absolutePath));
      }
      continue;
    }
    if (entry.name === "package.json") {
      const manifest = readJson(absolutePath);
      packages.set(manifest.name, { file: absolutePath, manifest });
    }
  }
}

for (const directory of workspaceDirectories) collectPackageFiles(directory);

for (const { file, manifest } of packages.values()) {
  const relativeFile = path.relative(root, file);
  if (!manifest.name) errors.push(`${relativeFile}: missing package name`);
  const hasSourceDirectory = fs.existsSync(path.join(path.dirname(file), "src"));
  if (hasSourceDirectory && !manifest.scripts?.["check-types"]) {
    errors.push(`${relativeFile}: missing check-types script`);
  }

  for (const section of [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ]) {
    for (const [dependency, range] of Object.entries(manifest[section] ?? {})) {
      if (String(range).startsWith("link:")) {
        errors.push(`${relativeFile}: stale link dependency ${dependency}=${range}`);
      }
      if (String(range).startsWith("workspace:") && !packages.has(dependency)) {
        errors.push(`${relativeFile}: broken workspace reference ${dependency}`);
      }
    }
  }

  for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
    const targets = [];
    const collectTargets = (value) => {
      if (typeof value === "string") targets.push(value);
      else if (value && typeof value === "object") {
        for (const nested of Object.values(value)) collectTargets(nested);
      }
    };
    collectTargets(target);

    for (const exportTarget of targets) {
      if (!exportTarget.startsWith(".")) continue;
      const wildcardIndex = exportTarget.indexOf("*");
      const targetPath = wildcardIndex === -1
        ? exportTarget
        : exportTarget.slice(0, wildcardIndex);
      const absoluteTarget = path.resolve(path.dirname(file), targetPath);
      const valid = wildcardIndex === -1
        ? fs.existsSync(absoluteTarget)
        : fs.existsSync(absoluteTarget) && fs.statSync(absoluteTarget).isDirectory();
      if (!valid) {
        errors.push(`${relativeFile}: unresolved export ${subpath} -> ${exportTarget}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Workspace validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Workspace validation passed for ${packages.size} packages.`);
