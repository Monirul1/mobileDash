export const environment = {
  production: true,
  appId:                    'dashboard',
  version:                  '0.7.5',
  playplexApi:              'http://10.242.152.109:3002/proxy/playplex-api',
  jenkinsApi:               'http://10.242.152.109:3002/proxy/jenkins-api',
  pollingIntervalInSeconds: 60,
  requestTimeoutInSeconds:  10,
  throttleInMs:             50,
  numRetries:               2,
  retryDelayInMs:           500,
  numTimingsForAvg:         6,
  maxMessages:              1000,
};
