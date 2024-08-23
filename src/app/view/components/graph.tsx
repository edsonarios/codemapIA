'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PanelInformation } from './panelInformation'
import {
  IRepositoryStore,
  useRepositoryStore,
} from '@/components/store/repositoryStore'
import { paramViewPageName } from '@/components/utils/constants'
import { Flow } from './flow'
import { Toaster, toast } from 'sonner'

export default function GraphPage() {
  const searchParams = useSearchParams()
  const paramRepository = searchParams.get(paramViewPageName) as string
  const {
    setParamRepoName,
    storeNodesAndEdges,
    setStoreNodesAndEdges,
    isDisableButton,
    setIsDisableButton,
  } = useRepositoryStore<IRepositoryStore>((state) => state)
  const [panelInfo, setPanelInfo] = useState<string | null>(null)

  const [apiKeyValue, setApiKeyValue] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  const handleApiKeySubmit = (event: any) => {
    event.preventDefault()
    if (apiKeyValue === '') {
      setError('API Key is required')
      return
    }
    if (apiKeyValue.length > 200) {
      setError('API Key is too long')
      return
    }
    localStorage.setItem('OPENAI_API_KEY', apiKeyValue)
    setApiKey(apiKeyValue)
  }

  useEffect(() => {
    const fetchStructure = async () => {
      // console.log(paramRepository)
      try {
        const res = await fetch(
          `/api/nodesAndEdges?${paramViewPageName}=${encodeURIComponent(paramRepository)}`,
        )
        // console.log(res)
        if (!res.ok) {
          console.error('Error fetching structure:', res)
          return
        }
        const nodesAndEdgesResponse = await res.json()
        // console.log(nodesAndEdgesResponse)
        setParamRepoName(paramRepository)
        setStoreNodesAndEdges(nodesAndEdgesResponse)
      } catch (error) {
        console.error('Error fetching structure:', error)
      }
    }
    fetchStructure()
    const storedApiKey = localStorage.getItem('OPENAI_API_KEY')
    // console.log('storedApiKey', storedApiKey)
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }
  }, [])

  const saveNodesAndEdges = async () => {
    setIsDisableButton(true)
    const res = await fetch(
      `/api/nodesAndEdges?${paramViewPageName}=${encodeURIComponent(paramRepository)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: storeNodesAndEdges }),
      },
    )
    if (!res.ok) {
      toast.error('Error to save data')
      return
    }
    const data = await res.json()
    // console.log(data)
    toast.success(data.response)
  }

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 1) {
        event.preventDefault()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return (
    <section className="relative flex flex-col justify-center items-center p-4 h-full w-full">
      <PanelInformation
        keyInfoPanel={panelInfo}
        setKeyInfoPanel={setPanelInfo}
        apiKey={apiKey}
      />
      {/* Home Page Button */}
      <a
        className=" absolute top-6 left-24 text-xs text-[#5cc8f7]  p-2 border-b-2 border-[#5cc8f7] rounded-md hover:bg-zinc-700"
        href="/"
        title="Go to Home Page"
      >
        ← back to Home Page
      </a>

      <button
        type="submit"
        className={`fixed right-4 bottom-4 ${isDisableButton ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-400'} text-white p-2 rounded text-sm shadow-lg`}
        title="Save Status"
        onClick={saveNodesAndEdges}
        disabled={isDisableButton}
      >
        Save Status
      </button>

      {/* Api Key */}
      {panelInfo === null && apiKey === '' ? (
        <form
          onSubmit={handleApiKeySubmit}
          className="absolute top-0 right-0 flex flex-col items-center mt-8 mr-2"
        >
          <label htmlFor="api-key" className="text-sm mb-2 text-yellow-500">
            OpenAI API Key not found. Please enter your API Key
          </label>
          <div className="flex flex-row justify-center items-center">
            <div className="flex flex-col relative">
              <input
                type="password"
                id="api-key"
                value={apiKeyValue}
                onChange={(e) => {
                  setError('')
                  setApiKeyValue(e.target.value)
                }}
                className="p-1 border rounded text-black"
              />
              {error && (
                <p className="absolute text-red-500 text-sm mt-10">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-400 text-white p-2 ml-2 rounded text-sm"
              title="Save API Key"
            >
              Save
            </button>
          </div>
        </form>
      ) : panelInfo === null ? (
        <div className="absolute top-0 right-0 mt-12 mr-8">
          <button
            className="bg-yellow-500 hover:bg-yellow-400 text-white p-2 ml-2 rounded text-sm"
            onClick={() => {
              localStorage.removeItem('OPENAI_API_KEY')
              setApiKeyValue('')
              setApiKey('')
            }}
          >
            Remove API Key
          </button>
        </div>
      ) : null}

      <h1 className="text-4xl mt-4">CodeMap AI</h1>
      <h2 className="text-center text-xl mt-2 text-balance text-[#5cc8f7]">
        Intelligent mapping of code structure with detailed AI explanations
      </h2>
      <h3 className="text-gray-400 text-sm text-balance">
        Click on a node to see more information
      </h3>
      {storeNodesAndEdges.map((nodeAndEdge, index) => (
        <div
          key={index}
          className="w-full flex justify-center flex-col items-center"
        >
          <h2 className="text-2xl mt-4 text-center mb-2">
            {index === storeNodesAndEdges.length - 1
              ? 'Single files'
              : `Code Map, Graph ${index + 1}`}
          </h2>
          <Flow
            NodesAndEdges={nodeAndEdge}
            panelInfo={panelInfo}
            setPanelInfo={setPanelInfo}
            index={index}
          />
        </div>
      ))}
      <Toaster position="bottom-center" richColors closeButton />
    </section>
  )
}