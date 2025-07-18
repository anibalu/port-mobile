# Port, by Numberless
Port is a communication app that emphasises consent. Building upon the concept of a "Port", it aims to
give users a way to connect in a manner where they control how much access they give up.

Port is currently built for iOS and Android using react-native. This repository contains the source code for the apps. You can download Port [here for Android](https://play.google.com/store/apps/details?id=tech.numberless.port) or [here for iOS](https://apps.apple.com/ca/app/port-messenger/id6473122668)

## Environment setup
Port is a react-native app. To set up your environment for React Native development, follow their guide over on [their documentation](https://reactnative.dev/docs/0.78/environment-setup).

Port uses LFS for large file storage on git. You can find instructions and downloads on [their website](https://git-lfs.com/). If you have any issues downloading specific files using LFS, please open an issue.

## Running the app
Once your environment is set up, from the root of the project, run `yarn ready-all`. This is a one stop shop to install dependencies and get started. Once your terminal stops panicking, you should see instructions from the metro server on how to launch the app on Android or iOS. For logs, you can use react native's dev tools, but we recommend going straight to Android Studio or XCode to get insight into native code.

## Documentation
Maintaining documentation is an ongoing project.
- [] Migrate over wiki
- [] Track debt
- [] Track missing documentation

### General practises:

- Function names should be descriptive. A well-named function won't need documentation. Still, include a docstring.
- In complex flows such as Chat, add in-line comments for sensitive choices that have been made during development. An example is how the Chat Flatlist uses the `inverted=true` flag, which means that **messages need to be sent in a inverted order** to the list.
- Avoid using short variable names, use descriptive names unless they are inline variables with limited operational scope.
- **Typing is important, even for return types**. Do not create function definitions that implicitly assume `any`. All functions and classes **MUST** include type declarations, either inline or separately.

### UI Classes

- For a screen, define any sensitive choices (as mentioned above).
- **Naming of the screen** is important. Names such as `NewGroupScreen.tsx` are redundant, name it `NewGroup.tsx`. This has been slipping recently, we should do better. I swear there's a 'NewNewXYZ.tsx' somewhere.

### Configuration:
- `react-native-dotenv` doesn't seem to be working very well. We intend to strip it out completely until we find a viable solution. Instead, abuse `src/configs/api.ts`. God knows we have. This is a bit of an antipattern, but all API urls go here. The only lines that really matter are:
```bash
const useSSL = USE_SSL ? USE_SSL === 'true' : true;
const URL = DOMAIN ? DOMAIN : 'staging.numberless.tech';
```

Prefer using `staging.numberless.tech`, but if that's unreachable or otherwise angry at you, use `dev.numberless.tech`.

## Building and releasing to production

To build for production, you need access to the following:

1. credentials to our `eas` account. This will grant access to profiles and keys we use to sign builds with. Reach out to Abhi for this.
1. A `sentry.properties` file, to be placed both in `android/` and `ios/`. Reach out to Abhi for access to the Sentry account if you don't already have it, and follow instructions to generate the file.

### Preparation

In our api.ts file, replace staging/dev with the production URL. Additionally you want to enable sentry logging, so replace undifned with the commented out URL right below it. Don't worry, this URL is not a secret, the `sentry.properties` file is.

### Android

The command to build for android is: `% eas build --local --platform=android`. This will run locally and may prompt you to log into the eas account. At the end of this, you will have a `.aab` file in the top level of the project.

To publish the app, log into the Play Console for the developer account and proceed with the steps outlined there. For access, reach out to Abhi.

### iOS

The command to build for iOS is `% eas build --local --platform=ios`. This will run locally and may prompt you to enter credentials to both your eas account, and apple developer account. If you don't have a developer account, reach out to Abhi (this is a theme...). At the end of this, you will have a `.ipa` file at the top level of the project.

To publish, first install transporter from the App Store. Ensure the publisher is verified to be apple themselves. Sign in, and then upload the generated `.ipa` file. Follow instructions, to submit to App Store Connect. When complete, log into App Store Connect and go to the testflight tab. You may need to complete some compliance. If the app hasn't appeared yet, wait. You will get an email as to whether the upload succeded or failed. It occasionally takes forever.

_Note: `.ipa` and `.aab` files are ignored by git. We don't want to commit them._

## Extra recommendations
- At Numberless, engineers are issued Apple silicon Macbooks. This makes life challenging in many ways, but is a requirement for developing for iOS. If issues are opened on for other hardware, we aren't certain about our ability to reproduce and resolve the issue.

- We recommend, wherever possible, avoiding running the app on emulators/simulators. There are several issues with this. On iOS simulators don't support APNS or CallKit. You are likely to have to refresh the app after every message you send to the device. You are occasionally issued an APNS token on a simulator, but these are freak incidents. The experience on Android emulators are better, but not stellar either.