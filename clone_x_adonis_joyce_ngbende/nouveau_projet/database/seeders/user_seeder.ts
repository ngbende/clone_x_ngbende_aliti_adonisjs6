import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class UserSeeder extends BaseSeeder {
  public async run() {
   // Dans UserSeeder
const testUsers = [
  {
    nom: 'Alice',
    prenom: 'Wonder', 
    email: 'alice@gmail.com', // ✅ Changez @example.com par @gmail.com
    password: 'password123',
  },
  {
    nom: 'Bob',
    prenom: 'Builder',
    email: 'bob@gmail.com', // ✅ Changez @example.com par @gmail.com
    password: 'password123',
  }
]

    for (const userData of testUsers) {
      // ✅ SUPPRIME d'abord l'utilisateur existant
      const existingUser = await User.findBy('email', userData.email)
      
      if (existingUser) {
        await existingUser.delete()
        console.log(`🗑️ ${userData.nom} supprimé(e)`)
      }

      // ✅ PUIS recrée avec le bon hash
      await User.create({
        ...userData,
        password: await hash.use('scrypt').make(userData.password),
        verified: true,
      })
      console.log(`✅ ${userData.nom} créé(e) avec hash scrypt`)
    }
  }
}