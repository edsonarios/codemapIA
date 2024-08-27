import * as path from 'path'
import * as fs from 'fs'
import {
  createNodesAndEdges,
  extractImports,
  getAliasesFromTsConfig,
  layoutNodes,
  separateGraphs,
} from './utils'
import { routePath } from 'src/common/utils'

const ignoreFolders = [
  'node_modules',
  'cdk.out',
  'dist',
  'coverage',
  'test',
  'tests',
  'tests-e2e',
  'tests-unit',
  'tests-integration',
  'tests-acceptance',
  'tests-functional',
  'tests-regression',
  'tests-performance',
  'tests-security',
  'tes',
  '.git',
  'public',
  'dist-electron',
  'release',
  'postgres',
]
const ignoreFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']
const ignorePatterns = [
  /\.env.*/,
  /\.ico/,
  /\.png/,
  /\.webp/,
  /\.jpg/,
  /\.jpeg/,
  /\.svg/,
  /\.gif/,
  /\.eot/,
  /\.otf/,
]

function cleanImportsFromOutput(outputContent: { [key: string]: string[] }) {
  const keys = Object.keys(outputContent)
  keys.forEach((key) => {
    const imports = outputContent[key]
    const cleanedImports = imports
      .map((importPath) => {
        importPath = importPath.replace(/(\.\.\/|\.\.\\|\.\/|\.\\)/g, '')
        const foundKey = keys.find((key) => key.includes(importPath))
        return foundKey
      })
      .filter((importPath) => importPath !== undefined) // Filter out undefined values
    outputContent[key] = cleanedImports
  })
  return outputContent
}

function shouldIgnoreFile(fileName: string): boolean {
  return (
    ignoreFiles.includes(fileName) ||
    ignorePatterns.some((pattern) => pattern.test(fileName))
  )
}

function processDirectory(
  currentPath: string,
  baseDir: string,
  outputContent: { [key: string]: string[] },
  aliases: { [key: string]: string },
) {
  fs.readdirSync(currentPath).forEach((file) => {
    const fullPath = path.join(currentPath, file)

    if (fs.statSync(fullPath).isDirectory()) {
      if (!ignoreFolders.includes(file)) {
        outputContent = processDirectory(
          fullPath,
          baseDir,
          outputContent,
          aliases,
        )
      }
    } else {
      if (!shouldIgnoreFile(file)) {
        const relativePath = path.relative(baseDir, fullPath)
        const fileContent = fs.readFileSync(fullPath, 'utf8')
        const imports = extractImports(fileContent, aliases)
        const pathFile = relativePath.replace(/\\/g, '/')
        outputContent[pathFile] = imports
      }
    }
    // console.log(outputContent)
  })
  return outputContent
}

function getContentFiles(
  currentPath: string,
  baseDir: string,
  outputContentFile: { [key: string]: string },
) {
  fs.readdirSync(currentPath).forEach((file) => {
    const fullPath = path.join(currentPath, file)

    if (fs.statSync(fullPath).isDirectory()) {
      if (!ignoreFolders.includes(file)) {
        outputContentFile = getContentFiles(
          fullPath,
          baseDir,
          outputContentFile,
        )
      }
    } else {
      if (!shouldIgnoreFile(file)) {
        const relativePath = path.relative(baseDir, fullPath)
        const fileContent = fs.readFileSync(fullPath, 'utf8')
        const pathFile = relativePath.replace(/\\/g, '/')
        outputContentFile[pathFile] = `${fileContent}`
      }
    }
    // console.log(outputContentFile)
  })
  return outputContentFile
}

function madeNodesAndEdges(structure: Record<string, string[]>) {
  const separatedGraphs = separateGraphs(structure)
  const nodesAndEdges = []
  for (let index = 0; index < separatedGraphs.length; index++) {
    const { nodes, edges } = createNodesAndEdges(separatedGraphs[index])
    nodesAndEdges.push(layoutNodes(nodes, edges))
  }
  return nodesAndEdges
}

export async function processRepository(repositoryName: string) {
  const fileSrc = `${routePath}`
  const repositoryPath = path.resolve(
    `${fileSrc}/clonedRepositories/${repositoryName}/`,
  )

  const tsConfigPath = path.join(repositoryPath, 'tsconfig.json')
  const aliases = getAliasesFromTsConfig(tsConfigPath)

  let outputContent = processDirectory(
    repositoryPath,
    repositoryPath,
    {},
    aliases,
  )
  outputContent = cleanImportsFromOutput(outputContent)

  const contentByFile = getContentFiles(repositoryPath, repositoryPath, {})

  const nodesAndEdges = madeNodesAndEdges(outputContent)

  return {
    structure: outputContent,
    contentFiles: contentByFile,
    nodesAndEdges: nodesAndEdges,
  }
}
