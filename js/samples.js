/* Vice Cover Studio — painted sample scenes.
   Each scene is drawn in code on an offscreen canvas, so every panel
   has a vivid photo to work with before the user uploads their own.
   No external images, no game artwork. */

(function (global) {
  "use strict";

  var W = 720;
  var H = 900;

  function canvas() {
    var c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  }

  function sky(ctx, stops) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function sun(ctx, x, y, r, color) {
    var g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(255, 120, 60, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function silhouette(ctx, color) {
    ctx.fillStyle = color;
  }

  /* City blocks with lit windows along the bottom third. */
  function skyline(ctx, baseY, color, lit) {
    ctx.fillStyle = color;
    var x = -20;
    while (x < W + 20) {
      var bw = 46 + ((x * 37) % 70);
      var bh = 90 + ((x * 53) % 190);
      ctx.fillRect(x, baseY - bh, bw, bh);
      if (lit) {
        ctx.fillStyle = lit;
        for (var wy = baseY - bh + 14; wy < baseY - 16; wy += 26) {
          for (var wx = x + 9; wx < x + bw - 10; wx += 20) {
            if (((wx * 7 + wy * 13) % 5) < 2) ctx.fillRect(wx, wy, 7, 10);
          }
        }
        ctx.fillStyle = color;
      }
      x += bw + 8;
    }
  }

  /* A palm: curved trunk plus seven drooping fronds. */
  function palm(ctx, x, y, s, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 7 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 14 * s, y - 90 * s, x + 44 * s, y - 150 * s);
    ctx.stroke();
    var tx = x + 44 * s;
    var ty = y - 150 * s;
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI * 0.95 + (i * Math.PI) / 6.2;
      var len = (58 + ((i * 29) % 30)) * s;
      var ex = tx + Math.cos(a) * len;
      var ey = ty + Math.sin(a) * len * 0.55 + 26 * s;
      ctx.lineWidth = 4.5 * s;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + Math.cos(a) * len * 0.5, ty + 34 * s, ex, ey);
      ctx.stroke();
    }
  }

  function road(ctx, y) {
    ctx.fillStyle = "#120a18";
    ctx.fillRect(0, y, W, H - y);
    ctx.strokeStyle = "rgba(255, 201, 60, 0.85)";
    ctx.lineWidth = 5;
    ctx.setLineDash([34, 26]);
    ctx.beginPath();
    ctx.moveTo(W / 2, y + 8);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* Scene 0 — "Boulevard Sunset": amber sky, low sun, towers, road. */
  function boulevard() {
    var c = canvas();
    var ctx = c.getContext("2d");
    sky(ctx, [[0, "#2b1055"], [0.42, "#c62b6e"], [0.68, "#ff7a18"], [1, "#ffc93c"]]);
    sun(ctx, W * 0.5, H * 0.52, 92, "#ffe9a8");
    skyline(ctx, H * 0.78, "#1c0b2e", "rgba(255, 201, 60, 0.9)");
    road(ctx, H * 0.78);
    palm(ctx, 84, H * 0.8, 1.05, "#12081f");
    palm(ctx, W - 70, H * 0.82, 0.85, "#12081f");
    return c;
  }

  /* Scene 1 — "Neon Pier": night blues, magenta and cyan light bars,
     pier posts and their shimmer on the water. */
  function pier() {
    var c = canvas();
    var ctx = c.getContext("2d");
    sky(ctx, [[0, "#050914"], [0.5, "#0d1440"], [0.78, "#3b1a63"], [1, "#12081f"]]);
    // moon
    ctx.fillStyle = "#e8f6ff";
    ctx.beginPath();
    ctx.arc(W * 0.72, H * 0.16, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(232, 246, 255, 0.25)";
    ctx.beginPath();
    ctx.arc(W * 0.72, H * 0.16, 66, 0, Math.PI * 2);
    ctx.fill();
    // neon bars
    var bars = ["#ff2e88", "#22d3ee", "#ffc93c", "#ff2e88", "#22d3ee"];
    bars.forEach(function (color, i) {
      var y = H * (0.42 + i * 0.075);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 26;
      ctx.fillRect(W * 0.08, y, W * 0.84, 10);
      ctx.shadowBlur = 0;
    });
    // water
    var wg = ctx.createLinearGradient(0, H * 0.62, 0, H);
    wg.addColorStop(0, "#0a1030");
    wg.addColorStop(1, "#050914");
    ctx.fillStyle = wg;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);
    bars.forEach(function (color, i) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.35;
      for (var k = 0; k < 5; k++) {
        var y = H * (0.64 + i * 0.06 + k * 0.012);
        ctx.fillRect(W * (0.2 + ((i * 13 + k * 7) % 40) / 100), y, 90 - k * 12, 4);
      }
      ctx.globalAlpha = 1;
    });
    // pier posts
    ctx.fillStyle = "#04060d";
    for (var x = 30; x < W; x += 86) {
      ctx.fillRect(x, H * 0.58, 16, H * 0.16);
    }
    ctx.fillRect(0, H * 0.58, W, 12);
    return c;
  }

  /* Scene 2 — "Palm Dusk": pastel dusk, big moon, palm row, sea band. */
  function palms() {
    var c = canvas();
    var ctx = c.getContext("2d");
    sky(ctx, [[0, "#ffe3f1"], [0.45, "#f9a8d4"], [0.75, "#7dd3fc"], [1, "#fef3c7"]]);
    ctx.fillStyle = "#fff7ed";
    ctx.beginPath();
    ctx.arc(W * 0.3, H * 0.24, 58, 0, Math.PI * 2);
    ctx.fill();
    // sea band
    var sg = ctx.createLinearGradient(0, H * 0.66, 0, H * 0.8);
    sg.addColorStop(0, "#67e8f9");
    sg.addColorStop(1, "#0e7490");
    ctx.fillStyle = sg;
    ctx.fillRect(0, H * 0.66, W, H * 0.14);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (var i = 0; i < 6; i++) {
      ctx.fillRect(40 + i * 110, H * (0.68 + (i % 3) * 0.035), 70, 4);
    }
    // sand
    ctx.fillStyle = "#fde68a";
    ctx.fillRect(0, H * 0.8, W, H * 0.2);
    palm(ctx, 120, H * 0.84, 1.15, "#3f2b4d");
    palm(ctx, 330, H * 0.86, 0.95, "#4a3358");
    palm(ctx, 560, H * 0.83, 1.25, "#3f2b4d");
    return c;
  }

  var BUILDERS = [boulevard, pier, palms];
  var NAMES = ["Boulevard Sunset", "Neon Pier", "Palm Dusk"];

  global.VCS = global.VCS || {};
  global.VCS.samples = {
    buildAll: function () { return BUILDERS.map(function (b) { return b(); }); },
    names: NAMES,
    count: BUILDERS.length
  };
})(window);
