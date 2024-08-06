import { Suspense } from 'react'
import GraphPage from './graph'

const ViewPageWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GraphPage />
    </Suspense>
  )
}

export default ViewPageWrapper
