import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const SettingsContext = createContext(null)

const STORAGE_KEY = 'app_settings'

const defaultSettings = {
  ttsVoice: 'FEMALE', // MALE | FEMALE
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const setTtsVoice = useCallback((voice) => {
    updateSettings({ ttsVoice: voice })
  }, [updateSettings])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setTtsVoice }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
