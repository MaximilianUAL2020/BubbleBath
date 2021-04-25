/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!******************************!*\
  !*** ./assets/js/content.js ***!
  \******************************/
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "url") {
    window.open(request.url, "_blank");
  }

  sendResponse(null);
});
/******/ })()
;