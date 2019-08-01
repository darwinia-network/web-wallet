// Copyright 2017-2019 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';

import React from 'react';
import { Button, InputAddress, Modal, TxButton } from '@polkadot/ui-app';

import ValidateSession from './ValidateSession';
import translate from '../translate';
import { SubmittableResult } from '@polkadot/api/SubmittableExtrinsic';

const noop = function(){};


type Props = I18nProps & {
  accountId: string,
  isOpen: boolean,
  onClose: () => void,
  onSuccess?:(status: SubmittableResult) => void,
  stashId: string,
  withStep?: boolean
};

type State = {
  sessionError: string | null,
  sessionId: string
};

class Key extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    this.state = {
      sessionError: null,
      sessionId: props.accountId
    };
  }

  render () {
    const { accountId, isOpen, onClose,onSuccess, t } = this.props;
    const { sessionError, sessionId } = this.state;

    if (!isOpen) {
      return null;
    }

    return (
      <Modal
        className='staking--Stash'
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
            isDisabled={!sessionId || !!sessionError}
            isPrimary
            label={t('Set Session Key')}
            onClick={onSuccess ? noop : onClose}
            onSuccess= {onSuccess}
            params={[[sessionId, sessionId],'0x']}
            tx='session.setKeys'
            withSpinner
          />
          <Button
            isBasic={true}
            isSecondary={true}
            onClick={onClose}
            label={t('Cancel')}
          />
        </Button.Group>
      </Modal.Actions>
      </Modal>
    );
  }

  private renderContent () {
    const { accountId, stashId, t, withStep } = this.props;
    const { sessionId } = this.state;

    return (
      <>
        <Modal.Header className="ui-step-header">
          {t('Session Key')}
          {withStep && <div>
            <span className="">STEP1</span>
            <i className=""></i>
            <span className="">STEP2</span>
            <i className="step"></i>
            <span className="step">STEP3</span>
          </div>}
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
            help={t('Changing the key only takes effect at the start of the next session. If validating, you should (currently) use an ed25519 key.')}
            label={t('session key:')}
            onChange={this.onChangeSession}
            type='account'
            value={sessionId}
          />
          {/* <InputAddress
            className='medium'
            help={t('Changing the key only takes effect at the start of the next session. If validating, you should (currently) use an ed25519 key.')}
            label={t('aura key')}
            onChange={this.onChangeSession}
            type='account'
            value={sessionId}
          /> */}
          <ValidateSession
            controllerId={accountId}
            onError={this.onSessionError}
            sessionId={sessionId}
            stashId={stashId}
          />
        </Modal.Content>
      </>
    );
  }

  private onChangeSession = (sessionId: string) => {
    this.setState({ sessionId });
  }

  private onSessionError = (sessionError: string | null) => {
    this.setState({ sessionError });
  }
}

export default translate(Key);
