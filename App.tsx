import {View, Text} from 'react-native';
import React from 'react';
import Task from './src/screens/Task';
import {Provider} from 'react-redux';
import {store} from './src/redux/store/store';

const App = () => {
  return (
    <Provider store={store}>
      <View style={{flex: 1}}>
        <Task />
      </View>
    </Provider>
  );
};

export default App;
