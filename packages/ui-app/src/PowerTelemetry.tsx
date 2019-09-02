// Copyright 2017-2019 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-api/types';


import BN from 'bn.js';
import React from 'react';
import { withCalls, withApi, withMulti } from '@polkadot/ui-api';
import { assetToPower } from '@polkadot/util';
import styled from 'styled-components'
import { Balance } from '@polkadot/types';
import bignumber from 'bignumber.js'

type Props = I18nProps & ApiProps & {
  accountId: string,
  controllerId?: string | null,
  staking_ktonPool: Balance,
  staking_ringPool: Balance,
  ringAmount?: Balance,
  ktonAmount?: Balance,
  ringExtraAmount?: Balance,
  ktonExtraAmount?: Balance,
};

type State = {
};

const ZERO = new Balance(0);
const noop = function () { };

class PowerTelemetry extends React.PureComponent<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const { staking_ktonPool = ZERO, staking_ringPool = ZERO, ringAmount = ZERO, ringExtraAmount = ZERO, ktonAmount = ZERO, ktonExtraAmount = ZERO, t } = this.props;
    const power = assetToPower(ringAmount, ktonAmount, staking_ringPool, staking_ktonPool)
    const powerTelemetry = assetToPower(ringAmount.add(ringExtraAmount) as Balance, ktonAmount.add(ktonExtraAmount) as Balance, staking_ringPool.add(ringExtraAmount) as Balance, staking_ktonPool.add(ktonExtraAmount) as Balance)
    const subPower = powerTelemetry.minus(power)
    return (
      <>
        {subPower.toFixed(0).toString()}
      </>
    )
  }
}

export default withMulti(
  PowerTelemetry,
  // translate,
  withApi,
  withCalls<Props>(
    'query.staking.ktonPool',
    'query.staking.ringPool'
  )
);
