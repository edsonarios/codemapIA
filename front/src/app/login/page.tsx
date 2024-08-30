'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Google from './icons/google'
import Github from './icons/github'
import { ring } from 'ldrs'
ring.register()

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async (provider: string) => {
    setLoading(true)
    let result
    if (provider === 'credentials') {
      result = await signIn(provider, {
        redirect: false,
        email,
        password,
        callbackUrl: '/',
      })
    } else {
      result = await signIn(provider, {
        callbackUrl: '/',
      })
    }

    if (result?.error) {
      setError(result.error)
    } else {
      setError('')
    }
    setLoading(false)
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative h-[520px] w-[400px] rounded flex items-center justify-center overflow-hidden shadow-md shadow-slate-700">
        <div className="absolute z-10 size-full p-8 text-gray-100 space-y-4">
          <h1 className="text-2xl font-bold text-center ">Code Map - Login</h1>
          {/* Formulario clásico de usuario y contraseña */}
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              login('credentials')
            }}
          >
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label className="block text-sm font-medium ">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium ">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Log in
            </button>
          </form>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-gray-400">------------ o ------------</span>
          </div>
          {/* Other platforms */}
          <div className="flex flex-col space-y-4">
            <button
              onClick={(e) => {
                e.preventDefault()
                login('github')
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 font-bold rounded flex items-center border-gray-500 border-2"
            >
              <div className="h-full p-2">
                <Github />
              </div>
              <div className="w-full text-center">Sign up with GitHub</div>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault()
                login('google')
              }}
              className="w-full bg-red-500 hover:bg-red-400 font-bold rounded flex items-center border-red-500 border-2"
            >
              <div className=" bg-white h-full p-2">
                <Google className="" />
              </div>
              <div className="w-full text-center">Sign up with Google</div>
            </button>
          </div>
          {loading && (
            <div className="flex  items-center justify-center">
              <l-ring
                size="40"
                stroke="5"
                bg-opacity="0"
                speed="2"
                color="white"
              ></l-ring>
            </div>
          )}
        </div>
        <div className="absolute w-full h-full rounded blur-3xl opacity-60  bg-gray-700 shadow-sky-600 shadow-2xl" />
      </div>
    </div>
  )
}
