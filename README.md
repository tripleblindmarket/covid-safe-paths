# Private Kit: San Marino

This is forked version of official private-kit repository which is intended to be customized, deployed to production and tested in San Marino Republic.

## Project Setup

1. Integrate mobile applications with Firebase backend and Cloud Storage
   [x] - private-kit-sm Firebase project setup
   [x] - iOs app connected to Firebase
   [x] - Android app connected to Firebase
   [x] - Implement Export to Cloud Storage (private domain)
   [ ] - Move public dataset to Cloud Storage (public domain)

1. Setup CI\CD pipeline and publish apps to app stores
   [] - Deploy app to Google Play Store (Private Kit: San Marino)
   [] - Deploy app to Apple Store (Private Kit: San Marino)
   [] - Github Actions workflow for CI\CD for Android app
   [] - Github Actions workflow for CI\CD for iOs app

1. Updates to frontend application and UX design
   [ ] - Discuss idea of responsible signaling (the idea is to let people signal that they suspect infection and mark themselves for authorities and neighbours?)
   [ ] - Elaborated user story (including government part)
   [ ] - Implement UI required to get user consent and export data

## Project Take-off

1. Backend logic (on Google Cloud Platform)
   [ ] - Review public dataset update logic and aggregation process
   [ ] - Setup cloud infrastructure to trigger update (python scripts probably?) to public dataset
   [ ] - Push-notification for mobile apps (daily updates on new cases)
   [ ] - Review cryptography used and infered privacy guarantees
   [ ] - Review security and access rights, GDPR complience check
1. UX design and frontend app
   [ ] - Develop wireframes in Figma and finalize UX/UI
   [ ] - Implement missing screens and UI elements

# Original Initiative: Private Kit

Help us stop COVID-19.

We’re building the next generation of secure location logging to preserve privacy and #flattenthecurve

Location logs provide time-stamped records of where users have been, allowing them to share information with health officials accurately and quickly. This helps support contact tracing efforts to slow the spread of the virus.

What’s truly special about Private Kit, though, is its privacy protection. Data never leaves users’ devices without their password entry and explicit consent. The location log generated by Private Kit cannot be accessed from outside the user’s device, meaning data transfer occurs only if the user chooses to share it with the researcher.

---

<img align="right" src="./assets/PreviewUI.png" data-canonical-src="./assets/PreviewUI.png"/>

Private Kit is a ‘privacy-first’ app that allows you to log your GPS trails on your own phone. The information is stored locally and never shared with anyone (not even with us or MIT) until you explicitly decide to manually export the data. The location log generated by Private Kit cannot be accessed from outside the user’s device. Location information can be imported and exported by the user and used in other projects and applications.

Private Kit’s trail generator logs your device’s location once every five minutes and stores 28 days of data in under 100KB of space – less space than a single picture. But what is truly exciting about Private Kit is its privacy protection.

**Home page:** http://privatekit.mit.edu

**WhitePaper:** [Apps Gone Rogue: Maintaining Personal Privacy in an Epidemic](https://drive.google.com/file/d/1nwOR4drE3YdkCkyy_HBd6giQPPhLEkRc/view?usp=sharing)

**Downloads:** [Google Play](https://play.google.com/store/apps/details?id=edu.mit.privatekit) | [Apple Store](https://apps.apple.com/us/app/private-kit-prototype/id1501903733)

# Development Overview

This is a React Native app version 61.5

## Architecture

Please refer to `docs/Private Kit Diagram.png` for a basic overview on the sequencing of generalized events and services that are utilized by Private Kit.

## Developer Setup

Refer to and run the dev_setup.sh (Linux/MacOS) or dev_setup.bat (Windows) for needed tools.

### iOS Configuration - First Time Setup

1. Move to `ios` directory and run `pod install`
2. If you have any trouble with packages not round, try `react-native link` from project directory.
3. Look at running commands below.

### Google Maps API Key

You will need to generate a Google API key in order for the mapping features to work correctly. Refer to this guide [guide](https://developers.google.com/maps/documentation/ios-sdk/get-api-key) in order to create the API key.

Once created you will need to add it to two different places in the project. One for Android and one for iOS.

- Android - open `android/app/src/main/AndroidManifest.xml`and search for `com.google.android.geo.API_KEY`. Add your key to the `android:value` property.
- iOS - open `ios/PrivateKit/AppDelegate.m` and search for `GMSServices provideAPIKey` and replace line with `[GMSServices provideAPIKey:@"YOUR_API_KEY"];`

## Running

Install modules:
`npm install` or `yarn install` (note `yarn` does a better job at installing dependencies on macOS)

To run, do:

```
npx react-native run-android
```

or

```
npx react-native run-ios --simulator="iPhone 8 Plus"
```

NOTE: In some cases, the abovementioned procedure leads to the error 'Failed to load bundle - Could not connect to development server'. In these cases, kill all other react-native processes and try it again.

## Contributing

Read the [contribution guidelines](CONTRIBUTING.md).

WhatsApp: https://chat.whatsapp.com/HXonYGVeAwQIKxO0HYlxYL
Slack: https://safepathsprivatekit.slack.com/
