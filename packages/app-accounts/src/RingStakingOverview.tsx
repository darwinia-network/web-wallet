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
import { withMulti, withObservable, withCalls } from '@polkadot/ui-api';
import { Button, CardGrid } from '@polkadot/ui-app';
import BN from 'bn.js';
import AccountStatus from './modals/AccountStatus';
import Account from './Account';
import AccountDarwinia from './AccountDarwinia';
import translate from './translate';
import { formatBalance, formatNumber } from '@polkadot/util';

import { SIDEBAR_MENU_THRESHOLD } from "@polkadot/apps/src/constants";
import RingStaking from './modals/RingStaking'
import ringStakingBtn from './img/stakingBtn.svg';
import RingStakingList from './RingStakingList';
const ringStakingBanner = require('./img/ringStakingBanner.png');

type Props = ComponentProps & I18nProps & {
  allAccounts?: SubjectInfo[],
  balances_locks: Array<{ amount: BN }>
};

type State = {
  isCreateOpen: boolean,
  isRingStakingOpen: boolean,
  isImportOpen: boolean,
  isAccountsListOpen: boolean,
  AccountMain: string
};

class Overview extends React.PureComponent<Props, State> {
  state: State = {
    isRingStakingOpen: false,
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
    const { allAccounts, onStatusChange, t, balances_locks = [] } = this.props;
    
    const { isRingStakingOpen, isCreateOpen, isImportOpen, isAccountsListOpen, AccountMain } = this.state;

    return (
      <Wrapper>
        {AccountMain && <AccountStatus onStatusChange={onStatusChange} changeAccountMain={() => { this.changeMainAddress() }} address={AccountMain} />}
        <div className='bannerBox'>
          <img className='ringStakingBanner' src={ringStakingBanner} alt="stake ring for precious kton" />
          <div className='stakingBtn' onClick={this.toggleRingStaking}><p>Staking now</p></div>
        </div>

        <div className={'titleRow'}>
          Deposit Ring
        </div>
        <RingStakingList account={AccountMain} />
        {isRingStakingOpen && <RingStaking senderId={AccountMain} onClose={this.toggleRingStaking}/>}
      </Wrapper>
    );
  }

  private getAccountMain = (): string | undefined => {
    const AccountMain = store.get('accountMain')
    const { allAccounts } = this.props;

    if (AccountMain && allAccounts && allAccounts[AccountMain]) {
      return AccountMain
    } else if (allAccounts) {
      return allAccounts && Object.keys(allAccounts)[0]
    } else {
      return ''
    }
  }

  private toggleRingStaking = (): void => {
    this.setState(({ isRingStakingOpen }) => ({
      isRingStakingOpen: !isRingStakingOpen
    }));
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
      font-size: 16px;
    }

    .titleRow::before {
      content: ' ';
      display: inline-block;
      width:3px;
      height:18px;
      background:linear-gradient(315deg,rgba(254,56,118,1) 0%,rgba(124,48,221,1) 71%,rgba(58,48,221,1) 100%);
      margin-right: 0.5rem;
    }

    .ringStakingBanner{
      width: 100%;
      margin-top: 20px;
    }

    .bannerBox{
      position: relative;
      .stakingBtn{
        background: url(${ringStakingBtn});
        width: 235px;
        height: 77px;
        position: absolute;
        top: 40%;
        right: 20px;
        cursor: pointer;
        p{
          text-align: center;
          font-size: 24px;
          color: #fff;
          line-height: 33px;
          line-height: 67px;
        }
      }
    }
`

export default withMulti(
  Overview,
  translate,
  // withObservable(accountObservable.subject, { propName: 'accounts' }),
);
