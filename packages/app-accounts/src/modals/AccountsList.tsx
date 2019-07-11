// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import { ComponentProps } from '../types';
import styled from 'styled-components';

import React from 'react';
import store from 'store'
import accountObservable from '@polkadot/ui-keyring/observable/accounts';
import { withMulti, withObservable } from '@polkadot/ui-api';
import { Button, CardGrid, Modal, AddressRowAccountList } from '@polkadot/ui-app';
import keyring from '@polkadot/ui-keyring';

import CreateModal from '../modals/Create';
import ImportModal from '../modals/Import';

import Account from '../Account';
import AccountDarwinia from '../AccountDarwinia';
import translate from '../translate';


type Props = ComponentProps & I18nProps & {
  accounts?: SubjectInfo[]
  onClose: () => void,
  changeAccountMain: () => void,
};

type State = {
  isCreateOpen: boolean,
  isImportOpen: boolean,
  AccountMain: string
};

class AccountsList extends React.PureComponent<Props, State> {
  state: State = {
    isCreateOpen: false,
    isImportOpen: false,
    AccountMain: ''
  };

  componentDidMount() {
    const AccountMain = this.getAccountMain() || '';
    this.setState({
      AccountMain: AccountMain
    })
  }

  render() {
    const { accounts, onStatusChange, t, onClose } = this.props;

    const { isCreateOpen, isImportOpen, AccountMain } = this.state;

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
                  <p>Choose account</p>
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
                <div key={address} className={'account-item'}>
                  <AddressRowAccountList
                    isEditable={false}
                    value={address}
                    isChecked={address === AccountMain}
                    onChange={() => {this.onChange()}}
                    withBalance
                  // withExplorer
                  // withIndex
                  // withTags
                  >
                  </AddressRowAccountList>
                </div>
              ))}
            </div>
          </CardGrid>
        </Wrapper>
      </Modal>
    );
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
`;

export default withMulti(
  AccountsList,
  translate,
  // withObservable(accountObservable.subject, { propName: 'accounts' })
);
