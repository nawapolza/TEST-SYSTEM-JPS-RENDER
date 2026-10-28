import './ledger.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './redesign.css';
import './mobile-home.css';
import './accessible-update.css';
import './responsive-ton-layout.css';
import './theme-finish.css';
import './mobile-ledger-one-line.css';
import './jps-professional-overrides.css';
import './jps-unified-2026.css';

function markDeviceMode() {
  try {
    const ua = navigator.userAgent || '';
    const mobileUa = /Android|iPhone|iPad|iPod|Mobile|Line|FBAN|FBAV/i.test(ua);
    const touchSmall = navigator.maxTouchPoints > 1 && Math.min(window.screen.width || 0, window.innerWidth || 0) <= 900;
    document.documentElement.dataset.device = mobileUa || touchSmall ? 'mobile' : 'desktop';
  } catch (_) {
    document.documentElement.dataset.device = 'desktop';
  }
}

markDeviceMode();

createRoot(document.getElementById('root')).render(
  <App />,
);
import './jps-brand.css';

import './jps-final-theme.css';

// Must be imported last: unified JPS blue/white theme overrides legacy page styles.
import './jps-blue-white-100.css';

// Final brand layer: force the JPS blue/white palette across legacy screens.
import './jps-system-blue-final.css';

import './jps-neo-experience.css';

// Last layer: shared accessibility, responsive and blue/white quality pass.
import './jps-quality-pass.css';
