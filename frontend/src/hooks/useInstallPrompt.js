import { useEffect, useState } from 'react'

export function useInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault() // stop Chrome's automatic mini-banner
      setInstallEvent(e) // save it so we can trigger it manually later
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = async () => {
    if (!installEvent) return
    installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null) // can only be used once
  }

  return { canInstall: !!installEvent, promptInstall }
}