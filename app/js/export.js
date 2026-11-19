/* Vice Cover Studio — PNG export at full resolution. */

(function (global) {
  "use strict";

  var VCS = global.VCS;

  /* Render the poster at the chosen size and trigger a download.
     Returns a promise that resolves to the file name. */
  function exportPNG(state, scenes, sizeKey) {
    var size = VCS.state.SIZES[sizeKey] || VCS.state.SIZES["1080x1350"];
    var out = document.createElement("canvas");
    out.width = size.w;
    out.height = size.h;
    var ctx = out.getContext("2d");
    VCS.render.drawPoster(ctx, size.w, size.h, state, scenes, { highlight: -1 });
    return new Promise(function (resolve, reject) {
      out.toBlob(function (blob) {
        if (!blob) { reject(new Error("Export produced no image")); return; }
        var name = "vice-cover-" + size.w + "x" + size.h + ".png";
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        resolve(name);
      }, "image/png");
    });
  }

  global.VCS.exporter = { exportPNG: exportPNG };
})(window);
