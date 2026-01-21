/**
 * Infinite Vibes DJ - Entry Point
 */

// Import main component (this will register all components)
import './components/prompt-dj.js';

// Log startup
console.log(
  '%c🎵 Infinite Vibes DJ',
  'color: #8338ec; font-size: 20px; font-weight: bold;'
);
console.log(
  '%cPowered by Google Gemini',
  'color: #06ffa5; font-size: 12px;'
);

// Prevent default drag/drop behavior
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

// Handle visibility change (pause/resume when tab is hidden/visible)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Tab hidden - audio continues in background');
  } else {
    console.log('Tab visible');
  }
});

// Service worker registration (optional, for PWA support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment to enable service worker:
    // navigator.serviceWorker.register('/sw.js').then(
    //   (registration) => console.log('SW registered:', registration.scope),
    //   (error) => console.log('SW registration failed:', error)
    // );
  });
}
