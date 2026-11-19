/* Vice Cover Studio — editor wiring, rebuilt.
   Photos stay on the user's machine, panels are panned by dragging on
   the preview and zoomed with a slider or the wheel, and Export saves
   the cover at the chosen size. */
import { SIZES, LAYOUTS, GRADES, freshState, panelRects, drawCover } from "./cover.js";
import { runShot } from "./shots.js";

const canvas = document.getElementById("cover");
const statusEl = document.getElementById("status");
const thumbsEl = document.getElementById("thumbs");
const panelRowsEl = document.getElementById("panelRows");
const state = freshState();
let activePanel = 0;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function currentSize() {
  return SIZES[state.size] || SIZES.wide;
}

function redraw() {
  const size = currentSize();
  drawCover(canvas, state, size.w, size.h);
}

function photoLabel(i) {
  const p = state.photos[i];
  return p ? p.name.replace(/\.[^.]+$/, "").slice(0, 18) || ("Photo " + (i + 1)) : "Photo " + (i + 1);
}

function refreshThumbs() {
  thumbsEl.innerHTML = "";
  if (!state.photos.length) {
    thumbsEl.textContent = "No photos yet — add one below, or use a sample in a shot.";
    return;
  }
  state.photos.forEach((p, i) => {
    const img = document.createElement("img");
    img.src = p.url;
    img.alt = p.name;
    img.title = p.name + " — click to fill panel " + (activePanel + 1);
    img.className = state.panels[activePanel] && state.panels[activePanel].photo === i ? "on" : "";
    img.addEventListener("click", () => {
      state.panels[activePanel].photo = i;
      refreshThumbs();
      refreshPanelRows();
      redraw();
    });
    thumbsEl.appendChild(img);
  });
}

function refreshPanelRows() {
  panelRowsEl.innerHTML = "";
  const count = (LAYOUTS[state.layout] || LAYOUTS.hero).panels.length;
  for (let i = 0; i < count; i++) {
    const slot = state.panels[i];
    const row = document.createElement("div");
    row.className = "panel-row" + (activePanel === i ? " active" : "");

    const name = document.createElement("button");
    name.type = "button";
    name.className = "pname";
    name.textContent = "Panel " + (i + 1);
    name.addEventListener("click", () => {
      activePanel = i;
      refreshThumbs();
      refreshPanelRows();
    });

    const pick = document.createElement("select");
    pick.setAttribute("aria-label", "Photo for panel " + (i + 1));
    state.photos.forEach((_, j) => {
      const opt = document.createElement("option");
      opt.value = String(j);
      opt.textContent = photoLabel(j);
      pick.appendChild(opt);
    });
    if (!state.photos.length) {
      const opt = document.createElement("option");
      opt.textContent = "No photo";
      pick.appendChild(opt);
    }
    pick.value = String(slot.photo);
    pick.addEventListener("change", () => {
      slot.photo = Number(pick.value);
      activePanel = i;
      refreshThumbs();
      redraw();
    });

    const zoom = document.createElement("input");
    zoom.type = "range";
    zoom.min = "1";
    zoom.max = "3";
    zoom.step = "0.05";
    zoom.value = String(slot.zoom || 1);
    zoom.setAttribute("aria-label", "Zoom panel " + (i + 1));
    zoom.addEventListener("input", () => {
      slot.zoom = Number(zoom.value);
      activePanel = i;
      redraw();
    });

    const flip = document.createElement("button");
    flip.type = "button";
    flip.className = "flip" + (slot.flip ? " on" : "");
    flip.textContent = slot.flip ? "Flipped" : "Flip";
    flip.addEventListener("click", () => {
      slot.flip = !slot.flip;
      activePanel = i;
      refreshPanelRows();
      redraw();
    });

    row.append(name, pick, zoom, flip);
    panelRowsEl.appendChild(row);
  }
}

function bindSeg(id, attr, apply) {
  const seg = document.getElementById(id);
  seg.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-" + attr + "]");
    if (!btn) return;
    seg.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
    btn.classList.add("on");
    apply(btn.dataset[attr]);
    redraw();
  });
}

bindSeg("layoutSeg", "layout", (v) => { state.layout = v; refreshPanelRows(); });
bindSeg("gradeSeg", "grade", (v) => { state.grade = v; });
bindSeg("sizeSeg", "size", (v) => { state.size = v; });

document.getElementById("title").addEventListener("input", (e) => { state.title = e.target.value; redraw(); });
document.getElementById("subtitle").addEventListener("input", (e) => { state.subtitle = e.target.value; redraw(); });
document.getElementById("place").addEventListener("input", (e) => { state.place = e.target.value; redraw(); });

document.getElementById("shuffle").addEventListener("click", () => {
  const keys = Object.keys(GRADES);
  let next = keys[(keys.indexOf(state.grade) + 1) % keys.length];
  state.grade = next;
  document.querySelectorAll("#gradeSeg button").forEach((b) => b.classList.toggle("on", b.dataset.grade === next));
  redraw();
});

