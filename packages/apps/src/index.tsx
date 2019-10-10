// Copyright 2017-2019 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import settings from '@polkadot/ui-settings';
import '@polkadot/ui-app/i18n';
import '@polkadot/ui-app/styles';
import queryString from 'query-string';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import store from 'store';
import { getTypeRegistry } from '@polkadot/types';
import { Api } from '@polkadot/ui-api';

import { QueueConsumer } from '@polkadot/ui-app/Status/Context';
import Queue from '@polkadot/ui-app/Status/Queue';
// import './i18n'
import Apps from './Apps';

const rootId = 'root';
const rootElement = document.getElementById(rootId);

// const url = process.env.WS_URL || 'ws://121.199.60.87/';
// const url = process.env.WS_URL || 'ws://192.168.1.241:9944/';
// const url = process.env.WS_URL || 'ws://192.168.110.19:9944/';
// const url = process.env.WS_URL || 'ws://192.168.1.241:9944/';
// const url = process.env.WS_URL || 'wss://trilobita.darwinia.network/';
// const url = process.env.WS_URL || 'ws://192.168.110.246:9944/';
// const url = process.env.WS_URL || 'ws://localhost:9944/';

const urlOptions = queryString.parse(location.href.split('?')[1]);
// const wsEndpoint = urlOptions.rpc || process.env.WS_URL || settings.apiUrl || undefined;
const wsEndpoint = process.env.WS_URL || settings.apiUrl || undefined;

const DARWINIA_TYPES = {
  "EpochDuration": "u64",
  // "EraIndex": "u32",
  "RingBalanceOf": "u128",
  "KtonBalanceOf": "u128",
  "ExtendedBalance": "u128",
  // "ValidatorPrefs": {
  //   "unstake_threshold": "Compact<u32>",
  //   "validator_payment_ratio": "u32"
  // },
  "StakingBalance": {
    "_enum": {
      "Ring": "RingBalanceOf",
      "Kton": "KtonBalanceOf"
    }
  },
  // "TimeDepositItem": {
  //   "value": "Compact<RingBalanceOf>",
  //   "start_time": "Compact<Moment>",
  //   "expire_time": "Compact<Moment>"
  // },
  // "UnlockChunk": {
  //   "value": "StakingBalance",
  //   "era": "Compact<EraIndex>",
  //   "is_time_deposit": "bool"
  // },
  // "StakingLedgers": {
  //   "stash": "AccountId",
  //   "total_ring": "Compact<RingBalanceOf>",
  //   "total_deposit_ring": "Compact<RingBalanceOf>",
    
  //   "active_ring": "Compact<RingBalanceOf>",
  //   "active_deposit_ring": "Compact<RingBalanceOf>",
  //   "total_kton": "Compact<KtonBalanceOf>",
  //   "active_kton": "Compact<KtonBalanceOf>",
  //   "deposit_items": "Vec<TimeDepositItem>",
  //   "unlocking": "Vec<UnlockChunk>"
  // },
  "IndividualExpo": {
    "who": "AccountId",
    "value": "ExtendedBalance"
  },
  "Exposures": {
    "total": "ExtendedBalance",
    "own": "ExtendedBalance",
    "others": "Vec<IndividualExpo>"
  }
}

if (!rootElement) {
  throw new Error(`Unable to find element with id '${rootId}'`);
}

// console.log('Web socket url=', url);

try {
  store.set('types', DARWINIA_TYPES);

  const types = store.get('types') || {};
  const names = Object.keys(types);

  if (names.length) {
    getTypeRegistry().register(types);
    console.log('Type registration:', names.join(', '));
  }
} catch (error) {
  console.error('Type registration failed', error);
}

ReactDOM.render(
  <Suspense fallback='...'>
    <Queue>
      <QueueConsumer>
        {({ queueExtrinsic, queueSetTxStatus }) => (
          <Api
            queueExtrinsic={queueExtrinsic}
            queueSetTxStatus={queueSetTxStatus}
            // url={url}
            url={wsEndpoint}
          >
            <HashRouter>
              <Apps />
            </HashRouter>
          </Api>
        )}
      </QueueConsumer>
    </Queue>
  </Suspense>,
  rootElement
);
