import { ref, onMounted, onUnmounted } from 'vue'

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  messageId: number | null
}

export function useContextMenu() {
  const menuState = ref<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
  })

  function openMenu(messageId: number, x: number, y: number) {
    menuState.value = { visible: true, x, y, messageId }
  }

  function closeMenu() {
    menuState.value = { visible: false, x: 0, y: 0, messageId: null }
  }

  function onDocumentClick() {
    if (menuState.value.visible) {
      closeMenu()
    }
  }

  onMounted(() => {
    document.addEventListener('click', onDocumentClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
  })

  return { menuState, openMenu, closeMenu }
}
