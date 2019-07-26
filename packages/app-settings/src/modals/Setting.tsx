
// Copyright 2017-2019 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiProps } from '@polkadot/ui-api/types';
import { DerivedFees } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { SettingsStruct } from '@polkadot/ui-settings/types';

import BN from 'bn.js';
import React from 'react';
import styled from 'styled-components';
import { Index } from '@polkadot/types';
import { Button, InputAddress, InputBalance, Modal, TxButton, media } from '@polkadot/ui-app';
import { Available } from '@polkadot/ui-reactive';
import Checks, { calcSignatureLength } from '@polkadot/ui-signer/Checks';
import { withApi, withCalls, withMulti } from '@polkadot/ui-api';
import { ZERO_FEES } from '@polkadot/ui-signer/Checks/constants';

import translate from '../translate';

import SwitchOn from '../img/switch-on.svg'
import SwitchOff from '../img/switch-off.svg'

import uiSettings from '@polkadot/ui-settings';


type Props = ApiProps & I18nProps & {
  onClose: () => void
};

type State = {
  settings: SettingsStruct
};

const ZERO = new BN(0);

const Wrapper = styled.div`
  .item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    p{
      margin-bottom: 0;
      font-size: 18px;
      color: #302B3C;
    }
  }
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

class Setting extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const settings = uiSettings.get();
    this.state = {
      settings,
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {

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
        <Modal.Header>{t('Setting')}</Modal.Header>
        {this.renderContent()}
        {this.renderButtons()}
      </Modal>
    );
  }

  private renderButtons() {
    const { onClose, t } = this.props;
    return (
      <Modal.Actions>
        <Button.Group>
          <Button
            isPrimary
            onClick={this.onSave}
            label={t('Save')}
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
    const {settings} = this.state;
    return (
      <Modal.Content>
        <Wrapper>
          <div className="item">
             <p>Developer mode</p>
             {settings.uiMode === 'full' ? <img onClick={this.toggleUiMode} src={SwitchOff}/> : <img onClick={this.toggleUiMode} src={SwitchOn}/>}
          </div>
        </Wrapper>
      </Modal.Content>
    );
  }

  private onSave = () => {
    const {settings} = this.state;
    uiSettings.set({
      ...settings
    })
    window.location.reload();
  }


  private toggleUiMode = () => {
    const {settings} = this.state;
    let uiMode = settings.uiMode
    if(uiMode === 'full'){
      uiMode = 'light'
    } else {
      uiMode = 'full'
    }

    this.setState({ settings: {
      ...settings,
      uiMode: uiMode
    } },() => {
      console.log(this.state)
    });
  }
}

export default withMulti(
  Setting,
  translate,
  withApi
);
