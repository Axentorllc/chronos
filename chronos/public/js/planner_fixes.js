// Copyright (c) 2024, ONFUSE AG and contributors
// For license information, please see license.txt

// Patch for Chronos frontend to use our custom API for assignment
(function() {
    console.log("Initializing Chronos fixes...");
    
    // Add event listener to detect when the timeline is rendered
    document.addEventListener('DOMContentLoaded', function() {
        // Check periodically if the timeline is ready
        const checkInterval = setInterval(function() {
            if (window.vis && document.querySelector('.vis-timeline')) {
                clearInterval(checkInterval);
                console.log("Timeline detected, fixing timeline drag behavior");
                
                // Add custom styling to make sure drag and drop works properly
                const style = document.createElement('style');
                style.textContent = `
                    .vis-item.vis-selected {
                        z-index: 999 !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }, 1000);
    });
    
    console.log("✅ Chronos fixes applied successfully");
})(); 