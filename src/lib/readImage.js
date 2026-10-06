// Reads an image File, downscales it (max 900px) and returns a JPEG data URL via callback.
// The original prototype called this helper without defining it, so it is implemented here.
export function readImage(file, cb) {
  var reader = new FileReader();
  reader.onerror = function () { cb(null); };
  reader.onload = function () {
    var img = new Image();
    img.onerror = function () { cb(null); };
    img.onload = function () {
      try {
        var max = 900, r = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * r);
        c.height = Math.round(img.height * r);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL("image/jpeg", 0.82));
      } catch (e) { cb(null); }
    };
    img.src = String(reader.result);
  };
  reader.readAsDataURL(file);
}