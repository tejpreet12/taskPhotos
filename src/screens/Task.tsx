import {
  FlatList,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import { hasAndroidPermission, uploadImagesToFirebase } from '../Utils/Helpers';
import { TEXT } from '../Utils/Constants';
import { ms, mvs } from '../Utils/ScalingUtils';
import { Images } from '../assets/Images/Images';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';
import { setSelectedPhotos } from '../redux/slice/photoslice';
import { resetUploadProgress, setUploadProgress } from '../redux/slice/uploadSlice';
import * as Progress from 'react-native-progress'; 

const Task = () => {
  const [renderedPhotos, setRenderPhotos] = useState<PhotoIdentifier[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [isMultipleSelect, setIsMultipleSelect] = useState(false);

  const dispatch = useDispatch();
  const selectedPhotos = useSelector(
    (state: RootState) => state.photos.selectedPhotos,
  );
  const uploadProgress = useSelector(
    (state: RootState) => state.upload.progress
  );

  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await hasAndroidPermission();
      if (hasPermission) {
        fetchPhotos();
      }
    };

    checkPermission();
  }, []);

  const handlePhotoSelect = (item: PhotoIdentifier) => {
    if (isMultipleSelect) {
      const isAlreadySelected = selectedPhotos.some(
        photo => photo.node.image.uri === item.node.image.uri,
      );
      if (isAlreadySelected) {
        dispatch(
          setSelectedPhotos(
            selectedPhotos.filter(
              photo => photo.node.image.uri !== item.node.image.uri,
            ),
          ),
        );
      } else {
        dispatch(setSelectedPhotos([...selectedPhotos, item]));
      }
    } else {
      const isCurrentlySelected =
        selectedPhotos.length > 0 &&
        selectedPhotos[0].node.image.uri === item.node.image.uri;
      dispatch(setSelectedPhotos(isCurrentlySelected ? [] : [item]));
    }
  };

  const fetchPhotos = async (after?: string) => {
    const photos = await CameraRoll.getPhotos({
      first: 4,
      after,
      assetType: 'Photos',
    });
    setHasNextPage(photos.page_info.has_next_page);
    setEndCursor(photos.page_info.end_cursor);
    setRenderPhotos(prev =>
      after ? [...prev, ...photos.edges] : photos.edges,
    );
  };

  const loadMore = () => {
    if (hasNextPage) {
      fetchPhotos(endCursor);
    }
  };

  const handleUpload = async () => {
    dispatch(resetUploadProgress());
    try {
      const downloadUrls = await uploadImagesToFirebase(selectedPhotos, (progress) => {
        dispatch(setUploadProgress(progress));
      });
      console.log('Uploaded URLs:', downloadUrls);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      {renderedPhotos ? (
        <View style={styles.headerContainer}>
          <Text style={styles.selectionText}>Single</Text>
          <Switch
            value={isMultipleSelect}
            onValueChange={(value) => {
              setIsMultipleSelect(value);
              dispatch(setSelectedPhotos([]));
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isMultipleSelect ? '#007AFF' : '#f4f3f4'}
          />
          <Text style={styles.selectionText}>Multiple</Text>
        </View>
      ) : null}


      {selectedPhotos.length > 0 && uploadProgress > 0 && (
        <View style={{ marginVertical: 20 }}>
          <Text>{`${TEXT.UploadProgress} ${uploadProgress.toFixed(2)}%`}</Text>
          <Progress.Bar
            progress={uploadProgress / 100}
            width={300}
            style={{ marginTop: 10 }}
            color="#007AFF"
          />
        </View>
      )}

      <FlatList
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
          <>
            {renderedPhotos.length > 0 && hasNextPage ? (
              <TouchableOpacity
                onPress={loadMore}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 10,
                }}>
                <Text>{TEXT.LoadMore}</Text>
              </TouchableOpacity>
            ) : null}
            {selectedPhotos.length > 0 ? (
              <TouchableOpacity
                onPress={handleUpload}
                style={{ alignSelf: 'center', marginVertical: mvs(10) }}>
                <Text>{TEXT.UploadToFirebase}</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              handlePhotoSelect(item);
            }}>
            <Image
              source={{ uri: item?.node?.image?.uri }}
              style={{ width: ms(95), height: mvs(95) }}
              resizeMode="cover"
            />
            {selectedPhotos.some(
              photo => photo.node.image.uri === item.node.image.uri,
            ) && (
                <View style={styles.checkmarkContainer}>
                  <Image source={Images.check} style={styles.checkmark} />
                </View>
              )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Task;

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
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: mvs(10),
    paddingRight: ms(16),
  },
  selectionText: {
    fontSize: ms(16),
  },
  checkmarkContainer: {
    position: 'absolute',
    right: ms(6),
    top: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    tintColor: '#007AFF',
    height: mvs(20),
    width: ms(20),
  },
});
