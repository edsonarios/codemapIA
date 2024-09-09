import { paramViewPageName } from '@/components/utils/constants'
import { Repository } from '../view/interface/repository.interface'
import ArrowUpRight from './icons/arrowUpRight'
import ArrowRight from './icons/arrowRight'
import { DateTime } from 'luxon'
import Options from './icons/options'
import {
  IRepositoryStore,
  useRepositoryStore,
} from '@/components/store/repositoryStore'
import { Session } from 'next-auth'

export default function RepositoryCard({
  repo,
  session,
}: {
  repo: Repository
  session: Session | null
}) {
  const { setIsShowModalRepository, setRepositoryData } =
    useRepositoryStore<IRepositoryStore>((state) => state)

  return (
    <section className="relative w-[350px] min-h-52 h-52 border-2 border-gray-500 rounded-lg p-4 space-y-2 hover:bg-neutral-600/20 transition-all ease-in-out duration-100 hover:h-auto group">
      {session && (
        <button
          className="absolute flex justify-center items-center rounded-md top-0 right-0 hover:bg-neutral-100/20 p-1"
          onClick={() => {
            setIsShowModalRepository(true)
            setRepositoryData(repo)
          }}
        >
          <Options className="size-5 hover:rotate-45 transition-all duration-200 hover:stroke-2" />
        </button>
      )}
      <a
        className="text-[#5cc8f7] flex flex-row justify-center items-center hover:underline"
        href={`/view?${paramViewPageName}=${repo.id}`}
      >
        <ArrowRight />
        <div className="text-center text-lg">{`${repo.name}`}</div>
      </a>
      <a
        className="flex flex-row w-full hover:underline"
        href={repo.url}
        target="_blank"
        rel="noreferrer"
      >
        <div className="text-sm ">{repo.url}</div>
        <ArrowUpRight />
      </a>

      {/* Aquí el line-clamp funcionará correctamente */}
      <div className="text-sm w-full text-gray-400 line-clamp-2 group-hover:line-clamp-none pb-1">
        {repo.description}
      </div>

      {/* Mover la fecha más abajo sin usar pb-8 */}
      <div className="absolute text-xs text-gray-500 bottom-1 right-2">{`Last update: ${DateTime.fromISO(repo.updatedAt).toFormat('yyyy LLL dd')}`}</div>
    </section>
  )
}
