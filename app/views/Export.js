import React, {
    Component
} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    Linking,
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity
} from 'react-native';

import colors from "../constants/colors";
import WebView from 'react-native-webview';
import Button from "../components/Button";
import {
    GetStoreData
} from '../helpers/General';
import {
    convertPointsToString
} from '../helpers/convertPointsToString';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import LocationServices from '../services/LocationService';
import backArrow from './../assets/images/backArrow.png'
const width = Dimensions.get('window').width;

const base64 = RNFetchBlob.base64


//import RNShareFile from 'react-native-file-share';


class ExportScreen extends Component {
    constructor(props) {
        super(props);
    }

    onShare = async () => {
        try {
            const locationArray = await GetStoreData('LOCATION_DATA');
            var locationData;

            if (locationArray !== null) {
                locationData = JSON.parse(locationArray);
            } else {
                locationData = [];
            }

            b64Data = base64.encode(JSON.stringify(locationData));
            Share.open({
                url: "data:string/txt;base64," + b64Data
            }).then(res => {
                console.log(res);
            })
                .catch(err => {
                    console.log(err.message, err.code);
                })
        } catch (error) {
            console.log(error.message);
        }
    };

    backToMain() {
        this.props.navigation.navigate('LocationTrackingScreen', {})
    }

    render() {

        return (
            <SafeAreaView style={styles.container}>

                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backArrowTouchable} onPress={() => this.backToMain()}>
                         <Image style={styles.backArrow} source={backArrow} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Export</Text>
                </View>

                <View style={styles.main}>
                    <Text style={styles.sectionDescription}>You can share you location trail with anyone using the Share button below.  Once you press the button it will ask you with whom and how you want to share it.</Text>
                    <Text style={styles.sectionDescription}>Location is shared as a simple list of times and coordinates, no other identifying information.</Text>
                    <TouchableOpacity style={styles.buttonTouchable} onPress={this.onShare}>
                        <Text style={styles.buttonText}>SHARE</Text>
                    </TouchableOpacity>
                    <Text style={[styles.sectionDescription,{marginTop:36}]}>Log has data of {convertPointsToString(LocationServices.getPointCount()) }</Text>
                </View>

            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    // Container covers the entire screen
    container: {
        flex: 1,
        flexDirection: 'column',
        color: colors.PRIMARY_TEXT,
        backgroundColor: colors.WHITE
    },
    headerTitle: {
        textAlign: 'center',
        fontWeight: "bold",
        fontSize: 38,

        padding: 0
    },
    subHeaderTitle: {
        textAlign: 'center',
        fontWeight: "bold",
        fontSize: 22,
        padding: 5
    },
    main: {
        flex: 1,
        flexDirection: 'column',
        textAlignVertical: 'top',
       // alignItems: 'center',
        padding:20,
        width:'96%',
        alignSelf:'center'
    },
    buttonTouchable: {
        borderRadius: 12,
        backgroundColor: "#665eff",
        height:52,
        alignSelf:'center',
        width:width*.7866,
        marginTop:30,
        justifyContent:'center'
    },
    buttonText:{

        fontFamily: "OpenSans-Bold",
        fontSize: 14,
        lineHeight: 19,
        letterSpacing: 0,
        textAlign: "center",
        color: "#ffffff"
    },
    mainText: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '400',
        textAlignVertical: 'center',
        padding: 20,
    },
    smallText: {
        fontSize: 10,
        lineHeight: 24,
        fontWeight: '400',
        textAlignVertical: 'center',
        padding: 20,
    },

    headerContainer: {
        flexDirection: 'row',
        height:60,
        borderBottomWidth:1,
        borderBottomColor:'rgba(189, 195, 199,0.6)'
    },
    backArrowTouchable:{
        width:60,
        height:60,
        paddingTop:21,
        paddingLeft:20
    },
    backArrow: {
        height: 18, 
        width: 18.48
    },
    headerTitle:{
        fontSize: 24,
        lineHeight: 24,
        fontFamily:'OpenSans-Bold',
        top:21
    },
    sectionDescription: {
        fontSize: 16,
        lineHeight: 24,
        marginTop:12,
        fontFamily:'OpenSans-Regular',
    },
});

export default ExportScreen;