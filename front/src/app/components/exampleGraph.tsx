import '@xyflow/react/dist/style.css'
import { ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
const Nodes = [
  {
    id: '1',
    data: { label: 'Index.tsx' },
    position: { x: 140, y: 50 },
    style: {},
  },
  {
    id: '2',
    data: { label: 'Components.tsx' },
    position: { x: 40, y: 200 },
    style: {},
  },
  {
    id: '3',
    data: { label: 'Utils.ts' },
    position: { x: 250, y: 200 },
    style: {},
  },
]

const Edges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
]

export default function ExampleGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(Nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(Edges)
  return (
    <div
      className="text-black rounded-md w-[450px] h-[320px]"
      // data-aos="zoom-in"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        // nodeTypes={nodeTypes}
      />
    </div>
  )
}
