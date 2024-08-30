import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import { API_URL } from '@/app/view/utils/utils'

const handler = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...credentials, provider: 'credentials' }),
        })

        const user = await response.json()
        if (!response.ok) {
          throw new Error(user.message || 'Login failed')
        }
        if (user) {
          return user
        } else {
          return null
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github') {
        await fetch(`${API_URL}/login`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            password: '',
            image: user.image,
            provider: 'github',
          }),
        })
      }

      return true
    },
  },
  pages: {
    signIn: '/login',
  },
})

export { handler as GET, handler as POST }
