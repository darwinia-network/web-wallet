// Copyright 2017-2019 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';

import BN from 'bn.js';
import React from 'react';
import { ValidatorPrefs } from '@polkadot/types';
import { Button, InputAddress, InputBalance, InputNumber, Modal, TxButton, TxComponent, Input } from '@polkadot/ui-app';

import InputValidationUnstakeThreshold from './InputValidationUnstakeThreshold';
import translate from '../translate';

import {u8aToU8a, u8aToString, u8aToHex} from '@polkadot/util'

type Props = I18nProps & {
  controllerId: string,
  isOpen: boolean,
  onClose: () => void,
  stashId: string,
  validatorPrefs?: ValidatorPrefs,
  withStep?: boolean
};

type State = {
  unstakeThreshold?: BN,
  unstakeThresholdError: string | null,
  validatorPayment?: BN,
  nodeName?: string
};

class Validate extends TxComponent<Props, State> {
  state: State = {
    // unstakeThreshold: new BN(3),
    unstakeThresholdError: null,
    // validatorPayment: new BN(0),
  };

  // inject the preferences returned via RPC once into the state (from this
  // point forward it will be entirely managed by the actual inputs)
  static getDerivedStateFromProps(props: Props, state: State): State | null {
    if (state.unstakeThreshold && state.validatorPayment) {
      return null;
    }
    console.log('validatorPrefs', props.validatorPrefs)
    
    if (props.validatorPrefs) {
      // @ts-ignore
      const { unstake_threshold, validator_payment_ratio } = props.validatorPrefs;

      return {
        unstakeThreshold: unstake_threshold.toBn(),
        unstakeThresholdError: null,
        validatorPayment: validator_payment_ratio.toBn()
      };
    }

    return {
      unstakeThreshold: undefined,
      unstakeThresholdError: null,
      validatorPayment: undefined
    };
  }

  componentDidMount() {
    console.log('u8aToString', u8aToString(u8aToU8a('0xe6b58be8af95e5ad97e7aca6e4b8b2')));
    console.log('u8aToString', u8aToHex(u8aToU8a('测试字符串')));
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
    const { unstakeThreshold, unstakeThresholdError, validatorPayment, nodeName } = this.state;
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
            params={[u8aToHex(u8aToU8a(nodeName)), unstakeThreshold, validatorPayment]}
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
    const { controllerId, stashId, t, validatorPrefs, withStep } = this.props;
    const { unstakeThreshold, unstakeThresholdError, validatorPayment, nodeName } = this.state;
    const defaultValue = validatorPrefs && validatorPrefs.unstakeThreshold && validatorPrefs.unstakeThreshold.toBn();

    return (
      <>
        <Modal.Header className="ui-step-header">
          {t('Set validator preferences')}
          {withStep && <div>
            <span className="">STEP1</span>
            <i className=""></i>
            <span className="">STEP2</span>
            <i className=""></i>
            <span className="">STEP3</span>
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
            help={t('node name')}
            label={t('node name')}
            onChange={this.onChangeNodeName}
            onEnter={this.sendTx}
            value={
              nodeName
                ? nodeName.toString()
                : ''
            }
          />
          <InputNumber
            className='medium'
            defaultValue={validatorPrefs && validatorPrefs.validatorPayment && validatorPrefs.validatorPayment.toBn()}
            help={t('Amount taken up-front from the reward by the validator before spliting the remainder between themselves and the nominators')}
            label={t('reward commission')}
            onChange={this.onChangePayment}
            onEnter={this.sendTx}
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
