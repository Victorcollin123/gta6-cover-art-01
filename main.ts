// Vice Cover Studio — hand-in program (Node 22, standard library only).
// The grader runs this file twice in a fresh container, and both runs must
// write the same bytes, so all it does is gather the entry: the app's
// static files, the screenshots, and the dossier the judge reads.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

// The repository root: beside this file sit app/ and screenshots/.
const repoRoot = fileURLToPath(new URL("./", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The caps the scorer grades against. Only the text cap shapes the
// dossier's bytes; the rest refuse an entry the scorer would refuse anyway
// (more than 4 screenshots or one over 256 KiB; more than 993 files in
// app/, or 48 MiB of them in all, or a path under app/ over 1000 bytes).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function handIn(): void {
  mkdirSync(outputDir, { recursive: true });

  cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });

  const shotsOut = join(outputDir, "screenshots");
  mkdirSync(shotsOut, { recursive: true });
  const shotsIn = join(repoRoot, "screenshots");
  if (existsSync(shotsIn)) {
    cpSync(shotsIn, shotsOut, { recursive: true });
  }

  writeFileSync(
    join(outputDir, "dossier.json"),
    buildDossier(outputDir, DOSSIER_CAPS),
  );
}

handIn();
