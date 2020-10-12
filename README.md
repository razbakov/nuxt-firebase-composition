# nuxt-firebase-composition

> Firebase Composition API for Nuxt.js

Use all the power of Composition API with Firebase in your Nuxt.js projects.

## Usage

Example of ToDos-App in `pages/index.vue`:

```vue
<template>
  <div v-if="!uid">
    <button @click="signInWithGoogle">Sign in</button>
  </div>
  <div v-else>
    <div>Signed in UID: {{ uid }}</div>
    <ul>
      <li v-for="todo in docs" :key="todo.id">{{ todo.title }}</li>
    </ul>
    <input v-model="newTodo" />
    <button @click="addTodo">Add</button>
  </div>
</template>

<script>
import { useAuth, useCollection, useDoc } from 'nuxt-firebase-composition'
import { ref } from '@nuxtjs/composition-api'

export default {
  setup() {
    const { uid, signInWithGoogle } = useAuth()
    const { docs } = useCollection('todos')
    const { create } = useDoc('todos')

    const newTodo = ref('')

    const addTodo = () => {
      create({
        title: newTodo.value,
      })
      newTodo.value = ''
    }

    return {
      newTodo,
      addTodo,
      signInWithGoogle,
      uid,
      docs,
      create,
    }
  },
}
</script>
```

## Why?

How is this better than [nuxt/firebase](https://github.com/nuxt-community/firebase-module) and [vuexfire](https://github.com/vuejs/vuefire/tree/master/packages/vuexfire) and [vuex-easy-firestore](https://github.com/mesqueeb/vuex-easy-firestore)?

You can create re-usable modules. For example let's take a code above and put it under `~/use/todos.js`:

```js
import { useCollection, useDoc } from 'nuxt-firebase-composition'
import { ref } from '@nuxtjs/composition-api'

export default () => {
  const { docs: todos } = useCollection('todos')
  const { create } = useDoc('todos')

  const newTodo = ref('')

  const addTodo = () => {
    create({
      title: newTodo.value,
    })
    newTodo.value = ''
  }

  return {
    newTodo,
    addTodo,
    todos,
  }
}
```

Now you can replace the `<script>` section of initial code to:

```js
import { useAuth } from 'nuxt-firebase-composition'
import useTodos from '~/use/todos.js'

export default {
  setup() {
    const { uid, signInWithGoogle } = useAuth()
    const { newTodo, addTodo, todos } = useTodos()

    return {
      signInWithGoogle,
      uid,
      newTodo,
      addTodo,
      todos,
    }
  },
}
```

I also believe that if all your modules will use `useCollection` and `useDoc` and `useAuth` as interface it will be easier later to switch from Firebase to other provider. And as you see in code Firebase and Firestore are not used directly.

There is a big room for improvement, but I believe foundation is there.

## Setup

1. Create Nuxt.js project

```bash
yarn create nuxt-app my-project
```

2. Install module and dependencies

```bash
yarn add nuxt-firebase-composition firebase @nuxtjs/composition-api
```

3. Create `~/plugins/firebase.client.js`:

```js
import { initFirebase } from 'nuxt-firebase-composition'
import { onGlobalSetup } from '@nuxtjs/composition-api'

export default ({ env: { firebase } }) => {
  onGlobalSetup(() => {
    initFirebase(firebase)
  })
}
```

4. Enable plugin in the `plugins` section of `nuxt.config.js`

```js
{
  plugins: [
    '~/plugins/firebase.client'
  ],
}
```

5. Add Firebase configuration to the `env` section of `nuxt.config.js`

```js
{
  env: {
    firebase: {
      config: {
          // REQUIRED: Official config for firebase.initializeApp(config):
          apiKey: '<apiKey>',
          authDomain: '<authDomain>',
          databaseURL: '<databaseURL>',
          projectId: '<projectId>',
          storageBucket: '<storageBucket>',
          messagingSenderId: '<messagingSenderId>',
          appId: '<appId>',
          measurementId: '<measurementId>'
      },
      services: {
        auth: true,
        firestore: true,
        analytics: false
      }
    }
  }
}
```

Your firebase config snippet and other Firebase specific parameters. You can retrieve this information from your Firebase project's overview page:

`https://console.firebase.google.com/project/<your-project-id>/overview`

## ToDos

`nuxt@2` with `@nuxtjs/composition-api` is still limited and doesn't offer the whole spectrum of features that we can have with `vue3`, I hope it's going to be solved with `nuxt@3`.

Initially I tried to create a compatible vue package, not only for nuxt, but I got a problem with `provide` from `@vue/composition-api` in Nuxtjs.

I tried to create a module for Nuxtjs, but got some weird errors, that I wasn't able to solve yet. It would be great to have it as a module though.

I would love to get some feedback and ideas.

Please let me know if you tried to install it and if it worked smoothly or you got a problem.

## Support me

If you like the idea please give a star to [nuxt-firebase-composition](https://github.com/razbakov/nuxt-firebase-composition) on Github.

If something doesn't work [create an issue](https://github.com/razbakov/nuxt-firebase-composition/issues/new).
