import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  envPrefix: ['NEXT_PUBLIC_', 'VITE_APP_'],
  plugins: [react(), tsconfigPaths()],
  define: {
    'process.env.NEXT_PUBLIC_IS_DESKTOP_APP': '"1"',
  },
});
