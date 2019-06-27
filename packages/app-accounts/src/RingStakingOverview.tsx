// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import { ComponentProps } from './types';
import styled from 'styled-components';

import React from 'react';
import store from 'store'
import accountObservable from '@polkadot/ui-keyring/observable/accounts';
import { withMulti, withObservable } from '@polkadot/ui-api';
import { Button, CardGrid } from '@polkadot/ui-app';

import CreateModal from './modals/Create';
import ImportModal from './modals/Import';
import AccountsListModal from './modals/AccountsList';
import AccountStatus from './modals/AccountStatus';
import Account from './Account';
import AccountDarwinia from './AccountDarwinia';
import translate from './translate';
import { SIDEBAR_MENU_THRESHOLD } from "@polkadot/apps/src/constants";
const ringStakingBanner =  require('./img/ringStakingBanner.png');

type Props = ComponentProps & I18nProps & {
  accounts?: SubjectInfo[]
};

type State = {
  isCreateOpen: boolean,
  isImportOpen: boolean,
  isAccountsListOpen: boolean,
  AccountMain: string
};

class Overview extends React.PureComponent<Props, State> {
  state: State = {
    isCreateOpen: false,
    isImportOpen: false,
    isAccountsListOpen: false,
    AccountMain: ''
  };

  componentDidMount() {
    const AccountMain = this.getAccountMain() || '';
    this.setState({
      AccountMain
    })
  }

  render() {
    const { accounts, onStatusChange, t } = this.props;

    const { isCreateOpen, isImportOpen, isAccountsListOpen, AccountMain } = this.state;

    return (
      <Wrapper>
        {AccountMain && <AccountStatus onStatusChange={onStatusChange} changeAccountMain={() => {this.changeMainAddress()}} address={AccountMain} />}
        <img className='ringStakingBanner' src={ringStakingBanner} alt="stake ring for precious kton"/>
        <div className={'titleRow'}>
          Darwinia asset
        </div>

        {AccountMain && <AccountDarwinia
          address={AccountMain}
          key={AccountMain}
        />}

        {isCreateOpen && (
          <CreateModal
            onClose={this.toggleCreate}
            onStatusChange={onStatusChange}
          />
        )}
        {isAccountsListOpen && (
          <AccountsListModal
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
        {/* {accounts && Object.keys(accounts).map((address) => (
            <Account
              address={address}
              key={address}
            />
          ))} */}
      </Wrapper>
    );
  }

  private getAccountMain = (): string | undefined => {
    const AccountMain = store.get('accountMain')
    console.log(AccountMain)
    const { accounts } = this.props;
    if (AccountMain) {
      return AccountMain
    } else if (accounts) {
      return accounts && Object.keys(accounts)[0]
    } else {
      return ''
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

  private changeMainAddress = (): void => {
    this.setState({
      AccountMain: this.getAccountMain() || ''
    })
  }
}

const Wrapper = styled.div`
    .titleRow {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-top: 20px;
      margin-bottom: 20px;
      font-weight: bold;
    }

    .titleRow::before {
      content: ' ';
      display: inline-block;
      background-color: #000;
      width: 6px;
      height: 22px;
      margin-right: 0.5rem;
    }

    .ringStakingBanner{
      width: 100%;
      margin-top: 20px;
    }
`

export default withMulti(
  Overview,
  translate,
  withObservable(accountObservable.subject, { propName: 'accounts' })
);
