/* Vice Cover Studio — colour grades.
   A grade is a recipe, not a filter preset: a warm wash, a cool wash,
   a contrast/saturation tweak via ctx.filter, and a top-light gradient.
   Applied after the panels and captions are drawn. */

(function (global) {
  "use strict";

  var GRADES = {
    sunset: {
      name: "Vice Sunset",
      filter: "saturate(1.25) contrast(1.08)",
      wash: { color: "#ff7a18", mode: "overlay", alpha: 0.22 },
      cool: { color: "#2b1055", mode: "multiply", alpha: 0.10 },
      topLight: [[0, "rgba(255, 201, 60, 0.20)"], [0.45, "rgba(255, 201, 60, 0)"]],
      captionTint: "#ffd166"
    },
    neon: {
      name: "Neon Nights",
      filter: "saturate(1.45) contrast(1.14)",
      wash: { color: "#ff2e88", mode: "overlay", alpha: 0.20 },
      cool: { color: "#0a1030", mode: "multiply", alpha: 0.16 },
      topLight: [[0, "rgba(34, 211, 238, 0.16)"], [0.5, "rgba(34, 211, 238, 0)"]],
      captionTint: "#22d3ee"
    },
    noir: {
      name: "Palm Noir",
      filter: "saturate(0.12) contrast(1.28) brightness(1.04)",
      wash: { color: "#ffffff", mode: "overlay", alpha: 0.08 },
      cool: { color: "#0a0a0c", mode: "multiply", alpha: 0.14 },
      topLight: [[0, "rgba(255, 255, 255, 0.10)"], [0.5, "rgba(255, 255, 255, 0)"]],
      captionTint: "#f4f4f5"
    },
    pastel: {
      name: "Pastel Vice",
      filter: "saturate(0.85) contrast(0.94) brightness(1.08)",
      wash: { color: "#f9a8d4", mode: "soft-light", alpha: 0.30 },
      cool: { color: "#a5f3fc", mode: "soft-light", alpha: 0.18 },
      topLight: [[0, "rgba(255, 255, 255, 0.22)"], [0.5, "rgba(255, 255, 255, 0)"]],
      captionTint: "#fbcfe8"
    }
  };

  function gradeKeys() { return Object.keys(GRADES); }

  /* Re-paint the finished poster through the grade. `base` is a canvas
     holding the ungraded poster; the result lands back on `ctx`. */
  function applyGrade(ctx, W, H, gradeKey, base) {
    var g = GRADES[gradeKey] || GRADES.sunset;
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.filter = g.filter;
    ctx.drawImage(base, 0, 0);
    ctx.filter = "none";

    ctx.globalCompositeOperation = g.wash.mode;
    ctx.globalAlpha = g.wash.alpha;
    ctx.fillStyle = g.wash.color;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = g.cool.mode;
    ctx.globalAlpha = g.cool.alpha;
    ctx.fillStyle = g.cool.color;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    var tl = ctx.createLinearGradient(0, 0, 0, H);
    g.topLight.forEach(function (s) { tl.addColorStop(s[0], s[1]); });
    ctx.fillStyle = tl;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    return g;
  }

  global.VCS = global.VCS || {};
  global.VCS.grades = {
    GRADES: GRADES,
    keys: gradeKeys,
    apply: applyGrade
  };
})(window);
