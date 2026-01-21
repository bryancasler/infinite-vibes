/**
 * Color Utility Functions
 * Handles color generation and manipulation
 */
/**
 * Generates a random neon color from the palette
 */
export declare function getRandomNeonColor(): string;
/**
 * Gets the next color in the palette (cycling)
 */
export declare function getNextColor(currentIndex: number): string;
/**
 * Generates a unique color that's not already in use
 */
export declare function getUniqueColor(usedColors: string[]): string;
/**
 * Generates a random HSL color string
 */
export declare function generateRandomHSL(saturation?: number, lightness?: number): string;
/**
 * Converts hex color to RGB object
 */
export declare function hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
} | null;
/**
 * Converts RGB to hex color string
 */
export declare function rgbToHex(r: number, g: number, b: number): string;
/**
 * Converts hex color to HSL
 */
export declare function hexToHsl(hex: string): {
    h: number;
    s: number;
    l: number;
} | null;
/**
 * Converts HSL to hex color string
 */
export declare function hslToHex(h: number, s: number, l: number): string;
/**
 * Lightens a hex color by a percentage
 */
export declare function lighten(hex: string, percent: number): string;
/**
 * Darkens a hex color by a percentage
 */
export declare function darken(hex: string, percent: number): string;
/**
 * Adjusts the saturation of a hex color
 */
export declare function saturate(hex: string, percent: number): string;
/**
 * Creates a color with alpha transparency
 */
export declare function withAlpha(hex: string, alpha: number): string;
/**
 * Interpolates between two colors
 */
export declare function interpolateColor(color1: string, color2: string, factor: number): string;
/**
 * Generates a gradient array between two colors
 */
export declare function generateGradient(color1: string, color2: string, steps: number): string[];
/**
 * Creates a CSS gradient string from colors
 */
export declare function createCssGradient(colors: string[], direction?: string): string;
/**
 * Creates a radial gradient CSS string
 */
export declare function createRadialGradient(colors: string[], shape?: 'circle' | 'ellipse'): string;
/**
 * Checks if a color is light or dark
 */
export declare function isLightColor(hex: string): boolean;
/**
 * Gets appropriate text color (black or white) for a background
 */
export declare function getContrastTextColor(backgroundColor: string): string;
/**
 * Generates complementary color
 */
export declare function getComplementary(hex: string): string;
/**
 * Generates triadic colors
 */
export declare function getTriadic(hex: string): [string, string, string];
/**
 * Checks if P3 color gamut is supported
 */
export declare function supportsP3Colors(): boolean;
/**
 * Creates a P3 color if supported, falls back to sRGB
 */
export declare function p3Color(r: number, g: number, b: number): string;
//# sourceMappingURL=color.d.ts.map