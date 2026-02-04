import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    adonisjs({
      entrypoints: ['resources/css/app.css', 'resources/js/app.js'],
      reload: ['resources/views/**/*.edge'],
    }),
  ],
  server: {
    host: true, // obligatoire pour accepter tous les hosts
    allowedHosts: [
      'clone-x-ngbende-aliti-adonisjs6.onrender.com', // ton domaine Render
      'localhost', // si tu veux tester localement
    ],
  },
})
