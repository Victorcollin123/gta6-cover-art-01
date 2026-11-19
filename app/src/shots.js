/* Fixed scenes for screenshots. ?shot=editor shows the editor with
   sample photos loaded; ?shot=cover shows the cover alone, full-bleed.
   `photo` picks the first sample (samples/<photo>.jpg), `photo2` an
   optional second one for the side panels, `caption` the title, and
   `subtitle`, `place`, `grade`, `layout`, `size` pick the rest.
   window.__shotReady is set once the scene has painted, after a double
   requestAnimationFrame, so a screenshot never catches a half-draw. */
export async function runShot(shot, query, apply) {
  const photo = query.get("photo") || "pier";
  const photo2 = query.get("photo2") || null;
  const caption = query.get("caption") || "Sunset Heist";
  const opts = {
    layout: query.get("layout") || undefined,
    grade: query.get("grade") || undefined,
    size: query.get("size") || undefined,
    subtitle: query.get("subtitle") || undefined,
    place: query.get("place") || undefined,
    photo2: photo2 ? "samples/" + photo2 + ".jpg" : undefined,
  };
  if (shot === "cover") document.body.classList.add("shot-cover");
  await apply("samples/" + photo + ".jpg", caption, opts);
  // Draw twice: once before the webfonts arrive, once after, so the
  // lettering in the shot uses Oswald, not a fallback.
  await document.fonts.ready;
  await apply("samples/" + photo + ".jpg", caption, opts);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
