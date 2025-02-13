import { PermissionsAndroid, Platform } from "react-native";
import storage from '@react-native-firebase/storage';
import { PhotoIdentifier } from '@react-native-camera-roll/camera-roll';
export async function hasAndroidPermission() {
        try {
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const hasReadMediaImagesPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
                const hasReadMediaVideoPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);

                if (hasReadMediaImagesPermission && hasReadMediaVideoPermission) {
                    return true;
                }
                const statuses = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                ]);

                return statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED &&
                    statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const hasStoragePermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
                if (hasStoragePermission) {
                    return true;
                }
                const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
                return status === PermissionsAndroid.RESULTS.GRANTED;
            }
        } catch (error) {
            console.error('Permission request error:', error);
            return false;
        }
    }

export const uploadImagesToFirebase = async (images: PhotoIdentifier[], onProgress: (progress: number) => void): Promise<string[]> => {
    const uploadPromises = images.map(async (image) => {
        const uri = image.node.image.uri; 
        console.log('Uploading file from URI:', uri); 
        const filename = uri.substring(uri.lastIndexOf('/') + 1); 
        const reference = storage().ref(`images/${filename}`); 

        const task = reference.putFile(uri);

        task.on('state_changed', (taskSnapshot) => {
            const progress = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100; 
            onProgress(progress); 
        });

        try {
            await task;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error; 
        }

        return await reference.getDownloadURL();
    });

    return Promise.all(uploadPromises);
};