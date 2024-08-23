import { useCallback, useEffect } from 'react'
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
import { NodesAndEdges } from '../interface/nodesAndEdges.interface'
import { debounce } from 'lodash'
import {
  IRepositoryStore,
  useRepositoryStore,
} from '@/components/store/repositoryStore'

const initialNodes = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 0, y: 0 }, style: {} },
  { id: '2', data: { label: 'Node 2' }, position: { x: 0, y: 0 }, style: {} },
]

const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: false }]

export function Flow({
  NodesAndEdges,
  panelInfo,
  setPanelInfo,
  index,
}: {
  NodesAndEdges: NodesAndEdges
  panelInfo: string | null
  setPanelInfo: (key: string | null) => void
  index: number
}) {
  const { storeNodesAndEdges, setStoreNodesAndEdges, setIsDisableButton } =
    useRepositoryStore<IRepositoryStore>((state) => state)

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  const handleNodeClick = (event: any, node: any) => {
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
    setNodes(NodesAndEdges.nodes)
    setEdges(NodesAndEdges.edges)
  }, [])

  const debouncedUpdate = useCallback(
    debounce((nodes, edges) => {
      const updatedState = { nodes, edges }
      const newStoreNodesAndEdges = storeNodesAndEdges.map((item, i) =>
        i === index ? updatedState : item,
      )
      setStoreNodesAndEdges(newStoreNodesAndEdges)
      setIsDisableButton(false)
      // console.log('updatedState')
    }, 500),
    [],
  )

  useEffect(() => {
    // console.log('change nodes or edges')
    debouncedUpdate(nodes, edges)
  }, [nodes, edges])

  return (
    <div className="text-black w-[90%] h-[800px] flex justify-center flex-col items-center border-2 rounded-md">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // panOnScroll // Disable zoom by scroll
        // ? selection Mode
        // selectionOnDrag
        // panOnDrag={[1, 2]}
        // selectionMode={SelectionMode.Partial}
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
