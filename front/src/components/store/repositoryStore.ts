import { NodesAndEdges } from '@/app/view/interface/nodesAndEdges.interface'
import { Repository } from '@/app/view/interface/repository.interface'
import { type StateCreator, create } from 'zustand'

export interface IRepositoryStore {
  structure: Record<string, string[]>
  setStructure: (structure: Record<string, string[]>) => void

  dataId: string
  setDataId: (dataId: string) => void

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

  isShowModalRepository: boolean
  setIsShowModalRepository: (isShowModalRepository: boolean) => void

  repositoryData: Repository | null
  setRepositoryData: (repositoryData: Repository) => void
}
const repositoryStore: StateCreator<IRepositoryStore> = (set) => ({
  structure: {},
  setStructure: (structure) => set({ structure }),

  dataId: '',
  setDataId: (dataId) => set({ dataId }),

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

  isShowModalRepository: false,
  setIsShowModalRepository: (isShowModalRepository) =>
    set({ isShowModalRepository }),

  repositoryData: null,
  setRepositoryData: (repositoryData) => set({ repositoryData }),
})

export const useRepositoryStore = create<IRepositoryStore>()(repositoryStore)
