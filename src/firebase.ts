import { provide, inject } from '@nuxtjs/composition-api'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { FirebaseApp, FirebaseOptions } from '@firebase/app-types'

const FirebaseSymbol = Symbol('Firebase')

export function useFirebase() {
  const result = inject(FirebaseSymbol)

  if (!result) {
    throw new Error('No Firebase provided')
  }

  return result as any
}

export function provideFirebase(options: any) {

  const apps = getApps()
  let firebase

  if (!apps.length) {
    firebase = initializeApp(options.config as FirebaseOptions) as FirebaseApp
  } else {
    firebase = apps[0] as FirebaseApp
  }

  const firestore = getFirestore(firebase)
  const realtimeDb = getDatabase(firebase)


  provide(FirebaseSymbol, {
    firebase,
    firestore,
    realtimeDb
  })
}
