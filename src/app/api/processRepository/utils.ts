import fs from 'fs'
import { parse } from 'jsonc-parser'
import * as babelParser from '@babel/parser'
import traverse from '@babel/traverse'

export function getAliasesFromTsConfig(tsConfigPath: string) {
  const tsConfig = fs.readFileSync(tsConfigPath, 'utf8')
  const parsedConfig = parse(tsConfig)

  const paths = parsedConfig.compilerOptions.paths || {}
  const aliases: { [key: string]: string } = {}

  Object.keys(paths).forEach((alias) => {
    const actualPath = paths[alias][0].replace('/*', '')
    const cleanedAlias = alias.replace('/*', '')
    aliases[cleanedAlias] = actualPath
  })
  // console.log('aliases', aliases)
  return aliases
}

// function isRelativeImport(
//   importPath: string,
//   aliases: { [key: string]: string },
// ): boolean {
//   return (
//     importPath.startsWith('./') ||
//     importPath.startsWith('../') ||
//     Object.keys(aliases).some((alias) => importPath.startsWith(alias))
//   )
// }

function resolveImportPath(
  importPath: string,
  aliases: { [key: string]: string },
  baseDir: string,
): string | undefined {
  // console.log(green('-----------------'))
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    // console.log('importPath', cyan(importPath))
    return importPath
  }
  // console.log('importPath', importPath)
  const alias = Object.keys(aliases).find((alias) =>
    importPath.startsWith(alias),
  )
  // console.log('alias', alias)
  if (alias) {
    const relativePath = importPath.replace(alias, aliases[alias])
    // console.log('relativePath', relativePath)
    return relativePath
  }

  return undefined
}

export function extractImports(
  fileContent: string,
  aliases: { [key: string]: string },
  baseDir: string,
): string[] {
  const imports: string[] = []
  try {
    const ast = babelParser.parse(fileContent, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })

    traverse(ast, {
      ImportDeclaration({ node }) {
        const resolvedPath = resolveImportPath(
          node.source.value,
          aliases,
          baseDir,
        )
        if (resolvedPath) {
          imports.push(resolvedPath)
        }
      },
    })
  } catch (error) {
    // console.error(`Error parsing file content: ${error.message}`)
  }
  return imports
}
