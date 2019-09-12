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
import { Balance, Compact } from '@polkadot/types';

import { calcSignatureLength } from '@polkadot/ui-signer/Checks';
import { ZERO_BALANCE, ZERO_FEES } from '@polkadot/ui-signer/Checks/constants';
import { Checkbox } from 'semantic-ui-react'
import styled from 'styled-components'
import { formatBalance, formatNumber, ringToKton, assetToPower } from '@polkadot/util';

import translate from '../translate';
import ValidateController from './ValidateController';
import { SubmittableResult } from '@polkadot/api/SubmittableExtrinsic';
import Bignumber from 'bignumber.js'
import { PowerTelemetry } from '@polkadot/ui-app'

export type stakingLedgerType = {
  raw: {
    stash?: string,
    total_power?: number,
    total_ring?: Compact,
    regular_ring?: Compact,
    active_ring?: Compact,
    total_kton?: Compact,
    active_kton?: Compact
  },
  isNone: boolean
}

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
  staking_ringPool?: Balance,
  staking_ktonPool?: Balance,
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

const stashOptions = [
  // { text: 'Stash account (increase the amount at stake)', value: 0 },
  { text: 'Stash account (do not increase the amount at stake)', value: 0 },
  { text: 'Controller account', value: 1 }
];

const lockLimitOptionsMaker = (): Array<object> => {
  const month = [0, 3, 6, 12, 18, 24, 30, 36]
  let options = []
  month.map((i) => {
    options.push({
      text: i === 0 ? 'Not fixed term' : `${i} Month`,
      value: i
    })
  })

  return options
}

const lockLimitOptions = lockLimitOptionsMaker()

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

