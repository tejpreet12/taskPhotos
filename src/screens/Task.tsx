import {
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {hasAndroidPermission} from '../Utils/Helpers';
import {TEXT} from '../Utils/Constants';
import {ms, mvs} from '../Utils/ScalingUtils';
import {Images} from '../assets/Images/Images';

const Task = () => {
  const [renderedPhotos, setRenderPhotos] = useState<PhotoIdentifier[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoIdentifier[]>([]);
  const [isMultipleSelect, setIsMultipleSelect] = useState(false);

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
    console.log(JSON.stringify(photos), 'PHOTOS');
    setHasNextPage(photos.page_info.has_next_page);
    setEndCursor(photos.page_info.end_cursor);
    console.log(JSON.stringify(photos.edges), 'PHOTOS NEW');
    setRenderPhotos(prev =>
      after ? [...prev, ...photos.edges] : photos.edges,
    );
  };

  const loadMore = () => {
    if (hasNextPage) {
      fetchPhotos(endCursor);
    }
  };

  return (
    <View style={styles.container}>
      {renderedPhotos ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setIsMultipleSelect(false)}>
            <View style={styles.radio}>
              {!isMultipleSelect && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Select Single Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setIsMultipleSelect(true)}>
            <View style={styles.radio}>
              {isMultipleSelect && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Select Multiple Images</Text>
          </TouchableOpacity>
        </View>
      ) : null}

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
                <Text>Load More</Text>
              </TouchableOpacity>
            ) : null}
            {selectedPhotos.length > 0 ? (
              <TouchableOpacity style={{alignSelf: 'center', marginVertical:mvs(10)}}>
                <Text>Upload to Firebase</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => {
              if (isMultipleSelect) {
                setSelectedPhotos(prev => {
                  const isAlreadySelected = prev.some(
                    photo => photo.node.image.uri === item.node.image.uri,
                  );
                  if (isAlreadySelected) {
                    return prev.filter(
                      photo => photo.node.image.uri !== item.node.image.uri,
                    );
                  } else {
                    return [...prev, item];
                  }
                });
              } else {
                if (
                  selectedPhotos.length > 0 &&
                  selectedPhotos[0].node.image.uri === item.node.image.uri
                ) {
                  setSelectedPhotos([]);
                } else {
                  setSelectedPhotos([item]);
                }
              }
            }}>
            <Image
              source={{uri: item?.node?.image?.uri}}
              style={{width: ms(95), height: mvs(95)}}
              resizeMode="cover"
            />
            {selectedPhotos.some(
              photo => photo.node.image.uri === item.node.image.uri,
            ) && (
              <View style={styles.checkmarkContainer}>
                {/* <Text style={styles.checkmark}>✓</Text> */}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: mvs(10),
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mvs(8),
  },
  radio: {
    height: ms(20),
    width: ms(20),
    borderRadius: ms(10),
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(8),
  },
  radioSelected: {
    height: ms(12),
    width: ms(12),
    borderRadius: ms(6),
    backgroundColor: '#007AFF',
  },
  radioText: {
    fontSize: 16,
    color: '#000000',
  },
  checkmarkContainer: {
    position: 'absolute',
    right: ms(6),
    top: 5,
    /*     backgroundColor: '#007AFF',
    borderRadius: ms(12),
    width: ms(24),
    height: ms(24), */
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    tintColor: '#007AFF',
    height: mvs(20),
    width: ms(20),
  },
});
