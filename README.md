# numberless client app

Our react native codebase for our end to end encrypted, authenticated, identifierless messaging applicattion with support for iOS and Android.

## IOS setup steps:

1. Install rbenv and use it to set ruby version 2.7.6 for the project:
	a. Run "brew install rbenv"
	b. Run "rbenv init"
	c. Make sure your bash script has eval "$(rbenv init -)" added at the end
	d. Run "rbenv install 2.7.6"
	e. Run "rbenv local 2.7.6"
    f. Run "ruby --version" to ensure the right verion of ruby is being used (ruby 2.7.6)
2. npm install (//use react-native-numberless-crypto module version 0.1.19 for actual iphone and 0.1.18 for iphone emulator. if you have 1.18, remove the ^ symbol so that RN doesn't use the newer library)
3. cd ios
4. bundle install
5. bundle exec pod install
6. Open Port.xcworkspace / npm start
7. Click on run / press "i" if started with npm start

## Android setup steps:

1. npm install
2. npm start
3. press "a"

## Documentation guidelines
Best practises for documenting Port.

The basic philosophy is that writing cleaner and descriptive code makes it redundant to document. 
*Unless you're performing a in-line array manipulation that involves creating Hashmaps, you won't need to write a comment explaining it.*

**Always document before you commit your final code. Doing it early makes your life hell, but doing it after your code is handed over makes everyone else's life hell**

### General practises:
- Function names should be descriptive. A well-named function won't need documentation.
- In complex flows such as Chat, add in-line comments for sensitive choices that have been made during development. An example is how the Chat Flatlist uses the `inverted=true` flag, which means that **messages need to be sent in a inverted order** to the list.
- Avoid using short variable names, use descriptive names unless they are inline variables with limited operational scope.
- **Typing is important, even for return types**. Do not create function definitions that implicitly assume `any`. All functions and classes **MUST** include type declarations, either inline or separately.

### UI Classes
- For a screen, define any sensitive choices (as mentioned above). 
- **Naming of the screen** is important. Names such as `NewGroupScreen.tsx` are redundant, name it `NewGroup.tsx`.

### Helper functions and utils
- Define input and response params for such functions. You can omit explaining the function, as long as the function name is descriptive enough.
- Use your intuition when writing comments here. If you feel like a general developer will not understand the line you're writing, **don't write it** that way. If there's no option, write it and then document it.
- Reiterating that **typing is essential**. It makes it easier to understand code, without having to document unnecessarily.

### Examples:
- `index.ts` under `AppPermissions` for functions.
- `Chat` under `Screens` for an end-to-end flow of all.

