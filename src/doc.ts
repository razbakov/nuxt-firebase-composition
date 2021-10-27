import { reactive, toRefs, computed } from '@nuxtjs/composition-api'
import { useFirebase } from './firebase'
import { useAuth } from './auth'

export default function useDoc(name: any) {
  const { firestore } = useFirebase()
  const { uid } = useAuth()

  const state = reactive({
    loading: false,
    saving: false,
    exists: false,
    doc: undefined as undefined|any,
    id: null as null|string,
    slug: null,
  })

  const collection = firestore.collection(name)

  function sync(id: string) {
    state.loading = true
    collection.doc(id).onSnapshot((doc: { exists: boolean; data: () => null; id: null }) => {
      state.loading = false
      state.exists = doc.exists

      if (doc.exists) {
        state.doc = doc.data()
        state.id = doc.id
      } else {
        state.doc = null
        state.id = null
      }
    })
  }

  async function load(id: string) {
    state.loading = true

    const doc = await collection.doc(id).get()
    state.id = id

    if (!doc.exists) {
      state.exists = false
      state.loading = false
      state.doc = {}

      return false
    }

    state.doc = doc.data()
    state.slug = state.doc.slug

    state.exists = true
    state.loading = false

    return true
  }

  async function find(param: any, value: any) {
    state.loading = true

    const filteredCollection = await collection.where(param, '==', value).get()

    if (filteredCollection.docs.length === 0) {
      state.exists = false
      state.loading = false
      state.doc = {}

      return false
    }

    const doc = filteredCollection.docs[0]

    state.doc = doc.data()
    state.id = doc.id

    state.exists = true
    state.loading = false

    return true
  }

  async function update(id: string, data: any) {
    state.saving = true

    const changes = {
      updatedAt: +new Date(),
      updatedBy: uid.value,
      ...data,
    }

    const result = await collection.doc(id).update(changes)

    state.saving = false

    return result
  }

  async function set(id: string, data: any) {
    state.saving = true

    const result = await collection.doc(id).set(data)

    state.saving = false

    return result
  }

  async function remove(id: string) {
    state.saving = true

    const result = await collection.doc(id).delete()

    state.saving = false

    return result
  }

  async function create(data: any) {
    state.saving = true

    const doc = await collection.add({
      createdAt: +new Date(),
      updatedAt: +new Date(),
      createdBy: uid.value,
      updatedBy: uid.value,
      ...data,
    })

    state.id = doc.id
    state.saving = false

    return doc
  }

  const isCreator = computed(
    () => state.doc && uid.value === state.doc.createdBy
  )

  return {
    ...toRefs(state),
    create,
    find,
    update,
    load,
    remove,
    isCreator,
    set,
    sync,
  }
}
