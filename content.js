(() => {
    // Configuration
    let settings = {
      skipAds: true,
      skipIntros: true,
      customIntroTimes: {}
    };
    
    // Common intro length (in seconds) for various channels
    const defaultIntroLength = 10; // Default assumption for intro length
    
    // Load user settings
    function loadSettings() {
      chrome.storage.sync.get(['skipAds', 'skipIntros', 'customIntroTimes'], (result) => {
        settings = result;
      });
    }
    
    // Initialize
    loadSettings();
    chrome.storage.onChanged.addListener(loadSettings);
    
    // Video detection and processing
    function setupVideoHandlers() {
      const video = document.querySelector('video');
      if (!video) return;
      
      // Observer for ad detection
      const adObserver = new MutationObserver(() => {
        checkForAdsAndSkip();
        checkForIntrosAndSkip(video);
      });
      
      // Watch for changes in the DOM to detect ads
      adObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Set up time update listener for intro skipping
      video.addEventListener('timeupdate', () => {
        checkForIntrosAndSkip(video);
      });
      
      // First check when setting up
      checkForAdsAndSkip();
    }
    
    // Check for and skip ads if enabled
    function checkForAdsAndSkip() {
      if (!settings.skipAds) return;
      
      // Skip button for regular ads
      const skipButton = document.querySelector('.ytp-ad-skip-button');
      if (skipButton) {
        console.log('YouTube Auto-Skip: Ad detected, skipping...');
        skipButton.click();
      }
      
      // Skip button for newer ad formats
      const skipButtonAlt = document.querySelector('.ytp-ad-skip-button-modern');
      if (skipButtonAlt) {
        console.log('YouTube Auto-Skip: Modern ad detected, skipping...');
        skipButtonAlt.click();
      }
      
      // Handle banner ads
      const bannerAd = document.querySelector('.ytp-ad-overlay-close-button');
      if (bannerAd) {
        console.log('YouTube Auto-Skip: Banner ad detected, closing...');
        bannerAd.click();
      }
    }
    
    // Check for and skip video intros if enabled
    function checkForIntrosAndSkip(video) {
      if (!settings.skipIntros || !video) return;
      
      // Get video ID
      const videoId = getYouTubeVideoId();
      if (!videoId) return;
      
      // Custom intro time for this specific video/channel
      let introEndTime = settings.customIntroTimes[videoId] || defaultIntroLength;
      
      // If we're in the intro portion and the video is playing
      if (video.currentTime < introEndTime && video.currentTime > 0 && !video.paused) {
        console.log(`YouTube Auto-Skip: Skipping intro (${introEndTime}s)`);
        video.currentTime = introEndTime;
      }
    }
    
    // Extract YouTube video ID from URL
    function getYouTubeVideoId() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('v');
    }
    
    // Run when navigating to a new video
    function onNavigate() {
      setupVideoHandlers();
    }
    
    // Set up navigation detection
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        onNavigate();
      }
    }).observe(document, { subtree: true, childList: true });
    
    // Initial setup
    onNavigate();
  })();
  