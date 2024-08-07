'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import * as d3 from 'd3'
import dagreD3 from 'dagre-d3'
import graphlibDot from 'graphlib-dot'
import { convertJsonToDot, separateGraphs } from './utils'
import { PanelInformation } from './panelInformation'
import {
  IRepositoryStore,
  useRepositoryStore,
} from '@/components/store/repositoryStore'
import { paramViewPageName } from '@/components/utils/constants'

export default function GraphPage() {
  // let processDirectory = false
  const searchParams = useSearchParams()
  const paramRepository = searchParams.get(paramViewPageName) as string
  const { structure, setStructure, setParamRepoName } =
    useRepositoryStore<IRepositoryStore>((state) => state)
  const [graphs, setGraphs] = useState<Record<string, string[]>[]>([])
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

  const svgRefs = useRef<(SVGSVGElement | null)[]>([])
  const innerRefs = useRef<(SVGGElement | null)[]>([])

  const renderGraph = (
    svgRef: SVGSVGElement | null,
    innerRef: SVGGElement | null,
    graphData: Record<string, string[]>,
  ) => {
    if (!svgRef || !innerRef) return

    const svg = d3.select(svgRef)
    const inner: any = d3.select(innerRef)

    const zoom: any = d3.zoom().on('zoom', (event) => {
      inner.attr('transform', event.transform)
    })
    svg.call(zoom)

    // eslint-disable-next-line new-cap
    const render = new dagreD3.render()

    const graphDefinition = convertJsonToDot(graphData)
    const graph: any = graphlibDot.read(graphDefinition)

    render(inner, graph)

    if (
      !Object.prototype.hasOwnProperty.call(graph.graph(), 'marginx') &&
      !Object.prototype.hasOwnProperty.call(graph.graph(), 'marginy')
    ) {
      graph.graph().marginx = 20
      graph.graph().marginy = 20
    }

    graph.graph().transition = (selection: any) =>
      selection.transition().duration(500)

    inner.call(render, graph)

    //! Add title to nodes
    // svg
    //   .selectAll('g.node')
    //   .append('title')
    //   .text((d: any) => d)

    //! Click to select node to show information
    let selectedNode: any = null
    svg.selectAll('g.node').on('click', function (event, d: any) {
      const currentNode = d3.select(this).selectAll('rect')

      if (selectedNode && selectedNode.node() === currentNode.node()) {
        // * Reset selected node color
        currentNode.style('fill', '#fff').style('stroke', '#fff')
        selectedNode = null
        setPanelInfo(null)
      } else {
        // * Reset all nodes color
        svg
          .selectAll('g.node rect')
          .style('fill', '#fff')
          .style('stroke', '#fff')

        // * Style selected node
        currentNode.style('fill', '#5cc8f7').style('stroke', '#5cc8f7')
        selectedNode = currentNode

        setPanelInfo(d)
      }
    })

    //! Hover effect
    svg
      .selectAll('g.node')
      .on('mouseover', function (event, d: any) {
        // * Change connection opacity
        svg
          .selectAll('g.edgePath path')
          .filter(function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const edge: any = d3.select(this.parentNode).datum()
            // * Style No parent node
            d3.select(this).style('opacity', 0.2)
            return edge.v === d || edge.w === d
          })
          // * Style Parent node
          .style('opacity', 1)
          .style('stroke', '#fff')
          .style('stroke-width', '3px')
        // * Ignore selected node
        if (
          selectedNode &&
          selectedNode.node() === d3.select(this).select('rect').node()
        ) {
          return
        }

        // * Change node color on hover
        d3.select(this)
          .select('rect')
          .style('fill', '#999')
          .style('stroke', '#999')
      })
      .on('mouseout', function (event, d) {
        // * Reset connection opacity
        svg
          .selectAll('g.edgePath path')
          .filter(function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const edge: any = d3.select(this.parentNode).datum()
            // * Style No parent node
            d3.select(this).style('opacity', 0.5)
            return edge.v === d || edge.w === d
          })
          // * Style Parent node
          .style('opacity', 0.5)
          .style('stroke-width', '2px')
        // * Ignore selected node
        if (
          selectedNode &&
          selectedNode.node() === d3.select(this).select('rect').node()
        ) {
          return
        }
        // * Reset node color on hover
        d3.select(this)
          .select('rect')
          .style('fill', '#fff')
          .style('stroke', '#fff')
      })
  }

  useEffect(() => {
    const fetchStructure = async () => {
      // console.log(paramRepository)
      try {
        const res = await fetch(
          `/api/structure?${paramViewPageName}=${encodeURIComponent(paramRepository)}`,
        )
        // console.log(res)
        if (!res.ok) {
          console.error('Error fetching structure:', res)
          return
        }
        const data = await res.json()
        // console.log(data)
        setParamRepoName(paramRepository)
        setStructure(data)
      } catch (error) {
        console.error('Error fetching structure:', error)
      }
    }
    fetchStructure()
    const storedApiKey = localStorage.getItem('OPENAI_API_KEY')
    console.log('storedApiKey', storedApiKey)
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }
  }, [])

  useEffect(() => {
    const separatedGraphs = separateGraphs(structure)
    setGraphs(separatedGraphs)
    svgRefs.current = Array(separatedGraphs.length).fill(null)
    innerRefs.current = Array(separatedGraphs.length).fill(null)
  }, [structure])

  useEffect(() => {
    graphs.forEach((graphData, index) => {
      renderGraph(svgRefs.current[index], innerRefs.current[index], graphData)
    })
  }, [graphs])

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
      {/* <div id="info-panel"></div>
      {panelInfo && <p>Selected node: {panelInfo}</p>} */}
      {graphs.map((_, index) => (
        <div
          key={index}
          className="w-full flex justify-center flex-col items-center"
        >
          <h2 className="text-2xl mt-4 text-center mb-2">
            {index === graphs.length - 1
              ? 'Single files'
              : `Code Map, Graph ${index + 1}`}
          </h2>

          <svg
            width="90%"
            height="800"
            className="rounded-md bg-[#282a36]"
            ref={(el) => {
              svgRefs.current[index] = el
            }}
          >
            <g
              ref={(el) => {
                innerRefs.current[index] = el
              }}
            />
          </svg>
        </div>
      ))}
    </section>
  )
}
