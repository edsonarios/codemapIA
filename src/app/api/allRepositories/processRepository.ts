import fs from 'fs'
import path from 'path'
import { routePath } from '../utils'
import {
  createNodesAndEdges,
  ensureDirectoryExistence,
  extractImports,
  getAliasesFromTsConfig,
  layoutNodes,
  separateGraphs,
} from './utils'

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
  const repositoryNameCleaned = repositoryName.replace('-main', '')
  const repositoryPath = path.resolve(
    `${fileSrc}/clonedRepositories/${repositoryName}/`,
  )
  let structurePath = path.resolve(
    `${fileSrc}/processedRepositories/${repositoryName}/structure.json`,
  )
  let contentFilesPath = path.resolve(
    `${fileSrc}/processedRepositories/${repositoryName}/contentFiles.json`,
  )

  let fileDetailsPath = path.resolve(
    `${fileSrc}/processedRepositories/${repositoryName}/fileDetails.json`,
  )

  const tsConfigPath = path.join(repositoryPath, 'tsconfig.json')
  const aliases = getAliasesFromTsConfig(tsConfigPath)
  // console.log('aliases', aliases)

  let outputContent = processDirectory(
    repositoryPath,
    repositoryPath,
    {},
    aliases,
  )
  outputContent = cleanImportsFromOutput(outputContent)
  // console.log(outputContent)

  const contentByFile = getContentFiles(repositoryPath, repositoryPath, {})
  // console.log(contentByFile)

  const nodesAndEdges = madeNodesAndEdges(outputContent)

  structurePath = path.resolve(
    `${fileSrc}/processedRepositories/${repositoryNameCleaned}/structure.json`,
  )

  contentFilesPath = path.resolve(
    `${fileSrc}/processedRepositories/${repositoryNameCleaned}/contentFiles.json`,
  )

  fileDetailsPath = path.resolve(
    `${fileSrc}/processedRepositories/${repositoryNameCleaned}/fileDetails.json`,
  )

  const nodesAndEdgesPath = path.resolve(
    `${fileSrc}/processedRepositories/${repositoryNameCleaned}/nodesAndEdges.json`,
  )

  ensureDirectoryExistence(structurePath)
  ensureDirectoryExistence(contentFilesPath)
  fs.writeFileSync(structurePath, JSON.stringify(outputContent, null, 2))
  fs.writeFileSync(contentFilesPath, JSON.stringify(contentByFile, null, 2))
  fs.writeFileSync(fileDetailsPath, JSON.stringify({}))
  fs.writeFileSync(nodesAndEdgesPath, JSON.stringify(nodesAndEdges, null, 2))
  // console.log(`Files are consolidated in: ${structurePath}`)
}
