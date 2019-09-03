// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import { AccountId, Exposure, StakingLedger, ValidatorPrefs, VectorAny, Option, Compact } from '@polkadot/types';
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
const ringStakingBanner = require('./img/ringStakingBanner.jpg');

import Bond from '@polkadot/app-staking/Account/Bond';
import BondExtra from '@polkadot/app-staking/Account/BondExtra';

import { api } from '@polkadot/ui-api'

function toIdString(id?: AccountId | null): string | null {
  return id
    ? id.toString()
    : null;
}

type Props = ComponentProps & I18nProps & {
  allAccounts?: SubjectInfo[],
  balances_locks: Array<{ amount: BN }>
};

type State = {
  isCreateOpen: boolean,
  isRingStakingOpen: boolean,
  isImportOpen: boolean,
  isAccountsListOpen: boolean,
  AccountMain: string,
  controllerId: string,
  stashId: string,
  isBondOpen: boolean,
  isBondExtraOpen: boolean,
};

class Overview extends React.PureComponent<Props, State> {
  state: State = {
    isRingStakingOpen: false,
    isCreateOpen: false,
    isImportOpen: false,
    isAccountsListOpen: false,
    AccountMain: '',
    controllerId: '',
    stashId: '',
    isBondOpen: false,
    isBondExtraOpen: false,
  };

  componentDidMount() {
    const AccountMain = this.getAccountMain() || '';
    this.setState({
      AccountMain
    })
    this.getControllerId(AccountMain)
  }

  componentWillReceiveProps(nextProps){
    const AccountMain = this.getAccountMain() || '';
    this.setState({
      AccountMain
    })
    this.getControllerId(AccountMain)
    console.log('AccountMain', AccountMain)
  }

  getControllerId = (accountId) => {
    if (!accountId) {
      return;
    }
    let stashId = null;
    let controllerId = null;
    api.queryMulti([
      [api.query.staking.bonded, accountId], // try to map to controller
      [api.query.staking.ledger, accountId]
    ], (re) => {
      const [account, ledger] = (re as VectorAny<Option<any>>)
      const ledgerWrap = ledger.isSome && ledger.unwrap() || null
      console.log('ledger', account, ledger)
      stashId = ledgerWrap ? ledgerWrap.stash : "";
      if (stashId) {
        controllerId = accountId
      } else {
        // @ts-ignore
        controllerId = (account && account.isNone) ? "" : toIdString(account);
      }
      console.log('getControllerId', accountId, controllerId)
      this.setState({
        controllerId,
        stashId
      })
    })
  }

  render() {
    const { allAccounts, onStatusChange, t, balances_locks = [] } = this.props;

    const { isRingStakingOpen, isCreateOpen, isImportOpen, isAccountsListOpen, AccountMain, stashId, controllerId } = this.state;
    console.log('box-ring')
    return (
      <Wrapper>
        {AccountMain && <AccountStatus onStatusChange={onStatusChange} changeAccountMain={() => { this.changeMainAddress() }} address={AccountMain} />}
        <div className='bannerBox'>
          <img className='ringStakingBanner' src={ringStakingBanner} alt="stake ring for precious kton" />
          <div className='stakingBtn' onClick={() => {
            if(controllerId) {
              this.toggleBondExtra()
            } else {
              this.toggleBond()
            }
            }}><p>Deposit now</p></div>
        </div>

        <div className={'titleRow'}>
          Deposit Ring
        </div>

        <RingStakingList account={controllerId} onStakingNow={() => {
            if(controllerId) {
              this.toggleBondExtra()
            } else {
              this.toggleBond()
            }
            }} />
        {isRingStakingOpen && <RingStaking senderId={AccountMain} onClose={this.toggleRingStaking} />}
        {this.renderBond()}
        {this.renderBondExtra()}
      </Wrapper>
    );
  }

  private renderBond() {
    const { stashId, AccountMain } = this.state;
    const { controllerId, isBondOpen } = this.state;

    return (
      <>
        <Bond
          accountId={stashId || AccountMain}
          controllerId={controllerId}
          isOpen={isBondOpen}
          onClose={this.toggleBond}
          disableController={true}
          easyMode={true}
        />
      </>
    );
  }

  private renderBondExtra() {
    const { controllerId, isBondExtraOpen, stashId, AccountMain } = this.state;
    console.log('renderBondExtra', controllerId, isBondExtraOpen, stashId, AccountMain)
    return (
      <BondExtra
        // @ts-ignore
        accountId={toIdString(stashId) || AccountMain}
        controllerId={controllerId}
        isOpen={isBondExtraOpen}
        onClose={this.toggleBondExtra}
      />
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
  private toggleBond = () => {
    this.setState(({ isBondOpen }) => ({
      isBondOpen: !isBondOpen
    }));
  }

  private toggleBondExtra = () => {
    this.setState(({ isBondExtraOpen }) => ({
      isBondExtraOpen: !isBondExtraOpen
    }));
  }

}

const Wrapper = styled.div`
    .titleRow {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 16px;
      text-transform: uppercase;
    }

    .titleRow::before {
      content: ' ';
      display: inline-block;
      width:3px;
      height:18px;
      background:linear-gradient(315deg,rgba(254,56,118,1) 0%,rgba(124,48,221,1) 71%,rgba(58,48,221,1) 100%);
      margin-right: 0.5rem;
      margin-top: -1px;
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
