// Copyright 2017-2019 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-api/types';

import BN from 'bn.js';
import React from 'react';
import { AccountId, Option, StakingLedgers } from '@polkadot/types';
import { Button, InputAddress, InputBalance, InputNumber, Modal, TxButton, TxComponent } from '@polkadot/ui-app';
import { withCalls, withApi, withMulti } from '@polkadot/ui-api';
import styled from 'styled-components'
import { withRouter } from 'react-router-dom';
import { formatBalance, formatKtonBalance } from '@polkadot/util';
import Checks from '@polkadot/ui-signer/Checks';
import translate from '../translate';

type Props = I18nProps & ApiProps & {
  controllerId?: AccountId | null,
  isOpen: boolean,
  onClose: () => void,
  staking_ledger?: StakingLedgers,
  history: any
};

type State = {
  maxBalance?: BN
  maxUnbond?: BN,
  type: string,
  hasAvailable: boolean
};

const StyleWrapper = styled.div`
  margin: 0 0 1em;
  line-height: 1.4285em;
  position: absolute;
  bottom: -41px;
  color: #fff;
  width: 100%;
  text-align: center;
  a{
    color: #fff;
    text-decoration: underline;
    margin-left: 10px;
  }
`

function toIdString(id?: AccountId | null | undefined): string | null | undefined {
  if (typeof id === 'undefined') return undefined
  return id
    ? id.toString()
    : null;
}

class Unbond extends TxComponent<Props, State> {
  state: State = {
    type: 'ring',
    hasAvailable: true
  };

  componentDidUpdate(prevProps: Props) {
    const { staking_ledger } = this.props;

    if (staking_ledger !== prevProps.staking_ledger) {
      this.setMaxBalance();
    }
  }

  goDepositRing = () => {
    const { history } = this.props
    history.push('ringstaking');
  }

  private onChangeFees = (hasAvailable: boolean) => {
    this.setState({ hasAvailable });
  }

  render() {
    const { controllerId, isOpen, onClose, t } = this.props;
    const { maxUnbond, type, hasAvailable } = this.state;
    const canSubmit = !!maxUnbond && maxUnbond.gtn(0) && hasAvailable;
    const typeKey = type.charAt(0).toUpperCase() + type.slice(1)

    if (!isOpen) {
      return null;
    }

    return (
      <>
        <Modal
          className='staking--Unbond'
          dimmer='inverted'
          open
          size='small'
          onClose={onClose}
        >
          {this.renderContent()}
          <Modal.Actions>
            <Button.Group>
              <TxButton
                accountId={controllerId}
                isDisabled={!canSubmit}
                isPrimary
                label={t('Unbond')}
                onClick={onClose}
                onClose={onClose}
                params={[{ [typeKey]: maxUnbond && maxUnbond }]}
                tx='staking.unbond'
                ref={this.button}
              />
              <Button
                isBasic={true}
                isSecondary={true}
                onClick={onClose}
                label={t('Cancel')}
              />
            </Button.Group>
          </Modal.Actions>
          <StyleWrapper>{t('If you want to unlock the ring that set the lock limit')} <a href="javascript:void(0)" onClick={this.goDepositRing}>[{t('click here')}]</a></StyleWrapper>
        </Modal>
      </>
    );
  }

  private renderContent() {
    const { controllerId, staking_ledger, api, t } = this.props;
    const { type, maxUnbond } = this.state;
    const typeKey = type.charAt(0).toUpperCase() + type.slice(1)

    if (!staking_ledger || staking_ledger.isEmpty) {
      return;
    }

    const extrinsic = api.tx.staking.unbond({ [typeKey]: maxUnbond && maxUnbond });

    return (
      <>
        <Modal.Header>
          {t('Unbond funds')}
        </Modal.Header>
        <Modal.Content className='ui--signer-Signer-Content'>
          <InputAddress
            className='medium'
            defaultValue={controllerId}
            isDisabled
            label={t('controller account')}
          />
          <InputNumber
            autoFocus
            className='medium'
            help={t('The maximum amount to unbond, this is adjusted using the bonded funds on the account.')}
            label={t('unbond amount')}
            // maxValue={maxBalance}
            placeholder={type === 'ring' ? formatBalance(staking_ledger.active_ring.toBn()) : formatKtonBalance(staking_ledger.active_kton.toBn())}
            siValue='kton'
            onChange={this.onChangeValue}
            onChangeType={this.onChangeType}
            onEnter={this.sendTx}
            // withMax
            isType
          />
          <Checks
            accountId={toIdString(controllerId)}
            extrinsic={extrinsic}
            isSendable
            onChange={this.onChangeFees}
          />
        </Modal.Content>
      </>
    );
  }

  private onChangeType = (type?: string) => {
    this.nextState({ type });
  }

  private nextState(newState: Partial<State>): void {
    this.setState((prevState: State): State => {
      const { maxUnbond = prevState.maxUnbond, maxBalance = prevState.maxBalance, type = prevState.type, hasAvailable = prevState.hasAvailable } = newState;

      return {
        maxUnbond,
        maxBalance,
        type,
        hasAvailable
      };
    });
  }

  private setMaxBalance = () => {
    const { staking_ledger } = this.props;

    if (!staking_ledger || staking_ledger.isEmpty) {
      return;
    }

    // const { active: maxBalance } = staking_ledger.raw;

    // this.nextState({

    //   maxBalance
    // });
  }

  private onChangeValue = (maxUnbond?: BN) => {
    this.nextState({ maxUnbond });
  }
}

export default withMulti(
  Unbond,
  translate,
  withApi,
  withCalls<Props>(
    ['query.staking.ledger', {
      paramName: 'controllerId',
      transform: (value: Option<StakingLedgers>) =>
        value.unwrapOr(null)
    }]
  ),
  withRouter
);
