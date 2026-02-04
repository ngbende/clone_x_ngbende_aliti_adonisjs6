import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
// ⚠️ SUPPRIME l'import de hash

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const testUsers = [
      {
        nom: 'Alice',
        prenom: 'Wonder', 
        email: 'alice@gmail.com',
        password: 'password123', // ✅ Reste en clair
      },
      {
        nom: 'Bob',
        prenom: 'Builder',
        email: 'bob@gmail.com',
        password: 'password123', // ✅ Reste en clair
      }
    ]

    for (const userData of testUsers) {
      const existingUser = await User.findBy('email', userData.email)
      
      if (existingUser) {
        await existingUser.delete()
        console.log(`🗑️ ${userData.nom} supprimé(e)`)
      }

      // ✅ SOLUTION FINALE : PAS de hash.make(), laisse AdonisJS gérer
      await User.create({
        ...userData,
        // ⚠️ SUPPRIME cette ligne : password: await hash.make(userData.password),
        verified: true,
      })
      console.log(`✅ ${userData.nom} créé(e) - AdonisJS gère le hash automatiquement`)
    }
  }
}