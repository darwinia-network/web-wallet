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
import noAccountImg from './img/noAccount.svg'
import { AccountId, Option } from '@polkadot/types';
import { api } from '@polkadot/ui-api'
import { Codec } from '@polkadot/types/types';

function toIdString(id?: AccountId | null): string | null {
  return id
    ? id.toString()
    : null;
}

type Props = ComponentProps & I18nProps & {
  accounts?: SubjectInfo[]
};

type State = {
  isCreateOpen: boolean,
  isImportOpen: boolean,
  isAccountsListOpen: boolean,
  AccountMain: string,
  controllerId?: string,
  stashId?: string,
};

class Overview extends React.PureComponent<Props, State> {
  state: State = {
    isCreateOpen: false,
    isImportOpen: false,
    isAccountsListOpen: false,
    AccountMain: '',
    controllerId: '',
    stashId: ''
  };
  apiUnsubscribe: any;

  constructor(props: Props) {
    super(props);

    this.apiUnsubscribe = []
  }
  
  componentDidMount() {
    setTimeout(() => {
      const AccountMain = this.getAccountMain() || '';

      this.setState({
        AccountMain
      })

      this.getAccountRelated(AccountMain, ({ stashId, controllerId }) => {
        console.log('getAccountRelated', { stashId, controllerId })

        this.setState({
          stashId,
          controllerId
        })
      })
    }, 0)
  }

  componentWillUnmount() {
    console.log('componentWillUnmount', this.apiUnsubscribe)
    this.unsubscribe()
  }

  unsubscribe = () => {
    this.apiUnsubscribe && this.apiUnsubscribe.map((unsubscribe) => {
      console.log('unsubscribe')
      unsubscribe && unsubscribe()
    })
  }

  filterUndefined(obj) {
    return Object.keys(obj).reduce((object,key) => {
      if(typeof obj[key] !== 'undefined') {object[key] = obj[key]}
      return object
    }, {})
  }

  getAccountRelated = async (AccountMain, callback) => {
    // stashId -> true -> (controllerId -> accountMain, stashId -> ledger.stashId)
    // stashId -> false -> (未绑定controllerId || 本身是 stashId)
    // this.unsubscribe();
    this.unsubscribe()
    let staking_ledger_t, staking_bonded_t = null;
    let isStashId = false
    staking_ledger_t = await api.query.staking.ledger((AccountMain), async (ledger: Option<Codec>) => {
      // console.log('api.query.staking.ledger', ledger)
      let stashId = null;

      const ledgerWrap = ledger && ledger.isSome && ledger.unwrapOr(null);
      // console.log('api.query.staking.ledger wrap', ledgerWrap)
      stashId = ledgerWrap && ledgerWrap.stash || null;

      if (ledger) {
        const ledgerWrap = ledger.unwrapOr(null);
        stashId = (ledgerWrap && ledgerWrap.stash) || null
      }

      // console.log('api.query.staking.ledger wrap1', ledger, stashId, toIdString(ledger ? stashId : undefined))

      if (stashId) {
        // controllerId = AccountMain;
        callback && callback({
          stashId: toIdString(ledger ? stashId : undefined),
          controllerId: toIdString(AccountMain)
        })
        isStashId = true
      } else {
        isStashId = false
      }
    })

    staking_bonded_t = await api.query.staking.bonded(AccountMain, (bonded: Option<Codec>) => {
      // console.log('api.query.staking.bonded', bonded)
      if (isStashId) {
        return;
      }

      let stashId = null, controllerId = null;
      const bondedWrap = bonded && bonded.isSome && bonded.unwrapOr(null);

      if (bondedWrap) {
        stashId = AccountMain;
        controllerId = bondedWrap;
      }

      callback && callback({
        stashId: toIdString(stashId),
        controllerId: toIdString(controllerId)
      })
    })

    this.apiUnsubscribe.push(staking_ledger_t, staking_bonded_t);
  }

  private _wrapperStatusChange = (e) => {
    const { accounts, onStatusChange, t } = this.props;
    onStatusChange(e);

    setTimeout(() => {
      const AccountMain = this.getAccountMain() || '';

      this.setState({
        AccountMain
      })
    }, 1000);
  }

  render() {
    const { accounts, onStatusChange, t } = this.props;
    const { isCreateOpen, isImportOpen, isAccountsListOpen, AccountMain ,stashId, controllerId} = this.state;

    return (
      <Wrapper>
        {AccountMain && <AccountStatus onStatusChange={this._wrapperStatusChange} changeAccountMain={() => { this.changeMainAddress() }} address={AccountMain} />}

        {AccountMain && <div className={'titleRow'}>
          {t('Darwinia asset')}
        </div>}

        {AccountMain && <AccountDarwinia
          address={AccountMain}
          key={AccountMain}
          stashId={stashId}
          controllerId={controllerId}
        />}

        {!AccountMain && <div className='noAccount'>
          <img src={noAccountImg} />
          <p className='h1'>No account</p>
          <p>Please add an account and open your Darwinia Network Surfing</p>

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

        </div>}

        {isCreateOpen && (
          <CreateModal
            onClose={this.toggleCreate}
            onStatusChange={this._wrapperStatusChange}
          />
        )}
        {isAccountsListOpen && (
          <AccountsListModal
            onClose={this.toggleCreate}
            onStatusChange={this._wrapperStatusChange}
          />
        )}
        {isImportOpen && (
          <ImportModal
            onClose={this.toggleImport}
            onStatusChange={this._wrapperStatusChange}
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
    const AccountMain = store.get('accountMain');
    const { accounts } = this.props;

    if (AccountMain && accounts && accounts[AccountMain]) {
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
    const AccountMain = this.getAccountMain() || ''

    this.getAccountRelated(AccountMain, ({ stashId, controllerId }) => {
      const _accountRelated = this.filterUndefined({ stashId, controllerId, AccountMain })
      console.log('getAccountRelated',_accountRelated, { stashId, controllerId })

      this.setState(_accountRelated)
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

    .noAccount{
      margin: 200px auto 0 auto;
      width: 630px;
      text-align: center;
      border: 1px solid #EDEDED;
      padding: 80px 100px;
      color: #302b3c;
      background: #fff;
      img{
        margin-bottom: 30px;
      }
      .h1{
        font-size: 20px;
        font-weight: bold;
      }
      p{
        font-size: 14px;
        margin-bottom: 40px;
      }
      button+button{
        margin-left: 30px;
      }
    }

    @media (max-width: 767px) {
      .noAccount{
        width: auto;
        padding: 40px 0px;
      }
    }
`

export default withMulti(
  Overview,
  translate,
  withObservable(accountObservable.subject, { propName: 'accounts' })
);
