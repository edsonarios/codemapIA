import { useEffect, useState } from 'react'
import { ColapseIcon } from '../icons/colapse'
import { MonacoEditor } from '../utils/MonacoEditor'
import {
  IRepositoryStore,
  useRepositoryStore,
} from '@/components/store/repositoryStore'
import { API_URL } from '../utils/utils'

export function PanelInformation({
  keyInfoPanel,
  setKeyInfoPanel,
  apiKey,
}: {
  keyInfoPanel: string | null
  setKeyInfoPanel: (key: string | null) => void
  apiKey: string
}) {
  const { contentFiles, fileDetails, setFileDetails, structure, dataId } =
    useRepositoryStore<IRepositoryStore>((state) => state)
  const [codeContent, setCodeContent] = useState<string>('')
  const [detailByIA, setDetailByIA] = useState<string>('')
  const [loading, setLoading] = useState(false)

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
          messages: [
            {
              role: 'user',
              content: `Tengo un proyecto con la siguiente estructura:
${structure}
Quiero que me expliques el archivo ${nameFile} cuyo contenido es:
${contentFile}
Primero, dame un breve resumen del archivo. Luego, explica su relación y propósito dentro del proyecto en general.
Asegurate de responderme en formato html como en el ejemplo que te mandare a continuacion.
Este es un ejemplo de output que quiero,
<div>
  <p>
    El archivo <strong>tsconfig.json</strong> configura el compilador TypeScript para el proyecto.
  </p>
  <br />

  <h3><strong>Opciones Principales:</strong></h3>
  <ul>
    <li><strong>allowJs:</strong> Permite compilar JavaScript.</li>
    <li><strong>strict:</strong> Activa verificaciones estrictas.</li>
    <li><strong>target:</strong> Compila a ECMAScript 2022.</li>
    <li><strong>lib:</strong> Usa bibliotecas de ECMAScript 2023.</li>
    <li><strong>moduleResolution:</strong> Estrategia de resolución de módulos Node.</li>
  </ul>
  <br />

  <h3><strong>Exclusiones:</strong></h3>
  <ul>
    <li>Excluye <strong>node_modules</strong> y <strong>cdk.out</strong>.</li>
  </ul>
  <br />

  <h3><strong>Relación con el Proyecto:</strong></h3>
  <p>
    <strong>tsconfig.json</strong> asegura que el código TypeScript se compile correctamente, siguiendo los estándares del proyecto.
  </p>
  <br />
  <ul>
    <li>Compila de manera consistente los archivos en <strong>src/</strong> y <strong>cdk/</strong>.</li>
    <li>Facilita el uso de decoradores y metadatos para funcionalidades avanzadas.</li>
  </ul>
</div>`,
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
  if (!keyInfoPanel) return null

  return (
    <div
      id="info-panel"
      className="absolute right-0 top-0 h-full w-1/3 bg-[#353847] p-4 border-l-2 z-10"
    >
      <div className="relative w-full h-full">
        <div className="sticky right-0 top-0">
          <div className="flex flex-row items-center align-middle">
            <button
              className="transition-transform duration-300 hover:bg-gray-300 hover:-translate-y-[1px] hover:translate-x-[1px] hidden md:block rounded-md p-1"
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
          <h4 className="text-xs mt-1 text-gray-200">
            Using ChatGPT, model: gpt-3.5-turbo-0125
          </h4>
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
