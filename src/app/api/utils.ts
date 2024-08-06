import path from 'path'

const isVercelEnvironment = !!process.env.VERCEL
// export const filePath = 'src/app/api/data'
export const routePath = isVercelEnvironment
  ? '/tmp'
  : path.resolve('src/app/api/data')
console.log(routePath)
