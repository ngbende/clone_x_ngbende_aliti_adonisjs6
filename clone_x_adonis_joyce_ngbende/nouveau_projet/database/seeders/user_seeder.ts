import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Hash from '@adonisjs/core/services/hash'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    // Créer Alice
    await User.create({
      nom: 'Alice',
      prenom: 'Wonder',
      email: 'alice@example.com',
      password: await Hash.make('password123'),
      verified: true,
    })

    // Créer Bob
    await User.create({
      nom: 'Bob',
      prenom: 'Builder',
      email: 'bob@example.com',
      password: await Hash.make('password123'),
      verified: true,
    })
  }
}
