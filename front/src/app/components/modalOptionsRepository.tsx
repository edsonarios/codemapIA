import {
  IRepositoryStore,
  useRepositoryStore,
} from '@/components/store/repositoryStore'
import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'
import Close from './icons/close'
import { API_URL } from '../view/utils/utils'
import ModalConfirmation from './modalConfirmation'

export default function ModalOptionsRepository() {
  const {
    isShowModalRepository,
    setIsShowModalRepository,
    repositoryData,
    analyzedRepos,
    setAnalyzedRepos,
    setIsShowConfirmationModal,
    waitForConfirmation,
  } = useRepositoryStore<IRepositoryStore>((state) => state)

  const [nameRepository, setNameRepository] = useState<string>('')
  const [descriptionRepository, setDescriptionRepository] = useState<string>('')

  // Event key escape to close the modal
  useEffect(() => {
    if (repositoryData) {
      setNameRepository(repositoryData.name)
      setDescriptionRepository(repositoryData.description)
    }
  }, [isShowModalRepository])

  const handledUpdateRepository = async () => {
    if (!repositoryData) return
    const response = await fetch(
      `${API_URL}/repositories/${repositoryData.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nameRepository,
          description: descriptionRepository,
        }),
      },
    )
    const data = await response.json()
    if (!response.ok) {
      toast.error(data.message)
      return
    }
    toast.success(data.message)
  }

  const handledRemoveRepository = async () => {
    if (!repositoryData) return
    setIsShowConfirmationModal(true)

    const isConfirmed = await waitForConfirmation()

    if (!isConfirmed) return
    const response = await fetch(
      `${API_URL}/repositories/${repositoryData.id}`,
      {
        method: 'DELETE',
      },
    )
    const data = await response.json()
    if (!response.ok) {
      toast.error(data.message)
      return
    }
    toast.success(data.message)
    const newAnalyzedRepos = analyzedRepos.filter(
      (repo) => repo.id !== repositoryData.id,
    )
    setAnalyzedRepos(newAnalyzedRepos)
    setIsShowModalRepository(false)
  }

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.key === 'Escape') {
        setIsShowModalRepository(false)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <div>
      {isShowModalRepository && (
        <div
          onClick={() => setIsShowModalRepository(false)}
          className={
            'fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-20'
          }
        >
          <div
            onClick={(event) => {
              event.stopPropagation()
            }}
            className="w-[600px]"
          >
            <header className="relative flex flex-row bg-zinc-900 rounded-t-md p-2 justify-between">
              <h1>Detail Repository</h1>
              <button
                className="flex p-1 rounded-full opacity-70 hover:bg-zinc-800 hover:opacity-100"
                onClick={() => setIsShowModalRepository(false)}
              >
                <Close className="size-5" />
              </button>
            </header>
            <section className="relative flex flex-col bg-zinc-800 rounded-b-md p-6 gap-4 px-6 justify-start">
              <div className="flex items-center">
                <label className="">Name</label>
                <input
                  className="bg-zinc-900 p-2 rounded-md w-full ml-2"
                  type="text"
                  value={nameRepository}
                  onChange={(e) => setNameRepository(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <label className="">Url:</label>
                <a
                  className="ml-2 hover:underline"
                  href={repositoryData?.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {repositoryData?.url}
                </a>
              </div>
              <div className="flex">
                <label className="">Description</label>
                <textarea
                  className="bg-zinc-900 p-2 rounded-md w-full ml-2 h-44"
                  value={descriptionRepository}
                  onChange={(e) => setDescriptionRepository(e.target.value)}
                />
              </div>
              <div className="space-x-2 flex justify-around">
                <button
                  className="p-2 bg-blue-500 hover:bg-blue-400 rounded-md"
                  onClick={handledUpdateRepository}
                >
                  Save Changes
                </button>
                <button
                  className="p-2 bg-red-500 hover:bg-red-400 rounded-md"
                  onClick={handledRemoveRepository}
                >
                  Delete Repository
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
      <Toaster position="bottom-center" richColors closeButton />
      <ModalConfirmation />
    </div>
  )
}
