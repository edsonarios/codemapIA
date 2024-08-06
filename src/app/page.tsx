'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { paramViewPageName } from '@/components/utils/constants'
import { getNameRepository } from '@/components/utils/utils'

export interface Repository {
  name: string
  url: string
  description: string
}

export default function Home() {
  const [analyzedRepos, setAnalyzedRepos] = useState<Repository[]>([])
  const [repoUrl, setRepoUrl] = useState('')
  const [errorRepoUrl, setErrorRepoUrl] = useState('')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRepos = async () => {
      const res = await fetch('/api/allRepositories')
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
    setLoading(true)
    try {
      const res = await fetch('/api/allRepositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: repoUrl }),
      })
      console.log(res)
      const data = await res.json()
      console.log(data)
      if (res.status === 200) {
        // console.log('ok')
        router.push(
          `/view?${paramViewPageName}=${encodeURIComponent(data.url)}`,
        )
      } else {
        console.log(data)
        setErrorRepoUrl(data.error || 'Error')
      }
    } catch (error: any) {
      console.log(error)
      setErrorRepoUrl(error.error || 'Error')
    }
    setLoading(false)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center p-24 h-full">
      <div className="text-center text-balance">
        <h1 className="text-6xl mt-4">CodeMap AI</h1>
        <h2 className="text-2xl mt-4 text-[#5cc8f7]">
          Intelligent mapping of code structure with detailed AI explanations
        </h2>
        <h3 className="mt-4 text-xl text-gray-500">
          Paste your GitHub repository URL to analyze its code structure. If the
          repository has been previously analyzed, you can view the results
          instantly.
        </h3>
        <h3 className="mt-4 text-xl text-gray-500">
          Example: https://github.com/midudev/hackaton-vercel-2024
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
          {/* Analyze */}
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
        <p className="text-center text-sm text-gray-100">
          &copy; 2024 CodeMap IA - Edson Añawaya Rios.
        </p>
      </footer>
    </main>
  )
}
