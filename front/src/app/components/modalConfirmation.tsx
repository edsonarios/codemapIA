import {
  IRepositoryStore,
  useRepositoryStore,
} from '@/components/store/repositoryStore'
import Warning from './icons/warning'

export default function ModalConfirmation() {
  const {
    isShowConfirmationModal,
    setIsShowConfirmationModal,
    setConfirmOption,
  } = useRepositoryStore<IRepositoryStore>((state) => state)

  return (
    <div>
      {isShowConfirmationModal && (
        <div
          className={
            'fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-30'
          }
        >
          <div
            onClick={(event) => {
              event.stopPropagation()
            }}
            className="w-[500px]"
          >
            <header className="relative flex flex-row bg-zinc-900 rounded-t-md p-3 justify-between">
              <h1>Confirmation</h1>
            </header>
            <section className="relative flex flex-col bg-zinc-800 rounded-b-md p-6 gap-4 px-6 justify-start">
              <div className="flex space-x-2">
                <Warning className="stroke-yellow-500" />
                <p>Are you sure you want to delete this repository?</p>
              </div>
              <div className="flex space-x-6 justify-center">
                <button
                  className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-md px-4"
                  onClick={() => {
                    setConfirmOption(false)
                    setIsShowConfirmationModal(false)
                  }}
                >
                  No
                </button>
                <button
                  className="p-2 bg-blue-500 hover:bg-blue-400 rounded-md px-4"
                  onClick={() => {
                    setConfirmOption(true)
                    setIsShowConfirmationModal(false)
                  }}
                >
                  Yes
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
