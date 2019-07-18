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

  formatDate(date) {
    if (date) {
      return dayjs(date).format("YYYY-MM-DD")
    }
  }

  process(start, month): number {
    const now = dayjs().unix();
    const end = dayjs(start).add(month * 30, 'day').unix();
    if (end <= now) {
      return 100
    } else {
      return 100 - (end - now) / (3600 * 24 * 30 * month) * 100
    }
  }

  render() {
    const { accounts, onStatusChange, t, balances_locks = [], account, kton_depositLedger = { raw: { deposit_list: [] } } } = this.props;

    // if ((kton_depositLedger.raw.deposit_list.length === 0)) {
    //   return (
    //     <Wrapper>
    //       <table className={'stakingTable'}>
    //         <tbody>
    //           <tr className='stakingTh'><td>Date</td><td>Deposit</td><td>Reward</td><td>Setting</td></tr>
    //           <tr>
    //             <td colSpan={4}>
    //               <p className="no-items">No items</p>
    //             </td>
    //           </tr>
    //         </tbody>
    //       </table>
    //     </Wrapper>
    //   );
    // }

    return (
      <Wrapper>
        <table className={'stakingTable'}>
          <tbody>
            <tr className='stakingTh'><td>Date</td><td>Deposit</td><td>Reward</td><td>Setting</td></tr>
            {kton_depositLedger && kton_depositLedger.raw.deposit_list && kton_depositLedger.raw.deposit_list.map((item, index) => {
              return <tr key={index}>
                <td>
                  <p className="stakingRange">{`${this.formatDate(new BN(item.start_at).toNumber() * 1000)} - ${this.formatDate(dayjs(new BN(item.start_at).toNumber() * 1000).add(new BN(item.month).toNumber() * 30, 'day').valueOf())}`}</p>
                  <div className="stakingProcess">
                    <div className="stakingProcessPassed" style={{ width: `${this.process(new BN(item.start_at).toNumber() * 1000, new BN(item.month).toNumber())}%` }}></div>
                  </div>
                </td>
                <td>{formatBalance(item.value)}</td>
                <td>{formatBalance(item.balance)}</td>
                <td>----</td>
              </tr>
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
      border-radius:2px;
      border:1px solid rgba(237,237,237,1);
      td{
        width: 25%;
        font-weight: bold;
      }
      .stakingProcess{
        height:3px;
        background:rgba(216,216,216,1);
        border-radius:4px;
        margin: 0 12%;
      }
      .stakingRange{
        margin-bottom: 6px;
      }
      .stakingProcessPassed{
        height:3px;
        background:linear-gradient(315deg,rgba(254,56,118,1) 0%,rgba(124,48,221,1) 71%,rgba(58,48,221,1) 100%);
        border-radius:4px;
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
      .no-items{
        padding: 15px;
        text-align: center;

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
