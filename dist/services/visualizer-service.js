/**
 * Visualizer Service
 * Renders real-time audio visualizations on Canvas
 */
import { DEFAULT_VISUALIZER_CONFIG, COLOR_SCHEMES } from '../utils/constants.js';
import { getAudioService } from './audio-service.js';
import { withAlpha, hexToRgb } from '../utils/color.js';
/**
 * Gradient Pulse Visualization
 */
class GradientPulseVisualization {
    constructor() {
        this.phase = 0;
        this.smoothedVolume = 0;
    }
    render(ctx, width, height, frequencyData, _timeDomainData, config) {
        // Calculate average volume
        const average = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length;
        const normalizedVolume = (average / 255) * config.sensitivity;
        // Smooth the volume
        this.smoothedVolume += (normalizedVolume - this.smoothedVolume) * 0.1;
        // Update phase
        this.phase += 0.02;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.max(width, height) * 0.8;
        // Clear with fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        // Draw multiple pulsing circles
        const colors = COLOR_SCHEMES[config.colorScheme];
        const numCircles = 5;
        for (let i = numCircles - 1; i >= 0; i--) {
            const circlePhase = this.phase + (i * Math.PI) / numCircles;
            const pulseAmount = Math.sin(circlePhase) * 0.3 + 0.7;
            const volumeScale = 1 + this.smoothedVolume * 2;
            const radius = (maxRadius * (i + 1)) / numCircles * pulseAmount * volumeScale;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            const color = colors[i % colors.length];
            const alpha = (1 - i / numCircles) * 0.5 * config.opacity;
            gradient.addColorStop(0, withAlpha(color, alpha));
            gradient.addColorStop(0.5, withAlpha(color, alpha * 0.5));
            gradient.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }
    reset() {
        this.phase = 0;
        this.smoothedVolume = 0;
    }
}
/**
 * Particle System Visualization
 */
class ParticleVisualization {
    constructor() {
        this.particles = [];
        this.lastSpawnTime = 0;
    }
    render(ctx, width, height, frequencyData, _timeDomainData, config) {
        // Calculate bass and treble levels
        const bassAvg = frequencyData.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
        const trebleAvg = frequencyData.slice(100, 150).reduce((a, b) => a + b, 0) / 50 / 255;
        // Spawn new particles based on audio
        const now = Date.now();
        const spawnRate = 50 + bassAvg * 200 * config.sensitivity;
        if (now - this.lastSpawnTime > 1000 / spawnRate && this.particles.length < 300) {
            this.spawnParticle(width, height, bassAvg, config);
            this.lastSpawnTime = now;
        }
        // Clear with trail effect
        ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + (1 - config.opacity) * 0.2})`;
        ctx.fillRect(0, 0, width, height);
        // Update and draw particles
        const colors = COLOR_SCHEMES[config.colorScheme];
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            // Update position
            p.x += p.vx * (1 + trebleAvg * config.sensitivity);
            p.y += p.vy * (1 + trebleAvg * config.sensitivity);
            // Apply slight gravity and friction
            p.vy += 0.02;
            p.vx *= 0.99;
            p.vy *= 0.99;
            // Update life
            p.life--;
            p.alpha = (p.life / p.maxLife) * config.opacity;
            // Remove dead particles
            if (p.life <= 0 || p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            // Draw particle
            const size = p.size * (0.5 + bassAvg * config.sensitivity);
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = withAlpha(p.color, p.alpha);
            ctx.fill();
            // Add glow effect
            if (config.blur === 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
                ctx.fillStyle = withAlpha(p.color, p.alpha * 0.2);
                ctx.fill();
            }
        }
    }
    spawnParticle(width, height, intensity, config) {
        const colors = COLOR_SCHEMES[config.colorScheme];
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3 + intensity * 5;
        this.particles.push({
            x: width / 2 + (Math.random() - 0.5) * 100,
            y: height / 2 + (Math.random() - 0.5) * 100,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 4 + intensity * 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            life: 60 + Math.random() * 60,
            maxLife: 120,
        });
    }
    reset() {
        this.particles = [];
    }
}
/**
 * Spectrogram Visualization
 */
class SpectrogramVisualization {
    constructor() {
        this.imageData = null;
        this.offset = 0;
    }
    render(ctx, width, height, frequencyData, _timeDomainData, config) {
        // Initialize or resize image data
        if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
            this.imageData = ctx.createImageData(width, height);
            this.offset = 0;
        }
        const colors = COLOR_SCHEMES[config.colorScheme];
        // Shift existing data left
        const data = this.imageData.data;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width - 1; x++) {
                const srcIdx = (y * width + x + 1) * 4;
                const dstIdx = (y * width + x) * 4;
                data[dstIdx] = data[srcIdx];
                data[dstIdx + 1] = data[srcIdx + 1];
                data[dstIdx + 2] = data[srcIdx + 2];
                data[dstIdx + 3] = data[srcIdx + 3];
            }
        }
        // Draw new column on the right
        const x = width - 1;
        const binCount = frequencyData.length;
        for (let y = 0; y < height; y++) {
            const freqIndex = Math.floor((1 - y / height) * binCount * 0.5);
            const value = frequencyData[freqIndex] / 255 * config.sensitivity;
            // Map value to color
            const colorIndex = Math.floor(value * (colors.length - 1));
            const color = colors[Math.min(colorIndex, colors.length - 1)];
            const rgb = hexToRgb(color) || { r: 255, g: 255, b: 255 };
            const idx = (y * width + x) * 4;
            data[idx] = rgb.r;
            data[idx + 1] = rgb.g;
            data[idx + 2] = rgb.b;
            data[idx + 3] = Math.floor(value * 255 * config.opacity);
        }
        // Draw to canvas
        ctx.putImageData(this.imageData, 0, 0);
    }
    reset() {
        this.imageData = null;
        this.offset = 0;
    }
}
/**
 * Warp (Starfield) Visualization
 */
class WarpVisualization {
    constructor() {
        this.stars = [];
        this.initialized = false;
    }
    initStars(width, height, config) {
        const colors = COLOR_SCHEMES[config.colorScheme];
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * width * 2,
                y: (Math.random() - 0.5) * height * 2,
                z: Math.random() * 1000,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
        this.initialized = true;
    }
    render(ctx, width, height, frequencyData, _timeDomainData, config) {
        if (!this.initialized) {
            this.initStars(width, height, config);
        }
        // Calculate speed from audio
        const bassAvg = frequencyData.slice(0, 20).reduce((a, b) => a + b, 0) / 20 / 255;
        const speed = 5 + bassAvg * 30 * config.sensitivity;
        // Clear with fade
        ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + (1 - config.opacity) * 0.3})`;
        ctx.fillRect(0, 0, width, height);
        const centerX = width / 2;
        const centerY = height / 2;
        // Update and draw stars
        for (const star of this.stars) {
            // Move star towards camera
            star.z -= speed;
            // Reset if too close
            if (star.z <= 0) {
                star.x = (Math.random() - 0.5) * width * 2;
                star.y = (Math.random() - 0.5) * height * 2;
                star.z = 1000;
            }
            // Project to 2D
            const scale = 500 / star.z;
            const x = centerX + star.x * scale;
            const y = centerY + star.y * scale;
            // Skip if off screen
            if (x < 0 || x > width || y < 0 || y > height)
                continue;
            // Calculate size and alpha based on distance
            const size = Math.max(0.5, (1 - star.z / 1000) * 4);
            const alpha = (1 - star.z / 1000) * config.opacity;
            // Draw star
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = withAlpha(star.color, alpha);
            ctx.fill();
            // Draw trail
            const trailLength = speed * 2;
            const prevScale = 500 / (star.z + trailLength);
            const prevX = centerX + star.x * prevScale;
            const prevY = centerY + star.y * prevScale;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = withAlpha(star.color, alpha * 0.5);
            ctx.lineWidth = size * 0.5;
            ctx.stroke();
        }
    }
    reset() {
        this.stars = [];
        this.initialized = false;
    }
}
/**
 * Album Art Visualization (static image with beat effects)
 */
