import { onBeforeUnmount, onMounted } from 'vue'

export const onEnterPressed = (callback: () => void) => {
  const modifiedCallback = (event: KeyboardEvent) => {
    // Check that only Enter is pressed, without any modifiers
    if ((event.code === 'Enter' || event.key === 'Enter' || event.keyCode === 13) && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
      callback();
    }
  };

  window.addEventListener('keyup', modifiedCallback);

  return () => {
    window.removeEventListener('keyup', modifiedCallback);
  };
};


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

export const onShiftBackspacePressed = (callback: () => void) => {
  const modifiedCallback = (event: KeyboardEvent) => {
    if (event.key === 'Backspace' && event.shiftKey) {
      callback();
    }
  };

  window.addEventListener('keyup', modifiedCallback);

  return () => {
    window.removeEventListener('keyup', modifiedCallback);
  };
};

export const onDeletePressed = (callback: () => void) => {
  const modifiedCallback = (event: KeyboardEvent) => {
    if (event.key === 'Delete' && event.shiftKey) {
      callback();
    }
  };

  window.addEventListener('keyup', modifiedCallback);

  return () => {
    window.removeEventListener('keyup', modifiedCallback);
  };
};

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

export const useShiftBackspaceKeyboardListener = (callback: () => void) => {
  let removeListener: () => void;

  onMounted(() => {
    removeListener = onShiftBackspacePressed(callback);
  });

  onBeforeUnmount(() => {
    removeListener && removeListener();
  });
};

export const useShiftDeleteKeyboardListener = (callback: () => void) => {
  let removeListener: () => void;

  onMounted(() => {
    removeListener = onDeletePressed(callback);
  });

  onBeforeUnmount(() => {
    removeListener && removeListener();
  });
};