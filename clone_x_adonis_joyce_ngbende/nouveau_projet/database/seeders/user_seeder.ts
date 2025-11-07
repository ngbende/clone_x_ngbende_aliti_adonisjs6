import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Hash from '@adonisjs/core/services/hash'

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
      // Vérifie si l'utilisateur existe déjà
      const existingUser = await User.findBy('email', userData.email)
      
      if (!existingUser) {
        await User.create({
          ...userData,
          password: await Hash.make(userData.password),
          verified: true,
        })
        console.log(`✅ ${userData.nom} créé(e)`)
      } else {
        console.log(`⏭️ ${userData.nom} existe déjà`)
      }
    }
  }
}