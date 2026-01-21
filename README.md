# Infinite Vibes DJ

A real-time generative music DJ application powered by Google Gemini Live API. Create endless, evolving soundscapes using AI-generated audio, with intuitive controls and stunning visualizations.

## Features

- **AI-Powered Music Generation**: Connect to Google Gemini's native audio model to generate continuous, rhythmic music
- **Prompt-Based Control**: Add "stems" or prompts to shape the music (e.g., "Deep House Bass", "Ethereal Vocals")
- **Weight Sliders**: Control the intensity of each musical element with smooth sliders
- **The Conductor**: Natural language chat interface to steer the music ("Make it jazzier", "Drop the bass")
- **Multiple Visualizations**: Choose from 5 visualization modes:
  - Gradient Pulse
  - Particle System
  - Spectrogram
  - Warp (Starfield)
  - Album Art
- **Preset Library**: Quick-start with curated musical presets
- **Gapless Playback**: Smooth, uninterrupted audio streaming
- **UI Auto-Hide**: Immersive experience with auto-fading controls

## Tech Stack

- **Language**: TypeScript
- **UI Framework**: Lit (Web Components)
- **Build**: Browser-native ES Modules via esm.sh
- **API**: Google Gemini Live API (`@google/generative-ai`)
- **Audio**: Web Audio API with scheduled playback
- **Styling**: CSS with glassmorphism aesthetic

## Getting Started

### Prerequisites

- Node.js 18+ (for development)
- A Google AI API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/infinite-vibes.git
   cd infinite-vibes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript:
   ```bash
   npm run build
   ```

4. Serve the application:
   ```bash
   npm run serve
   ```

5. Open your browser to `http://localhost:3000`

6. Enter your Google AI API key when prompted

### Development

Run in watch mode for development:
```bash
npm run dev
```

This will:
- Watch TypeScript files for changes and recompile
- Serve the application locally

## Project Structure

```
infinite-vibes/
├── index.html          # Entry HTML with import maps
├── index.ts            # Application entry point
├── index.css           # Global styles
├── types.ts            # TypeScript interfaces
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── utils/              # Utility functions
│   ├── audio.ts        # PCM decoding and AudioBuffer creation
│   ├── color.ts        # Color manipulation
│   ├── constants.ts    # App constants and presets
│   ├── storage.ts      # LocalStorage wrappers
│   └── throttle.ts     # Throttle/debounce utilities
├── services/           # Singleton services
│   ├── api-service.ts          # Gemini Live API connection
│   ├── audio-service.ts        # AudioContext and playback
│   ├── visualizer-service.ts   # Canvas visualizations
│   ├── chat-service.ts         # Natural language processing
│   ├── image-generation-service.ts  # Album art generation
│   ├── inspiration-service.ts  # Preset management
│   └── inactivity-service.ts   # UI auto-hide
├── core/               # Business logic
│   └── prompt-dj-orchestrator.ts  # Central state management
└── components/         # Lit Web Components
    ├── prompt-dj.ts           # Main container
    ├── visualizer-canvas.ts   # Visualization renderer
    ├── prompt-controller.ts   # Prompt pill with slider
    ├── playback-controls.ts   # Play/pause/stop controls
    ├── chat-conductor.ts      # Chat interface
    ├── settings-dialog.ts     # Settings panel
    ├── inspiration-panel.ts   # Preset browser
    └── api-key-dialog.ts      # Initial setup
```

## Architecture

The application follows a **Service-Oriented Architecture**:

- **Services**: Singleton classes managing external APIs and browser APIs
- **Core**: Orchestration layer connecting UI to services
- **Components**: Lit web components for the UI
- **Utils**: Pure helper functions

### Key Concepts

**Gapless Audio Playback**: Audio chunks from the API are decoded and scheduled using `AudioBufferSourceNode.start(time)` with a look-ahead buffer to prevent gaps.

**Prompt Weighting**: Each prompt has a weight (0.0-2.0) that affects its prominence in the generated audio. Changes are debounced and sent to the API as text instructions.

**The Conductor**: Natural language requests are processed by Gemini Flash, which returns JSON actions to modify the prompt list.

## Usage

1. **Add Prompts**: Click "Add Prompt" to add musical elements
2. **Adjust Weights**: Click a prompt pill to expand the slider
3. **Start Playing**: Press the play button to begin generating
4. **Use The Conductor**: Open the chat panel and describe changes naturally
5. **Try Presets**: Open Inspiration panel for quick-start vibes
6. **Customize**: Adjust settings for BPM, key, scale, and visualizations

## API Configuration

The application uses the Google Gemini API with these models:

- **Audio Generation**: `gemini-2.5-flash-preview-native-audio-dialog`
- **Chat/NLP**: `gemini-2.0-flash`
- **Image Generation**: `gemini-2.0-flash-exp`

## Browser Support

- Chrome 90+
- Edge 90+
- Firefox 90+
- Safari 15.4+

Requires support for:
- ES2022 modules
- Web Audio API
- Canvas 2D
- WebSocket

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with [Lit](https://lit.dev/)
- Powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- ES modules via [esm.sh](https://esm.sh/)
