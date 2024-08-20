import { MarkerType } from '@xyflow/react'

const mergeGraphs = (
  graphs: Record<string, string[]>[],
): Record<string, string[]>[] => {
  const mergedGraphs: Record<string, string[]>[] = []

  const mergeTwoGraphs = (
    graph1: Record<string, string[]>,
    graph2: Record<string, string[]>,
  ): Record<string, string[]> => {
    const mergedGraph: Record<string, string[]> = { ...graph1 }
    Object.keys(graph2).forEach((key) => {
      if (mergedGraph[key]) {
        mergedGraph[key] = [...new Set([...mergedGraph[key], ...graph2[key]])]
      } else {
        mergedGraph[key] = graph2[key]
      }
    })
    return mergedGraph
  }

  // Review each graph
  graphs.forEach((graph) => {
    let merged = false

    // Compare with already processed graphs
    for (let i = 0; i < mergedGraphs.length; i++) {
      const mergedGraph = mergedGraphs[i]
      const keys1 = Object.keys(graph)
      const keys2 = Object.keys(mergedGraph)

      // Verify if they share nodes
      if (keys1.some((key) => keys2.includes(key))) {
        mergedGraphs[i] = mergeTwoGraphs(mergedGraph, graph)
        merged = true
        break
      }
    }

    if (!merged) {
      mergedGraphs.push(graph)
    }
  })

  return mergedGraphs
}

export const separateGraphs = (
  json: Record<string, string[]>,
): Record<string, string[]>[] => {
  const graphs: Record<string, string[]>[] = []
  const childrenNodes = new Set<string>()
  const headNodes = new Set<string>()

  Object.keys(json).forEach((node) => {
    json[node].forEach((dependency) => {
      childrenNodes.add(dependency)
    })
  })
  Object.keys(json).forEach((node) => {
    if (json[node].length > 0 && !childrenNodes.has(node)) {
      headNodes.add(node)
    }
  })

  // Function to perform DFS and group connected nodes
  const visitNode = (
    node: string,
    graph: Record<string, string[]>,
    visitedNodes: Set<string>,
  ) => {
    if (!visitedNodes.has(node)) {
      visitedNodes.add(node)
      if (!graph[node]) {
        graph[node] = json[node]
      }
      json[node].forEach((dependency) => {
        if (!graph[dependency]) {
          graph[dependency] = json[dependency]
        }
        visitNode(dependency, graph, visitedNodes)
      })
    }
  }

  const visitedNodes = new Set<string>()

  // Group connected nodes
  headNodes.forEach((node) => {
    if (!visitedNodes.has(node)) {
      const newGraph: Record<string, string[]> = {}
      visitNode(node, newGraph, visitedNodes)
      graphs.push(newGraph)
    }
  })

  const mergedGraphs = mergeGraphs(graphs)
  const orphanGraph: Record<string, string[]> = {}
  Object.keys(json).forEach((node) => {
    if (!visitedNodes.has(node)) {
      orphanGraph[node] = json[node]
    }
  })

  if (Object.keys(orphanGraph).length > 0) {
    mergedGraphs.push(orphanGraph)
  }
  return mergedGraphs
}

export const convertJsonToDot = (json: Record<string, string[]>): string => {
  let dot = `digraph G {
    graph [splines=true];
    edge [arrowheadStyle="fill: #999"];
  `

  Object.keys(json).forEach((node) => {
    dot += `  "${node}" [label="${node}"];\n`
    json[node].forEach((edge) => {
      dot += `  "${node}" -> "${edge}";\n`
    })
  })

  dot += '}'
  return dot
}

export function createNodesAndEdges(graphs: Record<string, string[]>) {
  const nodes: object[] = []
  const edges: object[] = []

  Object.keys(graphs).forEach((key) => {
    nodes.push({
      id: key,
      data: { label: key },
      position: { x: 0, y: 0 }, // The positions will be calculated later
      width: key.length * 8,
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
