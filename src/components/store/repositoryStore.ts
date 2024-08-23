import { NodesAndEdges } from '@/app/view/interface/nodesAndEdges.interface'
import { type StateCreator, create } from 'zustand'

export interface IRepositoryStore {
  structure: Record<string, string[]>
  setStructure: (structure: Record<string, string[]>) => void

  fileDetails: Record<string, string>
  setFileDetails: (fileDetails: Record<string, string>) => void

  contentFiles: Record<string, string>
  setContentFiles: (contentFiles: Record<string, string>) => void

  paramRepoName: string
  setParamRepoName: (paramRepoName: string) => void

  storeNodesAndEdges: NodesAndEdges[]
  setStoreNodesAndEdges: (nodesAndEdges: NodesAndEdges[]) => void

  isDisableButton: boolean
  setIsDisableButton: (isDisableButton: boolean) => void
}
const repositoryStore: StateCreator<IRepositoryStore> = (set) => ({
  structure: {},
  setStructure: (structure) => set({ structure }),

  fileDetails: {},
  setFileDetails: (fileDetails) => set({ fileDetails }),

  contentFiles: {},
  setContentFiles: (contentFiles) => set({ contentFiles }),

  paramRepoName: '',
  setParamRepoName: (paramRepoName) => set({ paramRepoName }),

  storeNodesAndEdges: [],
  setStoreNodesAndEdges: (nodesAndEdges) =>
    set({ storeNodesAndEdges: nodesAndEdges }),

  isDisableButton: true,
  setIsDisableButton: (isDisableButton) => set({ isDisableButton }),
})

export const useRepositoryStore = create<IRepositoryStore>()(repositoryStore)
