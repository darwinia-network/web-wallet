// Copyright 2017-2019 @polkadot/ui-reactive authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, AccountIndex, Address } from '@polkadot/types';
import { BareProps, CallProps } from '@polkadot/ui-api/types';
import { DerivedBalances } from '@polkadot/api-derive/types';
import BN from 'bn.js'
import React from 'react';
import { formatBalance, formatKtonBalance } from '@polkadot/util';
import { withCalls } from '@polkadot/ui-api';

type Props = BareProps & CallProps & {
  balances_all?: DerivedBalances,
  kton_freeBalance?: BN,
  children?: React.ReactNode,
  label?: React.ReactNode,
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null,

};

export class AvailableDisplay extends React.PureComponent<Props> {
  render() {
    const { balances_all, kton_freeBalance, children, className, label = '' } = this.props;

    return (
      <div className={className}>
        <p>{label}{balances_all ?
          formatBalance(balances_all.availableBalance) :
          '0'}</p>
        <p>{label}{kton_freeBalance ? formatKtonBalance(kton_freeBalance) : '0'}</p>
        {children}
      </div>
    );
  }
}

export default withCalls<Props>(
  ['derive.balances.all', { paramName: 'params' }],
  ['query.kton.freeBalance', { paramName: 'params' }]
)(AvailableDisplay);
