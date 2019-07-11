export const environment = {
  production: false,
  appId:                    'dashboard',
  version:                  '0.7.5',
  playplexApi:              'http://localhost:3002/proxy/playplex-api',
  jenkinsApi:               'http://localhost:3002/proxy/jenkins-api',
  pollingIntervalInSeconds: 10,
  requestTimeoutInSeconds:  10,
  throttleInMs:             50,
  numRetries:               2,
  retryDelayInMs:           500,
  numTimingsForAvg:         5,
  maxMessages:              1000,
};
