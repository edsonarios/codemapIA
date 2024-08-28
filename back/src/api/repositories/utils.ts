import * as fs from 'fs'
import { parse } from 'jsonc-parser'
import * as babelParser from '@babel/parser'
import traverse from '@babel/traverse'
import { Edge, MarkerType } from '@xyflow/react'
import * as dagre from 'dagre'
import { walk, is } from '@astrojs/compiler/utils'
import { parse as parseAstro } from '@astrojs/compiler'

export const ensureFileExists = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), 'utf8')
  }
}

export function getAliasesFromTsConfig(tsConfigPath: string) {
  try {
    const tsConfig = fs.readFileSync(tsConfigPath, 'utf8')
    const parsedConfig = parse(tsConfig)

    const paths = parsedConfig.compilerOptions.paths || {}
    const aliases: { [key: string]: string } = {}

    Object.keys(paths).forEach((alias) => {
      const actualPath = paths[alias][0].replace('/*', '')
      const cleanedAlias = alias.replace('/*', '')
      aliases[cleanedAlias] = actualPath
    })
    return aliases
  } catch (error) {
    // console.log(error)
    return {}
  }
}

function resolveImportPath(
  importPath: string,
  aliases: { [key: string]: string },
): string | undefined {
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return importPath
  }
  const alias = Object.keys(aliases).find((alias) =>
    importPath.startsWith(alias),
  )
  if (alias) {
    const relativePath = importPath.replace(alias, aliases[alias])
    return relativePath
  }

  return undefined
}

function resolveImportPathFromLine(
  line: string,
  aliases: { [key: string]: string },
): string | undefined {
  const importPathMatch = line.match(/from\s+['"](.*)['"]/)
  if (importPathMatch) {
    const importPath = importPathMatch[1]
    return resolveImportPath(importPath, aliases)
  }
  return undefined
}

export async function extractImports(
  fileContent: string,
  aliases: { [key: string]: string },
  fileType: string,
): Promise<string[]> {
  const imports: string[] = []
  try {
    let ast
    if (fileType === 'astro') {
      ast = await parseAstro(fileContent)
      walk(ast.ast, (node) => {
        if (is.frontmatter(node)) {
          const frontmatterContent = node.value.trim().split('\n')
          frontmatterContent.forEach((line) => {
            if (line.startsWith('import ')) {
              const resolvedPath = resolveImportPathFromLine(line, aliases)
              if (resolvedPath) {
                // console.log(resolvedPath)
                imports.push(resolvedPath)
              }
            }
          })
        }
      })
    } else {
      ast = babelParser.parse(fileContent, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      })
      traverse(ast, {
        ImportDeclaration({ node }) {
          const resolvedPath = resolveImportPath(node.source.value, aliases)
          if (resolvedPath) {
            imports.push(resolvedPath)
          }
        },
      })
    }
  } catch (error) {
    // console.error(`Error parsing file content: ${error.message}`)
  }
  return imports
}

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

function calculateNodeWidth(text: string, charWidth = 10, padding = 20) {
  return text.length * charWidth + padding
}

export function createNodesAndEdges(graphs: Record<string, string[]>) {
  const nodes: object[] = []
  const edges: object[] = []
  Object.keys(graphs).forEach((key) => {
    const nameFile = key.split('/').pop() || ''
    const nodeWidth = calculateNodeWidth(nameFile)
    nodes.push({
      id: key,
      data: { label: nameFile },
      position: { x: 0, y: 0 }, // The positions will be calculated later
      width: nodeWidth,
      type: 'customNode',
    })

    graphs[key].forEach((dependency) => {
      const newEdge: Edge = {
        id: `${key}-${dependency}`,
        source: key,
        target: dependency,
        animated: false,
        type: 'default', // 'straight', 'step', 'smoothstep', 'default'
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 30,
          height: 30,
        },
      }
      edges.push(newEdge)
    })
  })

  return { nodes, edges }
}

export function layoutNodes(
  nodes: any[],
  edges: any[],
  columns = 5,
  verticalGap = 100,
  horizontalGap = 250,
) {
  const g = new dagre.graphlib.Graph()
  g.setGraph({})
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((node: any) =>
    g.setNode(node.id, { width: node.width || 100, height: 50 }),
  )
  edges.forEach((edge: any) => g.setEdge(edge.source, edge.target))

  g.graph().ranksep = 100 // Vertical space
  g.graph().nodesep = 50 // Horizontal space
  // g.graph().marginx = 20 // Margin horizontal around the graph
  // g.graph().marginy = 20 // Margin vertical around the graph

  dagre.layout(g)

  const positionedNodes = nodes.map((node: any) => ({
    ...node,
    position: {
      x: g.node(node.id)?.x || node.position.x,
      y: g.node(node.id)?.y || node.position.y,
    },
  }))

  // Sort singles files
  let lastIndex = positionedNodes.length - 1
  const xPos = 0
  const yPos =
    Math.max(...positionedNodes.map((node) => node.position.y)) + verticalGap

  while (
    lastIndex >= 0 &&
    !edges.some(
      (edge) =>
        edge.source === positionedNodes[lastIndex].id ||
        edge.target === positionedNodes[lastIndex].id,
    )
  ) {
    const column = (positionedNodes.length - 1 - lastIndex) % columns
    const row = Math.floor((positionedNodes.length - 1 - lastIndex) / columns)

    positionedNodes[lastIndex].position = {
      x: xPos + column * horizontalGap + 50,
      y: yPos + row * verticalGap,
    }

    lastIndex--
  }
  return { nodes: positionedNodes, edges }
}
