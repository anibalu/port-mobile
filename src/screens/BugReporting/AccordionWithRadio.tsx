import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import GreyArrowDown from '@assets/icons/GreyArrowDown.svg';
import GreyArrowUp from '@assets/icons/GreyArrowUp.svg';
import Screenshot from '@assets/icons/Screenshot.svg';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {FontSizes, PortColors, screen} from '@components/ComponentUtils';
import GenericInput from '@components/GenericInput';

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
          <NumberlessMediumText style={styles.headerText}>
            {category}
          </NumberlessMediumText>
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
                <NumberlessRegularText style={styles.sectionTextStyles}>
                  {content}
                </NumberlessRegularText>
                <RadioButton selected={selected.index === index} />
              </Pressable>
            );
          })}
        </View>
      )}

      <GenericInput
        wrapperStyle={{
          height: screen.height / 4,
          marginBottom: 20,
          marginTop: 0,
          paddingHorizontal: 20,
        }}
        inputStyle={{
          ...FontSizes[15].regular,
          paddingLeft: 15,
          paddingTop: 10,
          textAlignVertical: 'top',
          borderRadius: 12,
          width: '95%',
          alignSelf: 'center',
        }}
        maxLength={350}
        multiline={true}
        text={reviewText}
        setText={value => {
          setReviewText(value);
          setError('');
        }}
        placeholder="Enter issue here"
        alignment="left"
        showLimit={true}
      />

      <View style={styles.screenshot}>
        {image ? (
          <>
            <NumberlessRegularText style={styles.screenshotText}>
              Attached Screenshot.{' '}
              <NumberlessRegularText
                style={[
                  styles.screenshotText,
                  {textDecorationLine: 'underline'},
                ]}
                onPress={openImageGallery}>
                Click to change
              </NumberlessRegularText>
            </NumberlessRegularText>
            <Image style={styles.selectedImage} source={{uri: image}} />
          </>
        ) : (
          <>
            <NumberlessRegularText style={styles.screenshotText}>
              Do you wish to attach a screenshot?
            </NumberlessRegularText>
            <Screenshot style={{top: -7}} onPress={openImageGallery} />
          </>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderRadius: 16,
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
    ...FontSizes[12].regular,
    alignSelf: 'center',
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
    marginBottom: 20,
    paddingLeft: 15,
  },

  headerText: {
    ...FontSizes[15].medium,
    width: '90%',
    color: 'black',
  },
  content: {
    paddingTop: 5,
    backgroundColor: 'white',
  },
  sectionStyles: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'white',
  },
  sectionTextStyles: {
    width: '85%',
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
      borderColor: PortColors.primary.blue.app,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    {selected && (
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: PortColors.primary.blue.app,
        }}
      />
    )}
  </View>
);

export default AccordionWithRadio;
