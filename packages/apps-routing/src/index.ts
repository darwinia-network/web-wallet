// Copyright 2017-2019 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Routing, Routes } from './types';

import appSettings from '@polkadot/ui-settings';

import template from './123code';
import accounts from './accounts';
import RingStaking from './ringstaking'
import addressbook from './addressbook';
import contracts from './contracts';
import dashboard from './dashboard';
import democracy from './democracy';
import explorer from './explorer';
import extrinsics from './extrinsics';
import js from './js';
import settings from './settings';
import stakingKton from './staking';
import stakingKtonNode from './node';
import staking from './stakingoverview';
import storage from './storage';
import sudo from './sudo';
import toolbox from './toolbox';
import transfer from './transfer';
import dev from './dev';

const routes: Routes = appSettings.uiMode === 'full'
  ? ([] as Routes).concat(
    // dashboard,
    // explorer,
    
    // democracy,
    // null,
    accounts,
    staking,
    RingStaking,
    stakingKton,
    stakingKtonNode,
    // addressbook,
    // transfer,
    null,
    dev
    // null,
    // settings,
    // template
  )
  : ([] as Routes).concat(
    // dashboard,
    // explorer,
    
    // democracy,
    // null,



    accounts,
    staking,
    RingStaking,
    stakingKton,
    stakingKtonNode,




    // addressbook,
    
    // transfer,
    // null,
    // contracts,
    storage,
    extrinsics,
    settings,
    null,
    dev,
    // sudo,
    // null,

    // toolbox,
    // js,
    // template
  );

export default ({
  default: 'accounts',
  routes
} as Routing);
