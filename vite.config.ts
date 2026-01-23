import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import obfuscatorPlugin from 'rollup-plugin-obfuscator';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari15',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: {
        toplevel: true,
      },
    },
    rollupOptions: {
      plugins: isProduction
        ? [
            obfuscatorPlugin({
              global: true,
              options: {
                // Temel koruma
                compact: true,
                simplify: true,

                // Identifier gizleme
                identifierNamesGenerator: 'hexadecimal',
                renameGlobals: false,

                // String koruma (orta seviye)
                stringArray: true,
                stringArrayEncoding: ['base64'],
                stringArrayThreshold: 0.5,
                stringArrayRotate: true,
                stringArrayShuffle: true,
                splitStrings: true,
                splitStringsChunkLength: 15,

                // Control flow (hafif)
                controlFlowFlattening: false, // Performans için kapalı

                // Dead code (hafif)
                deadCodeInjection: false, // Boyut için kapalı

                // Debug koruma
                debugProtection: false, // Dev tools için kapalı
                disableConsoleOutput: true,

                // Diğer
                selfDefending: false,
                transformObjectKeys: false,
                unicodeEscapeSequence: false,
              },
            }),
          ]
        : [],
    },
  },
});
