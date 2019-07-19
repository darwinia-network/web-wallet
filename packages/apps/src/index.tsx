// Copyright 2017-2019 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import settings from '@polkadot/ui-settings';
import '@polkadot/ui-app/i18n';
import '@polkadot/ui-app/styles';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import store from 'store';
import { getTypeRegistry } from '@polkadot/types';
import { Api } from '@polkadot/ui-api';

import { QueueConsumer } from '@polkadot/ui-app/Status/Context';
import Queue from '@polkadot/ui-app/Status/Queue';
import Apps from './Apps';

const rootId = 'root';
const rootElement = document.getElementById(rootId);
// const url = process.env.WS_URL || 'ws://121.199.60.87/';
// const url = process.env.WS_URL || 'ws://192.168.1.241:9944/';
// const url = process.env.WS_URL || 'ws://192.168.1.241:9944/';
const url = process.env.WS_URL || 'wss://trilobita.darwinia.network/';
// const url = process.env.WS_URL || 'ws://192.168.110.246:9944/';
// const url = process.env.WS_URL || 'ws://localhost:9944/';

const DARWINIA_TYPES = {
  "TokenBalance": "u128",
  "Currency": "u128",
  "CurrencyOf": "u128",
  "RewardBalance": "u128",
  "RewardBalanceOf": "u128",
  "IndividualDeposit": {
    "month": "u32",
    "start_at": "u64",
    "value": "CurrencyOf",
    "balance": "TokenBalance",
    "claimed": "bool"
  },
  "Deposit": {
    "total": "CurrencyOf",
    "deposit_list": "Vec<IndividualDeposit>"
  }
}

if (!rootElement) {
  throw new Error(`Unable to find element with id '${rootId}'`);
}

console.log('Web socket url=', url);

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
            url={url}
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
