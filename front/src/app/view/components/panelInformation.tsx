import { useEffect, useRef, useState } from 'react'
import { ColapseIcon } from '../icons/colapse'
import { MonacoEditor } from '../utils/MonacoEditor'
import {
  IRepositoryStore,
  useRepositoryStore,
} from '@/components/store/repositoryStore'
import { API_URL } from '../utils/utils'
import { OpenAIChatModelId } from '@ai-sdk/openai/internal'
import { getExplainPrompt } from './prompt'

const modelOptions: OpenAIChatModelId[] = [
  'gpt-3.5-turbo',
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4',
  'gpt-4-turbo',
]

const languageOptions = ['EN', 'ES']

export function PanelInformation({
  keyInfoPanel,
  setKeyInfoPanel,
  apiKey,
}: {
  keyInfoPanel: string | null
  setKeyInfoPanel: (key: string | null) => void
  apiKey: string
}) {
  const {
    contentFiles,
    fileDetails,
    setFileDetails,
    structure,
    dataId,
    modelIA,
    setModelIA,
    panelWidth,
    setPanelWidth,
    language,
    setLanguage,
  } = useRepositoryStore<IRepositoryStore>((state) => state)

  const [codeContent, setCodeContent] = useState<string>('')
  const [detailByIA, setDetailByIA] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [size, setSize] = useState(panelWidth)

  //! Update content by keyInfoPanel
  useEffect(() => {
    if (keyInfoPanel && keyInfoPanel in contentFiles) {
      setCodeContent(contentFiles[keyInfoPanel] || '')
      setDetailByIA(fileDetails[keyInfoPanel] || '')
    }
  }, [keyInfoPanel])

  const handledGetDetailsByIA = async (force = false) => {
    setLoading(true)
    if (!keyInfoPanel) return
    const details = fileDetails[keyInfoPanel]
    if (force) setDetailByIA(' ')
    if (!details || force) {
      const nameFile = keyInfoPanel
      const contentFile = contentFiles[keyInfoPanel]
      //! Get details by IA
      const response = await fetch('/api/ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          modelIA,
          messages: [
            {
              role: 'user',
              content: getExplainPrompt(
                language,
                structure,
                nameFile,
                contentFile,
              ),
            },
          ],
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setLoading(false)
        setDetailByIA(`<p style=color:red;>${data.error}</p>`)
        return
      }
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let detailsResponse = ''
      // let originalResponse = ''

      while (true) {
        if (!reader) continue
        const { done, value } = await reader.read()
        if (done) break
        let valueString = decoder.decode(value, { stream: true })
        // originalResponse += valueString
        valueString = valueString
          .replace(/0:\s?/g, '')
          .replace(/\n/g, '')
          .replace(/\\n/g, '')
          .replace(/"/g, '')
          .replace(/```/g, '')
          .replace(/```/g, '')
          .replace(/html/g, '')
        if (valueString.includes('d:{finishReason:stop')) {
          break
        }
        detailsResponse += valueString
        setDetailByIA(detailsResponse)
      }
      // console.log(originalResponse)
      //! Save details
      await fetch(`${API_URL}/data/${dataId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: keyInfoPanel,
          detail: detailsResponse,
        }),
      })
      setFileDetails({ ...fileDetails, [keyInfoPanel]: detailsResponse })
      setLoading(false)
    } else {
      setDetailByIA(details)
    }
  }

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setModelIA(event.target.value)
  }

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setLanguage(event.target.value)
  }

  const isResizing = useRef(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true
    e.preventDefault()
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return
    setSize((prevWidth) => {
      const newSize = Math.max(prevWidth - e.movementX, 100)

      // debounce(() => setPanelWidth(newSize), 500)
      setPanelWidth(newSize)
      return newSize
    })
  }

  const handleMouseUp = () => {
    isResizing.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  if (!keyInfoPanel) return null

  return (
    <div
      id="info-panel"
      className={`absolute right-0 top-0 h-full bg-[#353847] p-4 border-l-2 z-10`}
      style={{ width: `${size}px` }}
      data-aos="fade-left"
    >
      <div
        className="absolute right-[calc(100%-2px)] top-0 h-full w-2 hover:bg-gray-500 cursor-col-resize z-50 transition-all "
        onMouseDown={handleMouseDown}
      />
      <div className="relative w-full h-full">
        <div className="sticky right-0 top-0">
          <div className="flex flex-row items-center align-middle">
            <button
              className="transition-transform duration-300 hover:bg-gray-500 hover:-translate-y-[1px] hover:translate-x-[1px] hidden md:block rounded-md p-1"
              onClick={() => {
                setDetailByIA('')
                setKeyInfoPanel(null)
              }}
              title="Close Panel"
            >
              <ColapseIcon />
            </button>
            <h2 className="text-lg font-bold ml-4">{`File: ${keyInfoPanel}`}</h2>
          </div>
          <div className="flex flex-row items-center mt-2">
            <button
              className={`rounded-md text-white p-2
                ${
                  detailByIA !== ''
                    ? 'bg-yellow-400 hover:bg-yellow-300'
                    : 'bg-blue-500 hover:bg-blue-400'
                }`}
              onClick={() => handledGetDetailsByIA(detailByIA !== '')}
            >
              {detailByIA !== ''
                ? 'Update Explanation'
                : 'Get Explanation From File (By IA)'}
            </button>
            {loading && <div id="spinner" className="loader ml-2"></div>}
          </div>
          <div className="text-xs mt-1 text-gray-200 flex items-center">
            {/* //? Options model ChatGPT */}
            <h4>OpenAI model</h4>
            <select
              className="ml-2 p-1 rounded border border-gray-600 bg-gray-800 text-white"
              value={modelIA}
              onChange={handleModelChange}
            >
              {modelOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* //? Options language */}
            <h4 className="ml-3">Language</h4>
            <select
              className="ml-2 p-1 rounded border border-gray-600 bg-gray-800 text-white"
              value={language}
              onChange={handleLanguageChange}
            >
              {languageOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {detailByIA !== '' ? (
            <div className="bg-white p-4 mt-4 rounded shadow text-black">
              <div dangerouslySetInnerHTML={{ __html: detailByIA }} />
            </div>
          ) : (
            <div className="text-slate-300 bg-white p-4 mt-4 rounded shadow">
              <p>Get an explanation of the file using the button above...</p>
            </div>
          )}
          <h2 className="text-xl font-bold my-4">Code</h2>
          <MonacoEditor code={codeContent} />
        </div>
      </div>
    </div>
  )
}
