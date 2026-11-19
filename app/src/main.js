/* Vice Cover Studio — editor wiring.
   Uploads stay local, panels are cropped by dragging on the preview,
   and Export downloads the cover at the chosen size. */
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

function refreshThumbs() {
  thumbsEl.innerHTML = "";
  state.photos.forEach((p, i) => {
    const img = document.createElement("img");
    img.src = p.url;
    img.alt = p.name;
    img.title = p.name;
    img.className = state.panels[activePanel] && state.panels[activePanel].photo === i ? "on" : "";
    img.addEventListener("click", () => {
      state.panels[activePanel].photo = i;
      refreshThumbs();
      redraw();
    });
    thumbsEl.appendChild(img);
  });
}

function refreshPanelRows() {
  panelRowsEl.innerHTML = "";
  const rects = panelRects(state.layout, 1, 1);
  rects.forEach((_, i) => {
    const slot = state.panels[i];
    const row = document.createElement("div");
    row.className = "panel-row";
    const name = document.createElement("span");
    name.className = "pname";
    name.textContent = "Panel " + (i + 1);
    name.addEventListener("click", () => { activePanel = i; refreshThumbs(); refreshPanelRows(); });
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
    row.append(name, zoom, flip);
    panelRowsEl.appendChild(row);
  });
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
    redraw();
  }
});

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
});
canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const box = canvas.getBoundingClientRect();
  const slot = state.panels[drag.panel];
  slot.ox = drag.ox + (e.clientX - drag.x) / box.width;
  slot.oy = drag.oy + (e.clientY - drag.y) / box.height;
  slot.ox = Math.max(-1, Math.min(1, slot.ox));
  slot.oy = Math.max(-1, Math.min(1, slot.oy));
  redraw();
});
canvas.addEventListener("pointerup", () => { drag = null; canvas.classList.remove("dragging"); });
canvas.addEventListener("pointercancel", () => { drag = null; canvas.classList.remove("dragging"); });

document.getElementById("export").addEventListener("click", () => {
  const size = currentSize();
  canvas.toBlob((blob) => {
    if (!blob) { statusEl.textContent = "Export failed — try again."; return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vice-cover-" + size.w + "x" + size.h + ".png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = "Saved vice-cover-" + size.w + "x" + size.h + ".png";
  }, "image/png");
});

async function applyShot(sample, text, opts) {
  const img = await loadImage(sample);
  state.photos = [{ img, url: sample, name: sample.split("/").pop() }];
  state.title = text;
  if (opts.layout) state.layout = opts.layout;
  if (opts.grade) state.grade = opts.grade;
  if (opts.size) state.size = opts.size;
  if (opts.subtitle !== undefined) state.subtitle = opts.subtitle;
  document.getElementById("title").value = state.title;
  document.getElementById("subtitle").value = state.subtitle;
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
