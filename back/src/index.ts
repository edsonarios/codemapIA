// import fs from 'fs'
// import path from 'path'
// // import { routePath } from '../utils'
// import {
//   ensureDirectoryExistence,
//   extractImports,
//   getAliasesFromTsConfig,
// } from './utils'
// import { ignoreFiles, ignoreFolders, ignorePatterns } from './constants'
// import { green } from 'colors'

// function cleanImportsFromOutput(outputContent: { [key: string]: string[] }) {
//   const keys = Object.keys(outputContent)
//   keys.forEach((key) => {
//     const imports = outputContent[key]
//     const cleanedImports = imports
//       .map((importPath) => {
//         console.log(green('//!---------------------------------------'))
//         console.log('before', importPath)
//         let toFindImportPath = importPath.replace(
//           /(\.\.\/|\.\.\\|\.\/|\.\\)/g,
//           '',
//         )
//         toFindImportPath = toFindImportPath.startsWith('src/')
//           ? toFindImportPath
//           : `/${toFindImportPath}`
//         console.log('toFindImportPath', toFindImportPath)
//         let foundKey = keys.find((key) => key.includes(toFindImportPath))
//         console.log('foundKey', foundKey)

//         // Verify if the import path is a folder and if it has an index.ts file
//         if (!toFindImportPath.match(/\.\w+$/) && foundKey) {
//           // Determinar la ruta potencial para index.ts
//           const basePath = foundKey.substring(
//             0,
//             foundKey.lastIndexOf(toFindImportPath) + toFindImportPath.length,
//           )
//           console.log('basePath', basePath)

//           // Formar la nueva ruta agregando '/index' sin extensión
//           const potentialIndexPath = `${basePath}/index`

//           // Buscar en keys si existe la ruta 'index' con cualquier extensión
//           const resolvedIndexPath = keys.find((key) =>
//             key.includes(potentialIndexPath),
//           )
//           console.log('resolvedIndexPath', resolvedIndexPath)
//           // Si se encontró una ruta válida, usarla
//           if (resolvedIndexPath) {
//             foundKey = resolvedIndexPath
//           }
//         }
//         return foundKey
//       })
//       .filter((importPath) => importPath !== undefined) // Filter out undefined values
//     outputContent[key] = cleanedImports
//   })
//   return outputContent
// }

// function shouldIgnoreFile(fileName: string): boolean {
//   return (
//     ignoreFiles.includes(fileName) ||
//     ignorePatterns.some((pattern) => pattern.test(fileName))
//   )
// }

// async function processDirectory(
//   currentPath: string,
//   baseDir: string,
//   outputContent: { [key: string]: string[] },
//   aliases: { [key: string]: string },
// ) {
//   const entries = fs.readdirSync(currentPath)
//   for (const file of entries) {
//     const fullPath = path.join(currentPath, file)
//     const fileType = path.extname(file).slice(1)

//     if (fs.statSync(fullPath).isDirectory()) {
//       if (!ignoreFolders.includes(file)) {
//         outputContent = await processDirectory(
//           fullPath,
//           baseDir,
//           outputContent,
//           aliases,
//         )
//       }
//     } else {
//       if (!shouldIgnoreFile(file)) {
//         const relativePath = path.relative(baseDir, fullPath)
//         const fileContent = fs.readFileSync(fullPath, 'utf8')
//         const imports = await extractImports(fileContent, aliases, fileType)
//         const pathFile = relativePath.replace(/\\/g, '/')
//         // console.log(green('---------------------------------------'))
//         // console.log('pathFile', pathFile)
//         // console.log('imports', imports)
//         outputContent[pathFile] = imports
//       }
//     }
//   }
//   return outputContent
// }

// function getContentFiles(
//   currentPath: string,
//   baseDir: string,
//   outputContentFile: { [key: string]: string },
// ) {
//   fs.readdirSync(currentPath).forEach((file) => {
//     const fullPath = path.join(currentPath, file)

//     if (fs.statSync(fullPath).isDirectory()) {
//       if (!ignoreFolders.includes(file)) {
//         outputContentFile = getContentFiles(
//           fullPath,
//           baseDir,
//           outputContentFile,
//         )
//       }
//     } else {
//       if (!shouldIgnoreFile(file)) {
//         const relativePath = path.relative(baseDir, fullPath)
//         const fileContent = fs.readFileSync(fullPath, 'utf8')
//         const pathFile = relativePath.replace(/\\/g, '/')
//         outputContentFile[pathFile] = `${fileContent}`
//       }
//     }
//   })
//   return outputContentFile
// }

// export async function processRepository(repositoryName: string) {
//   const fileSrc = `./`
//   // const fileSrc = 'D:/Code/hackaton-vercel-2024'
//   // const fileSrc = `${routePath}`
//   const repositoryNameCleaned = repositoryName.replace('-main', '')

//   const repositoryPath = 'D:/Code/edev/play-factory-web'

//   let structurePath = path.resolve(
//     `${fileSrc}/processedRepositories/${repositoryName}/structure.json`,
//   )
//   let contentFilesPath = path.resolve(
//     `${fileSrc}/processedRepositories/${repositoryName}/contentFiles.json`,
//   )

//   let fileDetailsPath = path.resolve(
//     `${fileSrc}/processedRepositories/${repositoryName}/fileDetails.json`,
//   )

//   const tsConfigPath = path.join(repositoryPath, 'tsconfig.json')
//   const aliases = getAliasesFromTsConfig(tsConfigPath)

//   let outputContent = await processDirectory(
//     repositoryPath,
//     repositoryPath,
//     {},
//     aliases,
//   )
//   // console.log(outputContent)
//   outputContent = cleanImportsFromOutput(outputContent)

//   const contentByFile = getContentFiles(repositoryPath, repositoryPath, {})
//   // console.log(contentByFile)

//   structurePath = path.resolve(
//     `${fileSrc}/processedRepositories/${repositoryNameCleaned}/structure.json`,
//   )
//   contentFilesPath = path.resolve(
//     `${fileSrc}/processedRepositories/${repositoryNameCleaned}/contentFiles.json`,
//   )

//   fileDetailsPath = path.resolve(
//     `${fileSrc}/processedRepositories/${repositoryNameCleaned}/fileDetails.json`,
//   )

//   ensureDirectoryExistence(structurePath)
//   ensureDirectoryExistence(contentFilesPath)
//   fs.writeFileSync(structurePath, JSON.stringify(outputContent, null, 2))
//   fs.writeFileSync(contentFilesPath, JSON.stringify(contentByFile, null, 2))
//   fs.writeFileSync(fileDetailsPath, JSON.stringify({}))
//   // console.log(`Files are consolidated in: ${structurePath}`)
// }
// processRepository('edson/play-factory-web')

import express from 'express'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())

// get users
app.get('/', async (req, res) => {
  res.status(200).send({ message: 'Hello World' })
})

app.listen(3500, () => {
  console.log('server listening...')
})

export default app
