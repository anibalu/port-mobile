import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {cleanDeletePort} from '@utils/Ports';
import {PendingCardInfo, PortTable} from '@utils/Ports/interfaces';
import {formatTimeAgo} from '@utils/Time';
import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Link from '@assets/icons/LinkIcon.svg';
import QRIcon from '@assets/icons/QRIcon.svg';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';

const ContactCard = (props: PendingCardInfo) => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setShowDeleteModal(true)}>
      <SimpleCard style={styles.card}>
        <View style={styles.row}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
            }}>
            <View
              style={{
                padding: PortSpacing.secondary.uniform,
                backgroundColor: PortColors.primary.grey.light,
                borderRadius: 12,
              }}>
              {props.isLink ? <Link /> : <QRIcon />}
            </View>

            <View style={styles.textrow}>
              <NumberlessText
                fontType={FontType.rg}
                ellipsizeMode="tail"
                numberOfLines={1}
                fontSizeType={FontSizeType.l}
                style={styles.text}>
                {props.name}
              </NumberlessText>
              <NumberlessText
                fontType={FontType.rg}
                ellipsizeMode="tail"
                numberOfLines={1}
                fontSizeType={FontSizeType.s}
                style={styles.subtitle}>
                Created {formatTimeAgo(props.createdOn)}
              </NumberlessText>
            </View>
          </View>
          <ConfirmationBottomSheet
            visible={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={async () =>
              await cleanDeletePort(props.portId, PortTable.generated)
            }
            title={`Your connection with ${props.name} is pending`}
            description="Your connection is formed when your contact clicks on the link you
          sent. If you decide not to connect, you can delete the Port."
            buttonText="Delete Port"
            buttonColor="r"
          />
        </View>
      </SimpleCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: PortSpacing.secondary.uniform,
    marginBottom: PortSpacing.tertiary.bottom,
    justifyContent: 'center',
    padding: PortSpacing.tertiary.uniform,
  },
  descriptionText: {
    textAlign: 'left',
    width: '100%',
    marginTop: PortSpacing.secondary.top,
  },
  text: {
    color: 'black',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textrow: {
    padding: PortSpacing.tertiary.uniform,
    gap: 4,
    flex: 1,
  },
  subtitle: {
    color: PortColors.subtitle,
  },
  declinebutton: {
    backgroundColor: PortColors.primary.red.error,
    justifyContent: 'center',
    borderRadius: PortSpacing.tertiary.uniform,
    alignItems: 'center',
    flexDirection: 'row',
    gap: PortSpacing.tertiary.uniform,
    padding: PortSpacing.tertiary.uniform,
  },
});

export default ContactCard;
