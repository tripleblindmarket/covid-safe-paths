import React, { Component } from 'react';
import {
  BackHandler,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import packageJson from '../../package.json';
import fontFamily from './../constants/fonts';
import languages from './../locales/languages';
import lock from '../assets/svgs/lock';
import NavigationBarWrapper from '../components/NavigationBarWrapper';
import { Typography } from '../components/Typography';
import Colors from '../constants/colors';
import { DEBUG_MODE } from '../constants/storage';
import { GetStoreData } from '../helpers/General';
import { disableDebugMode, enableDebugMode } from '../helpers/Intersect';

class AboutScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tapCount: 0, // tracks number of taps, for debugging
    };
  }

  backToMain() {
    this.props.navigation.goBack();
  }

  handleBackPress = () => {
    this.setState({ tapCount: 0 });
    this.backToMain();
    return true;
  };

  componentDidMount() {
    GetStoreData(DEBUG_MODE).then(dbgMode => {
      if (dbgMode == 'true') {
        this.setState({ tapCount: 4 });
      }
    });

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleTapTeam = () => {
    // debug builds only until we have feature flagging.
    if (__DEV__) {
      this.setState({ tapCount: this.state.tapCount + 1 });
      if (this.state.tapCount >= 3) {
        if (this.state.tapCount == 3) {
          enableDebugMode();
        } else if (this.state.tapCount == 7) {
          this.setState({ tapCount: 0 });
          disableDebugMode();
        }
      }
    }
  };

  handleExitDebugModePress = () => {
    this.setState({ tapCount: 0 });
    disableDebugMode();
  };

  render() {
    return (
      <NavigationBarWrapper
        title={languages.t('label.about_title')}
        onBackPress={this.backToMain.bind(this)}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.spacer} />
          <View style={styles.spacer} />

          <View style={styles.aboutLabelContainer}>
            <SvgXml style={styles.aboutSectionIconLock} xml={lock} />
            <Typography style={styles.aboutSectionTitles}>
              {languages.t('label.commitment')}
            </Typography>
          </View>
          <Typography style={styles.aboutSectionPara}>
            {languages.t('label.commitment_para')}
            <Typography
              style={styles.aboutcovidhyperlink}
              onPress={() => {
                Linking.openURL('https://covidsafepaths.org/');
              }}>
              {/* eslint-disable-next-line react-native/no-raw-text */}
              {'covidsafepaths.org'}
            </Typography>
          </Typography>

          <View style={styles.spacer} />
          <View style={styles.spacer} />

          <View style={styles.main}>
            <View style={styles.row}>
              <Typography style={styles.aboutSectionParaBold}>
                {languages.t('about.version')}
              </Typography>
              <Typography style={styles.aboutSectionPara}>
                {packageJson.version}
              </Typography>
            </View>

            <View style={styles.row}>
              <Typography style={styles.aboutSectionParaBold}>
                {languages.t('about.operating_system_abbr')}
              </Typography>
              <Typography style={styles.aboutSectionPara}>
                {Platform.OS + ' v' + Platform.Version}
              </Typography>
            </View>

            <View style={styles.row}>
              <Typography style={styles.aboutSectionParaBold}>
                {languages.t('about.dimensions')}
              </Typography>
              <Typography style={styles.aboutSectionPara}>
                {Math.trunc(Dimensions.get('screen').width) +
                  ' x ' +
                  Math.trunc(Dimensions.get('screen').height)}
              </Typography>
            </View>
          </View>

          <View style={styles.spacer} />
          <View style={styles.spacer} />
        </ScrollView>
      </NavigationBarWrapper>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: Colors.INTRO_WHITE_BG,
    paddingHorizontal: 26,
    paddingBottom: 42,
  },
  aboutLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  aboutSectionIconLock: {
    width: 20,
    height: 26.67,
    marginTop: 36,
  },
  aboutSectionTitles: {
    color: Colors.VIOLET_TEXT,
    fontSize: 26,
    fontFamily: fontFamily.primaryMedium,
    marginTop: 36,
    marginLeft: 10,
    lineHeight: 32,
  },
  aboutSectionPara: {
    color: Colors.VIOLET_TEXT,
    fontSize: 16,
    lineHeight: 22.5,
    marginTop: 12,
    alignSelf: 'center',
    fontFamily: fontFamily.primaryRegular,
  },
  aboutcovidhyperlink: {
    color: Colors.VIOLET_TEXT,
    fontSize: 16,
    lineHeight: 22.5,
    marginTop: 12,
    alignSelf: 'center',
    fontFamily: fontFamily.primaryRegular,
    textDecorationLine: 'underline',
  },
  aboutSectionParaBold: {
    color: Colors.VIOLET_TEXT,
    fontSize: 16,
    lineHeight: 22.5,
    marginTop: 12,
    alignSelf: 'center',
    fontFamily: fontFamily.primaryBold,
  },
  spacer: {
    marginVertical: '2%',
  },
  row: {
    flexDirection: 'row',
    color: Colors.PRIMARY_TEXT,
    alignItems: 'flex-start',
  },
});

export default AboutScreen;
