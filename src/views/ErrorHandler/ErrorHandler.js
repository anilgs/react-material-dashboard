/* eslint-disable react/no-multi-comp */
/* eslint-disable linebreak-style */
import React from 'react';
import { NotFound } from '../';
import { useError } from '../../hooks/useError';
import { Snackbar } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import MuiAlert from '@material-ui/lab/Alert';


function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

// A context will be the way that we allow components lower down 
// the tree to trigger the display of an error page
const ErrorStatusContext = React.createContext(() => {});

// The top level component that will wrap our app's core features
export const ErrorHandler = ({ children }) => {
  const history = useHistory();
  let  displayErr = { status: false, code: 0, message: '', initial: true}
  const [err, setErrorStatus, initial, setInitial] = useError(displayErr);



  
  const handleSnackbarClose =  () => {
    displayErr.status = false;
    setErrorStatus(displayErr);
  };
  // Make sure to "remove" this status code whenever the user 
  // navigates to a new URL. If we didn't do that, then the user
  // would be "trapped" into error pages forever
  React.useEffect(() => {
    // Listen for changes to the current location.
    const unlisten = history.listen(() => setErrorStatus(undefined));
    // cleanup the listener on unmount
    return unlisten;
  }, [])
  
  // This is what the component will render. If it has an 
  // errorStatusCode that matches an API error, it will only render
  // an error page. If there is no error status, then it will render
  // the children as normal
  const renderContent = () => {
    if (err && err.code === 404) {
      return <NotFound />
    }
    // ... more HTTP codes handled here
    return children;
  }
  
  // We wrap it in a useMemo for performance reasons. More here:
  // https://kentcdodds.com/blog/how-to-optimize-your-context-value/
  const contextPayload = React.useMemo(
    () => ({ setErrorStatus }), 
    [setErrorStatus]
  );
  
  // We expose the context's value down to our components, while
  // also making sure to render the proper content to the screen 
  return (
    <ErrorStatusContext.Provider value={contextPayload}>
      {renderContent()}
      <Snackbar
        anchorOrigin={err && err.status ? { horizontal: 'left', vertical: 'bottom'} : { horizontal: 'right', vertical: 'top'}}
        autoHideDuration={5000}
        message = {err ? err.message : ''}
        onClose={handleSnackbarClose}
        open={err ? (err.status ||  err.message.length > 0) : false}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity= {err && err.status ? "error" : "success"}
        >
          { err ? err.message : '' }
        </Alert>
      </Snackbar>
    </ErrorStatusContext.Provider>
  )
}

// A custom hook to quickly read the context's value. It's
// only here to allow quick imports
export const useErrorStatus = () => React.useContext(ErrorStatusContext);
