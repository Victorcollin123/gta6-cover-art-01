/* Vice Cover Studio — controls.
   Wires the rail to the state and repaints the stage on every change.
   Drag pans the selected panel's photo; the wheel zooms it. */

(function (global) {
  "use strict";

  var VCS = global.VCS;

  function $(id) { return document.getElementById(id); }

  function thumbURL(panel, scenes) {
    var img = panel.photo || scenes[panel.scene % scenes.length];
    if (img instanceof HTMLImageElement) return img.src;
    return img.toDataURL("image/jpeg", 0.72);
  }

  function buildPanelList(state, scenes, renderPreview) {
    var list = $("panelList");
    list.innerHTML = "";
    var panels = VCS.state.panelsForLayout(state);
    panels.forEach(function (panel, i) {
      var card = document.createElement("div");
      card.className = "panel-card" + (state.selected === i ? " selected" : "");

      var head = document.createElement("div");
      head.className = "panel-head";
      var name = document.createElement("strong");
      name.textContent = "Panel " + (i + 1) + " — " + VCS.samples.names[panel.scene % 3];
      var flip = document.createElement("button");
      flip.type = "button";
      flip.className = "mini-btn" + (panel.flip ? " on" : "");
      flip.textContent = panel.flip ? "Flipped" : "Flip";
      flip.addEventListener("click", function () {
        panel.flip = !panel.flip;
        buildPanelList(state, scenes, renderPreview);
        renderPreview();
      });
      head.appendChild(name);
      head.appendChild(flip);
      card.appendChild(head);

      var row = document.createElement("div");
      row.className = "panel-row";
      var thumb = document.createElement("img");
      thumb.className = "thumb";
      thumb.alt = "Panel " + (i + 1) + " photo";
      thumb.src = thumbURL(panel, scenes);
      thumb.addEventListener("click", function () {
        state.selected = i;
        buildPanelList(state, scenes, renderPreview);
        renderPreview();
      });
      row.appendChild(thumb);

      var controls = document.createElement("div");
      controls.className = "panel-controls";

      var label = document.createElement("label");
      label.className = "upload-label";
      label.textContent = panel.photo ? "Replace photo" : "Upload your photo";
      var input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.addEventListener("change", function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var url = URL.createObjectURL(file);
        var img = new Image();
        img.onload = function () {
          panel.photo = img;
          panel.zoom = 1;
          panel.ox = 0;
          panel.oy = 0;
          buildPanelList(state, scenes, renderPreview);
          renderPreview();
        };
        img.src = url;
      });
      label.appendChild(input);
      controls.appendChild(label);

      var zoomRow = document.createElement("div");
      zoomRow.className = "zoom-row";
      var zoomLabel = document.createElement("span");
      zoomLabel.textContent = "Zoom";
      var zoom = document.createElement("input");
      zoom.type = "range";
      zoom.min = "100";
      zoom.max = "260";
      zoom.value = String(Math.round(panel.zoom * 100));
      zoom.setAttribute("aria-label", "Zoom panel " + (i + 1));
      zoom.addEventListener("input", function () {
        panel.zoom = zoom.value / 100;
        renderPreview();
      });
      var zoomOut = document.createElement("span");
      zoomOut.textContent = Math.round(panel.zoom * 100) + "%";
      zoom.addEventListener("input", function () {
        zoomOut.textContent = Math.round(panel.zoom * 100) + "%";
      });
      zoomRow.appendChild(zoomLabel);
      zoomRow.appendChild(zoom);
      zoomRow.appendChild(zoomOut);
      controls.appendChild(zoomRow);

      var sceneRow = document.createElement("div");
      sceneRow.className = "zoom-row";
      var sceneLabel = document.createElement("span");
      sceneLabel.textContent = "Scene";
      var sceneBtn = document.createElement("button");
      sceneBtn.type = "button";
      sceneBtn.className = "mini-btn";
      sceneBtn.textContent = "Next scene";
      sceneBtn.addEventListener("click", function () {
        panel.photo = null;
        panel.scene = (panel.scene + 1) % VCS.samples.count;
        buildPanelList(state, scenes, renderPreview);
        renderPreview();
      });
      sceneRow.appendChild(sceneLabel);
      sceneRow.appendChild(sceneBtn);
      controls.appendChild(sceneRow);

      row.appendChild(controls);
      card.appendChild(row);
      list.appendChild(card);
    });
  }

  function initUI(state, scenes, renderPreview, onExport) {
    /* Layout picker */
    $("layoutSeg").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-layout]");
      if (!btn) return;
      state.layout = btn.getAttribute("data-layout");
      Array.prototype.forEach.call(
        $("layoutSeg").querySelectorAll(".seg-btn"),
        function (b) { b.classList.toggle("active", b === btn); }
      );
      buildPanelList(state, scenes, renderPreview);
      renderPreview();
    });

    /* Grade picker */
    $("gradeGrid").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-grade]");
      if (!btn) return;
      state.grade = btn.getAttribute("data-grade");
      Array.prototype.forEach.call(
        $("gradeGrid").querySelectorAll(".grade-btn"),
        function (b) { b.classList.toggle("active", b === btn); }
      );
      renderPreview();
    });

    /* Captions */
    $("titleInput").addEventListener("input", function () {
      state.title = $("titleInput").value;
      renderPreview();
    });
    $("subtitleInput").addEventListener("input", function () {
      state.subtitle = $("subtitleInput").value;
      renderPreview();
    });
    $("placeInput").addEventListener("input", function () {
      state.place = $("placeInput").value;
      renderPreview();
    });
    $("outlineChk").addEventListener("change", function () {
      state.outline = $("outlineChk").checked;
      renderPreview();
    });
    $("gradientChk").addEventListener("change", function () {
      state.gradientTitle = $("gradientChk").checked;
      renderPreview();
    });
    $("shadowChk").addEventListener("change", function () {
      state.dropShadow = $("shadowChk").checked;
      renderPreview();
    });

    /* Texture */
    $("halftoneRange").addEventListener("input", function () {
      state.halftone = $("halftoneRange").value / 100;
      $("halftoneOut").textContent = $("halftoneRange").value + "%";
      renderPreview();
    });
    $("grainRange").addEventListener("input", function () {
      state.grain = $("grainRange").value / 100;
      $("grainOut").textContent = $("grainRange").value + "%";
      renderPreview();
    });
    $("vignetteChk").addEventListener("change", function () {
      state.vignette = $("vignetteChk").checked;
      renderPreview();
    });

    /* Export size */
    $("sizeSelect").addEventListener("change", function () {
      state.size = $("sizeSelect").value;
      renderPreview();
    });

    /* Shuffle: new layout, grade, scenes and caption set. */
    $("shuffleBtn").addEventListener("click", function () {
      var layouts = Object.keys(VCS.state.LAYOUTS);
      var grades = VCS.grades.keys();
      state.layout = layouts[Math.floor(Math.random() * layouts.length)];
      state.grade = grades[Math.floor(Math.random() * grades.length)];
      state.panels.forEach(function (p) {
        p.scene = Math.floor(Math.random() * VCS.samples.count);
        p.photo = null;
        p.zoom = 1;
        p.ox = 0;
        p.oy = 0;
      });
      var titles = [
        ["SUNSET HEIST", "Two thieves. One last score."],
        ["BOULEVARD QUEEN", "She owns the night shift."],
        ["PALM NOIR NIGHTS", "Every light hides a secret."],
        ["NEON GETAWAY", "Outrun the sunrise."],
        ["VICE ROYALE", "The city deals the cards."]
      ];
      var pick = titles[Math.floor(Math.random() * titles.length)];
      state.title = pick[0];
      state.subtitle = pick[1];
      $("titleInput").value = state.title;
      $("subtitleInput").value = state.subtitle;
      syncPickers(state);
      buildPanelList(state, scenes, renderPreview);
      renderPreview();
    });

    $("resetBtn").addEventListener("click", function () {
      var fresh = VCS.state.defaultState();
      Object.keys(fresh).forEach(function (k) { state[k] = fresh[k]; });
      $("titleInput").value = state.title;
      $("subtitleInput").value = state.subtitle;
      $("placeInput").value = state.place;
      $("outlineChk").checked = state.outline;
      $("gradientChk").checked = state.gradientTitle;
      $("shadowChk").checked = state.dropShadow;
      $("halftoneRange").value = String(Math.round(state.halftone * 100));
      $("halftoneOut").textContent = Math.round(state.halftone * 100) + "%";
      $("grainRange").value = String(Math.round(state.grain * 100));
      $("grainOut").textContent = Math.round(state.grain * 100) + "%";
      $("vignetteChk").checked = state.vignette;
      $("sizeSelect").value = state.size;
      syncPickers(state);
      buildPanelList(state, scenes, renderPreview);
      renderPreview();
    });

    $("exportBtn").addEventListener("click", onExport);
    $("exportBtn2").addEventListener("click", onExport);

    /* Stage: click selects a panel, drag pans its photo, wheel zooms. */
    var stage = $("stage");
    var dragging = null;

    function panelAt(state, scenes, evt) {
      var rect = stage.getBoundingClientRect();
      var scaleX = stage.width / rect.width;
      var scaleY = stage.height / rect.height;
      var x = (evt.clientX - rect.left) * scaleX / stage.width;
      var y = (evt.clientY - rect.top) * scaleY / stage.height;
      var layout = VCS.state.LAYOUTS[state.layout];
      var panels = VCS.state.panelsForLayout(state);
      for (var i = 0; i < panels.length; i++) {
        var r = layout.panels[i];
        if (x >= r[0] && x < r[0] + r[2] && y >= r[1] && y < r[1] + r[3]) return i;
      }
      return -1;
    }

    stage.addEventListener("pointerdown", function (evt) {
      var i = panelAt(state, scenes, evt);
      if (i < 0) return;
      state.selected = i;
      buildPanelList(state, scenes, renderPreview);
      renderPreview();
      dragging = { i: i, x: evt.clientX, y: evt.clientY };
      stage.setPointerCapture(evt.pointerId);
    });

    stage.addEventListener("pointermove", function (evt) {
      if (!dragging) return;
      var rect = stage.getBoundingClientRect();
      var panel = VCS.state.panelsForLayout(state)[dragging.i];
      var layout = VCS.state.LAYOUTS[state.layout];
      var r = layout.panels[dragging.i];
      panel.ox += (evt.clientX - dragging.x) / rect.width / r[2];
      panel.oy += (evt.clientY - dragging.y) / rect.height / r[3];
      panel.ox = Math.max(-0.6, Math.min(0.6, panel.ox));
      panel.oy = Math.max(-0.6, Math.min(0.6, panel.oy));
      dragging.x = evt.clientX;
      dragging.y = evt.clientY;
      renderPreview();
    });

    stage.addEventListener("pointerup", function () { dragging = null; });
    stage.addEventListener("pointercancel", function () { dragging = null; });

    stage.addEventListener("wheel", function (evt) {
      evt.preventDefault();
      var i = panelAt(state, scenes, evt);
      if (i < 0) i = state.selected;
      var panel = VCS.state.panelsForLayout(state)[i];
      panel.zoom = Math.max(1, Math.min(2.6, panel.zoom * (evt.deltaY < 0 ? 1.08 : 0.93)));
      buildPanelList(state, scenes, renderPreview);
      renderPreview();
    }, { passive: false });
  }

  function syncPickers(state) {
    Array.prototype.forEach.call(
      $("layoutSeg").querySelectorAll(".seg-btn"),
      function (b) { b.classList.toggle("active", b.getAttribute("data-layout") === state.layout); }
    );
    Array.prototype.forEach.call(
      $("gradeGrid").querySelectorAll(".grade-btn"),
      function (b) { b.classList.toggle("active", b.getAttribute("data-grade") === state.grade); }
    );
  }

  global.VCS.ui = {
    initUI: initUI,
    buildPanelList: buildPanelList,
    syncPickers: syncPickers
  };
})(window);
