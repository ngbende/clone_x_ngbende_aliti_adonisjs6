import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const testUsers = [
      {
        nom: 'Alice',
        prenom: 'Wonder', 
        email: 'alice@gmail.com',
        password: 'password123',
      },
      {
        nom: 'Bob',
        prenom: 'Builder',
        email: 'bob@gmail.com',
        password: 'password123',
      }
    ]

    for (const userData of testUsers) {
      const existingUser = await User.findBy('email', userData.email)
      
      if (existingUser) {
        await existingUser.delete()
        console.log(`🗑️ ${userData.nom} supprimé(e)`)
      }

      // ✅ CORRECTION : Utilisez hash.make() au lieu de hash.use('scrypt').make()
      await User.create({
        ...userData,
        password: await hash.make(userData.password), // ← CHANGEMENT ICI
        verified: true,
      })
      console.log(`✅ ${userData.nom} créé(e) avec hash standard`)
    }
  }
}