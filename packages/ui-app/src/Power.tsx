// Copyright 2017-2019 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-api/types';
import { CalculateBalanceProps } from '../types';

import BN from 'bn.js';
import React from 'react';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { Button, Dropdown, InputAddress, InputNumber, InputBalance, Modal, TxButton, TxComponent } from '@polkadot/ui-app';
import { withCalls, withApi, withMulti } from '@polkadot/ui-api';
import { calcSignatureLength } from '@polkadot/ui-signer/Checks';
import { ZERO_BALANCE, ZERO_FEES } from '@polkadot/ui-signer/Checks/constants';
import { Checkbox } from 'semantic-ui-react'
import styled from 'styled-components'
import { formatBalance, formatNumber, ringToKton, assetToPower } from '@polkadot/util';

// import translate from '../translate';
// import ValidateController from './ValidateController';
import { SubmittableResult } from '@polkadot/api/SubmittableExtrinsic';
import { Balance } from '@polkadot/types';
import bignumber from 'bignumber.js'

type Props = I18nProps & ApiProps & CalculateBalanceProps & {
  accountId: string,
  controllerId?: string | null,
  isOpen: boolean,
  disableController?: boolean,
  onClose: () => void,
  onSuccess?: (status: SubmittableResult) => void,
  easyMode: boolean,
  checkSameController?: boolean,
  withStep?: boolean,
  kton_freeBalance?: BN,
  kton_locks: Array<any>,
  balances_locks: Array<any>,
  balances_freeBalance?: BN,
  staking_ktonPool: Balance,
  staking_ringPool: Balance,
  ringAmount?: Balance,
  ktonAmount?: Balance
};

type State = {
  bondValue?: BN,
  controllerError: string | null,
  controllerId: string,
  destination: number,
  extrinsic: SubmittableExtrinsic | null,
  maxBalance?: BN,
  lockLimit: number,
  type: string,
  accept: boolean
};

const ZERO = new BN(0);
const noop = function () { };

const StyledWrapper = styled.div`
    display: flex;
    margin-top: -4px;
    label{
      flex: 0 0 15rem;
    }
    &>div{
      border: 1px solid #DEDEDF;
      p{
        color: #98959F;
        font-size: 12px;
      }
      
      padding: 10px 20px;
      background: #FBFBFB;
    }
`

const GetPowerStyledWrapper = styled.div`
  font-size: 0;
  margin-top: 20px;
  p{
    text-align: right;
    font-size: 16px;
    color: #302B3C;
    margin-bottom: 10px;
  }

  p:last-child{
    margin-top: 0;
    margin-bottom: 0;
  }

  span{
    color: #5930DD;
    font-weight: bold;
  }
`

class Power extends React.PureComponent<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);

    const { accountId, controllerId } = this.props;

    this.state = {
      controllerError: null,
      controllerId: controllerId ? controllerId.toString() : accountId,
      destination: 1,
      extrinsic: null,
      lockLimit: 0,
      type: 'ring',
      accept: false
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { balances_fees } = this.props;
    const { controllerId, destination, extrinsic } = this.state;

    const hasLengthChanged = ((extrinsic && extrinsic.encodedLength) || 0) !== ((prevState.extrinsic && prevState.extrinsic.encodedLength) || 0);

    if ((controllerId && prevState.controllerId !== controllerId) ||
      (prevState.destination !== destination) ||
      (balances_fees !== prevProps.balances_fees) ||
      hasLengthChanged
    ) {

    }
  }

  getKtonAmount = () => {
    const {type, bondValue = ZERO, lockLimit} = this.state
    let kton = null;
    let parsedBondValue = bondValue
    console.log(parsedBondValue.toString(),111)
    if(type === 'ring' && lockLimit != 0) {
      return formatBalance(new BN(ringToKton(parsedBondValue.toString(), lockLimit)), false)
    }
    return '0'
  }

  getPowerAmount = () => {
    const { type, bondValue = ZERO } = this.state
    let power = ZERO;
    power = assetToPower(bondValue, type)
    return formatBalance(power, false)
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
