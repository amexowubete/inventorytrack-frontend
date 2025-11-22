import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './', // tell Vite to use the root folder
  plugins: [react()]
})
