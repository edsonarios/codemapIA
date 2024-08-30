'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { paramViewPageName } from '@/components/utils/constants'
import { getNameRepository } from '@/components/utils/utils'
import { API_URL } from './view/utils/utils'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import Profile from './profile'

export interface Repository {
  name: string
  url: string
  description: string
}
export default function Home() {
  const { data: session, status, update } = useSession()
  const [analyzedRepos, setAnalyzedRepos] = useState<Repository[]>([])
  const [repoUrl, setRepoUrl] = useState(
    'https://github.com/midudev/hackaton-vercel-2024',
  )
  const [errorRepoUrl, setErrorRepoUrl] = useState('')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRepos = async () => {
      const res = await fetch(`${API_URL}/repositories`)
      const data: Repository[] = await res.json()
      setAnalyzedRepos(data)
    }
    fetchRepos()
  }, [])

  const reviewError = () => {
    if (repoUrl === '') {
      setErrorRepoUrl('The url is required')
      return false
    }
    if (repoUrl.length > 200) {
      setErrorRepoUrl('The url is too long')
      return false
    }
    if (!repoUrl.startsWith('https://github.com/')) {
      setErrorRepoUrl('The url should be from GitHub')
      return false
    }
    return true
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!reviewError()) {
      return
    }
    setErrorRepoUrl('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/repositories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: repoUrl }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(
          `/view?${paramViewPageName}=${encodeURIComponent(data.url)}`,
        )
      } else {
        setErrorRepoUrl(data.error || 'Error')
      }
    } catch (error: any) {
      setErrorRepoUrl(error.error || 'Error')
    }
    setLoading(false)
  }

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  if (status === 'loading') return <div>Loading...</div>
  return (
    <main className="relative flex min-h-screen flex-col items-center p-24 h-full">
      <div
        onMouseEnter={toggleDropdown}
        onMouseLeave={toggleDropdown}
        className="flex flex-col items-center cursor-pointer absolute top-6 right-8 w-44"
      >
        <a
          className="flex items-center justify-center w-full text-md p-4 rounded-md hover:bg-zinc-700 "
          href={session ? '#' : '/login'}
          title="Go to Login Page"
        >
          <div className="mr-2">
            {session?.user?.image ? (
              <Image
                src={session?.user?.image || ''}
                alt="Image profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <Profile />
            )}
          </div>
          {session?.user?.name ? session?.user?.name : 'Log In'}
        </a>
        {isDropdownOpen && session && (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="block text-sm bg-red-500 rounded-md hover:bg-red-400 text-center w-full p-2"
          >
            Cerrar sesión
          </button>
        )}
      </div>

      <div className="text-center text-balance">
        <h1 className="text-6xl mt-4">CodeMap AI</h1>
        <h2 className="text-2xl mt-4 text-[#5cc8f7]">
          Intelligent mapping of code structure with detailed AI explanations
        </h2>
        <h3 className="mt-4 text-xl text-gray-500">
          Example: https://github.com/edsonarios/play-factory-dev
        </h3>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-row p-2 items-center w-full justify-center"
      >
        <h4>Url GitHub Repository</h4>
        <div className="relative w-[50%] ml-4 flex flex-col items-start">
          <input
            className="p-2 w-full text-black"
            type="text"
            value={repoUrl}
            onChange={(e) => {
              setErrorRepoUrl('')
              setRepoUrl(e.target.value)
            }}
            placeholder="https://github.com/midudev/hackaton-vercel-2024"
          />
          {errorRepoUrl !== '' && (
            <p className="text-red-500 absolute mt-11">{errorRepoUrl}</p>
          )}
          {loading && (
            <p className="text-[#5cc8f7] absolute mt-11">
              Cloning repository and analyzing it...
            </p>
          )}
        </div>
        <button
          type="submit"
          className="ml-4 p-2 bg-blue-500 hover:bg-blue-400 text-white rounded w-24 flex items-center justify-center"
        >
          {loading ? (
            <div id="spinner" className="loader ml-2"></div>
          ) : (
            'Analyze'
          )}
        </button>
      </form>

      <div>
        <div className="mt-8 w-full">
          <h4 className="text-2xl mb-4">Analyzed Repositories</h4>
          <ul className="list-disc list-inside pl-4">
            {analyzedRepos.map((repo, index) => (
              <li key={index}>
                <a
                  href={`/view?${paramViewPageName}=${getNameRepository(repo.url)}`}
                  className="text-[#5cc8f7] hover:underline"
                >
                  {`${repo.name} - ${repo.url}`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <footer className="absolute text-white text-center w-full bottom-0 p-6">
        <p className="text-center text-sm text-gray-100 mt-4">
          &copy; 2024 CodeMap IA - Edson Añawaya Rios.
        </p>
      </footer>
    </main>
  )
}
