/**
 * Linda's Happy Ending Animation
 * Plays after defeating the boss
 */

function backToMenu() {
    // Go back to main games menu
    window.location.href = '../lindas-ocean-adventure/index.html';
}

// Auto-start animation on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐟 Linda\'s Happy Ending - Animation Started!');
});
