// Copyright 2017-2019 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Routes } from './types';

import Transfer from '@polkadot/app-transfer';
import DevModal from '@polkadot/app-settings/modals/Setting';

export default ([
  {
    Component: Transfer,
    Modal: DevModal,
    display: {
      isHidden: false,
      needsAccounts: false
    },
    i18n: {
      defaultValue: 'Setting'
    },
    icon: 'setting',
    name: 'dev'
  }
] as Routes);
