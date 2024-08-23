import { MarkerType } from '@xyflow/react'

export function createNodesAndEdges(graphs: Record<string, string[]>) {
  const nodes: object[] = []
  const edges: object[] = []

  Object.keys(graphs).forEach((key) => {
    const nameFile = key.split('/').pop() || ''
    nodes.push({
      id: key,
      data: { label: nameFile },
      position: { x: 0, y: 0 }, // The positions will be calculated later
      width: nameFile.length * 8,
    })

    graphs[key].forEach((dependency) => {
      edges.push({
        id: `${key}-${dependency}`,
        source: key,
        target: dependency,
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 30,
          height: 30,
        },
      })
    })
  })

  return { nodes, edges }
}
