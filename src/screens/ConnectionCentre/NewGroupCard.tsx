import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '../../components/NumberlessText';
import Icon from '../../../assets/icons/ConnectionCenterGroups.svg';
import {Button} from './Button';
import {instrument} from './ConnectionCentre';
type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;

function NewGroupCard(props: {
  isClicked: boolean;
  setSelected: SetStateFunction<instrument>;
}) {
  if (props.isClicked) {
    return (
      <View style={style.clickedBox}>
        <View style={style.briefBox}>
          <View style={style.negativeBox}>
            <View style={style.iconBox}>
              <Icon height={24} width={26} />
            </View>
            <View style={style.lineBox} />
          </View>
          <View style={style.textBox}>
            <NumberlessMediumText style={style.titleText}>
              New Group
            </NumberlessMediumText>
            <NumberlessRegularText style={style.descriptionText}>
              Bring people together, build strong communities and have lively
              conversations.
            </NumberlessRegularText>
          </View>
        </View>
        <View style={style.educationBox}>
          <View>
            <NumberlessRegularText style={style.educationText}>
              Add education below
            </NumberlessRegularText>
          </View>
          <Button
            onPress={() => console.log('create pressed')}
            style={{width: '80%'}}>
            Create
          </Button>
        </View>
      </View>
    );
  }
  return (
    <Pressable
      style={style.unclickedBox}
      onPress={() => props.setSelected({id: 'group'})}>
      <View style={style.briefBox}>
        <View style={style.negativeBox}>
          <View style={style.iconBox}>
            <Icon height={24} width={26} />
          </View>
          <View style={style.lineBox} />
        </View>
        <View style={style.textBox}>
          <NumberlessMediumText style={style.titleText}>
            New Group
          </NumberlessMediumText>
          <NumberlessRegularText style={style.descriptionText}>
            Bring people together, build strong communities and have lively
            conversations.
          </NumberlessRegularText>
        </View>
      </View>
    </Pressable>
  );
}

const style = StyleSheet.create({
  unclickedBox: {
    opacity: 0.4,
    display: 'flex',
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  clickedBox: {
    display: 'flex',
    width: '100%',
    borderRadius: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  briefBox: {
    minHeight: 106,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  textBox: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '100%',
    width: '100%',
    paddingLeft: 121,
    paddingTop: 15,
    paddingRight: 20,
    paddingBottom: 15,
  },
  negativeBox: {
    position: 'absolute',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  titleText: {
    color: '#000000',
    fontSize: 15,
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 12,
    marginBottom: 5,
  },
  iconBox: {
    width: 76,
    height: 76,
    backgroundColor: '#547CEF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15,
  },
  lineBox: {
    marginTop: 10,
    marginBottom: 10,
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  educationBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
  },
  educationText: {
    fontSize: 15,
    marginBottom: 200,
  },
});

export default NewGroupCard;
