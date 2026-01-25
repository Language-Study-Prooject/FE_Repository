import { configureStore, createSlice } from '@reduxjs/toolkit'

import profileReducer from '../domains/profile/store/profileSlice'

// 임시 슬라이스 (빈 store 에러 방지)
const appSlice = createSlice({
    name: 'app',
    initialState: {
        initialized: true,
    },
    reducers: {},
})

export const store = configureStore({
    reducer: {
        app: appSlice.reducer,
        profile: profileReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})

export default store
