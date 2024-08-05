import fs from 'fs'
import path from 'path'
import * as babelParser from '@babel/parser'
import traverse from '@babel/traverse'

const directoryPath = 'D:/code/customer-scoops/cs-sendgrid-api-function/'
const outputPath = 'output.json'
const outputContentPath = 'outputContentByFile.json'
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
const ignoreFiles = ['package-lock.json']
const ignorePatterns = [/\.env.*/]

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
) {
  fs.readdirSync(currentPath).forEach((file) => {
    const fullPath = path.join(currentPath, file)

    if (fs.statSync(fullPath).isDirectory()) {
      if (!ignoreFolders.includes(file)) {
        outputContent = processDirectory(fullPath, baseDir, outputContent)
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
        console.log(fileContent)
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
    const cleanedImports = imports.map((importPath) => {
      importPath = importPath.replace(/(\.\.\/|\.\.\\|\.\/|\.\\)/g, '')
      const foundKey = keys.find((key) => key.includes(importPath))
      return foundKey
    })
    outputContent[key] = cleanedImports
  })
  return outputContent
}

export function listFiles() {
  let outputContent = processDirectory(directoryPath, directoryPath, {})
  outputContent = cleanImportsFromOutput(outputContent)
  // console.log(outputContent)

  const contentByFile = getContentFiles(directoryPath, directoryPath, {})
  // console.log(contentByFile)

  fs.writeFileSync(outputPath, JSON.stringify(outputContent, null, 2))
  fs.writeFileSync(outputContentPath, JSON.stringify(contentByFile, null, 2))
  console.log(`Files are consolidated in: ${outputPath}`)
}
