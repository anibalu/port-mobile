# numberless client app

Our react native codebase for our end to end encrypted, authenticated, identifierless messaging applicattion with support for iOS and Android.

IOS setup steps:

1. Install rbenv and use it to set ruby version 2.7.6 for the project:
	a. Run "brew install rbenv"
	b. Run "rbenv init"
	c. Make sure your bash script has eval "$(rbenv init -)" added at the end
	d. Run "rbenv install 2.7.6"
	e. Run "rbenv local 2.7.6"
    f. Run "ruby --version" to ensure the right verion of ruby is being used (ruby 2.7.6)
2. npm install (//use react-native-numberless-crypto module version 0.1.15 for actual iphone and 0.1.16 for iphone emulator. if you have 1.15, remove the ^ symbol so that RN doesn't use the newer library)
3. cd ios
4. bundle install
5. bundle exec pod install
6. Open Port.xcworkspace / npm start
7. Click on run / press "i" if started with npm start

Android setup steps:

1. npm install
2. npm start
3. press "a"
