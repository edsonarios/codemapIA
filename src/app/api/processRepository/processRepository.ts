import fs from 'fs'
import path from 'path'
import * as babelParser from '@babel/parser'
import traverse from '@babel/traverse'
import { routePath } from '../utils'
import { getAliasesFromTsConfig } from './utils'

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

function shouldIgnoreFile(fileName: string): boolean {
  return (
    ignoreFiles.includes(fileName) ||
    ignorePatterns.some((pattern) => pattern.test(fileName))
  )
}

function isRelativeImport(importPath: string): boolean {
  return importPath.startsWith('./') || importPath.startsWith('../')
}

function extractImports(fileContent: string): string[] {
  const imports: string[] = []
  try {
    const ast = babelParser.parse(fileContent, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })

    traverse(ast, {
      ImportDeclaration({ node }) {
        if (isRelativeImport(node.source.value)) {
          imports.push(node.source.value)
        }
      },
    })
  } catch (error) {
    // console.error(`Error parsing file content: ${error.message}`)
  }
  return imports
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
        const imports = extractImports(fileContent)
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

const ensureDirectoryExistence = (filePath: string) => {
  const dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
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

  structurePath = path.resolve(
    `${fileSrc}/processedRepositories/${repositoryNameCleaned}/structure.json`,
  )
  contentFilesPath = path.resolve(
    `${fileSrc}/processedRepositories/${repositoryNameCleaned}/contentFiles.json`,
  )

  fileDetailsPath = path.resolve(
    `${fileSrc}/processedRepositories/${repositoryNameCleaned}/fileDetails.json`,
  )

  ensureDirectoryExistence(structurePath)
  ensureDirectoryExistence(contentFilesPath)
  fs.writeFileSync(structurePath, JSON.stringify(outputContent, null, 2))
  fs.writeFileSync(contentFilesPath, JSON.stringify(contentByFile, null, 2))
  fs.writeFileSync(fileDetailsPath, JSON.stringify({}))
  // console.log(`Files are consolidated in: ${structurePath}`)
}
