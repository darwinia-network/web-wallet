// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps } from './types';

import BN from 'bn.js';
import React from 'react';
import { AccountId, AccountIndex, Address, Balance } from '@polkadot/types';
import { formatKtonBalance } from '@polkadot/util';
import { Bonded } from '@polkadot/ui-reactive';
import Bignumber from 'bignumber.js'
import { classes } from './util';

export type Props = BareProps & {
  bonded?: BN | Array<BN>,
  label?: React.ReactNode,
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null,
  withLabel?: boolean,
  ringPool?: Balance
};

export default class BondedDisplay extends React.PureComponent<Props> {
  render () {
    const { bonded, params, className, label, style } = this.props;

    if (!params) {
      return null;
    }

    return bonded
      ? this.renderProvided()
      : (
        <Bonded
          className={classes('ui--Bonded', className)}
          label={label}
          params={params}
          style={style}
        />
     );
  }

  toPower(bonded, ringPool){
    if(!bonded || !ringPool || (ringPool && ringPool.toString() === '0')){
      return '0'
    }
    return new Bignumber(bonded.toString()).div(new Bignumber(ringPool.toString()).times(2)).times(100000).toFixed(0).toString();
  }

  private renderProvided () {
    const { bonded, className, label, style, ringPool } = this.props;
    let value = `${this.toPower(Array.isArray(bonded) ? bonded[0] : bonded, ringPool )} Power`;
    if (Array.isArray(bonded)) {
      const totals = bonded.filter((value, index) => index !== 0);
      const total = totals.reduce((total, value) => total.add(value), new BN(0)).gtn(0)
        ? `(+${totals.map((bonded) => this.toPower(bonded, ringPool) + 'Power').join(', ')})`
        : '';

      value = `${value}  ${total}`;
    }

    return (
      <div
        className={classes('ui--Bonded', className)}
        style={style}
      >
        {label}{value}
      </div>
    );
  }
}