class Bond extends TxComponent<Props, State> {
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
      this.setMaxBalance();
    }
  }

  getKtonAmount = () => {
    const {type, bondValue = ZERO, lockLimit} = this.state
    let kton = null;
    let parsedBondValue = bondValue
    if(type === 'ring' && lockLimit != 0) {
      return formatBalance(new BN(ringToKton(parsedBondValue.toString(), lockLimit)), false)
    }
    return '0'
  }


  toPower(bonded, ringPool){
    if(!bonded || !ringPool || (ringPool && ringPool.toString() === '0')){
      return '0'
    }

    // const _div = new bignumber(staking_ringPool.toString()).div(new bignumber(staking_ktonPool.toString()))

    // const _power = new bignumber(ringAmount.toString()).plus(new bignumber(ktonAmount.toString()).times(_div)).div(new bignumber(staking_ringPool.toString()).times(2)).times(100000)


    return new Bignumber(bonded.toString()).div(new Bignumber(ringPool.toString()).times(2)).times(100000).toFixed(0).toString();
  }

  getPowerAmount = () => {
    const { staking_ringPool, staking_ktonPool } = this.props
    const { type, bondValue = ZERO } = this.state

    let ktonBonded = new BN(0);
    let ringBonded = new BN(0);

    return <PowerTelemetry
      ringAmount={ringBonded as Balance}
      ktonAmount={ktonBonded as Balance}
      ringPool={staking_ringPool}
      ktonPool={staking_ktonPool}
      ringExtraAmount={type === 'ring' ? bondValue : new Balance(0)}
      ktonExtraAmount={type === 'kton' ? bondValue : new Balance(0)}
    />
  }

  render() {
    const { accountId, isOpen, onClose, onSuccess, t } = this.props;
    const { bondValue, controllerError, controllerId, extrinsic, maxBalance, lockLimit, accept, type } = this.state;
    const hasValue = !!bondValue && bondValue.gtn(0);

    const canSubmit = hasValue && !controllerError && !!controllerId && (lockLimit && type === 'ring' ? accept : true);
    if (!isOpen) {
      return null;
    }



    return (
      <Modal
        className='staking--Bonding'
        dimmer='inverted'
        open
        size='small'
        onClose={onClose}
      >
        {this.renderContent()}
        <Modal.Actions>
          <Button.Group>
            <TxButton
              accountId={accountId}
              isDisabled={!canSubmit}
              isPrimary
              label={t('Bond')}
              onClick={onSuccess ? noop : onClose}
              onClose={onClose}
              onSuccess={onSuccess}
              withSpinner={true}
              extrinsic={extrinsic}
              ref={this.button}
            />
            <Button
              isSecondary={true}
              isBasic={true}
              onClick={onClose}
              label={t('Skip')}
            />
          </Button.Group>
        </Modal.Actions>
      </Modal>
    );
  }

  private renderContent() {
    const { accountId, t, disableController = false, easyMode = false, checkSameController = false, withStep, balances_locks, kton_locks,balances_freeBalance, kton_freeBalance } = this.props;
    const { controllerId, controllerError, bondValue, destination, maxBalance, lockLimit = 0, accept, type } = this.state;
    const hasValue = !!bondValue && bondValue.gtn(0);

    let _balances_locks = new BN(0)
    let _ktonBalances_locks = new BN(0)
    
    if (balances_locks) {
      balances_locks.forEach((item) => {
        _balances_locks = _balances_locks.add(item.amount)
      })
    }
    if (kton_locks) {
      kton_locks.forEach((item) => {
        _ktonBalances_locks = _ktonBalances_locks.add(item.amount)
      })
    }

    return (
      <>
        <Modal.Header className="ui-step-header">
          {t('Bond funds')}
          {withStep && <div>
            <span className="">STEP1</span>
            <i className="step"></i>
            <span className="step">STEP2</span>
            <i className="step"></i>
            <span className="step">STEP3</span>
          </div>}
        </Modal.Header>
        <Modal.Content className='ui--signer-Signer-Content'>
          <InputAddress
            className='medium'
            defaultValue={accountId}
            isDisabled
            label={t('stash account')}
          />

          {!easyMode && <InputAddress
            className='medium'
            help={t('The controller is the account that will be used to control any nominating or validating actions. Should not match another stash or controller.')}
            isError={!!controllerError}
            label={t('controller account')}
            onChange={this.onChangeController}
            isDisabled={disableController}
            type='account'
            value={controllerId}
          />}

          <ValidateController
            accountId={accountId}
            controllerId={controllerId}
            onError={this.onControllerError}
            checkSameController={checkSameController}
          />

          {!easyMode && <Dropdown
            className='medium'
            defaultValue={1}
            help={t('The destination account for any payments as either a nominator or validator')}
            label={t('payment destination')}
            onChange={this.onChangeDestination}
            options={stashOptions}
            value={destination}
          />}

          <InputNumber
            autoFocus
            className='medium'
            help={t('The total amount of the stash balance that will be at stake in any forthcoming rounds (should be less than the total amount available)')}
            isError={!hasValue}
            label={t('value bonded')}
            siValue={'kton'}
            // maxValue={maxBalance}
            onChange={this.onChangeValue}
            onChangeType={this.onChangeType}
            onEnter={this.sendTx}
            // placeholder={formatBalance((balances_freeBalance && balances_locks) ? balances_freeBalance.sub(_balances_locks).toString() : '0', false)}
            // withMax
            isType
          />
          {type === 'ring' ? <Dropdown
            className='medium'
            defaultValue={lockLimit}
            help={t('lock limit')}
            label={t('lock limit')}
            onChange={this.onChangeLockLimit}
            options={lockLimitOptions}
          // value={lockLimit}
          /> : null}
          {lockLimit ? <StyledWrapper>
            <label></label>
            <div>
              <p>After setting a lock limit, you will receive an additional KTON bonus; if you unlock it in advance within the lock limit, you will be charged a penalty of 3 times the KTON reward.</p>
              <Checkbox checked={accept} onChange={this.toggleAccept} label='I Accept' />
            </div>
          </StyledWrapper> : null}

          <GetPowerStyledWrapper>
            <p>You will get: <span>{this.getPowerAmount()} POWER</span></p>
            {lockLimit ? <p><span>{this.getKtonAmount()} KTON</span></p> : null}
          </GetPowerStyledWrapper>
        </Modal.Content>
      </>
    );
  }

  private nextState(newState: Partial<State>): void {
    this.setState((prevState: State): State => {
      const { api } = this.props;
      const { bondValue = prevState.bondValue, controllerError = prevState.controllerError, controllerId = prevState.controllerId, destination = prevState.destination, maxBalance = prevState.maxBalance, lockLimit = prevState.lockLimit, type = prevState.type, accept = prevState.accept } = newState;
      const typeKey = type.charAt(0).toUpperCase() + type.slice(1)
      const extrinsic = (bondValue && controllerId)
        ? api.tx.staking.bond(controllerId, { [typeKey]: bondValue }, destination, lockLimit)
        : null;

      return {
        bondValue,
        controllerError,
        controllerId,
        destination,
        extrinsic,
        maxBalance,
        lockLimit,
        type,
        accept
      };
    });
  }

  private setRingMaxBalance = () => {
    const { api, system_accountNonce = ZERO, balances_fees = ZERO_FEES, balances_all = ZERO_BALANCE, kton_locks, kton_freeBalance = ZERO } = this.props;
    const { controllerId, destination, type, lockLimit } = this.state;

    const { transactionBaseFee, transactionByteFee } = balances_fees;
    const { freeBalance } = balances_all;

    let prevMax = new BN(0);
    let maxBalance = new BN(1);
    let extrinsic;

    while (!prevMax.eq(maxBalance)) {
      prevMax = maxBalance;

      const typeKey = type.charAt(0).toUpperCase() + type.slice(1)
      extrinsic = controllerId && destination
        ? api.tx.staking.bond(controllerId, { [typeKey]: maxBalance }, destination, lockLimit)
        : null;

      const txLength = calcSignatureLength(extrinsic, system_accountNonce);

      const fees = transactionBaseFee
        .add(transactionByteFee.muln(txLength));
      let _ktonBalances_locks = new BN(0)

      if (kton_locks) {
        kton_locks.forEach((item) => {
          _ktonBalances_locks = _ktonBalances_locks.add(item.amount)
        })
      }
      maxBalance = kton_freeBalance.sub(_ktonBalances_locks);
    }

    this.nextState({
      extrinsic,
      maxBalance
    });
  }

  private setMaxBalance = () => {
    const { api, system_accountNonce = ZERO, balances_fees = ZERO_FEES, balances_all = ZERO_BALANCE, kton_locks, kton_freeBalance = ZERO } = this.props;
    const { controllerId, destination, type, lockLimit } = this.state;

    const { transactionBaseFee, transactionByteFee } = balances_fees;
    const { freeBalance } = balances_all;

    let prevMax = new BN(0);
    let maxBalance = new BN(1);
    let extrinsic;

    while (!prevMax.eq(maxBalance)) {
      prevMax = maxBalance;
      const typeKey = type.charAt(0).toUpperCase() + type.slice(1)

      extrinsic = controllerId && destination
        ? api.tx.staking.bond(controllerId, { [typeKey]: maxBalance }, destination, lockLimit)
        : null;

      const txLength = calcSignatureLength(extrinsic, system_accountNonce);

      const fees = transactionBaseFee
        .add(transactionByteFee.muln(txLength));

      let _ktonBalances_locks = new BN(0)

      if (kton_locks) {
        kton_locks.forEach((item) => {
          _ktonBalances_locks = _ktonBalances_locks.add(item.amount)
        })
      }
      maxBalance = kton_freeBalance.sub(_ktonBalances_locks);
    }

    this.nextState({
      extrinsic,
      maxBalance
    });
  }

  private onChangeController = (controllerId: string) => {
    this.nextState({ controllerId });
  }

  private onChangeDestination = (destination: number) => {
    this.nextState({ destination });
  }

  private toggleAccept = () => {
    const { accept } = this.state;
    this.nextState({ accept: !accept });
  }

  private onChangeLockLimit = (lockLimit: number) => {
    this.nextState({ lockLimit });
  }

  private onChangeValue = (bondValue?: BN) => {
    this.nextState({ bondValue });
  }

  private onChangeType = (type?: string) => {
    this.nextState({ type, lockLimit: 0 });
  }

  private onControllerError = (controllerError: string | null) => {
    this.setState({ controllerError });
  }
}

export default withMulti(
  Bond,
  translate,
  withApi,
  withCalls<Props>(
    'derive.balances.fees',
    ['derive.balances.all', { paramName: 'accountId' }],
    ['query.system.accountNonce', { paramName: 'accountId' }],
    ['query.balances.locks', { paramName: 'stashId' }],
    ['query.kton.locks', { paramName: 'stashId' }],
    ['query.kton.freeBalance', { paramName: 'stashId' }],
    'query.staking.ringPool',
    'query.staking.ktonPool'
  )
);
