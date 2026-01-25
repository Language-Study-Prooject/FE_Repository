import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import profileService from '../services/profileService'

// 프로필 조회
export const fetchMyProfile = createAsyncThunk(
    'profile/fetchMyProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await profileService.getMyProfile()
            return response.data || response
        } catch (error) {
            const status = error.response?.status
            const message = error.response?.data?.error || error.message || '프로필 조회 실패'
            return rejectWithValue({ message, status })
        }
    }
)

// 프로필 수정
export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (data, { rejectWithValue }) => {
        try {
            const response = await profileService.updateProfile(data)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || '프로필 수정 실패')
        }
    }
)

// 이미지 업로드
export const uploadProfileImage = createAsyncThunk(
    'profile/uploadImage',
    async (file, { dispatch, rejectWithValue }) => {
        try {
            const urlResponse = await profileService.getImageUploadUrl(file.name, file.type)
            const { uploadUrl, imageUrl } = urlResponse.data

            await profileService.uploadImageToS3(uploadUrl, file)
            await dispatch(updateProfile({ profileUrl: imageUrl }))

            return imageUrl
        } catch (error) {
            return rejectWithValue('이미지 업로드 실패')
        }
    }
)

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        profile: null,
        loading: false,
        error: null,
        updateLoading: false,
        imageUploading: false,
        authError: false
    },
    reducers: {
        clearError: (state) => { state.error = null },
        clearProfile: (state) => { state.profile = null }
    },
    extraReducers: (builder) => {
        builder
            // fetchMyProfile
            .addCase(fetchMyProfile.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMyProfile.fulfilled, (state, action) => {
                state.loading = false
                state.profile = action.payload
            })
            .addCase(fetchMyProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || action.payload

                const status = action.payload?.status
                const message = String(action.payload?.message || action.payload || '')

                if (status === 401 || message.includes('401') || message.includes('인증')) {
                    state.profile = null
                    state.authError = true
                }
            })
            // updateProfile
            .addCase(updateProfile.pending, (state) => {
                state.updateLoading = true
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.updateLoading = false
                state.profile = action.payload
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.updateLoading = false
                state.error = action.payload
            })
            // uploadProfileImage
            .addCase(uploadProfileImage.pending, (state) => {
                state.imageUploading = true
            })
            .addCase(uploadProfileImage.fulfilled, (state) => {
                state.imageUploading = false
            })
            .addCase(uploadProfileImage.rejected, (state, action) => {
                state.imageUploading = false
                state.error = action.payload
            })
    }
})

export const { clearError, clearProfile } = profileSlice.actions
export default profileSlice.reducer