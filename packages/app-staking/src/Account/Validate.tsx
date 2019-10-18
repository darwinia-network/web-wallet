// Copyright 2017-2019 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';

import BN from 'bn.js';
import React from 'react';
import { ValidatorPrefs, Bytes } from '@polkadot/types';
import { Button, InputAddress, InputBalance, InputNumber, Modal, TxButton, TxComponent, Input } from '@polkadot/ui-app';

import InputValidationUnstakeThreshold from './InputValidationUnstakeThreshold';
import translate from '../translate';

import { u8aToU8a, u8aToString, u8aToHex } from '@polkadot/util'

type Props = I18nProps & {
  controllerId: string,
  isOpen: boolean,
  onClose: () => void,
  stashId: string,
  validatorPrefs?: ValidatorPrefs,
  withStep?: boolean
  nodeName?: Bytes
};

type State = {
  unstakeThreshold?: BN,
  unstakeThresholdError: string | null,
  validatorPayment?: BN,
  nodeName?: string,
  isUpdateProps?: boolean
};

class Validate extends TxComponent<Props, State> {
  state: State = {
    unstakeThreshold: undefined,
    unstakeThresholdError: null,
    validatorPayment: undefined,
    nodeName: undefined,
    isUpdateProps: false
  };

  // inject the preferences returned via RPC once into the state (from this
  // point forward it will be entirely managed by the actual inputs)
  // static getDerivedStateFromProps(props: Props, state: State): State | null {
  // console.log('validatorPrefs valiidate',state.unstakeThreshold ,state.validatorPayment )
  // if (state.unstakeThreshold && state.validatorPayment && state.nodeName) {
  //   return null;
  // }

  // const { nodeName = new Bytes() } = props
  // console.log('validatorPrefs valiidate1', props.validatorPrefs, nodeName)

  // // if (props.validatorPrefs) {
  // //   // @ts-ignore
  // //   const { unstake_threshold, validator_payment_ratio } = props.validatorPrefs || {};
  // //   console.log('validatorPrefs valiidate2', unstake_threshold.toBn(), validator_payment_ratio.toBn())
  // //   return {
  // //     unstakeThreshold: unstake_threshold.toBn(),
  // //     unstakeThresholdError: null,
  // //     validatorPayment: validator_payment_ratio.toBn(),
  // //     nodeName: u8aToString(nodeName.toU8a(true))
  // //   };
  // // }

  // // @ts-ignore
  // const { unstake_threshold, validator_payment_ratio } = props.validatorPrefs || {};

  // return {
  //   unstakeThreshold: props.validatorPrefs ? unstake_threshold.toBn() : undefined,
  //   unstakeThresholdError: null,
  //   validatorPayment: props.validatorPrefs ? validator_payment_ratio.toBn() : undefined,
  //   nodeName: nodeName
  // };
  // }


  static getDerivedStateFromProps(props: Props, state: State): State | null {
    // console.log('props.validatorPrefs unstakeThreshold', state.unstakeThreshold)

    if (!props.validatorPrefs || state.isUpdateProps) {
      return null;
    }
    const {nodeName = new Bytes()}  = props

    if (props.validatorPrefs && !state.isUpdateProps) {

      const { unstakeThreshold, validatorPayment } = props.validatorPrefs;
      // console.log('props.validatorPrefs1', props.validatorPrefs)

      return {
        unstakeThreshold: unstakeThreshold.toBn(),
        unstakeThresholdError: null,
        validatorPayment: validatorPayment.toBn().div(new BN(10000000)),
        nodeName: u8aToString(nodeName.toU8a(true)),
        isUpdateProps: true
      };
    }

    return {
      unstakeThreshold: new BN(3),
      unstakeThresholdError: null,
      validatorPayment: undefined,
      nodeName: u8aToString(nodeName.toU8a(true)),
      isUpdateProps: false
    };

  }

  componentDidMount() {

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
        onClose={onClose}
        size='small'
      >
        {this.renderContent()}
        {this.renderButtons()}
      </Modal>
    );
  }

  private renderButtons() {
    const { controllerId, onClose, t, validatorPrefs } = this.props;
    const { unstakeThreshold = new BN(3), unstakeThresholdError, validatorPayment, nodeName } = this.state;
    const isChangingPrefs = validatorPrefs && !!validatorPrefs.unstakeThreshold;

    return (
      <Modal.Actions>
        <Button.Group>
          <TxButton
            accountId={controllerId}
            isDisabled={!!unstakeThresholdError}
            isPrimary
            label={isChangingPrefs ? t('Set validator preferences') : t('Validate')}
            onClick={onClose}
            onClose={onClose}
            params={[u8aToHex(u8aToU8a(nodeName)), validatorPayment, unstakeThreshold]}
            tx='staking.validate'
            ref={this.button}
          />
          <Button
            isBasic
            isSecondary
            label={t('Skip')}
            onClick={onClose}
          />
        </Button.Group>
      </Modal.Actions>
    );
  }

  private renderContent() {
    const { controllerId, stashId, t, validatorPrefs, withStep } = this.props;
    const { unstakeThreshold, unstakeThresholdError, validatorPayment, nodeName } = this.state;
    const defaultValue = validatorPrefs && validatorPrefs.unstakeThreshold && validatorPrefs.unstakeThreshold.toBn();

    return (
      <>
        <Modal.Header className="ui-step-header">
          {t('Set validator preferences')}
          {withStep && <div>
            <span className="">{t('STEP1')}</span>
            <i className=""></i>
            <span className="">{t('STEP2')}</span>
            <i className=""></i>
            <span className="">{t('STEP3')}</span>
          </div>}
        </Modal.Header>
        <Modal.Content className='ui--signer-Signer-Content'>
          <InputAddress
            className='medium'
            defaultValue={stashId.toString()}
            isDisabled
            label={t('stash account')}
          />
          <InputAddress
            className='medium'
            defaultValue={controllerId}
            isDisabled
            label={t('controller account')}
          />
          <Input
            className='medium'
            defaultValue={nodeName}
            help={t('node name')}
            label={t('node name')}
            onChange={this.onChangeNodeName}
            value={
              nodeName
                ? nodeName
                : ''
            }
          />
          <InputNumber
            className='medium'
            defaultValue={validatorPrefs && validatorPrefs.validatorPayment && validatorPrefs.validatorPayment.toBn().div(new BN(10000000))}
            help={t('Amount taken up-front from the reward by the validator before spliting the remainder between themselves and the nominators')}
            label={t('reward commission')}
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
            defaultValue={defaultValue}
            help={t('The number of time this validator can get slashed before being automatically unstaked (maximum of 10 allowed)')}
            isError={!!unstakeThresholdError}
            label={t('automatic unstake threshold')}
            onChange={this.onChangeThreshold}
            onEnter={this.sendTx}
            isSi={false}
            value={
              unstakeThreshold
                ? unstakeThreshold.toString()
                : '3'
            }
          />
          <InputValidationUnstakeThreshold
            onError={this.onUnstakeThresholdError}
            unstakeThreshold={unstakeThreshold}
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

  private onUnstakeThresholdError = (unstakeThresholdError: string | null) => {
    this.setState({ unstakeThresholdError });
  }

}

export default translate(Validate);