class AlbumArtVisualization {
    constructor() {
        this.smoothedVolume = 0;
        this.phase = 0;
    }
    render(ctx, width, height, frequencyData, _timeDomainData, config) {
        // Calculate volume
        const average = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length;
        const normalizedVolume = (average / 255) * config.sensitivity;
        this.smoothedVolume += (normalizedVolume - this.smoothedVolume) * 0.15;
        this.phase += 0.05;
        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        // Draw pulsing background glow
        const colors = COLOR_SCHEMES[config.colorScheme];
        const glowSize = Math.min(width, height) * 0.4 * (1 + this.smoothedVolume);
        for (let i = 2; i >= 0; i--) {
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, glowSize * (1 + i * 0.3));
            const color = colors[(i + Math.floor(this.phase)) % colors.length];
            gradient.addColorStop(0, withAlpha(color, 0.3 * config.opacity));
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
        // Draw placeholder for album art
        const artSize = Math.min(width, height) * 0.5;
        const artX = (width - artSize) / 2;
        const artY = (height - artSize) / 2;
        const scale = 1 + this.smoothedVolume * 0.05;
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);
        // Draw album art placeholder (rounded square)
        const radius = 20;
        ctx.beginPath();
        ctx.roundRect(artX, artY, artSize, artSize, radius);
        ctx.fillStyle = withAlpha(colors[0], 0.2 * config.opacity);
        ctx.fill();
        ctx.strokeStyle = withAlpha(colors[0], 0.5 * config.opacity);
        ctx.lineWidth = 2;
        ctx.stroke();
        // Draw music note icon in center
        ctx.fillStyle = withAlpha('#fff', 0.5 * config.opacity);
        ctx.font = `${artSize * 0.3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♪', width / 2, height / 2);
        ctx.restore();
    }
    reset() {
        this.smoothedVolume = 0;
        this.phase = 0;
    }
}
/**
 * Singleton Visualizer Service
 */
export class VisualizerService {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.config = { ...DEFAULT_VISUALIZER_CONFIG };
        this.animationId = null;
        this.isRunning = false;
        this.strategies = new Map();
        this.currentStrategy = null;
        // Initialize strategies
        this.strategies.set('gradient-pulse', new GradientPulseVisualization());
        this.strategies.set('particles', new ParticleVisualization());
        this.strategies.set('spectrogram', new SpectrogramVisualization());
        this.strategies.set('warp', new WarpVisualization());
        this.strategies.set('album-art', new AlbumArtVisualization());
    }
    /**
     * Gets the singleton instance
     */
    static getInstance() {
        if (!VisualizerService.instance) {
            VisualizerService.instance = new VisualizerService();
        }
        return VisualizerService.instance;
    }
    /**
     * Sets the canvas element
     */
    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // Handle high DPI displays
        this.handleResize();
    }
    /**
     * Handles canvas resize
     */
    handleResize() {
        if (!this.canvas)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        if (this.ctx) {
            this.ctx.scale(dpr, dpr);
        }
    }
    /**
     * Gets current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Updates configuration
     */
    setConfig(config) {
        const previousMode = this.config.mode;
        this.config = { ...this.config, ...config };
        // Reset strategy if mode changed
        if (config.mode && config.mode !== previousMode) {
            this.currentStrategy?.reset?.();
            this.currentStrategy = this.strategies.get(this.config.mode) || null;
        }
        // Apply blur filter
        if (this.ctx && config.blur !== undefined) {
            this.ctx.filter = config.blur > 0 ? `blur(${config.blur}px)` : 'none';
        }
    }
    /**
     * Starts the visualization loop
     */
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.currentStrategy = this.strategies.get(this.config.mode) || null;
        this.render();
    }
    /**
     * Stops the visualization loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    /**
     * Main render loop
     */
    render() {
        if (!this.isRunning || !this.canvas || !this.ctx || !this.currentStrategy) {
            return;
        }
        const audioService = getAudioService();
        const frequencyData = audioService.getFrequencyData();
        const timeDomainData = audioService.getTimeDomainData();
        const rect = this.canvas.getBoundingClientRect();
        this.currentStrategy.render(this.ctx, rect.width, rect.height, frequencyData, timeDomainData, this.config);
        this.animationId = requestAnimationFrame(() => this.render());
    }
    /**
     * Sets the visualization mode
     */
    setMode(mode) {
        this.setConfig({ mode });
    }
    /**
     * Gets available visualization modes
     */
    getAvailableModes() {
        return Array.from(this.strategies.keys());
    }
    /**
     * Clears the canvas
     */
    clear() {
        if (!this.canvas || !this.ctx)
            return;
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, rect.width, rect.height);
    }
    /**
     * Disposes of resources
     */
    dispose() {
        this.stop();
        this.clear();
        this.canvas = null;
        this.ctx = null;
        // Reset all strategies
        this.strategies.forEach((strategy) => strategy.reset?.());
    }
}
// Export singleton instance getter
export const getVisualizerService = () => VisualizerService.getInstance();
//# sourceMappingURL=visualizer-service.js.map