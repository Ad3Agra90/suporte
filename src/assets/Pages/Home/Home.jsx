import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const containerStyle = {
  position: 'fixed',
  top: '-80px', // Adjust to header height
  left: 0,
  height: '110vh',
  width: '100vw',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  zIndex: 0, // Ensure iframe container stays behind header
};

const iframeStyle = {
  border: 'none',
  height: '100%',
  width: '100%',
};

export default function Home() {
  const iframeRef = useRef(null);
  const location = useLocation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Toggle visibility based on current path
    if (location.pathname === '/') {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const hideHeader = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc) return;

        // Attempt to hide header by common selectors
        const header = iframeDoc.querySelector('header, .header, #header, nav, .navbar, .site-header');
        if (header) {
          header.style.display = 'none';
        }
      } catch {
        // Cross-origin iframe, cannot access DOM
        console.warn('Cannot access iframe content due to cross-origin restrictions.');
      }
    };

    iframe.addEventListener('load', hideHeader);

    return () => {
      iframe.removeEventListener('load', hideHeader);
    };
  }, []);

  return (
    <div style={{ ...containerStyle, display: visible ? 'block' : 'none' }}>
      <iframe
        ref={iframeRef}
        src="https://www.midiavox.com.br/"
        title="Midiavox"
        style={iframeStyle}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
