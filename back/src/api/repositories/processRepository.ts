import * as path from 'path'
import * as fs from 'fs'
import {
  createNodesAndEdges,
  extractImports,
  getAliasesFromTsConfig,
  layoutNodes,
  separateGraphs,
} from './utils'
import { routePath } from '../../common/utils'

import { ignoreFiles, ignoreFolders, ignorePatterns } from './constants'

function cleanImportsFromOutput(outputContent: { [key: string]: string[] }) {
  const keys = Object.keys(outputContent)
  keys.forEach((key) => {
    const imports = outputContent[key]
    const cleanedImports = imports
      .map((importPath) => {
        let toFindImportPath = importPath.replace(
          /(\.\.\/|\.\.\\|\.\/|\.\\)/g,
          '',
        )
        toFindImportPath = toFindImportPath.startsWith('src/')
          ? toFindImportPath
          : `/${toFindImportPath}`
        let foundKey = keys.find((key) => key.includes(toFindImportPath))

        // Verify if the import path is a folder and if it has an index.ts file
        if (!toFindImportPath.match(/\.\w+$/) && foundKey) {
          const basePath = foundKey.substring(
            0,
            foundKey.lastIndexOf(toFindImportPath) + toFindImportPath.length,
          )

          const potentialIndexPath = `${basePath}/index`
          const resolvedIndexPath = keys.find((key) =>
            key.includes(potentialIndexPath),
          )
          if (resolvedIndexPath) {
            foundKey = resolvedIndexPath
          }
        }
        return foundKey
      })
      .filter((importPath) => importPath !== undefined)
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

async function processDirectory(
  currentPath: string,
  baseDir: string,
  outputContent: { [key: string]: string[] },
  aliases: { [key: string]: string },
) {
  const entries = fs.readdirSync(currentPath)
  for (const file of entries) {
    const fullPath = path.join(currentPath, file)
    const fileType = path.extname(file).slice(1)

    if (fs.statSync(fullPath).isDirectory()) {
      if (!ignoreFolders.includes(file)) {
        outputContent = await processDirectory(
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
        const imports = await extractImports(fileContent, aliases, fileType)
        const pathFile = relativePath.replace(/\\/g, '/')
        outputContent[pathFile] = imports
      }
    }
    // console.log(outputContent)
  }
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

  let outputContent = await processDirectory(
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
