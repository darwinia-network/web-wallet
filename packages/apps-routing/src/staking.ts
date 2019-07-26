// Copyright 2017-2019 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Routes } from './types';

import Staking from '@polkadot/app-staking/StakingKton';

export default ([
  {
    Component: Staking,
    display: {
      needsAccounts: true,
      needsApi: [
        [
          'tx.staking.bond' // current bonding API
          // 'tx.staking.stake' // previous staking API
        ]
      ]
    },
    i18n: {
      defaultValue: 'Nomination'
    },
    icon: 'certificate',
    name: 'staking'
  }
] as Routes);
