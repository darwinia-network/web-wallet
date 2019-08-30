// Copyright 2017-2019 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-api/types';


import BN from 'bn.js';
import React from 'react';
import { withCalls, withApi, withMulti } from '@polkadot/ui-api';
import { ZERO_BALANCE, ZERO_FEES } from '@polkadot/ui-signer/Checks/constants';
import styled from 'styled-components'
import { formatBalance, formatNumber, ringToKton, assetToPower } from '@polkadot/util';
import { Balance } from '@polkadot/types';
import bignumber from 'bignumber.js'

type Props = I18nProps & ApiProps & {
  accountId: string,
  controllerId?: string | null,
  staking_ktonPool: Balance,
  staking_ringPool: Balance,
  ringAmount?: Balance,
  ktonAmount?: Balance
};

type State = {
};

const ZERO = new BN(0);
const noop = function () { };

class Power extends React.PureComponent<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);

    const { accountId, controllerId } = this.props;

    this.state = {

    };
  }

  render() {
    const { staking_ktonPool, staking_ringPool,ringAmount, ktonAmount, t } = this.props;
    if(!staking_ktonPool || !staking_ringPool || !ringAmount || !ktonAmount){
      return (
        <>
        0
        </>
      )
    }

    // console.log('ringAmountktonAmount', staking_ktonPool.toString(), staking_ringPool.toString(), ringAmount.toString(), ktonAmount.toString())
    const _div = new bignumber(staking_ringPool.toString()).div(new bignumber(staking_ktonPool.toString()))

    const _power = new bignumber(ringAmount.toString()).plus(new bignumber(ktonAmount.toString()).multipliedBy(_div))

    return (
      <>
      {formatBalance(_power.toString().split('.')[0], false)}
      </>
    );
  }
}

export default withMulti(
  Power,
  // translate,
  withApi,
  withCalls<Props>(
    'query.staking.ktonPool',
    'query.staking.ringPool'
  )
);
