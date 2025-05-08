import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';


import AcceptTerms from '@screens/AcceptTerms/AcceptTerms';
import AcceptTermsSecondThoughts from '@screens/AcceptTerms/AcceptTermsSecondThoughts';
import DeleteAccountAnyway from '@screens/AcceptTerms/DeleteAccountAnyway';

import {TermsStackParamList} from './TermsStackTypes';

const Stack = createNativeStackNavigator<TermsStackParamList>();

function TermsStack() {
  return (
    <>
      <Stack.Navigator
        initialRouteName="AcceptTerms"
        screenOptions={{
          headerShown: false,
          orientation: 'portrait',
        }}>
        <Stack.Screen name="AcceptTerms" component={AcceptTerms} />
        <Stack.Screen name="AcceptTermsSecondThoughts" component={AcceptTermsSecondThoughts} />
        <Stack.Screen name="DeleteAccountAnyway" component={DeleteAccountAnyway} />
      </Stack.Navigator>
    </>
  );
}

export default TermsStack;