import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { translations, LANGUAGES } from '../i18n/translations'

const SettingsContext = createContext(null)

const STORAGE_KEY = 'app_settings'

const defaultSettings = {
  ttsVoice: 'FEMALE', // MALE | FEMALE
  language: LANGUAGES.KO, // ko | en
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

  const setLanguage = useCallback((lang) => {
    updateSettings({ language: lang })
  }, [updateSettings])

  // Translation function
  const t = useCallback((key) => {
    const keys = key.split('.')
    let value = translations[settings.language]

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return value || key
  }, [settings.language])

  const value = useMemo(() => ({
    settings,
    updateSettings,
    setTtsVoice,
    setLanguage,
    t,
    language: settings.language,
    isKorean: settings.language === LANGUAGES.KO,
    isEnglish: settings.language === LANGUAGES.EN,
  }), [settings, updateSettings, setTtsVoice, setLanguage, t])

  return (
    <SettingsContext.Provider value={value}>
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

// Convenience hook for translations
export const useTranslation = () => {
  const { t, language, isKorean, isEnglish } = useSettings()
  return { t, language, isKorean, isEnglish }
}
