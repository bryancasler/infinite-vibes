/**
 * Color Utility Functions
 * Handles color generation and manipulation
 */

import { NEON_COLORS } from './constants.js';

/**
 * Generates a random neon color from the palette
 */
export function getRandomNeonColor(): string {
  const index = Math.floor(Math.random() * NEON_COLORS.length);
  return NEON_COLORS[index];
}

/**
 * Gets the next color in the palette (cycling)
 */
export function getNextColor(currentIndex: number): string {
  return NEON_COLORS[(currentIndex + 1) % NEON_COLORS.length];
}

/**
 * Generates a unique color that's not already in use
 */
export function getUniqueColor(usedColors: string[]): string {
  const available = NEON_COLORS.filter((c) => !usedColors.includes(c));

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // If all colors are used, generate a random hue
  return generateRandomHSL();
}

/**
 * Generates a random HSL color string
 */
export function generateRandomHSL(
  saturation: number = 100,
  lightness: number = 50
): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Converts hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return null;
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Converts RGB to hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number): string => {
    const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts hex color to HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL to hex color string
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

/**
 * Lightens a hex color by a percentage
 */
export function lighten(hex: string, percent: number): string {
  const hsl = hexToHsl(hex);

  if (!hsl) {
    return hex;
  }

  const newLightness = Math.min(100, hsl.l + percent);
  return hslToHex(hsl.h, hsl.s, newLightness);
}

/**
 * Darkens a hex color by a percentage
 */
export function darken(hex: string, percent: number): string {
  const hsl = hexToHsl(hex);

  if (!hsl) {
    return hex;
  }

  const newLightness = Math.max(0, hsl.l - percent);
  return hslToHex(hsl.h, hsl.s, newLightness);
}

/**
 * Adjusts the saturation of a hex color
 */
export function saturate(hex: string, percent: number): string {
  const hsl = hexToHsl(hex);

  if (!hsl) {
    return hex;
  }

  const newSaturation = Math.min(100, Math.max(0, hsl.s + percent));
  return hslToHex(hsl.h, newSaturation, hsl.l);
}

/**
 * Creates a color with alpha transparency
 */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return hex;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Interpolates between two colors
 */
export function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return color1;
  }

  const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
  const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
  const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

  return rgbToHex(r, g, b);
}

/**
 * Generates a gradient array between two colors
 */
export function generateGradient(
  color1: string,
  color2: string,
  steps: number
): string[] {
  const gradient: string[] = [];

  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    gradient.push(interpolateColor(color1, color2, factor));
  }

  return gradient;
}

/**
 * Creates a CSS gradient string from colors
 */
export function createCssGradient(
  colors: string[],
  direction: string = 'to right'
): string {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
}

/**
 * Creates a radial gradient CSS string
 */
export function createRadialGradient(
  colors: string[],
  shape: 'circle' | 'ellipse' = 'circle'
): string {
  return `radial-gradient(${shape}, ${colors.join(', ')})`;
}

/**
 * Checks if a color is light or dark
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return false;
  }

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

/**
 * Gets appropriate text color (black or white) for a background
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#ffffff';
}

/**
 * Generates complementary color
 */
export function getComplementary(hex: string): string {
  const hsl = hexToHsl(hex);

  if (!hsl) {
    return hex;
  }

  const complementaryHue = (hsl.h + 180) % 360;
  return hslToHex(complementaryHue, hsl.s, hsl.l);
}

/**
 * Generates triadic colors
 */
export function getTriadic(hex: string): [string, string, string] {
  const hsl = hexToHsl(hex);

  if (!hsl) {
    return [hex, hex, hex];
  }

  return [
    hex,
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
}

/**
 * Checks if P3 color gamut is supported
 */
export function supportsP3Colors(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(color-gamut: p3)').matches;
}

/**
 * Creates a P3 color if supported, falls back to sRGB
 */
export function p3Color(r: number, g: number, b: number): string {
  if (supportsP3Colors()) {
    return `color(display-p3 ${r} ${g} ${b})`;
  }

  return rgbToHex(
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  );
}
