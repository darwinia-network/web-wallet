// Copyright 2017-2019 @polkadot/ui-reactive authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, AccountIndex, Address } from '@polkadot/types';
import { BareProps, CallProps } from '@polkadot/ui-api/types';
import { DerivedKtonBalances } from '@polkadot/api-derive/types';
import React from 'react';
import { formatKtonBalance } from '@polkadot/util';
import { withCalls } from '@polkadot/ui-api';

type Props = BareProps & CallProps & {
  kton_all?: DerivedKtonBalances,
  children?: React.ReactNode,
  label?: React.ReactNode,
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null,
};

export class AvailableDisplay extends React.PureComponent<Props> {
  render() {
    const { children, className, label = '', kton_all } = this.props;
    return (
      <div className={className}>
        <p>{label}{kton_all ?
          formatKtonBalance(kton_all.availableBalance) :
          '0'}</p>
        {children}
      </div>
    );
  }
}

export default withCalls<Props>(
  ['derive.kton.all', { paramName: 'params' }]
)(AvailableDisplay);
