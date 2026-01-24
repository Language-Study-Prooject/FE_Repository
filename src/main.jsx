import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom'
import App from './App.jsx'
import {store} from './store'
import {ThemeProvider} from './contexts/ThemeContext'
import {ChatProvider} from './contexts/ChatContext'
import {SettingsProvider} from './contexts/SettingsContext'
import './index.css'
import {Amplify} from 'aws-amplify'
import {AuthProvider} from './contexts/AuthContext.jsx'
import {NotificationProvider, NotificationToast} from './domains/notification'
import awsConfig from './aws-config'

Amplify.configure(awsConfig)

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <ThemeProvider>
                    <SettingsProvider>
                        <ChatProvider>
                            <AuthProvider>
                                <NotificationProvider>
                                    <App/>
                                    <NotificationToast/>
                                </NotificationProvider>
                            </AuthProvider>
                        </ChatProvider>
                    </SettingsProvider>
                </ThemeProvider>
            </BrowserRouter>
        </Provider>
    </StrictMode>,
)
