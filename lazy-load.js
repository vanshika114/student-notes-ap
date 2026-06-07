/**
 * Global Lazy Loading Utility
 * Uses IntersectionObserver to lazy load images and iframes with transition effects.
 */
document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll("img[data-src], iframe[data-src]");
    
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.src = el.dataset.src;
                    
                    // Add fade-in transition on load
                    el.addEventListener("load", () => {
                        el.style.opacity = 1;
                        el.style.transition = "opacity 0.5s ease-in-out";
                    });
                    
                    observer.unobserve(el);
                }
            });
        }, {
            rootMargin: "0px 0px 200px 0px" // Load early before scrolling into view
        });

        images.forEach(img => {
            img.style.opacity = 0; // Hide initially
            observer.observe(img);
        });
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.style.opacity = 1;
        });
    }
});
