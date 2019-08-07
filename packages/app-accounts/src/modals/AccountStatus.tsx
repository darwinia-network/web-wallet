// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { ActionStatus } from '@polkadot/ui-app/Status/types';

import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import { ComponentProps } from '../types';

import React, { ReactComponentElement } from 'react';
import accountObservable from '@polkadot/ui-keyring/observable/accounts';
import { withMulti, withObservable } from '@polkadot/ui-api';
import { Header, Popup, Grid } from 'semantic-ui-react'
import { AddressInfo, AddressRowReverse, AddressRow, Button, Card, Icon } from '@polkadot/ui-app';
import translate from '../translate';
import styled from "styled-components";
import keyring from '@polkadot/ui-keyring';
import { noop } from '@babel/types';

import Forgetting from './Forgetting';
import Backup from './Backup';

import ChangePass from './ChangePass';
import AccountsList from './AccountsList';

import ChangeIcon from '../img/changeIcon.svg'
import SwitchIcon from '../img/switchAccount.svg'

type Props = ComponentProps & I18nProps & {
  accounts?: SubjectInfo[],
  address: string,
  changeAccountMain:() => void
};

type State = {
  isCreateOpen: boolean,
  isImportOpen: boolean,
  isEditable: boolean,
  isForgetOpen: boolean,
  isBackupOpen: boolean,
  isPasswordOpen: boolean,
  isAccountOpen: boolean
};

class AccountStatus extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);
    this.state = {
      isCreateOpen: false,
      isImportOpen: false,
      isEditable: keyring.getAccount(props.address) && !(keyring.getAccount(props.address).meta.isInjected),
      isForgetOpen: false,
      isBackupOpen: false,
      isPasswordOpen: false,
      isAccountOpen: false
    }
  }

  render() {
    const { accounts, onStatusChange, t, address } = this.props;

    return (
      <StyledWrapper>
        <div className="ui--AccountStatus-Box">
          <div className="ui--AccountStatus-Network">
            <span>•</span><span>Trilobita</span>
          </div>
          <AddressRowReverse
            isEditable={true}
            value={address}
          // withExplorer
          // withIndex
          // withTags
          >
          </AddressRowReverse>
          {/* {PopupExampleFlowing(this.renderButtons(), address)} */}

          <div><img onClick={this.toggleAccount} className="switchBtn" src={SwitchIcon}/></div>
          {this.renderModals()}
        </div>
      </StyledWrapper>
    );
  }

  private toggleForget = (): void => {
    const { isForgetOpen } = this.state;

    this.setState({
      isForgetOpen: !isForgetOpen
    });
  }

  private toggleBackup = (): void => {
    const { isBackupOpen } = this.state;

    this.setState({
      isBackupOpen: !isBackupOpen
    });
  }

  private togglePass = (): void => {
    const { isPasswordOpen } = this.state;
    this.setState({
      isPasswordOpen: !isPasswordOpen
    });
  }

  private toggleAccount = (): void => {
    const { isAccountOpen } = this.state;

    this.setState({
      isAccountOpen: !isAccountOpen
    });
  }


  private renderButtons() {
    const { t } = this.props;
    const { isEditable } = this.state;

    return (
      <ButtonStyledWrapper className='accounts--Account-buttons buttons'>
        {isEditable && (
          <>
            <Button
              isNegative
              onClick={this.toggleForget}
              icon='trash'
              size='small'
              tooltip={t('Forget this account')}
            />
            <Button
              icon='cloud download'
              isPrimary
              onClick={this.toggleBackup}
              size='small'
              tooltip={t('Create a backup file for this account')}
            />
            <Button
              icon='key'
              isPrimary
              onClick={this.togglePass}
              size='small'
              tooltip={t("Change this account's password")}
            />
          </>
        )}
        <Button
          isPrimary
          onClick={this.toggleAccount}
          size='small'
          tooltip={t("Change this account's password")}
        >
          <img src={ChangeIcon} />
        </Button>
      </ButtonStyledWrapper>
    );

  }
  private onForget = (): void => {
    const { t, address } = this.props;
    
    if (!address) {
      return;
    }

    const status = {
      account: address,
      action: 'forget'
    } as ActionStatus;

    try {
      keyring.forgetAccount(address);
      status.status = 'success';
      status.message = t('account forgotten');
      window.location.reload();
    } catch (error) {
      status.status = 'error';
      status.message = error.message;
    }
  }

  private toggleCreate = (): void => {
    this.setState(({ isCreateOpen }) => ({
      isCreateOpen: !isCreateOpen
    }));
  }

  private toggleImport = (): void => {
    this.setState(({ isImportOpen }) => ({
      isImportOpen: !isImportOpen
    }));
  }

  private renderModals() {

    const {address, changeAccountMain, accounts} = this.props;
    const { isForgetOpen, isBackupOpen, isPasswordOpen, isAccountOpen } = this.state;
    const {onStatusChange} = this.props
    if (!address) {
      return null;
    }

    const modals = [];


    if (isBackupOpen) {
      modals.push(
        <Backup
          key='modal-backup-account'
          onClose={this.toggleBackup}
          address={address}
        />
      );
    }

    if (isForgetOpen) {
      modals.push(
        <Forgetting
          address={address}
          doForget={this.onForget}
          key='modal-forget-account'
          onClose={this.toggleForget}
        />
      );
    }

    if (isPasswordOpen) {
      modals.push(
        <ChangePass
          address={address}
          key='modal-change-pass'
          onClose={this.togglePass}
        />
      );
    }

    if(isAccountOpen) {
      modals.push(
        <AccountsList
          address={address}
          accounts={accounts}
          key='modal-accounts'
          onClose={this.toggleAccount}
          onStatusChange={onStatusChange}
          changeAccountMain={changeAccountMain}
        />
      );
    }
    return modals;
  }
}

const ButtonStyledWrapper = styled.div`
  padding: 0px;
  display: flex;
  justify-items: center;
  button{
    background-color: transparent!important;
    i{
      color: #B3B3B3!important;
    }
  }
  button:hover,button:active{
    background-color: #f8f8f8!important;
  }
`

const StyledWrapper = styled.div`
  background: #fff;
  padding: 8px 0 8px 2rem;
  margin:0 -2rem;
  border-bottom:1px solid rgba(237,237,237,1);
  .ui--AccountStatus-Box{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ui--AccountStatus-Network{
    color: #8231D8;
    font-size: 14px;
    font-weight: bold;
    flex: 1;
    span{
      margin-right: .5rem;
    }
  }
  button{
    background-color: transparent!important;
  }
  .accounts--Account-buttons{
    padding: 40px;
  }
  .switchBtn{
    margin-left: 16px;
    cursor: pointer;
  }
`

// @ts-ignore
const PopupExampleFlowing = (Box, address: string) => (
  <Popup basic position='bottom right' trigger={<div><img className="switchBtn" src={SwitchIcon}/></div>} flowing hoverable>
    {Box}
  </Popup>
)

export default withMulti(
  AccountStatus,
  translate,
  withObservable(accountObservable.subject, { propName: 'accounts' })
);