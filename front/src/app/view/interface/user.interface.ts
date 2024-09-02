export interface User {
  id: string
  name: string
  email: string
  password: string
  provider: string
  image: string
  active: boolean
  allowedRepos: number
}
