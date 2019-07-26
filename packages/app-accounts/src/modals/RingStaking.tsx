// Copyright 2017-2019 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiProps } from '@polkadot/ui-api/types';
import { DerivedFees } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';

import BN from 'bn.js';
import React from 'react';
import styled from 'styled-components';
import { Index } from '@polkadot/types';
import { Button, InputAddress, InputBalance, Input, Modal, TxButton, media } from '@polkadot/ui-app';
import { Available } from '@polkadot/ui-reactive';
import Checks, { calcSignatureLength } from '@polkadot/ui-signer/Checks';
import { withApi, withCalls, withMulti } from '@polkadot/ui-api';
import { ZERO_FEES } from '@polkadot/ui-signer/Checks/constants';

import translate from '../translate';

type Props = ApiProps & I18nProps & {
  balances_fees?: DerivedFees,
  onClose: () => void,
  recipientId?: string,
  senderId?: string,
  system_accountNonce?: BN,
  type: 'balances' | 'kton',
  kton_depositLedger: { raw: { total: BN } }
};

type State = {
  amount: BN,
  ringAmount: BN,
  month: BN,
  extrinsic: SubmittableExtrinsic | null,
  hasAvailable: boolean,
  maxBalance?: BN,
  recipientId?: string | null,
  senderId?: string | null
};

const ZERO = new BN(0);

const Wrapper = styled.div`
  article.padded {
    box-shadow: none;
  }

  .balance {
    margin-bottom: 0.5rem;
    text-align: right;
    padding-right: 1rem;

    .label {
      opacity: 0.7;
    }
  }

  ${media.DESKTOP`
    article.padded {
      margin: .75rem 0 0.75rem 15rem;
      padding: 0.25rem 1rem;
    }
  `}

  label.with-help {
    flex-basis: 10rem;
  }
`;

class RingStaking extends React.PureComponent<Props> {
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      amount: ZERO,
      ringAmount: ZERO,
      month: ZERO,
      extrinsic: null,
      hasAvailable: true,
      maxBalance: ZERO,
      recipientId: props.recipientId || null,
      senderId: props.senderId || null
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { balances_fees } = this.props;
    const { extrinsic, recipientId, senderId } = this.state;

    const hasLengthChanged = ((extrinsic && extrinsic.encodedLength) || 0) !== ((prevState.extrinsic && prevState.extrinsic.encodedLength) || 0);

