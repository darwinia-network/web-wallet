// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DerivedBalancesMap } from '@polkadot/api-derive/types';
import { AppProps, I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-api/types';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import { ComponentProps, RecentlyOffline, RecentlyOfflineMap } from './types';
import store from 'store'
import React from 'react';
import { Route, Switch } from 'react-router';
import { AccountId, Option, VectorAny, Bytes } from '@polkadot/types';
import { HelpOverlay } from '@polkadot/ui-app';
import Tabs, { TabItem } from '@polkadot/ui-app/Tabs';
import { withCalls, withMulti, withObservable } from '@polkadot/ui-api';
import accountObservable from '@polkadot/ui-keyring/observable/accounts';
import AccountStatus from '@polkadot/app-accounts/modals/AccountStatus';

import './index.css';

import Accounts from './AccountsNode';
import translate from './translate';
import { api } from '@polkadot/ui-api'
import { Codec } from '@polkadot/types/types';

function toIdString(id?: AccountId | null | undefined): string | null | undefined {
  if (typeof id === 'undefined') return undefined
  return id
    ? id.toString()
    : null;
}

type Props = AppProps & ApiProps & I18nProps & {
  allAccounts?: SubjectInfo,
  balances?: DerivedBalancesMap,
  session_validators?: Array<AccountId>,
  staking_controllers?: [Array<AccountId>, Array<Option<AccountId>>],
  staking_recentlyOffline?: RecentlyOffline,
  onStatusChange?: () => void
};

type State = {
  controllers: Array<string>,
  recentlyOffline: RecentlyOfflineMap,
  stashes: Array<string>,
  tabs: Array<TabItem>,
  validators: Array<string>,
  AccountMain: string,
  stashId?: string,
  controllerId?: string,
  sessionKey?: string,
  ledger?: any,
  nodeName?: Bytes
};

class App extends React.PureComponent<Props, State> {
  state: State;
  apiUnsubscribe: any;
  staking_multi_t: any;
  staking_ledger_t: any;
  staking_bonded_t: any;

  constructor(props: Props) {
    super(props);

    const { t } = props;

    this.state = {
      controllers: [],
      recentlyOffline: {},
      stashes: [],
      tabs: [
        {
          isRoot: true,
          name: 'overview',
          text: t('Staking overview')
        },
        {
          name: 'actions',
          text: t('Account actions')
        }
      ],
      validators: [],
      AccountMain: '',
      controllerId: '',
      stashId: '',
      ledger: null
    };

    this.apiUnsubscribe = [];
  }


  static getDerivedStateFromProps({ staking_controllers = [[], []], session_validators = [], staking_recentlyOffline = [] }: Props): State {

    return {
      controllers: staking_controllers[1].filter((optId) => optId && optId.isSome).map((accountId) =>
        accountId.unwrap().toString()
      ),
      stashes: staking_controllers[0].map((accountId) => accountId.toString()),
      validators: session_validators.map((authorityId) =>
        authorityId.toString()
      ),
      recentlyOffline: staking_recentlyOffline.reduce(
        (result, [accountId, blockNumber, count]) => {
          const account = accountId.toString();

          if (!result[account]) {
            result[account] = [];
          }

          result[account].push({
            blockNumber,
            count
          });

          return result;
        }, {} as RecentlyOfflineMap)
    } as State;
  }

  componentDidMount() {
    setTimeout(() => {
      const AccountMain = this.getAccountMain() || '';
      this.setState({
        AccountMain
      })

      this.getAccountRelated(AccountMain, ({ stashId, controllerId }) => {
        const _accountRelated = this.filterUndefined({ stashId, controllerId, AccountMain })
        this.setState(_accountRelated)

        this.getStakingInfo(stashId, controllerId, ({ ledger, sessionKey, nodeName }) => {
          const _stakingInfo = this.filterUndefined({ ledger, sessionKey, nodeName })
          this.setState(_stakingInfo)
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
    return Object.keys(obj).reduce((object, key) => {
      if (typeof obj[key] !== 'undefined') { object[key] = obj[key] }
      return object
    }, {})
  }

  getStakingInfo = async (stashId, controllerId, callback) => {
    if (!controllerId || !stashId) {
      callback && callback({
        sessionKey: null,
        ledger: null,
        nodeName: new Bytes()
      })
      return;
    }
    console.log('getStakingInfo params', controllerId, stashId)

    this.staking_multi_t && this.staking_multi_t();
    this.staking_multi_t = await api.queryMulti([
      [api.query.session.nextKeyFor, controllerId],
      // [api.query.staking.validators, stashId],
      [api.query.staking.ledger, controllerId],
      [api.query.staking.nodeName, controllerId]
    ], (result) => {
      const [nextKeyFor, ledger, _nodeName] = (result as VectorAny<Option<any>>)
      const ledgerWrap = ledger && ledger.isSome && ledger.unwrapOr(null);
      const sessionKeyWrap = (nextKeyFor && nextKeyFor.isSome) ? nextKeyFor.unwrap() : {grandpaKey: null};

      const nodeName = _nodeName
      console.log('getStakingInfo', result,nextKeyFor, sessionKeyWrap, ledgerWrap, nodeName)

      callback && callback({
        sessionKey: nextKeyFor ? toIdString(sessionKeyWrap.grandpaKey) : undefined,
        ledger: ledgerWrap || undefined,
        nodeName
      })

      // stashId = ledgerWrap ? ledgerWrap.stash : "";
      // validatorPrefs = filterValidatorPrefs(staking_validators, stashId);
      // console.log('ledger', nextKeyFor, toIdString(nextKeyFor.unwrapOr(null)), staking_validators, validatorPrefs, ledger, toIdString(stashId))
      // console.log('nodeName', nodeName)
      // console.log('controllerId 2', toIdString(controllerId))
      // staking_ledger = ledger
      // nextSessionId = nextKeyFor
      // staking_nodeName = nodeName
      // resolve(1)
      // staking_validators = stakingValidators
    })

    // this.apiUnsubscribe.push(staking_multi_t);
  }

  getAccountRelated = async (AccountMain, callback) => {
    // stashId -> true -> (controllerId -> accountMain, stashId -> ledger.stashId)
    // stashId -> false -> (未绑定controllerId || 本身是 stashId)
    // this.unsubscribe();
    this.unsubscribe()
    let staking_ledger_t, staking_bonded_t = null;
    let isStashId = false
    staking_ledger_t = await api.query.staking.ledger((AccountMain), async (ledger: Option<Codec>) => {
      console.log('api.query.staking.ledger', ledger)
      let stashId = null;

      const ledgerWrap = ledger && ledger.isSome && ledger.unwrapOr(null);
      console.log('api.query.staking.ledger wrap', ledgerWrap)
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
      console.log('api.query.staking.bonded', bonded)
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

  render() {
    const { allAccounts, basePath, onStatusChange } = this.props;
    const { controllers, recentlyOffline, stashes, validators, AccountMain, stashId, controllerId, ledger, sessionKey, nodeName } = this.state;
    const hidden = !allAccounts || Object.keys(allAccounts).length === 0
      ? ['actions']
      : [];
    const { balances = {} } = this.props;
    // console.log('inject props', stashId, controllerId, sessionKey, ledger, nodeName)
    // @ts-ignore
    return (
      <>
        {AccountMain && <AccountStatus onStatusChange={onStatusChange} changeAccountMain={() => { this.changeMainAddress() }} address={AccountMain} />}
        <Accounts
          balances={balances}
          controllers={controllers}
          recentlyOffline={recentlyOffline}
          stashes={stashes}
          validators={validators}
          // @ts-ignore
          accountMain={AccountMain}
          onStatusChange={onStatusChange}
          stashId={stashId}
          controllerId={controllerId}
          ledger={ledger}
          sessionKey={sessionKey}
          nodeName={nodeName}
        />
      </>
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

  private changeMainAddress = (): void => {
    const AccountMain = this.getAccountMain() || ''

    this.getAccountRelated(AccountMain, ({ stashId, controllerId }) => {
      const _accountRelated = this.filterUndefined({ stashId, controllerId, AccountMain })
      console.log('_accountRelated', _accountRelated, stashId, controllerId, AccountMain)
      this.setState(_accountRelated)

      this.getStakingInfo(stashId, controllerId, ({ ledger, sessionKey, nodeName }) => {
        const _stakingInfo = this.filterUndefined({ ledger, sessionKey, nodeName })
        console.log('_stakingInfo', _stakingInfo)
        this.setState(_stakingInfo)
      })
    })
  }
}

export default withMulti(
  App,
  translate,
  withCalls<Props>(
    'derive.staking.controllers',
    'query.session.validators',
    'query.staking.recentlyOffline'
  ),
  withObservable(accountObservable.subject, { propName: 'allAccounts' })
);
