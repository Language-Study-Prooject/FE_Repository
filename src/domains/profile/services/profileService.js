import api from '../../../api/axios'

const profileService = {
    // 내 프로필 조회
    getMyProfile: async () => {
        const response = await api.get('/users/profile/me')
        return response.data
    },

    // 프로필 수정 (닉네임, 레벨)
    updateProfile: async ({ nickname, level, profileUrl }) => {
        const response = await api.put('/users/profile/me', {
            nickname,
            level,
            profileUrl
        })
        return response.data
    },

    // 이미지 업로드 URL 발급
    getImageUploadUrl: async (fileName, contentType) => {
        const response = await api.post('/users/profile/me/image', {
            fileName,
            contentType
        })
        return response.data
    },

    // S3에 이미지 직접 업로드
    uploadImageToS3: async (uploadUrl, file) => {
        await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file
        })
    }
}

export default profileService