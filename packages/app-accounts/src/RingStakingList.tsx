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
import translate from './translate';
import { formatBalance, formatNumber } from '@polkadot/util';
import ringStakingBtn from './img/stakingBtn.svg';
import dayjs from 'dayjs'

type Props = ComponentProps & I18nProps & {
  accounts?: SubjectInfo[],
  balances_locks: Array<{ amount: BN }>,
  account: string,
  kton_depositLedger: { raw: { deposit_list: Array<any> } }
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
    AccountMain: '',

  };

  componentDidMount() {
  }

  formatDate(date){
    if(date){
      return dayjs(date).format("YYYY-MM-DD")
    }
  }

  render() {
    const { accounts, onStatusChange, t, balances_locks = [], account, kton_depositLedger = { raw: { deposit_list: [] } }} = this.props;
    console.log('locks', balances_locks, account, kton_depositLedger)
    return (
      <Wrapper>
        <table className={'stakingTable'}>
          <tbody>
            <tr className='stakingTh'><td>Date</td><td>Deposit</td><td>Reward</td><td>Setting</td></tr>
            {kton_depositLedger && kton_depositLedger.raw.deposit_list && kton_depositLedger.raw.deposit_list.map((item, index) => {
              return <tr key={index}><td>{`${this.formatDate(item.start_at)} - ${this.formatDate(dayjs(item.start_at).add(dayjs(item.month).unix(), 'month').valueOf())}`}</td><td>{formatBalance(item.value)}</td><td>----</td><td>----</td></tr>
            })}
          </tbody>
        </table>
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
    .stakingTable{
      border-collapse: collapse;
      background: #fff;
      width: 100%;
      td{
        width: 25%;
        font-weight: bold;
      }
      .stakingTh{
        td{
          font-size: 16px;
        }
      }
      tr{
        td{
          text-align: center;
          padding: 24px 10px;
        }
      }
      tr:nth-child(even) {
        td{
          background: #FBFBFB;
        }
      }
    }
`

export default withMulti(
  Overview,
  translate,
  withCalls<Props>(
    ['query.balances.locks', { paramName: 'account' }],
    ['query.kton.depositLedger', { paramName: 'account' }],
  ),
  // withObservable(accountObservable.subject, { propName: 'accounts' })
);
