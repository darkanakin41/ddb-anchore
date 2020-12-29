import { auth, init } from '@/store/modules.ts'

export default function hydrateStore () {
  return new Promise((resolve, reject) => {
    init.setHydrating(true)
    hydrateStoreSecurity().finally(async () => {
      resolve()

      init.setHydrating(false)
      init.setHydrated(true)
    }).catch((e) => {
      reject(e)
    })
  })
}

export async function hydrateStoreSecurity () {
  await auth.tryGetUser()
}

export function resetStore () {
  auth.resetState()
  init.resetState()
}
