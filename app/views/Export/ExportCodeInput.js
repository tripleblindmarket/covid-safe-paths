import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icons } from '../../assets';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Typography } from '../../components/Typography';
import Colors from '../../constants/colors';
import fontFamily from '../../constants/fonts';
import { Theme } from '../../constants/themes';

const CODE_LENGTH = 6;
const MOCK_ENDPOINT =
  'https://private-anon-da01e87e46-safeplaces.apiary-mock.com/access-code/valid';

const CodeInput = ({ code, length, setCode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  let digits = [];
  for (let i = 0; i < length; i++) digits.push(code[i]);

  const digitRefs = useRef([]);
  useEffect(() => {
    digitRefs.current = digitRefs.current.slice(0, length);
  }, [length]);

  const focus = i => {
    digitRefs.current[i].focus();
  };

  // Focus on mount
  useEffect(() => {
    setTimeout(() => {
      focus(0);
    }, 0); // allow waiting for transition to end & first paint
  }, []);

  const onFocus = i => {
    if (i > currentIndex) {
      // prohibit skipping forward
      focus(currentIndex);
    } else {
      // restart at clicked digit
      setCurrentIndex(i);
      setCode(code.slice(0, i));
    }
  };

  // Adding digits
  const onChangeDigit = d => {
    if (d.length) {
      setCode(code.slice(0, currentIndex) + d);
      const nextIndex = currentIndex + 1;
      if (nextIndex < length) {
        setCurrentIndex(nextIndex);
        focus(nextIndex);
      }
    }
  };

  // Removing digits
  const onKeyPress = e => {
    if (e.nativeEvent.key === 'Backspace') {
      // go to previous
      if (!code[currentIndex]) {
        const newIndex = currentIndex - 1;
        if (newIndex >= 0) {
          setCurrentIndex(newIndex);
          setCode(code.slice(0, newIndex));
          focus(newIndex);
        }
      }
      // clear current (used for last digit)
      else {
        setCode(code.slice(0, currentIndex));
      }
    }
  };

  return (
    <View style={{ flexDirection: 'row', flexShrink: 1 }}>
      {[...digits].map((digit, i) => (
        <TextInput
          ref={ref => (digitRefs.current[i] = ref)}
          key={`${i}CodeDigit`}
          value={digit}
          style={[
            styles.digitInput,
            {
              borderColor: digit
                ? Colors.VIOLET_BUTTON
                : Colors.VIOLET_BUTTON_LIGHT,
            },
          ]}
          keyboardType={'number-pad'}
          returnKeyType={'done'}
          onChangeText={onChangeDigit}
          onKeyPress={onKeyPress}
          blurOnSubmit={false}
          onFocus={() => onFocus(i)}
        />
      ))}
    </View>
  );
};

export const ExportSelectHA = ({ route, navigation }) => {
  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeInvalid, setCodeInvalid] = useState(false);

  const { selectedAuthority } = route.params;

  const validateCode = async () => {
    setIsCheckingCode(true);
    setCodeInvalid(false);
    try {
      const res = await fetch(`${MOCK_ENDPOINT}?access_code=${code}`);
      const { valid } = await res.json();
      if (valid) {
        navigation.navigate('ExportLocationConsent', {
          selectedAuthority,
          code,
        });
      } else {
        setCodeInvalid(true);
      }
      setIsCheckingCode(false);
    } catch (e) {
      Alert.alert(t('common.something_went_wrong'));
      setIsCheckingCode(false);
    }
  };

  return (
    <Theme use='default'>
      <StatusBar
        barStyle='dark-content'
        backgroundColor={Colors.VIOLET_BUTTON}
        translucent={false}
      />
      <SafeAreaView style={styles.wrapper}>
        <KeyboardAvoidingView behavior={'padding'} style={styles.container}>
          <View style={styles.headerIcons}>
            <IconButton
              icon={Icons.BackArrow}
              size={27}
              onPress={() => navigation.replace('ExportSelectHA')}
            />
            <IconButton
              icon={Icons.Close}
              size={22}
              onPress={() => navigation.navigate('SettingsScreen')}
            />
          </View>
          <View style={{ flex: 1, marginBottom: 20 }}>
            <Typography use='headline2' style={styles.exportSectionTitles}>
              {t('export.code_input_title')}
            </Typography>
            <View style={{ height: 8 }} />
            <Typography use='body1'>
              {t('export.code_input_body', { name: selectedAuthority.name })}
            </Typography>
            {/* These flex grows allow for a lot of flexibility across device sizes */}
            <View style={{ maxHeight: 60, flexGrow: 1 }} />
            <View style={{ flexGrow: 1 }}>
              <CodeInput code={code} length={CODE_LENGTH} setCode={setCode} />
              {codeInvalid && (
                <Typography style={styles.errorSubtitle} use='body2'>
                  {t('export.code_input_error')}
                </Typography>
              )}
            </View>
            <Button
              disabled={code.length < CODE_LENGTH || isCheckingCode}
              label={t('common.next')}
              onPress={validateCode}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Theme>
  );
};

const styles = StyleSheet.create({
  errorSubtitle: {
    marginTop: 8,
    color: Colors.RED_TEXT,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    paddingLeft: 0,
  },
  wrapper: {
    flex: 1,
    paddingBottom: 44,
    backgroundColor: Colors.INTRO_WHITE_BG,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flex: 1,
  },
  digitInput: {
    fontSize: 20,
    color: Colors.VIOLET_TEXT_DARK,
    textAlign: 'center',
    flexGrow: 1,
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  exportSectionTitles: {
    color: Colors.VIOLET_TEXT_DARK,
    fontWeight: '500',
    fontFamily: fontFamily.primaryMedium,
  },
});

export default ExportSelectHA;
