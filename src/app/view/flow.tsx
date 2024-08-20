import { useCallback, useEffect } from 'react'
import dagre from 'dagre'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  SelectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { createNodesAndEdges } from './utils'

const initialNodes = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 0, y: 0 }, style: {} },
  { id: '2', data: { label: 'Node 2' }, position: { x: 0, y: 0 }, style: {} },
]

const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: false }]

export function Flow({
  graph,
  panelInfo,
  setPanelInfo,
  last,
}: {
  graph: Record<string, string[]>
  panelInfo: string | null
  setPanelInfo: (key: string | null) => void
  last: boolean
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  function layoutNodes(graphs: Record<string, string[]>) {
    // console.log(graphs)
    const { nodes, edges } = createNodesAndEdges(graphs)
    const g = new dagre.graphlib.Graph()
    g.setGraph({})
    g.setDefaultEdgeLabel(() => ({}))

    nodes.forEach((node: any) => g.setNode(node.id, {}))
    edges.forEach((edge: any) => g.setEdge(edge.source, edge.target))

    g.graph().ranksep = last ? 100 : 100 // Vertical space
    g.graph().nodesep = last ? 200 : 300 // Horizontal space
    g.graph().marginx = 20 // Margin horizontal around the graph
    g.graph().marginy = 20 // Margin vertical around the graph

    dagre.layout(g)

    const positionedNodes = nodes.map((node: any) => ({
      ...node,
      position: {
        x: g.node(node.id).x,
        y: g.node(node.id).y,
      },
    }))
    setNodes(positionedNodes)
    setEdges(edges as any)
  }

  const handleNodeClick = (event: any, node: any) => {
    // console.log('Node:', node)
    if (panelInfo === node.id) {
      setPanelInfo(null)
    } else {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, style: { ...n.style, backgroundColor: '#5cc8f7' } }
            : { ...n, style: {} },
        ),
      )
      setPanelInfo(node.id)
    }
  }

  const handleNodeMouseEnter = (event: any, node: any) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.source === node.id || edge.target === node.id) {
          return { ...edge, animated: true }
        }
        return edge
      }),
    )
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id && panelInfo !== node.id
          ? { ...n, style: { ...n.style, backgroundColor: '#999' } }
          : n,
      ),
    )
  }

  const handleNodeMouseLeave = (event: any, node: any) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (
          (edge.source === node.id || edge.target === node.id) &&
          panelInfo !== node.id
        ) {
          return { ...edge, animated: false }
        }
        return edge
      }),
    )
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id && panelInfo !== node.id ? { ...n, style: {} } : n,
      ),
    )
  }

  useEffect(() => {
    layoutNodes(graph)
  }, [])

  return (
    <div className="text-black w-[90%] h-[800px] flex justify-center flex-col items-center border-2 rounded-md">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // panOnScroll // Disable zoom by scroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode={SelectionMode.Partial}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
      >
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
