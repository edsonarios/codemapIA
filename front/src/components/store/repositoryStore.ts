import { NodesAndEdges } from '@/app/view/interface/nodesAndEdges.interface'
import { Repository } from '@/app/view/interface/repository.interface'
import { type StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface IRepositoryStore {
  analyzedRepos: Repository[]
  setAnalyzedRepos: (analyzedRepos: Repository[]) => void

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

  isShowConfirmationModal: boolean
  setIsShowConfirmationModal: (isShowConfirmationModal: boolean) => void

  confirmOption: boolean | null
  setConfirmOption: (confirmOption: boolean | null) => void

  repositoryData: Repository | null
  setRepositoryData: (repositoryData: Repository) => void

  waitForConfirmation: () => Promise<boolean>

  modelIA: string
  setModelIA: (modelIA: string) => void
}
const repositoryStore: StateCreator<IRepositoryStore> = (set) => ({
  analyzedRepos: [],
  setAnalyzedRepos: (analyzedRepos) => set({ analyzedRepos }),

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

  isShowConfirmationModal: false,
  setIsShowConfirmationModal: (isShowConfirmationModal) =>
    set({ isShowConfirmationModal }),

  confirmOption: null,
  setConfirmOption: (confirmOption) => set({ confirmOption }),

  repositoryData: null,
  setRepositoryData: (repositoryData) => set({ repositoryData }),

  waitForConfirmation: () =>
    new Promise((resolve) => {
      const unsubscribe = useRepositoryStore.subscribe((state) => {
        if (state.confirmOption !== null) {
          resolve(state.confirmOption)
          set({ confirmOption: null })
          unsubscribe()
        }
      })
    }),

  modelIA: 'gpt-3.5-turbo-0125',
  setModelIA: (modelIA) => set({ modelIA }),
})

export const useRepositoryStore = create<IRepositoryStore>()(
  persist(repositoryStore, {
    name: 'codemap-store',
    partialize: (state) => ({
      modelIA: state.modelIA,
    }),
  }),
)
