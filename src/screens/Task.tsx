import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CameraRoll, PhotoIdentifier } from "@react-native-camera-roll/camera-roll";
import { hasAndroidPermission } from '../Utils/Helpers';
import { TEXT } from '../Utils/Constants';
import { ms, mvs } from '../Utils/ScalingUtils';

const Task = () => {
    const [renderedPhotos, setRenderPhotos] = useState<PhotoIdentifier[]>([]);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [endCursor, setEndCursor] = useState<string | undefined>();

    useEffect(() => {
        const checkPermission = async () => {
            const hasPermission = await hasAndroidPermission();
            if (hasPermission) {
                fetchPhotos();
            }
        };

        checkPermission();
    }, []);

    const fetchPhotos = async (after?: string) => {
        const photos = await CameraRoll.getPhotos({
            first: 4,
            after,
            assetType: 'Photos',
        });
        console.log(JSON.stringify(photos), "PHOTOS")
        setHasNextPage(photos.page_info.has_next_page);
        setEndCursor(photos.page_info.end_cursor);
        console.log(JSON.stringify(photos.edges), "PHOTOS NEW")
        setRenderPhotos(prev => after ? [...prev, ...photos.edges] : photos.edges);
    }

    const loadMore = () => {
        if (hasNextPage) {
            fetchPhotos(endCursor);
        }
    }

    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={{ flex: 1, }}
                numColumns={4}
                style={styles.flatList}
                data={renderedPhotos}
                keyExtractor={(_, index) => index.toString()}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text>{TEXT.NoImage}</Text>
                    </View>
                )}
                ListFooterComponent={() => (
                    hasNextPage ? (
                        <TouchableOpacity
                            onPress={loadMore}
                            style={{ justifyContent: 'center', alignItems: 'center', padding: 10 }}
                        >
                            <Text>Load More</Text>
                        </TouchableOpacity>
                    ) : null
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity>
                        <Image source={{ uri: item?.node?.image?.uri }} style={{ width: ms(96), height: mvs(96) }} resizeMode='cover' />
                        {/* <Text>HELLO . HI</Text> */}
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

export default Task

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flatList: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});