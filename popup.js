document.addEventListener('DOMContentLoaded', () => {
    // Load saved settings
    chrome.storage.sync.get(['skipAds', 'skipIntros', 'customIntroTimes'], (result) => {
      document.getElementById('skipAds').checked = result.skipAds;
      document.getElementById('skipIntros').checked = result.skipIntros;
      displayCustomIntros(result.customIntroTimes);
    });
    
    // Save toggle settings
    document.getElementById('skipAds').addEventListener('change', (e) => {
      chrome.storage.sync.set({ skipAds: e.target.checked });
    });
    
    document.getElementById('skipIntros').addEventListener('change', (e) => {
      chrome.storage.sync.set({ skipIntros: e.target.checked });
    });
    
    // Add custom intro time
    document.getElementById('addCustomIntro').addEventListener('click', () => {
      const videoUrl = document.getElementById('videoUrl').value;
      const introLength = document.getElementById('introLength').value;
      
      if (!videoUrl || !introLength) {
        alert('Please enter both a video URL and intro length');
        return;
      }
      
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        alert('Invalid YouTube URL');
        return;
      }
      
      chrome.storage.sync.get(['customIntroTimes'], (result) => {
        const customIntroTimes = result.customIntroTimes || {};
        customIntroTimes[videoId] = parseFloat(introLength);
        
        chrome.storage.sync.set({ customIntroTimes }, () => {
          document.getElementById('videoUrl').value = '';
          document.getElementById('introLength').value = '';
          displayCustomIntros(customIntroTimes);
        });
      });
    });
    
    // Display custom intro settings
    function displayCustomIntros(customIntroTimes) {
      const container = document.getElementById('customIntroList');
      container.innerHTML = '';
      
      Object.entries(customIntroTimes).forEach(([videoId, time]) => {
        const item = document.createElement('div');
        item.className = 'custom-intro-item';
        
        const videoText = document.createElement('span');
        videoText.textContent = `${videoId} - ${time}s`;
        item.appendChild(videoText);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => {
          chrome.storage.sync.get(['customIntroTimes'], (result) => {
            const updated = result.customIntroTimes || {};
            delete updated[videoId];
            chrome.storage.sync.set({ customIntroTimes: updated }, () => {
              displayCustomIntros(updated);
            });
          });
        });
        
        item.appendChild(deleteBtn);
        container.appendChild(item);
      });
    }
    
    // Extract video ID from various YouTube URL formats
    function extractVideoId(url) {
      try {
        const urlObj = new URL(url);
        
        // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
        if (urlObj.searchParams.has('v')) {
          return urlObj.searchParams.get('v');
        }
        
        // Short URL: https://youtu.be/VIDEO_ID
        if (urlObj.hostname === 'youtu.be') {
          return urlObj.pathname.substring(1);
        }
        
        // Embedded URL
        if (urlObj.pathname.includes('/embed/')) {
          return urlObj.pathname.split('/embed/')[1];
        }
        
        return null;
      } catch (e) {
        return null;
      }
    }
  });