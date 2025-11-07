import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const testUsers = [
      {
        nom: 'Alice',
        prenom: 'Wonder',
        email: 'alice@example.com',
        password: 'password123',
      },
      {
        nom: 'Bob', 
        prenom: 'Builder',
        email: 'bob@example.com',
        password: 'password123',
      }
    ]

    for (const userData of testUsers) {
      const existingUser = await User.findBy('email', userData.email)
      
      if (!existingUser) {
        // ✅ UTILISE SCrypt POUR LE HASH
        await User.create({
          ...userData,
          password: await hash.use('scrypt').make(userData.password),
          verified: true,
        })
        console.log(`✅ ${userData.nom} créé(e)`)
      } else {
        console.log(`⏭️ ${userData.nom} existe déjà`)
      }
    }
  }
}