    if ((prevState.senderId !== senderId) ||
      hasLengthChanged
    ) {
      this.setMaxBalance().catch(console.error);
    }
  }

  render() {
    const { t, onClose } = this.props;

    return (
      <Modal
        className='app--accounts-Modal'
        dimmer='inverted'
        open
        onClose={onClose}
      >
        {this.renderContent()}
        {this.renderButtons()}
      </Modal>
    );
  }

  private getDepositFunctionName() {
    const { kton_depositLedger = { raw: { total: new BN('0') } } } = this.props;
    let totalNum = new BN('0')
    if(kton_depositLedger && kton_depositLedger.raw && kton_depositLedger.raw.total) {
      totalNum = kton_depositLedger.raw.total
    }

    if (totalNum.eq(new BN('0'))) {
      return 'deposit'
    } else {
      return 'depositExtra'
    }
  }

  private nextState(newState: Partial<State>): void {
    this.setState((prevState: State): State => {
      const { api } = this.props;
      const { amount = prevState.amount, recipientId = prevState.recipientId, hasAvailable = prevState.hasAvailable, maxBalance = prevState.maxBalance, senderId = prevState.senderId, ringAmount = prevState.ringAmount, month = prevState.month } = newState;
      const extrinsic = senderId
        ? api.tx.kton[this.getDepositFunctionName()](ringAmount, month)
        : null;

      return {
        amount,
        extrinsic,
        hasAvailable,
        maxBalance,
        recipientId,
        senderId,
        ringAmount,
        month
      };
    });
  }

  private renderButtons() {
    const { onClose, t } = this.props;
    const { extrinsic, hasAvailable, senderId } = this.state;

    return (
      <Modal.Actions>
        <Button.Group>
          <TxButton
            accountId={senderId}
            extrinsic={extrinsic}
            // isDisabled={!hasAvailable}
            isPrimary
            label={t('Make')}
            onStart={onClose}
            withSpinner={false}
          />
          <Button
            isBasic={true}
            isSecondary={true}
            label={t('Cancel')}
            onClick={onClose}
          />
        </Button.Group>
      </Modal.Actions>
    );
  }

  private renderContent() {
    const { recipientId: propRecipientId, senderId: propSenderId, type, t } = this.props;
    const { extrinsic, hasAvailable, maxBalance, recipientId, senderId, month } = this.state;
    const available = <span className='label'>{t('available ')}</span>;

    return (
      <Modal.Content>
        <Wrapper>
          <InputAddress
            defaultValue={propSenderId}
            help={t('The account you will send funds from.')}
            isDisabled={!!propSenderId}
            label={t('send from account')}
            onChange={this.onChangeFrom}
            type='account'
          />
          <div className='balance'><Available label={available} params={senderId} /></div>
          {/* <InputAddress
            defaultValue={propRecipientId}
            help={t('Select a contact or paste the address you want to send funds to.')}
            isDisabled={!!propRecipientId}
            label={t('send to address')}
            onChange={this.onChangeTo}
            type='all'
          />
          <div className='balance'><Available label={available} params={recipientId} type={type} /></div> */}

          <InputBalance
            // type='number'
            help={t('The amount of Ring Token')}
            label={t('ring amount')}
            maxValue={maxBalance}
            withMax
            onChange={this.onChangeRingAmount}
          />

          <Input
            type='number'
            help={t('The deposit time of ring')}
            label={t('month')}
            // maxValue={maxBalance}
            value={month.toString()}
            max={36}
            min={1}
            onChange={this.onChangeRingMonth}
          />

          <Checks
            accountId={senderId}
            extrinsic={extrinsic}
            isSendable
            onChange={this.onChangeFees}
          />

          {/* <InputBalance
            help={t('Type the amount you want to transfer. Note that you can select the unit on the right e.g sending 1 mili is equivalent to sending 0.001.')}
            isError={!hasAvailable}
            label={t('amount')}
            maxValue={maxBalance}
            onChange={this.onChangeAmount}
            withMax
          />
          <Checks
            accountId={senderId}
            extrinsic={extrinsic}
            isSendable
            onChange={this.onChangeFees}
          /> */}
        </Wrapper>
      </Modal.Content>
    );
  }

  private onChangeRingAmount = (ringAmount: BN) => {
    try {
      this.nextState({ ringAmount: new BN(ringAmount || 0) });
    } catch (e) {
      console.log(e)
    }
  }

  private onChangeRingMonth = (month: string) => {
    try {
      if(parseInt(month) > 36){
        month = '36'
      }

      if(parseInt(month) <=0){
        month = '1'
      }

      this.nextState({ month: new BN(month || 0) });
    } catch (e) {
      this.nextState({ month: new BN(0) });
      console.log(e)
    }
  }

  private onChangeAmount = (amount: BN = new BN(0)) => {
    this.nextState({ amount });
  }

  private onChangeFrom = (senderId: string) => {
    this.nextState({ senderId });
  }

  private onChangeTo = (recipientId: string) => {
    this.nextState({ recipientId });
  }

  private onChangeFees = (hasAvailable: boolean) => {
    this.setState({ hasAvailable });
  }

  private setMaxBalance = async () => {
    const { api, balances_fees = ZERO_FEES } = this.props;
    const { senderId, recipientId, ringAmount, month } = this.state;

    // if (!senderId || !recipientId) {
    //   return;
    // }

    // let extrinsic;

    // extrinsic = api.tx.kton[this.getDepositFunctionName()](ringAmount, month);

    // this.nextState({
    //   extrinsic,
    // });


    const { transferFee, transactionBaseFee, transactionByteFee, creationFee } = balances_fees;

    // FIXME The any casts here are irritating, but they are basically caused by the derive
    // not really returning an actual `class implements Codec`
    // (if casting to DerivedBalance it would be `as any as DerivedBalance`)
    const accountNonce = await api.query.system.accountNonce(senderId) as Index;
    const senderBalance = (await api.derive.balances.all(senderId) as any).availableBalance;
    const recipientBalance = (await api.derive.balances.all(recipientId) as any).availableBalance;

    let prevMax = new BN(0);
    let maxBalance = new BN(1);
    let extrinsic;

    while (!prevMax.eq(maxBalance)) {
      prevMax = maxBalance;
      // extrinsic = api.tx.balances.transfer(recipientId, prevMax);
      extrinsic = api.tx.kton[this.getDepositFunctionName()](ringAmount, month);

      const txLength = calcSignatureLength(extrinsic, accountNonce);
      const fees = transactionBaseFee
        .add(transactionByteFee.muln(txLength))
        .add(transferFee)
        .add(recipientBalance.isZero() ? creationFee : ZERO);

      maxBalance = senderBalance.sub(fees);
    }

    this.nextState({
      extrinsic,
      maxBalance
    });
  }
}

export default withMulti(
  RingStaking,
  translate,
  withApi,
  withCalls<Props>(
    'derive.balances.fees',
    ['query.kton.depositLedger', { paramName: 'senderId' }],
  )
);
