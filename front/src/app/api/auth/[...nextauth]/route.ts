import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id
      }
      return token
    },

    async session({ session, token }: any) {
      session.user.id = token.id
      return session
    },

    async signIn({ user, account }) {
      const response = await fetch(`${API_URL}/login`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: '',
          image: user.image,
          provider: account?.provider,
        }),
      })
      const data = await response.json()
      user.id = data.id
      return true
    },
  },
  pages: {
    signIn: '/login',
  },
})

export { handler as GET, handler as POST }
