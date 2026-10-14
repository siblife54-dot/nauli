// Change only this value to "original" to restore the previous hero globally.
const DEFAULT_FACE = "reference";
const requestedFace = new URLSearchParams(window.location.search).get("face");
document.documentElement.dataset.face = ["original", "reference"].includes(requestedFace)
  ? requestedFace
  : DEFAULT_FACE;
