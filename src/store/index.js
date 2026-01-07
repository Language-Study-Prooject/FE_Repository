import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    // 슬라이스들 추가
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store
