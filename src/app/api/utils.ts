import path from 'path'

const isVercelEnvironment = !!process.env.VERCEL
export const routePath = isVercelEnvironment
  ? '/tmp/'
  : path.resolve('src/app/api/data/')

export function formatRepositoryName(repoName: string) {
  const words = repoName.split('-')

  const formattedName = words
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')

  return formattedName
}
