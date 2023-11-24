import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Pressable,
} from 'react-native';
import GreyArrowDown from '../../../assets/icons/GreyArrowDown.svg';
import GreyArrowUp from '../../../assets/icons/GreyArrowUp.svg';
import Screenshot from '../../../assets/icons/Screenshot.svg';
import {Asset, launchImageLibrary} from 'react-native-image-picker';

const AccordionWithRadio = ({
  sections,
  selected,
  setSelected,
  setReviewText,
  reviewText,
  image,
  setImage,
  category,
  Img,
  setError,
}) => {
  const [expanded, setExpanded] = useState(false);

  const openImageGallery = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
      });
      //images are selected
      const selected: Asset[] = response.assets || [];
      setImage(selected[0].uri);
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  const toggleAccordion = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleAccordion} style={styles.header}>
        <View style={styles.accordionTitleStyles}>
          <Img style={{marginRight: 10}} />
          <Text style={styles.headerText}>{category}</Text>
          {expanded ? <GreyArrowUp /> : <GreyArrowDown />}
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.content}>
          {sections.map(section => {
            const {content, index} = section;
            return (
              <Pressable
                onPress={() => setSelected(section)}
                style={styles.sectionStyles}
                key={section.index}>
                <Text style={styles.sectionTextStyles}>{content}</Text>
                <RadioButton selected={selected.index === index} />
              </Pressable>
            );
          })}
        </View>
      )}
      <TextInput
        textAlign="left"
        textAlignVertical="top"
        style={styles.input}
        placeholder="Enter issue here"
        onChangeText={value => {
          setReviewText(value);
          setError('');
        }}
        value={reviewText}
      />

      <View style={styles.screenshot}>
        {image ? (
          <>
            <Text onPress={openImageGallery} style={styles.screenshotText}>
              Attached Screenshot. Click to change
            </Text>
            <Image style={styles.selectedImage} source={{uri: image}} />
          </>
        ) : (
          <>
            <Text style={styles.screenshotText}>
              Do you wish to attach a screenshot?
            </Text>
            <Screenshot onPress={openImageGallery} />
          </>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    margin: 10,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingLeft: 20,
  },
  screenshot: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 10,
  },
  selectedImage: {
    height: 70,
    width: 70,
    marginLeft: -40,
    borderRadius: 10,
    marginBottom: 10,
  },
  screenshotText: {
    width: '90%',
    alignSelf: 'center',
    fontWeight: '400',
    fontSize: 14,
    marginBottom: 15,
    color: '#868686',
  },
  accordionTitleStyles: {
    paddingVertical: 15,
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 150,
    alignSelf: 'center',
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
    borderRadius: 16,
    paddingLeft: 15,
  },

  headerText: {
    fontSize: 15,
    fontWeight: '600',
    width: '90%',
    color: 'black',
  },
  content: {
    paddingTop: 25,
    backgroundColor: 'white',
  },
  sectionStyles: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'white',
  },
  sectionTextStyles: {
    width: '85%',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 20,
    marginLeft: 20,
    color: 'black',
  },
});

const RadioButton = ({selected}) => (
  <View
    style={{
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#547CEF',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    {selected && (
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: '#547CEF',
        }}
      />
    )}
  </View>
);

export default AccordionWithRadio;
