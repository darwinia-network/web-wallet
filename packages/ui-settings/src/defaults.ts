// Copyright 2017-2019 @polkadot/ui-settings authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Options } from './types';

// matches https://polkadot.js.org & https://*.polkadot.io
// tslint:disable-next-line
const isPolkadot = typeof window !== 'undefined' && window.location.host.indexOf('polkadot') !== -1;

const WSS_POLKADOT = 'wss://crayfish.darwinia.network/';
const WSS_SUBSTRATE = 'wss://crayfish.darwinia.network/';
const LANGUAGE_DEFAULT = 'default';
const LOCKING_DEFAULT = 'session';

const CRYPTOS: Options = [
  { text: 'Edwards (ed25519)', value: 'ed25519' },
  { text: 'Schnorrkel (sr25519)', value: 'sr25519' }
];

const ENDPOINTS: Options = [
  { text: 'Crayfish (Darwinia, hosted by Itering)', value: WSS_POLKADOT },
  // { text: 'Emberic Elm (Substrate, hosted by Parity)', value: WSS_SUBSTRATE },
  { text: 'Alpha Node (35.194.207.170:9944)', value: 'ws://35.194.207.170:9944/' },
  { text: 'Local Node (192.168.1.241:9944)', value: 'ws://192.168.1.241:9944/' },
  { text: 'Local Node (127.0.0.1:9944)', value: 'ws://127.0.0.1:9944/' }
];

const LANGUAGES: Options = [
  { text: 'Default browser language (auto-detect)', value: LANGUAGE_DEFAULT }
];

const LOCKING: Options = [
  { text: 'Once per session', value: 'session' },
  { text: 'On each transaction', value: 'tx' }
];

const UIMODES: Options = [
  { value: 'full', text: 'Fully featured' },
  { value: 'light', text: 'Basic features only' }
];

const UITHEMES: Options = [
  { value: 'polkadot', text: 'Polkadot' },
  { value: 'substrate', text: 'Substrate' }
];

const ENDPOINT_DEFAULT = isPolkadot
  ? WSS_POLKADOT
  : WSS_SUBSTRATE;

const UITHEME_DEFAULT = isPolkadot
  ? 'polkadot'
  : 'substrate';

// tslint:disable-next-line
const UIMODE_DEFAULT = !isPolkadot && typeof window !== 'undefined' && window.location.host.indexOf('ui-light') !== -1
  ? 'light'
  : 'full';

export {
  CRYPTOS,
  ENDPOINT_DEFAULT,
  ENDPOINTS,
  LANGUAGE_DEFAULT,
  LANGUAGES,
  LOCKING_DEFAULT,
  LOCKING,
  UIMODE_DEFAULT,
  UIMODES,
  UITHEME_DEFAULT,
  UITHEMES
};
