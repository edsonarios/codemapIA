'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Google from './icons/google'
import Github from './icons/github'
import { ring } from 'ldrs'
import User from './icons/user'
import Password from './icons/password'
import { BuiltInProviderType } from 'next-auth/providers/index'
import { useRouter } from 'next/navigation'
import BackHome from '@/components/backHome'
import { API_URL } from '../view/utils/utils'
import Email from './icons/email'
import { Toaster, toast } from 'sonner'
ring.register()

export default function Login() {
  const router = useRouter()
  // Sign up
  const [register, setRegister] = useState(false)
  const [nameRegister, setNameRegister] = useState('')
  const [emailRegister, setEmailRegister] = useState('')
  const [passwordRegister, setPasswordRegister] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [errorRepeat, setErrorRepeat] = useState('')
  // Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async (provider: BuiltInProviderType) => {
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
      // setError(result.error)
      toast.error(result.error || 'Sign in failed')
    } else {
      setError('')
      if (provider === 'credentials') {
        router.push(`/`)
      }
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (password !== repeatPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nameRegister,
          email: emailRegister,
          password: passwordRegister,
          provider: 'credentials',
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.message || 'Sign up failed')
        return
      }
      toast.success(data.message)
      setEmailRegister('')
      setPasswordRegister('')
      setRepeatPassword('')
      setErrorRepeat('')
      setRegister(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRepeatPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRepeatPassword(e.target.value)
    if (e.target.value === '') {
      setErrorRepeat('')
      return
    }
    if (e.target.value !== password) {
      setErrorRepeat('Passwords do not match')
    } else {
      setErrorRepeat('')
    }
  }

  return (
    <div className="relative flex justify-center h-screen">
      <BackHome />
      <div
        className={`${register ? 'h-[750px]' : 'h-[520px]'} relative w-[450px] rounded flex items-center justify-center overflow-hidden shadow-md shadow-slate-700`}
        style={{
          marginTop: 'calc(40vh - 20%)',
        }}
      >
        <div className="absolute z-10 size-full p-8 text-gray-100 space-y-4">
          <h1 className="text-2xl font-bold text-center ">Code Map - Login</h1>
          {/* Tab Login or Register */}
          <div className="flex justify-around w-full bg-slate-500 rounded-md">
            <button
              onClick={() => setRegister(false)}
              className={`w-full p-2 text-white ${
                !register ? 'bg-blue-600' : 'bg-slate-600 hover:bg-blue-500'
              } rounded-l-lg transition-colors duration-300`}
            >
              Login
            </button>
            <button
              onClick={() => setRegister(true)}
              className={`w-full p-2 text-white ${
                register ? 'bg-blue-600' : 'bg-slate-400 hover:bg-blue-500'
              } rounded-r-lg transition-colors duration-300`}
            >
              Sign up
            </button>
          </div>

          {register ? (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                handleSignUp()
              }}
            >
              <div>
                <label className="block text-sm font-medium ">Username</label>
                <div className="flex items-center h-10 rounded border-2 border-gray-600">
                  <div className="bg-slate-600 h-full flex items-center justify-center w-10">
                    <User className="size-5 stroke-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={nameRegister}
                    onChange={(e) => setNameRegister(e.target.value)}
                    className="text-black w-full h-full border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-300 p-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium ">Email</label>
                <div className="flex items-center h-10 rounded border-2 border-gray-600">
                  <div className="bg-slate-600 h-full flex items-center justify-center w-10">
                    <Email className="size-5 stroke-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={emailRegister}
                    onChange={(e) => setEmailRegister(e.target.value)}
                    className="text-black w-full h-full border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-300 p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium ">Password</label>
                <div className="flex items-center h-10 rounded border-2 border-gray-600">
                  <div className="bg-slate-600 h-full flex items-center justify-center w-10">
                    <Password className="size-5 stroke-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={passwordRegister}
                    onChange={(e) => setPasswordRegister(e.target.value)}
                    className="text-black w-full h-full border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-300 p-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium ">
                  Repeat Password
                </label>
                <div className="flex items-center h-10 rounded border-2 border-gray-600">
                  <div className="bg-slate-600 h-full flex items-center justify-center w-10">
                    <Password className="size-5 stroke-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={repeatPassword}
                    onChange={handleRepeatPasswordChange}
                    className="text-black w-full h-full border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-300 p-2"
                    required
                  />
                </div>
                {errorRepeat ? (
                  <p className="text-red-500 text-xs mt-1">{errorRepeat}</p>
                ) : (
                  <p className="text-xs text-transparent mt-1">_</p>
                )}
              </div>

              <button
                type="submit"
                className={`${errorRepeat !== '' ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'}  w-full text-white font-bold py-2 px-4 rounded`}
                disabled={errorRepeat !== ''}
              >
                Sign up
              </button>
              {error && <p className="text-red-500">{error}</p>}
            </form>
          ) : (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                login('credentials')
              }}
            >
              <div>
                <label className="block text-sm font-medium ">Email</label>
                <div className="flex items-center h-10 rounded border-2 border-gray-600">
                  <div className="bg-slate-600 h-full flex items-center justify-center w-10">
                    <User className="size-5 stroke-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-black w-full h-full border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-300 p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium ">Password</label>
                <div className="flex items-center h-10 rounded border-2 border-gray-600">
                  <div className="bg-slate-600 h-full flex items-center justify-center w-10">
                    <Password className="size-5 stroke-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-black w-full h-full border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-300 p-2"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Log in
              </button>
              {error && <p className="text-red-500">{error}</p>}
            </form>
          )}
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
      <Toaster position="bottom-center" richColors closeButton />
    </div>
  )
}
