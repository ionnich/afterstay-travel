import React from 'react';
import Svg, { Path, Circle as SvgCircle, Rect, Line, Polyline } from 'react-native-svg';

/* ─── SVG Icons — exact copies from prototype ─── */

export function AppleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" style={{ marginTop: -2 }}>
      <Path
        d="M17.6 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-2-3.7-2-1.6-.2-3.1 1-3.9 1-.8 0-2.1-.9-3.4-.9-1.7 0-3.4 1-4.3 2.6-1.8 3.2-.5 7.9 1.3 10.5.9 1.3 2 2.7 3.3 2.6 1.3 0 1.8-.8 3.4-.8 1.6 0 2.1.8 3.4.8 1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-2.9 1.4-3-.1 0-2.7-1-2.8-4.4zM15 5.5c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.5-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.4z"
        fill="#fff"
      />
    </Svg>
  );
}

export function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.4-3.5z" />
    </Svg>
  );
}

export function EmailIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" fill="none" />
      <Path d="M3 7l9 6 9-6" stroke="currentColor" fill="none" />
    </Svg>
  );
}

export function SMSIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12a8 8 0 01-11.8 7L4 20.5l1.5-4.5A8 8 0 1121 12z" stroke="currentColor" fill="none" />
      <SvgCircle cx="8.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
      <SvgCircle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
      <SvgCircle cx="15.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ArrowIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" />
      <Polyline points="12 5 19 12 12 19" stroke="currentColor" fill="none" />
    </Svg>
  );
}