document.getElementById("reset").addEventListener("click", () => {
  const keep = state.photos;
  const fresh = freshState();
  fresh.photos = keep;
  Object.assign(state, fresh);
  document.getElementById("title").value = state.title;
  document.getElementById("subtitle").value = state.subtitle;
  document.getElementById("place").value = state.place;
  document.querySelectorAll("#layoutSeg button").forEach((b) => b.classList.toggle("on", b.dataset.layout === state.layout));
  document.querySelectorAll("#gradeSeg button").forEach((b) => b.classList.toggle("on", b.dataset.grade === state.grade));
  document.querySelectorAll("#sizeSeg button").forEach((b) => b.classList.toggle("on", b.dataset.size === state.size));
  refreshThumbs();
  refreshPanelRows();
  redraw();
  statusEl.textContent = "Back to the fresh cover — your photos are still loaded.";
});

document.getElementById("photo").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  for (const file of files) {
    try {
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      state.photos.push({ img, url, name: file.name });
    } catch {
      statusEl.textContent = "Could not read " + file.name;
    }
  }
  if (state.photos.length) {
    state.panels.forEach((p) => { if (p.photo >= state.photos.length) p.photo = 0; });
    refreshThumbs();
    refreshPanelRows();
    redraw();
    statusEl.textContent = state.photos.length + (state.photos.length === 1 ? " photo" : " photos") + " loaded — drag a panel to frame it.";
  }
});

/* Drag a panel to pan its photo; the wheel zooms the panel under the cursor. */
let drag = null;
function panelAt(clientX, clientY) {
  const box = canvas.getBoundingClientRect();
  const px = (clientX - box.left) / box.width;
  const py = (clientY - box.top) / box.height;
  const rects = panelRects(state.layout, 1, 1);
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}
canvas.addEventListener("pointerdown", (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  activePanel = i;
  const slot = state.panels[i];
  drag = { panel: i, x: e.clientX, y: e.clientY, ox: slot.ox || 0, oy: slot.oy || 0 };
  canvas.classList.add("dragging");
  canvas.setPointerCapture(e.pointerId);
  refreshThumbs();
  refreshPanelRows();
});
canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const box = canvas.getBoundingClientRect();
  const slot = state.panels[drag.panel];
  slot.ox = Math.max(-1, Math.min(1, drag.ox + (e.clientX - drag.x) / box.width));
  slot.oy = Math.max(-1, Math.min(1, drag.oy + (e.clientY - drag.y) / box.height));
  redraw();
});
canvas.addEventListener("pointerup", () => { drag = null; canvas.classList.remove("dragging"); });
canvas.addEventListener("pointercancel", () => { drag = null; canvas.classList.remove("dragging"); });
canvas.addEventListener("wheel", (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  e.preventDefault();
  const slot = state.panels[i];
  slot.zoom = Math.max(1, Math.min(3, (slot.zoom || 1) - Math.sign(e.deltaY) * 0.1));
  activePanel = i;
  refreshPanelRows();
  redraw();
}, { passive: false });

document.getElementById("export").addEventListener("click", () => {
  const size = currentSize();
  const slug = (state.title || "vice-cover").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "vice-cover";
  canvas.toBlob((blob) => {
    if (!blob) { statusEl.textContent = "Export failed — try again."; return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = slug + "-" + size.w + "x" + size.h + ".png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = "Saved " + a.download;
  }, "image/png");
});

async function applyShot(sample, text, opts) {
  const first = await loadImage(sample);
  const photos = [{ img: first, url: sample, name: sample.split("/").pop() }];
  if (opts.photo2) {
    try {
      const second = await loadImage(opts.photo2);
      photos.push({ img: second, url: opts.photo2, name: opts.photo2.split("/").pop() });
    } catch { /* one photo is enough */ }
  }
  state.photos = photos;
  state.title = text;
  if (opts.layout) state.layout = opts.layout;
  if (opts.grade) state.grade = opts.grade;
  if (opts.size) state.size = opts.size;
  if (opts.subtitle !== undefined) state.subtitle = opts.subtitle;
  if (opts.place !== undefined) state.place = opts.place;
  // Spread two photos across the panels so a hero shot shows both,
  // and frame the repeated photo differently in each panel so no two
  // panels look like the same crop.
  if (photos.length > 1) {
    state.panels[0].photo = 0;
    state.panels[1].photo = 1;
    state.panels[1].zoom = 1.3;
    state.panels[1].oy = 0.12;
    state.panels[2].photo = 1;
  }
  document.getElementById("title").value = state.title;
  document.getElementById("subtitle").value = state.subtitle;
  document.getElementById("place").value = state.place;
  document.querySelectorAll("#layoutSeg button").forEach((b) => b.classList.toggle("on", b.dataset.layout === state.layout));
  document.querySelectorAll("#gradeSeg button").forEach((b) => b.classList.toggle("on", b.dataset.grade === state.grade));
  document.querySelectorAll("#sizeSeg button").forEach((b) => b.classList.toggle("on", b.dataset.size === state.size));
  refreshThumbs();
  refreshPanelRows();
  redraw();
}

const params = new URLSearchParams(location.search);
const shot = params.get("shot");
if (shot) {
  runShot(shot, params, applyShot);
} else {
  refreshThumbs();
  refreshPanelRows();
  redraw();
}
