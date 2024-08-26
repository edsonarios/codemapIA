'use client'
import dagre from 'dagre'
import React, { useCallback, useEffect } from 'react'
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

// interface NodeData {
//   label: string
// }

// interface Position {
//   x: number
//   y: number
// }

// interface Node {
//   id: string
//   data: NodeData
//   position?: Position
// }

// const initialNodes = [
//   { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
//   { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
//   { id: '3', position: { x: 200, y: 200 }, data: { label: '3' } },
// ]
// const initialEdges = [
//   { id: 'e1-2', source: '1', target: '2', animated: true },
//   { id: 'e2-3', source: '1', target: '3', animated: true },
// ]
const initialNodes = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 0, y: 0 }, style: {} },
  { id: '2', data: { label: 'Node 2' }, position: { x: 0, y: 0 }, style: {} },
  { id: '3', data: { label: 'Node 3' }, position: { x: 0, y: 0 }, style: {} },
  { id: '4', data: { label: 'Node 4' }, position: { x: 0, y: 0 }, style: {} },
  { id: '5', data: { label: 'Node 5' }, position: { x: 0, y: 0 }, style: {} },
  { id: '6', data: { label: 'Node 6' }, position: { x: 0, y: 0 }, style: {} },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: false },
  { id: 'e1-3', source: '1', target: '3', animated: false },
  { id: 'e2-4', source: '2', target: '4', animated: false },
  { id: 'e2-5', source: '2', target: '5', animated: false },
  { id: 'e1-6', source: '3', target: '6', animated: false },
]
const panOnDrag = [1, 2]
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  useEffect(() => {
    const g = new dagre.graphlib.Graph()
    g.setGraph({})
    g.setDefaultEdgeLabel(() => ({}))

    initialNodes.forEach((node) => g.setNode(node.id, {}))
    initialEdges.forEach((edge) => g.setEdge(edge.source, edge.target))

    g.graph().ranksep = 100 // Vertical space
    g.graph().nodesep = 200 // Horizontal space
    g.graph().marginx = 20 // Margin horizontal around the graph
    g.graph().marginy = 20 // Margin vertical around the graph

    dagre.layout(g)

    const positionedNodes = initialNodes.map((node) => ({
      ...node,
      position: {
        x: g.node(node.id).x,
        y: g.node(node.id).y,
      },
    }))
    setNodes(positionedNodes)
  }, [])

  const handleNodeClick = (event: any, node: any) => {
    console.log('Node clicked:', node)
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
        n.id === node.id
          ? { ...n, style: { ...n.style, backgroundColor: '#999' } }
          : n,
      ),
    )
  }

  const handleNodeMouseLeave = (event: any, node: any) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.source === node.id || edge.target === node.id) {
          return { ...edge, animated: false }
        }
        return edge
      }),
    )
    setNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, style: {} } : n)),
    )
  }
  return (
    <div className="text-black w-svw h-svh">
      {/* <Background variant="dots" gap={20} size={1} /> */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // panOnScroll // Disable zoom by scroll
        selectionOnDrag
        panOnDrag={panOnDrag}
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
