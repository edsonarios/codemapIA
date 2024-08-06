import path from 'path'

const isVercelEnvironment = !!process.env.VERCEL
// export const filePath = 'src/app/api/data'
export const routePath = isVercelEnvironment
  ? '/tmp/'
  : path.resolve('src/app/api/data/')
console.log(routePath)

export function formatRepositoryName(repoName: string) {
  // Separar por guiones
  const words = repoName.split('-')

  // Capitalizar la primera letra de cada palabra y unirlas con espacios
  const formattedName = words
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')

  return formattedName
}
