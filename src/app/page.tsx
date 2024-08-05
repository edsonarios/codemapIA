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
  const router = useRouter()

  useEffect(() => {
    const fetchRepos = async () => {
      const res = await fetch('/api/allRepositories')
      const data: Repository[] = await res.json()
      setAnalyzedRepos(data)
    }
    fetchRepos()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // console.log(repoUrl)
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
        alert(`Error to analise: ${data.url}`)
      }
    } catch (error) {
      console.error('Error analyzing repository:', error)
      alert('Error analyzing repository')
    }
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
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-row p-2 items-center w-full justify-center"
      >
        <h4>Url Repository</h4>
        <input
          className="ml-4 p-2 w-[50%] text-black"
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/midudev/hackaton-vercel-2024"
        />
        <button
          type="submit"
          className="ml-4 p-2 bg-blue-500 hover:bg-blue-400 text-white rounded"
        >
          Analyze
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
                  target="_blank"
                  rel="noopener noreferrer"
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
