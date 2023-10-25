import { onBeforeUnmount, onMounted } from 'vue'

export const onEnterPressed = (callback: () => void) => {
  const modifiedCallback = (event: KeyboardEvent) => {
    if (event.code === 'Enter' || event.key === 'Enter' || event.keyCode === 13) {
      callback()
    }
  }

  window.addEventListener('keyup', modifiedCallback)

  return () => {
    window.removeEventListener('keyup', modifiedCallback)
  }
}

export const onShiftEnterPressed = (callback: () => void) => {
  const modifiedCallback = (event: KeyboardEvent) => {
    if ((event.code === 'Enter' || event.key === 'Enter' || event.keyCode === 13) && event.shiftKey) {
      callback()
    }
  }

  window.addEventListener('keyup', modifiedCallback)

  return () => {
    window.removeEventListener('keyup', modifiedCallback)
  }
}

export const useEnterKeyboardListener = (callback: () => void) => {
  let removeListener: () => void

  onMounted(() => {
    removeListener = onEnterPressed(callback)
  })

  onBeforeUnmount(() => {
    removeListener && removeListener()
  })
}

export const useShiftEnterKeyboardListener = (callback: () => void) => {
  let removeListener: () => void

  onMounted(() => {
    removeListener = onShiftEnterPressed(callback)
  })

  onBeforeUnmount(() => {
    removeListener && removeListener()
  })
}
