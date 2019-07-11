export const schemas = [
  {
    name: 'build',
    label: 'Build System',
    vertical: true,
    items: [
      {
        name: 'ios-build',
        label: 'iOS Build Machines',
        type: 'node',
        root: true,
        dependencies: [],
        verificationType: 'build',
        verificationUrl: '/computer/api/json',
        responseFilter: 'Xcode09Pool'
      },
      {
        name: 'android-build',
        label: 'Android Build Machines',
        type: 'node',
        root: true,
        dependencies: [],
        responseFilter: 'GooglePool01'
      },
    ]
  },
  {
    name: 'ios',
    label: 'iOS Apps',
    variants: [
      { name: 'cc', label: 'CC' },
      { name: 'bet', label: 'BET' },
      { name: 'paramountnetwork', label: 'Paramount' },
      { name: 'tvland', label: 'TV-Land' },
      { name: 'mtv', label: 'MTV' },
      { name: 'vh1', label: 'VH1' },
      { name: 'cmt', label: 'CMT' },
    ],
    items: [
      {
        name: 'app',
        label: 'App',
        type: 'group',
        root: true,
        collapsible: false,
        nodeTemplate: { name: 'ios-{name}', label: 'iOS {label}', brand: '{label}',
          dependencies: [ { name: 'cfg-{name}' }, { name: 'api-{name}' }, { name: 'mediagen' } ] },
        nodes: [
          // { name: 'ios-CMT', label: 'iOS CMT', dependencies: [ { name: 'api-cmt' }, { name: 'mediagen' } ] },
        ]
      },
      {
        name: 'config',
        label: 'Config',
        type: 'group',
        collapsible: true,
        nodeTemplate: { name: 'cfg-{name}', label: 'Config {label}', brand: '{label}', verificationType: 'config',
          verificationUrl: '/feeds/networkapp/intl/main/1.9/?key=networkapp1.0&brand={name}&platform=ios&region=US&version=4.5' },
        nodes: [
          // { name: 'cfg-cmt', label: 'Config CMT' },
        ]
      },
      {
        name: 'api',
        label: 'API',
        type: 'group',
        collapsible: true,
        nodeTemplate: { name: 'api-{name}', label: 'API {label}', brand: '{label}', verificationType: 'api' },
        nodes: [
          // { name: 'api-cmt', label: 'API CMT' },
        ]
      },
      {
        name: 'mediagen',
        label: 'MediaGen',
        type: 'node'
      }
    ]
  },
  {
    name: 'android',
    label: 'Android Apps',
    variants: [
      { name: 'cc', label: 'CC' },
      { name: 'bet', label: 'BET' },
      { name: 'paramountnetwork', label: 'Paramount' },
      { name: 'tvland', label: 'TV-Land' },
      { name: 'mtv', label: 'MTV' },
      { name: 'vh1', label: 'VH1' },
      { name: 'cmt', label: 'CMT' },
    ],
    items: [
      {
        name: 'app',
        label: 'App',
        type: 'group',
        root: true,
        collapsible: false,
        nodeTemplate: { name: 'android-{name}', label: 'Android {label}', brand: '{label}',
          dependencies: [ { name: 'cfg-{name}' }, { name: 'api-{name}' }, { name: 'mediagen' } ] },
        nodes: [
          // { name: 'ios-CMT', label: 'iOS CMT', dependencies: [ { name: 'api-cmt' }, { name: 'mediagen' } ] },
        ]
      },
      {
        name: 'config',
        label: 'Config',
        type: 'group',
        collapsible: true,
        nodeTemplate: { name: 'cfg-{name}', label: 'Config {label}', brand: '{label}', verificationType: 'config',
          verificationUrl: '/feeds/networkapp/intl/main/1.9/?key=networkapp1.0&brand={name}&platform=android&region=US&version=4.5' },
        nodes: [
          // { name: 'cfg-cmt', label: 'Config CMT' },
        ]
      },
      {
        name: 'api',
        label: 'API',
        type: 'group',
        collapsible: true,
        nodeTemplate: { name: 'api-{name}', label: 'API {label}', brand: '{label}', verificationType: 'api' },
        nodes: [
          // { name: 'api-cmt', label: 'API CMT' },
        ]
      },
      {
        name: 'mediagen',
        label: 'MediaGen',
        type: 'node'
      }
    ]
  },
];
