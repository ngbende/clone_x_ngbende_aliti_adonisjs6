import Env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

export default defineConfig({
  default: 'sendgrid',

  from: {
    address: Env.get('MAIL_FROM_ADDRESS')!,
    name: Env.get('MAIL_FROM_NAME')!,
  },

  mailers: {
    sendgrid: transports.smtp({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false, // TLS false pour le port 587
      auth: {
        type: 'login',
        user: 'apikey', // obligatoire pour SendGrid SMTP
        pass: Env.get('SENDGRID_API_KEY')!, // ta clé API SendGrid
      },
    }),
  },
})
