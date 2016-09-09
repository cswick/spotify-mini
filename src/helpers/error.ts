import ErrorSources from '../lib/ErrorSources';

let handleError = (errorSource, args) => {
  console.error(`${errorSource}: ${JSON.stringify(args, null, '\t')}`);
};

export default handleError;
