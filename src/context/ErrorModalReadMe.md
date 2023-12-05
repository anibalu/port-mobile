# error modal provider

this is wrapped around the whole app so it can be used
anywhere

# control functions togglemodal, showmodal and hidemodal are handled in the context and not exposed outside

technically this is not a modal, rather a view tag that disappears in 3 seconds

# to add a error object

in ErrorModalContext.tsx file, add your error object having
text and Icon props and send it in the provider

Use this anywhere in the app from useErrorModal() custom hook

# to use the error modal

call the function in the parent component (in a button or function)
no need to call the component
