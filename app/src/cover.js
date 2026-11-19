/* Vice Cover Studio — poster engine, rebuilt.
   One canvas carries the whole cover: panel photos, a sun glow and a
   colour grade, halftone dots in the shadows, film grain, a vignette,
   and the big display lettering. Everything runs on the user's own
   machine; no photo ever leaves it. */

export const SIZES = {
  wide: { w: 1920, h: 1080, label: "1920 × 1080" },
  square: { w: 1080, h: 1080, label: "1080 × 1080" },
  portrait: { w: 1080, h: 1350, label: "1080 × 1350" },
};

export const LAYOUTS = {
  hero: {
    label: "Hero + two",
    panels: [
      { x: 0, y: 0, w: 0.6, h: 1 },
      { x: 0.6, y: 0, w: 0.4, h: 0.5 },
      { x: 0.6, y: 0.5, w: 0.4, h: 0.5 },
    ],
  },
  trio: {
    label: "Three split",
    panels: [
      { x: 0, y: 0, w: 0.335, h: 1 },
      { x: 0.335, y: 0, w: 0.33, h: 1 },
      { x: 0.665, y: 0, w: 0.335, h: 1 },
    ],
  },
  single: {
    label: "Full bleed",
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
};

/* Each grade is a sky wash, a sun glow, a low wash and an accent colour
   used for the place-line rule and the title's lower half. */
export const GRADES = {
  sunset: {
    label: "Vice Sunset",
    sky: "rgba(255,94,120,0.36)",
    low: "rgba(255,140,40,0.32)",
    wash: "rgba(24,180,190,0.15)",
    glow: "rgba(255,190,90,0.55)",
    accent: "#ff5e7a",
    duotone: false,
  },
  neon: {
    label: "Neon Nights",
    sky: "rgba(255,0,180,0.40)",
    low: "rgba(0,220,255,0.32)",
    wash: "rgba(120,0,255,0.17)",
    glow: "rgba(0,235,255,0.42)",
    accent: "#22d3ee",
    duotone: false,
  },
  noir: {
    label: "Palm Noir",
    sky: "rgba(8,8,24,0.34)",
    low: "rgba(255,220,120,0.12)",
    wash: "rgba(0,0,0,0.12)",
    glow: "rgba(255,240,200,0.28)",
    accent: "#ffd9a0",
    duotone: true,
  },
  pastel: {
    label: "Pastel Vice",
    sky: "rgba(255,170,200,0.28)",
    low: "rgba(255,210,130,0.26)",
    wash: "rgba(140,220,220,0.17)",
    glow: "rgba(255,235,180,0.45)",
    accent: "#ff8fb0",
    duotone: false,
  },
};

export function freshState() {
  return {
    layout: "hero",
    size: "wide",
    grade: "sunset",
    title: "VICE HEAT",
    subtitle: "Two outlaws. One last score.",
    place: "LEONIDA",
    photos: [],
    panels: [
      { photo: 0, zoom: 1, ox: 0, oy: 0, flip: false },
      { photo: 0, zoom: 1, ox: 0, oy: 0, flip: false },
      { photo: 0, zoom: 1, ox: 0, oy: 0, flip: false },
    ],
  };
}

export function panelRects(layout, w, h) {
  const def = LAYOUTS[layout] || LAYOUTS.hero;
  return def.panels.map((p) => ({
    x: Math.round(p.x * w),
    y: Math.round(p.y * h),
    w: Math.round(p.w * w),
    h: Math.round(p.h * h),
  }));
}

/* Deterministic pseudo-random stream so grain and halftone look the
   same on every export of the same cover. */
function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function drawPhotoIn(ctx, img, rect, slot) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const cover = Math.max(rect.w / iw, rect.h / ih);
  const scale = cover * (slot.zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = rect.x + rect.w / 2 + (slot.ox || 0) * rect.w;
  const cy = rect.y + rect.h / 2 + (slot.oy || 0) * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(cx, cy);
  if (slot.flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

function paintSunGlow(ctx, w, h, grade) {
  const g = GRADES[grade] || GRADES.sunset;
  const cx = w * 0.72;
  const cy = h * 0.3;
  const r = Math.min(w, h) * 0.42;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  glow.addColorStop(0, g.glow);
  glow.addColorStop(0.5, g.glow.replace(/[\d.]+\)$/, "0.18)"));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function paintGrade(ctx, w, h, grade) {
  const g = GRADES[grade] || GRADES.sunset;
  const wash = ctx.createLinearGradient(0, 0, w, h);
  wash.addColorStop(0, g.sky);
  wash.addColorStop(0.55, "rgba(0,0,0,0)");
  wash.addColorStop(1, g.low);
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = g.wash;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  if (!g.duotone) return;
  ctx.save();
  ctx.globalCompositeOperation = "saturation";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  const duo = ctx.createLinearGradient(0, 0, 0, h);
  duo.addColorStop(0, "rgba(255,240,200,0.24)");
  duo.addColorStop(1, "rgba(18,18,60,0.32)");
  ctx.fillStyle = duo;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/* Halftone dots grow towards the bottom of the frame, where the
   lettering band sits — the printed-poster feel, strongest in shadow. */
function paintHalftone(ctx, w, h) {
  const rnd = rng(7);
  const step = Math.max(10, Math.round(w / 150));
  ctx.save();
  for (let y = 0; y < h; y += step) {
    const depth = y / h;
    for (let x = 0; x < w; x += step) {
      const r = (depth * depth * step * 0.45 + rnd() * 0.5) * 0.9;
      if (r < 0.4) continue;
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.arc(x + step / 2, y + step / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function paintGrain(ctx, w, h) {
  const rnd = rng(13);
  const n = Math.round((w * h) / 1100);
  ctx.save();
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = rnd() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
    ctx.fillRect(rnd() * w, rnd() * h, 1.6, 1.6);
  }
  ctx.restore();
}

function paintVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.8
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.44)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function fitTitle(ctx, text, maxW, startPx, family) {
  let px = startPx;
  ctx.font = `700 ${px}px ${family}`;
  while (px > 24 && ctx.measureText(text).width > maxW) {
    px = Math.floor(px * 0.94);
    ctx.font = `700 ${px}px ${family}`;
  }
  return px;
}

function paintLettering(ctx, w, h, state) {
  const g = GRADES[state.grade] || GRADES.sunset;
  const title = (state.title || "").trim().toUpperCase();
  const sub = (state.subtitle || "").trim();
  const place = (state.place || "").trim().toUpperCase();

  // Dark band the title sits on, fading up into the photo.
  const bandH = Math.round(h * 0.32);
  const bandY = h - bandH;
  const shade = ctx.createLinearGradient(0, bandY - 50, 0, h);
  shade.addColorStop(0, "rgba(0,0,0,0)");
  shade.addColorStop(0.35, "rgba(0,0,0,0.55)");
  shade.addColorStop(1, "rgba(0,0,0,0.84)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, bandY - 50, w, bandH + 50);

  const pad = Math.round(w * 0.045);
  const maxW = w - pad * 2;
  const family = '"Oswald", "Archivo Black", "Arial Narrow", sans-serif';
  const px = fitTitle(ctx, title || "VICE", maxW, Math.round(h * 0.17), family);
  const baseY = h - Math.round(h * 0.05);

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `700 ${px}px ${family}`;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = Math.round(px * 0.12);
  ctx.shadowOffsetY = Math.round(px * 0.05);
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(8,4,18,0.92)";
  ctx.lineWidth = Math.max(3, Math.round(px * 0.07));
  ctx.strokeText(title, pad, baseY);
  const tg = ctx.createLinearGradient(0, baseY - px, 0, baseY);
  tg.addColorStop(0, "#fff7e8");
  tg.addColorStop(0.55, "#ffd9a0");
  tg.addColorStop(1, g.accent);
  ctx.fillStyle = tg;
  ctx.fillText(title, pad, baseY);
  ctx.restore();

  if (sub) {
    const subPx = Math.max(16, Math.round(h * 0.028));
    ctx.save();
    ctx.font = `${subPx}px "Archivo Black", "Arial Black", sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.93)";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 6;
    ctx.fillText(sub, pad, baseY - px - Math.round(h * 0.022));
    ctx.restore();
  }

  if (place) {
    const plPx = Math.max(14, Math.round(h * 0.024));
    ctx.save();
    ctx.font = `600 ${plPx}px Oswald, "Arial Narrow", sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    const tw = ctx.measureText(place).width;
    ctx.fillText(place, pad, Math.round(h * 0.055));
    ctx.fillStyle = g.accent;
    ctx.fillRect(pad, Math.round(h * 0.075), tw, Math.max(3, Math.round(h * 0.004)));
    ctx.restore();
  }
}

function paintEmptyPanel(ctx, rect, h) {
  const pg = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  pg.addColorStop(0, "#3a1c4d");
  pg.addColorStop(1, "#12081c");
  ctx.fillStyle = pg;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `600 ${Math.round(h * 0.02)}px Oswald, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("ADD A PHOTO", rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.textAlign = "left";
}

export function drawCover(canvas, state, w, h) {
  const size = SIZES[state.size] || SIZES.wide;
  const W = w || size.w;
  const H = h || size.h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#12081c";
  ctx.fillRect(0, 0, W, H);

  const rects = panelRects(state.layout, W, H);
  const gap = Math.max(3, Math.round(W * 0.005));
  rects.forEach((r, i) => {
    const slot = state.panels[i] || { photo: 0, zoom: 1, ox: 0, oy: 0, flip: false };
    const photo = state.photos[slot.photo];
    const inner = { x: r.x + gap / 2, y: r.y + gap / 2, w: r.w - gap, h: r.h - gap };
    if (photo && photo.img) {
      drawPhotoIn(ctx, photo.img, inner, slot);
    } else {
      paintEmptyPanel(ctx, inner, H);
    }
    // White poster gutter around every panel.
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = gap;
    ctx.strokeRect(r.x + gap / 2, r.y + gap / 2, r.w - gap, r.h - gap);
  });

  paintSunGlow(ctx, W, H, state.grade);
  paintGrade(ctx, W, H, state.grade);
  paintHalftone(ctx, W, H);
  paintGrain(ctx, W, H);
  paintLettering(ctx, W, H, state);
  paintVignette(ctx, W, H);
  return { w: W, h: H };
}
