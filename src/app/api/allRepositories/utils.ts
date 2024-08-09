import fs from 'fs'
import path from 'path'
import { parse } from 'jsonc-parser'
import * as babelParser from '@babel/parser'
import traverse from '@babel/traverse'
import { parse as parseAstro } from '@astrojs/compiler'
import { walk, is } from '@astrojs/compiler/utils'

export const ensureDirectoryExistence = (filePath: string) => {
  const dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

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
    // console.error(error)
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
