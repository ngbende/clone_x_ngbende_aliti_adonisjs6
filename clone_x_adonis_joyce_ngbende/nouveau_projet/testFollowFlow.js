import fetch from 'node-fetch'

const API_URL = 'http://localhost:3333/api'

// Utilisateur Alice
const alice = {
  email: 'alice@example.com',
  password: 'password123',
}

async function main() {
  try {
    // 1️⃣ Connexion pour récupérer le token
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alice),
    })

    const loginData = await loginRes.json()
    const token = loginData.token
    console.log('Token Alice:', token)

    // 2️⃣ Alice suit Bob (id 2)
    const followRes = await fetch(`${API_URL}/follow/2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    console.log('Follow:', await followRes.json())

    // 3️⃣ Vérifier followings d’Alice
    const followingsRes = await fetch(`${API_URL}/users/1/followings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('Alice followings:', await followingsRes.json())

    // 4️⃣ Vérifier followers de Bob
    const followersRes = await fetch(`${API_URL}/users/2/followers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('Bob followers:', await followersRes.json())

    // 5️⃣ Alice se désabonne
    const unfollowRes = await fetch(`${API_URL}/unfollow/2`, {
      // POST /unfollow/:id
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('Unfollow:', await unfollowRes.json())

    // ✅ Re-vérification
    const followingsAfter = await fetch(`${API_URL}/users/1/followings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('Alice followings après unfollow:', await followingsAfter.json())

    const followersAfter = await fetch(`${API_URL}/users/2/followers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('Bob followers après unfollow:', await followersAfter.json())
  } catch (err) {
    console.error('Erreur:', err)
  }
}

main()

// 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
