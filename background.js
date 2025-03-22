chrome.runtime.onInstalled.addListener(() => {
    // Set default settings
    chrome.storage.sync.set({
      skipAds: true,
      skipIntros: true,
      customIntroTimes: {}
    });
  });