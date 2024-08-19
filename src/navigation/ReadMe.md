## This folder is responsible for the App's navigation.

### The App has 2 navigation stacks that a developer needs to be aware of. A 3rd stack ("Login Stack will rarely need any changes"):

1. Onboarding Stack (stack the helps user setup a new profile)
2. App Stack (primary stack of the app which navigates the user to Home by default).

If you need to add a new screen to the App:

1. Create screen component
2. Decide which stack the screen goes to.
3. Add screen to stack.

Example of adding a screen to onboarding stack:

1. Create screen component which accepts certain params. Lets call this ExampleScreen({param1: string; param2: boolean})
2. add ExampleScreen to AppStackParamList.

```
AppStackParamList = {...other screen, ExampleScreen: {param1: string; param2: boolean}}
```

3. add ExampleScreen to AppStack by importing it and adding it as a Stack.Screen component.

```
<Stack.Screen name="ExampleScreen" component={ExampleScreen} />
```

There are three stacks currently.
Level 1 stacks: Login Stack and App Stack.
App Stack has all screens. Along with all these screens,
it has FolderStack which is the level 2 stack. This is where nesting starts.

To access appstack, navigation.navigate('AppStack', {screen:screename})
To access folderstack, navigation.navigate('FolderStack', {screen:screename})
