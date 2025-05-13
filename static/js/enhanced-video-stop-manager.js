/**
 * Enhanced Video Playback Manager
 * Solves issues with video stopping when closing modals
 */

// Function to ensure all videos stop when closing a modal
function stopAllVideosInModal() {
    console.log("Stopping all videos in modal");
    
    // Find all video elements on the page
    const allVideos = document.querySelectorAll('video');
    
    // Stop each video
    allVideos.forEach(video => {
        try {
            if (!video.paused) {
                console.log("Stopping video:", video.src);
                video.pause();
            }
            
            // Reset playback time to beginning (optional)
            // video.currentTime = 0;
        } catch (e) {
            console.error("Error while trying to stop video:", e);
        }
    });
    
    // Find iframe elements that may contain YouTube or Vimeo videos
    const iframes = document.querySelectorAll('iframe');
    
    // Stop each video inside iframe
    iframes.forEach(iframe => {
        try {
            // Attempt to send stop message to video
            const src = iframe.src;
            
            // Special handling for YouTube videos
            if (src.includes('youtube.com') || src.includes('youtu.be')) {
                console.log("Stopping YouTube video:", src);
                // Reload iframe to stop video (simplest method)
                iframe.src = iframe.src;
            }
            // Special handling for Vimeo videos
            else if (src.includes('vimeo.com')) {
                console.log("Stopping Vimeo video:", src);
                // Reload iframe to stop video
                iframe.src = iframe.src;
            }
        } catch (e) {
            console.error("Error while trying to stop iframe video:", e);
        }
    });
}

// Add event listeners for modal closing
document.addEventListener('DOMContentLoaded', function() {
    console.log("Enhanced video playback manager loaded");
    
    // Monitor click events on modal close elements
    document.addEventListener('click', function(event) {
        // Check if clicked on any modal close button
        if (event.target.classList.contains('close') || 
            event.target.classList.contains('btn-close') ||
            event.target.closest('.close') || 
            event.target.closest('.btn-close')) {
            console.log("Clicked on close button");
            stopAllVideosInModal();
        }
        
        // Check if clicked outside modal
        if (event.target.classList.contains('modal')) {
            console.log("Clicked outside modal");
            stopAllVideosInModal();
        }
    });
    
    // Monitor modal close events using Bootstrap API
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('hide.bs.modal', function() {
            console.log("Modal close event called from Bootstrap API");
            stopAllVideosInModal();
        });
    });
    
    // Add special handler for buttons that open projects directly from the homepage
    const portfolioLinks = document.querySelectorAll('[data-portfolio-id]');
    portfolioLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Stop any video before opening a new project
            stopAllVideosInModal();
        });
    });
});

// Add extra layer of protection - periodic cleanup
setInterval(function() {
    // Check if all modals are closed
    const openModals = document.querySelectorAll('.modal.show');
    if (openModals.length === 0) {
        // No open modals, ensure all videos are stopped
        stopAllVideosInModal();
    }
}, 5000); // every 5 seconds
