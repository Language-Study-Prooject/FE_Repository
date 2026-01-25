import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    fetchMyProfile,
    updateProfile,
    uploadProfileImage,
    clearError
} from '../store/profileSlice'

export const useProfile = () => {
    const dispatch = useDispatch()
    const { profile, loading, error, updateLoading, imageUploading } = useSelector(
        (state) => state.profile
    )

    useEffect(() => {
        if (!profile && !loading && !error) {
            dispatch(fetchMyProfile())
        }
    }, [dispatch, profile, loading, error])

    return {
        profile,
        loading,
        error,
        updateLoading,
        imageUploading,
        updateProfile: (data) => dispatch(updateProfile(data)).unwrap(),
        uploadImage: (file) => dispatch(uploadProfileImage(file)).unwrap(),
        clearError: () => dispatch(clearError()),
        refetch: () => dispatch(fetchMyProfile())
    }
}

export default useProfile