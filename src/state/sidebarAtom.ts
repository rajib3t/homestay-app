type OpenItems = Record<string, boolean>

let state: OpenItems = {}
const listeners = new Set<() => void>()

export const getSidebarOpen = (): OpenItems => state

export const setSidebarOpen = (next: OpenItems) => {
  state = next
  listeners.forEach((l) => l())
}

export const updateSidebarItem = (title: string) => {
  setSidebarOpen({ ...state, [title]: !state[title] })
}

export const subscribeSidebar = (cb: () => void): (() => void) => {
  listeners.add(cb)
  return () => { listeners.delete(cb); }
}
