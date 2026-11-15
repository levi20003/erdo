import { useEffect } from 'react'

/** The browser / status-bar colour (meta theme-color). Pass null to leave it to someone else. */
export function useThemeColor(color) {
  useEffect(() => {
    if (color) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  }, [color])
}

/** Top-of-screen colours per theme: the green header, and the plain page (focus mode). */
export const HERO_COLOR = { light: '#40a064', dark: '#2a6b43' }
export const PAGE_COLOR = { light: '#f4f5e7', dark: '#171313' }
