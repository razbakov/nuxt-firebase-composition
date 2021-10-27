import { reactive, toRefs, provide, inject } from '@nuxtjs/composition-api'
import { useFirebase } from './firebase'
import {
  signOut,
  signInAnonymously,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { User } from './types'

const AuthSymbol = Symbol('FirebaseAuth')

export function useAuth() {
  const result = inject(AuthSymbol)

  if (!result) {
    throw Error('No Auth provided')
  }
  return result as any
}

export function provideAuth() {
  const { firebase } = useFirebase()
  const auth = getAuth(firebase)

  const state = reactive({
    loading: true,
    signingIn: false,
    uid: null as null|string,
    user: null as null|User
  })

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await setUser(user)
    }
  })

  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn')
    if (!email) {
      email = window.prompt('Please provide your email for confirmation')
      if (email) {
        signInWithEmailLink(auth, email, window.location.href).then(() => {
          window.localStorage.removeItem('emailForSignIn')
        }).catch((e) => {
          console.error(e)
        })
      } else {
        console.error('Must supply e-mail address')
      }
    }
  }

  async function resetUser() {
    state.user = null
    state.uid = null
    state.loading = false
    state.signingIn = false
  }

  async function setUser(user: User) {
    state.user = user
    state.uid = user ? user.uid : null
    state.loading = false
    state.signingIn = false
  }

  async function _signOut() {
    signOut(auth).then(() => {
      resetUser()
    })
  }

  async function _signInAnonymously() {
    signInAnonymously(auth).then(() => {
      state.signingIn = true
    })
  }

  async function _signInWithEmailLink(link: string) {
    state.signingIn = true

    // todo: add email extraction from url
    let email = ''
    if (!email) {
      console.error('email is missing')
    }

    signInWithEmailLink(auth, email, link).then(() => {
      window.localStorage.removeItem('emailForSignIn')
    })
  }

  async function _sendSignInLinkToEmail(email: string) {
    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    }

    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem('emailForSignIn', email)
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            await setUser(user)
          }
        })
      })
  }

  function _signInWithGoogle() {
    state.signingIn = true

    const provider = new GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/userinfo.email')
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user
        if (user) {
          await setUser(user)
        }
      })
  }

  provide(AuthSymbol, {
    ...toRefs(state),
    _signInWithGoogle,
    _sendSignInLinkToEmail,
    _signOut,
    _signInAnonymously,
    _signInWithEmailLink,
  })
}
