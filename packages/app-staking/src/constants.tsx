// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import BN from 'bn.js';
import { StakingLedgers } from '@polkadot/types';

export const rewardDestinationOptions = [
    // { text: 'Stash account (increase the amount at stake)', value: 0 },
    { text: 'Stash account (do not increase the amount at stake)', value: 0 },
    { text: 'Controller account', value: 1 }
];

export const rewardDestinationOptionsI18n = (t) => [
    // { text: 'Stash account (increase the amount at stake)', value: 0 },
    { text: t('Stash account (do not increase the amount at stake)'), value: 0 },
    { text: t('Controller account'), value: 1 }
];

export const ZERO_STAKING_LEDGER = {
    total_ring: new BN(0),
    total_deposit_ring: new BN(0),
    active_ring: new BN(0),
    active_deposit_ring: new BN(0),
    total_kton: new BN(0),
    active_kton: new BN(0),
} as StakingLedgers;