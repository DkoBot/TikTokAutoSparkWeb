import { ref } from 'vue'

export const browserStatus = ref(false)
export const loginStatus = ref(false)
export const friendsList = ref([])
export const hasLoaded = ref(false)
export const homeLoaded = ref(false)

export const setBrowserStatus = (status) => {
  browserStatus.value = status
}

export const setLoginStatus = (status) => {
  loginStatus.value = status
}

export const setFriendsList = (list) => {
  friendsList.value = list
  hasLoaded.value = true
}

export const setHomeLoaded = () => {
  homeLoaded.value = true
}
