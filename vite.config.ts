import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  // ... your other config
  plugins: [
    // ... your other plugins
    nodePolyfills({
      // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
      include: ['process', 'crypto', 'stream', 'util'],
      globals: { global: true, process: true },
    }),
  ],
})