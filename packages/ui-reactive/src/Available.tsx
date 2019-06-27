// Copyright 2017-2019 @polkadot/ui-reactive authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, AccountIndex, Address } from '@polkadot/types';
import { BareProps, CallProps } from '@polkadot/ui-api/types';
import { DerivedBalances } from '@polkadot/api-derive/types';
import BN from 'bn.js'
import React from 'react';
import { formatBalance } from '@polkadot/util';
import { withCalls } from '@polkadot/ui-api';

type Props = BareProps & CallProps & {
  balances_all?: DerivedBalances,
  ringBalances_freeBalance?: BN,
  ktonBalances_freeBalance?: BN,
  children?: React.ReactNode,
  label?: React.ReactNode,
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null,
  type?: 'ring' | 'kton'
};

export class AvailableDisplay extends React.PureComponent<Props> {
  render () {
    const { balances_all, ringBalances_freeBalance,ktonBalances_freeBalance, children, className, label = '', type = 'ring' } = this.props;
    console.log('balance_ring_tr', ringBalances_freeBalance)
    return (
      <div className={className}>
    
        {/* {
          balances_all ?
          formatBalance(balances_all.availableBalance) :
          '0'
        } */}
        <p>{label}{ringBalances_freeBalance ? formatBalance(ringBalances_freeBalance) : '0'} Ring</p>
        <p>{label}{ktonBalances_freeBalance ? formatBalance(ktonBalances_freeBalance) : '0'} Kton</p>
        {children}
      </div>
    );
  }
}

export default withCalls<Props>(
  ['derive.balances.all', { paramName: 'params' }],
  ['query.ringBalances.freeBalance', { paramName: 'params' }],
  ['query.ktonBalances.freeBalance', { paramName: 'params' }]
)(AvailableDisplay);
