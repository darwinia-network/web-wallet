// Copyright 2017-2019 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-api/types';

import BN from 'bn.js';
import React from 'react';
import { ValidatorPrefs, Bytes } from '@polkadot/types';
import { Button, InputAddress, InputNumber, Modal, TxButton, TxComponent, Input } from '@polkadot/ui-app';
import Checks from '@polkadot/ui-signer/Checks';
import { withMulti, withApi } from '@polkadot/ui-api';
import translate from '../translate';
import { u8aToU8a, u8aToString, u8aToHex } from '@polkadot/util'

type Props = ApiProps & I18nProps & {
  accountId: string,
  isOpen: boolean,
  onClose: () => void,
  stashId: string,
  validatorPrefs: ValidatorPrefs,
  nodeName?: Bytes
};

type State = {
  unstakeThreshold?: BN,
  validatorPayment?: BN,
  nodeName?: string,
  hasAvailable: boolean
};

class Staking extends TxComponent<Props, State> {
  state: State = {
    // unstakeThreshold: new BN(3),
    validatorPayment: new BN(0),
    hasAvailable: true
  };

  // inject the preferences are returned via RPC once into the state (from this
  // point forward it will be entirely managed by the actual inputs)
  static getDerivedStateFromProps(props: Props, state: State): State | null {
    // console.log('props.validatorPrefs unstakeThreshold', state.unstakeThreshold)

    if (state.unstakeThreshold) {
      return null;
    }
    const { nodeName = new Bytes() } = props
    // const { unstake_threshold, validator_payment_ratio } = props.validatorPrefs;
    // console.log('props.validatorPrefs', props.validatorPrefs, unstake_threshold.toBn(), validator_payment_ratio.toBn())
    // return {
    //   unstakeThreshold: unstake_threshold.toBn(),
    //   validatorPayment: validator_payment_ratio.toBn()
    // }

    if (props.validatorPrefs) {
      const { unstakeThreshold, validatorPayment } = props.validatorPrefs;
      // console.log('props.validatorPrefs', props.validatorPrefs, unstake_threshold.toBn(), validator_payment_ratio.toBn())

      return {
        unstakeThreshold: unstakeThreshold.toBn(),
        validatorPayment: validatorPayment.toBn(),
        nodeName: u8aToString(nodeName.toU8a(true)),
        hasAvailable: state.hasAvailable
      };
    }

    return {
      unstakeThreshold: new BN(3),
      validatorPayment: undefined,
      nodeName: u8aToString(nodeName.toU8a(true)),
      hasAvailable: state.hasAvailable
    };

  }

  render() {
    const { isOpen, onClose } = this.props;

    if (!isOpen) {
      return null;
    }

    return (
      <Modal
        className='staking--Staking'
        dimmer='inverted'
        open
        size='small'
        onClose={onClose}
      >
        {this.renderContent()}
        {this.renderButtons()}
      </Modal>
    );
  }

  private onChangeFees = (hasAvailable: boolean) => {
    this.setState({ hasAvailable });
  }

  private renderButtons() {
    const { accountId, onClose, t } = this.props;
    const { unstakeThreshold, validatorPayment, nodeName, hasAvailable } = this.state;

    return (
      <Modal.Actions>
        <Button.Group>
          <TxButton
            accountId={accountId}
            isDisabled={!hasAvailable}
            isPrimary
            label={t('Validate')}
            onClick={onClose}
            params={[
              u8aToHex(u8aToU8a(nodeName)),
              validatorPayment,
              unstakeThreshold
            ]}
            tx='staking.validate'
            ref={this.button}
          />
          <Button
            isBasic
            isSecondary
            label={t('Cancel')}
            onClick={onClose}
          />

        </Button.Group>
      </Modal.Actions>
    );
  }

  private renderContent() {
    const { accountId, stashId, api, t } = this.props;
    const { unstakeThreshold, validatorPayment, nodeName } = this.state;
    const extrinsic = api.tx.staking.validate(u8aToHex(u8aToU8a(nodeName)), validatorPayment, unstakeThreshold);

    return (
      <>
        <Modal.Header>
          {t('Validating')}
        </Modal.Header>
        <Modal.Content className='ui--signer-Signer-Content'>
          <InputAddress
            className='medium'
            defaultValue={accountId}
            isDisabled
            label={t('controller account')}
          />
          <InputAddress
            className='medium'
            defaultValue={stashId.toString()}
            isDisabled
            label={t('stash account')}
          />
          <Input
            className='medium'
            help={t('node name')}
            label={t('node name')}
            onChange={this.onChangeNodeName}
            onEnter={this.sendTx}
            value={
              nodeName
                ? nodeName
                : ''
            }
          />
          <InputNumber
            className='medium'
            help={t('Reward that validator takes up-front, the remainder is split between themselves and nominators')}
            label={t('payment preferences')}
            onChange={this.onChangePayment}
            onEnter={this.sendTx}
            rightLabel={'%'}
            isSi={false}
            value={
              validatorPayment
                ? validatorPayment.toString()
                : '0'
            }
          />
          <InputNumber
            autoFocus
            bitLength={32}
            className='medium'
            help={t('The number of allowed slashes for this validator before being automatically unstaked (maximum of 10 allowed)')}
            label={t('unstake threshold')}
            onChange={this.onChangeThreshold}
            onEnter={this.sendTx}
            isSi={false}
            value={
              unstakeThreshold
                ? unstakeThreshold.toString()
                : '3'
            }
          />
          <Checks
            accountId={accountId}
            extrinsic={extrinsic}
            isSendable
            onChange={this.onChangeFees}
          />
        </Modal.Content>
      </>
    );
  }

  private onChangePayment = (validatorPayment?: BN) => {
    if (validatorPayment) {
      this.setState({ validatorPayment });
    }
  }

  private onChangeThreshold = (unstakeThreshold?: BN) => {
    if (unstakeThreshold) {
      this.setState({ unstakeThreshold });
    }
  }

  private onChangeNodeName = (nodeName: string) => {
    this.setState({ nodeName });
  }
}

export default withMulti(
  Staking,
  translate,
  withApi
);
