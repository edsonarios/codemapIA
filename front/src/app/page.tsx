'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { paramViewPageName } from '@/components/utils/constants'
import { API_URL } from './view/utils/utils'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import Profile from './profile'
import UserLoged from './login/icons/userLoged'
import { Repository } from './view/interface/repository.interface'
import { User } from './view/interface/user.interface'
import RepositoryCard from './components/repositoryCard'
import AOS from 'aos'
import 'aos/dist/aos.css'
import ModalOptionsRepository from './components/modalOptionsRepository'
import {
  IRepositoryStore,
  useRepositoryStore,
} from '@/components/store/repositoryStore'

export default function Home() {
  const { analyzedRepos, setAnalyzedRepos } =
    useRepositoryStore<IRepositoryStore>((state) => state)
  const { data: session, status } = useSession()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [repoUrl, setRepoUrl] = useState('')
  const [errorRepoUrl, setErrorRepoUrl] = useState('')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRepos = async () => {
      if (status === 'loading') return
      // console.log('session', session)
      if (session?.user?.email) {
        const userId = (session.user as any).id || ''
        const userResponse = await fetch(`${API_URL}/users/${userId}`)
        const user = (await userResponse.json()) as User
        setCurrentUser(user)

        const res = await fetch(`${API_URL}/repositories/${userId}`)
        const data: Repository[] = await res.json()
        setAnalyzedRepos(data)
      } else {
        const res = await fetch(`${API_URL}/repositories`)
        const data: Repository[] = await res.json()
        setAnalyzedRepos(data)
      }
    }
    fetchRepos()
  }, [session])

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
      let userId: string | null = null
      if (session) {
        userId = (session?.user as any).id || ''
      }
      const res = await fetch(`${API_URL}/repositories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: repoUrl, userId }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/view?${paramViewPageName}=${data.id}`)
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

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    })
  }, [])

  if (status === 'loading') return <div>Loading...</div>
  return (
    <main className="relative flex min-h-screen flex-col items-center p-24 h-full">
      <div
        onMouseEnter={toggleDropdown}
        onMouseLeave={toggleDropdown}
        className="flex flex-col items-center cursor-pointer absolute top-6 right-8 w-40"
      >
        <a
          className="flex items-center justify-center w-full text-md p-4 rounded-md hover:bg-zinc-700 "
          href={session ? '#' : '/login'}
          // title="Go to Login Page"
        >
          <div className="mr-2">
            {session?.user?.name && session?.user?.image ? (
              <Image
                src={session?.user?.image || ''}
                alt="Image profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : session?.user?.name ? (
              <UserLoged className="stroke-green-700" />
            ) : (
              <Profile />
            )}
          </div>
          {session?.user?.name ? session?.user?.name : 'Log In'}
        </a>
        {isDropdownOpen && session && (
          <button
            onClick={() => signOut({ redirect: false })}
            className="block text-sm bg-red-500 rounded-md hover:bg-red-400 text-center w-full p-2"
          >
            Sign Out
          </button>
        )}
      </div>

      <div className="text-center text-balance">
        <h1 className="text-6xl mt-4" data-aos="fade-down">
          CodeMap AI
        </h1>
        <h2 className="text-2xl mt-4 text-[#5cc8f7]" data-aos="fade-down">
          Intelligent mapping of code structure with detailed AI explanations
        </h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-row p-2 items-center w-full justify-center mt-6"
        data-aos="fade-in"
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
          className={`ml-4 p-2 text-white rounded w-24 flex items-center justify-center ${currentUser && analyzedRepos.length >= currentUser.allowedRepos ? 'bg-gray-500 hover:bg-gray-400' : 'bg-blue-500 hover:bg-blue-400'}`}
          disabled={
            !!(currentUser && analyzedRepos.length >= currentUser.allowedRepos)
          }
          title={`${currentUser && analyzedRepos.length >= currentUser.allowedRepos ? 'You have reached the limit of repositories' : 'Analyze repository'}`}
        >
          {loading ? (
            <div id="spinner" className="loader ml-2"></div>
          ) : (
            'Analyze'
          )}
        </button>
      </form>

      <div className="w-full mt-8 mb-8">
        <h4 className="text-center text-2xl mb-4" data-aos="fade-zoom-in">
          {session ? 'Our Repositories' : 'Public Analized Repositories'}
          <span className="text-sm text-gray-500">
            {session && currentUser
              ? ` (Max repositories allowed: ${currentUser.allowedRepos})`
              : ''}
          </span>
        </h4>
        <div className="w-full flex flex-wrap justify-start">
          {analyzedRepos.map((repo, index) => (
            <div key={index} className="p-2" data-aos="fade-left">
              <RepositoryCard repo={repo} session={session} />
            </div>
          ))}
        </div>
      </div>

      <footer className="absolute text-white text-center w-full bottom-0 p-6">
        <p className="text-center text-sm text-gray-100">
          &copy; 2024 CodeMap IA - Edson Añawaya Rios.
        </p>
      </footer>
      <ModalOptionsRepository />
    </main>
  )
}
