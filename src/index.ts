import { provideFirebase, useFirebase } from './firebase'
import { provideCollections, useCollection } from './collection'
import { provideAuth, useAuth } from './auth'
import useDoc from './doc'
import { FirebaseApp, FirebaseOptions } from '@firebase/app-types'

function initFirebase(config: FirebaseOptions) {
  provideFirebase(config)
  provideAuth()
  provideCollections()
}

export { initFirebase, useFirebase, useCollection, useAuth, useDoc }
