chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "url") {
    window.open(request.url, "_blank");
  }
  sendResponse(null);
});
