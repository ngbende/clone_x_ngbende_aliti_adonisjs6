import env from '#start/env'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(env.get('SENDGRID_API_KEY')!)

export default sgMail
// Configure SendGrid mail client with API key from environment variables
