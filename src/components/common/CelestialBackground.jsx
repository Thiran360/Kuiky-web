import React from 'react';
import './CelestialBackground.css';

const CelestialBackground = () => {
  return (
    <div className="celestial-bg-fixed">
      <iframe
        className="celestial-video-engine"
        src="https://www.youtube.com/embed/9S6_K_9Z-jQ?autoplay=1&mute=1&controls=0&loop=1&playlist=9S6_K_9Z-jQ&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
      <div className="aura-glass-overlay"></div>
    </div>
  );
};

export default CelestialBackground;
