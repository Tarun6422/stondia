#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────
 *  Video Thumbnail Generator
 *  Extracts the first frame from every MP4 in src/img/ and saves it
 *  as a JPG poster thumbnail for use with HTML5 <video> elements.
 *
 *  Usage:
 *    node scripts/generate-thumbnails.mjs            # generate missing thumbnails
 *    node scripts/generate-thumbnails.mjs --force    # regenerate all thumbnails
 *    node scripts/generate-thumbnails.mjs --dry-run  # preview what would be generated
 *
 *  Requires: FFmpeg installed and available in PATH
 *  Download: https://ffmpeg.org/download.html
 * ─────────────────────────────────────────────────────────────────────
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const MEDIA_DIR = path.join(PROJECT_ROOT, "src", "img");

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DRY_RUN = args.includes("--dry-run");

/* ── Help ── */
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
  Video Thumbnail Generator
  ─────────────────────────
  Extracts the first frame from every MP4 in src/img/ and saves
  a JPG poster thumbnail alongside it.

  Usage:
    node scripts/generate-thumbnails.mjs              generate missing thumbnails
    node scripts/generate-thumbnails.mjs --force      regenerate ALL thumbnails
    node scripts/generate-thumbnails.mjs --dry-run    preview only (no writes)

  Requires FFmpeg: https://ffmpeg.org/download.html
  `);
  process.exit(0);
}

/* ── Check FFmpeg availability ── */
function checkFfmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore", timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/* ── Format duration nicely ── */
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ── Main ── */
async function main() {
  console.log("");
  console.log("  ╔══════════════════════════════════════════════════╗");
  console.log("  ║        Video Thumbnail Generator                ║");
  console.log("  ╚══════════════════════════════════════════════════╝");
  console.log(`  Media directory: ${MEDIA_DIR}`);
  console.log(`  Force mode:      ${FORCE ? "YES" : "No (skip existing)"}`);
  console.log(`  Dry run:         ${DRY_RUN ? "YES" : "No (will write files)"}`);
  console.log("");

  // Check FFmpeg
  const ffmpegAvailable = checkFfmpeg();
  if (!ffmpegAvailable) {
    console.error("  ✖ FFmpeg not found in PATH.");
    console.error("");
    console.error("  To install:");
    console.error("    Windows:   https://ffmpeg.org/download.html  (add to PATH)");
    console.error("    macOS:     brew install ffmpeg");
    console.error("    Ubuntu:    sudo apt install ffmpeg");
    console.error("");
    process.exit(1);
  }
  console.log("  ✓ FFmpeg found");
  console.log("");

  // Find all MP4 files
  const allFiles = await readdir(MEDIA_DIR);
  const mp4Files = allFiles.filter((f) => f.endsWith(".mp4")).sort();

  if (mp4Files.length === 0) {
    console.log("  No MP4 files found in src/img/.");
    console.log("");
    process.exit(0);
  }

  console.log(`  Found ${mp4Files.length} MP4 file(s)`);
  console.log("");

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const mp4 of mp4Files) {
    const baseName = mp4.replace(/\.mp4$/i, "");
    const thumbName = `${baseName}.jpg`;
    const videoPath = path.join(MEDIA_DIR, mp4);
    const thumbPath = path.join(MEDIA_DIR, thumbName);

    // Check if thumbnail already exists
    if (!FORCE && existsSync(thumbPath)) {
      const videoStats = await stat(videoPath);
      const thumbStats = await stat(thumbPath);

      if (thumbStats.mtimeMs > videoStats.mtimeMs) {
        // Thumbnail exists and is newer than the video — skip
        skipped++;
        if (skipped <= 5 || mp4Files.length <= 5) {
          console.log(`  · ${mp4}  →  thumbnail exists ✓`);
        }
        continue;
      } else {
        console.log(`  · ${mp4}  →  thumbnail outdated, regenerating…`);
      }
    }

    if (DRY_RUN) {
      console.log(`  → Would generate: ${thumbName}`);
      generated++;
      continue;
    }

    // Extract first frame using FFmpeg
    try {
      const cmd = [
        "ffmpeg",
        "-y", // overwrite output
        "-i",
        `"${videoPath}"`, // input file
        "-vframes",
        "1", // extract single frame
        "-q:v",
        "3", // high JPEG quality (1-31, lower = better)
        "-vf",
        `"scale=640:-1"`, // scale to 640px wide (maintain aspect)
        `"${thumbPath}"`, // output file
      ].join(" ");

      execSync(cmd, {
        stdio: "pipe",
        timeout: 30000, // 30 seconds per video
      });

      generated++;
      console.log(`  ✓ ${thumbName}`);
    } catch (err) {
      errors++;
      console.error(
        `  ✖ ${mp4}  →  error: ${err.stderr?.toString?.()?.slice(0, 120) || err.message}`,
      );
    }
  }

  // Summary
  console.log("");
  console.log("  ═══════════════════════════════════════════════════");
  console.log(`  Generated:  ${generated}`);
  console.log(`  Skipped:    ${skipped}`);
  console.log(`  Errors:     ${errors}`);
  console.log(`  Total:      ${mp4Files.length}`);
  console.log("  ═══════════════════════════════════════════════════");
  console.log("");

  if (DRY_RUN && generated > 0) {
    console.log(`  (dry run — no files were written)`);
    console.log(`  Run without --dry-run to generate thumbnails.`);
    console.log("");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
