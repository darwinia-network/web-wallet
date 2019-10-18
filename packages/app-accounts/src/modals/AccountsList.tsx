// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import { ComponentProps } from '../types';
import styled from 'styled-components';
import { ActionStatus } from '@polkadot/ui-app/Status/types';

import React from 'react';
import store from 'store'
import { withMulti, withObservable } from '@polkadot/ui-api';
import { Button, CardGrid, Modal, AddressRowAccountList } from '@polkadot/ui-app';
import keyring from '@polkadot/ui-keyring';
import CreateModal from '../modals/Create';
import ImportModal from '../modals/Import';
import translate from '../translate';
import Forgetting from './Forgetting';
import Backup from './Backup';
import ChangePass from './ChangePass';

type Props = ComponentProps & I18nProps & {
  accounts?: SubjectInfo[]
  onClose: () => void,
  changeAccountMain: () => void,
  onStatusChange: () => void,
};

type State = {
  isCreateOpen: boolean,
  isImportOpen: boolean,
  AccountMain: string,
  isForgetOpen: boolean,
  isBackupOpen: boolean,
  isPasswordOpen: boolean,
  address: string,
  settingOpenAddress: string
};

class AccountsList extends React.PureComponent<Props, State> {
  state: State = {
    isCreateOpen: false,
    isImportOpen: false,
    AccountMain: '',
    isForgetOpen: false,
    isBackupOpen: false,
    isPasswordOpen: false,
    address: '',
    settingOpenAddress: ''
  };

  componentDidMount() {
    const AccountMain = this.getAccountMain() || '';
    this.setState({
      AccountMain: AccountMain
    })
  }

  render() {
    const { accounts, onStatusChange, t, onClose } = this.props;

    const { isCreateOpen, isImportOpen, AccountMain, settingOpenAddress } = this.state;

    return (
      <Modal
        className='app--accounts-Modal'
        dimmer='inverted'
        open
        onClose={onClose}
      >
        <Wrapper>
          <CardGrid
            buttons={
              <div className={'overviewTab'}>
                <div>
                  <p>{t('Choose account')}</p>
                </div>
                <div>
                  <Button
                    isPrimary
                    label={t('Add account')}
                    onClick={this.toggleCreate}
                  />
                  <Button
                    isPrimary
                    label={t('Restore JSON')}
                    onClick={this.toggleImport}
                  />
                </div>
              </div>
            }
          >
            {isCreateOpen && (
              <CreateModal
                onClose={this.toggleCreate}
                onStatusChange={onStatusChange}
              />
            )}
            {isImportOpen && (
              <ImportModal
                onClose={this.toggleImport}
                onStatusChange={onStatusChange}
              />
            )}
            <div className='account-box'>
              {accounts && Object.keys(accounts).map((address) => (
                  <AddressRowAccountList
                    key={address} 
                    isEditable={false}
                    value={address}
                    isChecked={address === AccountMain}
                    onChange={() => {this.onChange()}}
                    withBalance
                    toggleBackup={this.toggleBackup}
                    toggleForget={this.toggleForget}
                    togglePass={this.togglePass}
                    toggleSetting={this.toggleSetting}
                    settingOpenAddress={settingOpenAddress}
                    onStatusChange={onStatusChange}
                  // withExplorer
                  // withIndex
                  // withTags
                  />
              ))}
            </div>
            {this.renderModals()}
          </CardGrid>
        </Wrapper>
      </Modal>
    );
  }

  private toggleSetting = (address: string) => {
    const { settingOpenAddress } = this.state;
    this.setState({
      settingOpenAddress: (settingOpenAddress === address ? '' : address)
    })
  }

  private getAccountMain = (): string | undefined => {
    const AccountMain = store.get('accountMain')
    const { accounts } = this.props;

    if (AccountMain && accounts && accounts[AccountMain]) {
      return AccountMain
    } else if(accounts && accounts[AccountMain]){
      return accounts && Object.keys(accounts)[0]
    } else {
      return ''
    }
  }

  private onChange = (): void => {
    const {onClose, changeAccountMain} = this.props;
    const AccountMain = this.getAccountMain() || '';
    this.setState({
      AccountMain: AccountMain
    })
    changeAccountMain && changeAccountMain()
    onClose && onClose()
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

  private toggleForget = (address?: string): void => {
    const { isForgetOpen } = this.state;

    this.setState({
      isForgetOpen: !isForgetOpen,
      address
    });
  }

  private toggleBackup = (address?: string): void => {
    const { isBackupOpen } = this.state;

    this.setState({
      isBackupOpen: !isBackupOpen,
      address
    });
  }

  private togglePass = (address?: string): void => {
    const { isPasswordOpen } = this.state;
    this.setState({
      isPasswordOpen: !isPasswordOpen,
      address
    });
  }

  private renderModals() {

    const { changeAccountMain, accounts} = this.props;
    const { isForgetOpen, isBackupOpen, isPasswordOpen, address } = this.state;
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
    return modals;
  }

  private onForget = (): void => {
    const { t } = this.props;
    const { address } = this.state;
    
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
}

const Wrapper = styled.div`
  .overviewTab{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 44px 15px 20px;
    margin: 0;
    p{
      font-size: 20px;
      color: #302B3C;
    }
  }

  .account-box{
    width: 100%;
  }

  .account-item{
    padding: 15px 58px 15px 20px;
    border-top: 1px solid rgba(237,237,237,1);
  }

  .account-item:last-child{
    border-bottom: 1px solid rgba(237,237,237,1);
  }

  @media (max-width: 767px) {
    .overviewTab{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin: 0;
    .ui.primary.button {
      margin-right: 5px;
    }

    p{
      font-size: 16px;
      color: #302B3C;
    }
  }
  }
`;

export default withMulti(
  AccountsList,
  translate,
);
