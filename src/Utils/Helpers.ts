import { PermissionsAndroid, Platform } from "react-native";

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