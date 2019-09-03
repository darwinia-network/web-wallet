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
import { Button, CardGrid, ColorButton, TxButton } from '@polkadot/ui-app';
import BN from 'bn.js';
import translate from './translate';
import { formatBalance, formatKtonBalance, formatNumber, ringToKton } from '@polkadot/util';
import ringStakingBtn from './img/stakingBtn.svg';
import dayjs from 'dayjs'

type Props = ComponentProps & I18nProps & {
  accounts?: SubjectInfo[],
  balances_locks: Array<{ amount: BN }>,
  account: string,
  gringotts_depositLedger: { raw: { deposit_list: Array<any> } },
  onStakingNow: () => void,
  staking_ledger: any
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

  process(start, expire): number {
    const now = dayjs().unix();
    const end = dayjs(expire).unix();
    if (end <= now) {
      return 100
    } else {
      return 100 - (end - now) / (end - dayjs(start).unix()) * 100
    }
  }

  render() {
    const { accounts, onStatusChange, t, balances_locks = [], account, gringotts_depositLedger = { raw: { deposit_list: [] } }, onStakingNow, staking_ledger } = this.props;
    // if(!staking_ledger){
    //   return null;
    // }
    let ledger = staking_ledger && staking_ledger.unwrapOr(null)


    console.log('staking_ledger', staking_ledger, ledger)
    if (!ledger || !ledger.deposit_items || (ledger.deposit_items.length === 0)) {
      return (
        <Wrapper>
          <table className={'stakingTable stakingTableEmpty'}>
            <tbody>
              <tr className='stakingTh'><td>Expire Date</td><td>Deposit</td>
                <td>Reward</td>
                <td>Setting</td></tr>
              <tr>
                <td colSpan={4} className="emptyTd">
                  <p className="no-items">No items</p>
                  <ColorButton onClick={onStakingNow}>{t('Deposit Now')}</ColorButton>
                </td>
              </tr>
            </tbody>
          </table>
        </Wrapper>
      );
    }

    let regularList = ledger.deposit_items
    return (
      <Wrapper>
        <table className={'stakingTable'}>
          <tbody>
            <tr className='stakingTh'><td>Date</td><td>Deposit</td>
              <td>Reward</td>
              <td>Setting</td></tr>
            {regularList.map((item, index) => {
              console.log('item', item, item.expire_time)
              return <tr key={index}>
                <td>
                  <p className="stakingRange">{`${this.formatDate(item.start_time.raw)} - ${this.formatDate(item.expire_time.raw)}`}</p>
                  <div className="stakingProcess">
                    <div className="stakingProcessPassed" style={{ width: `${this.process(item.start_time.raw, item.expire_time.raw)}%` }}></div>
                  </div>
                </td>
                <td>{formatBalance(item.value)}</td>
                <td className="textGradient">{formatKtonBalance(ringToKton(item.value, ((dayjs(item.expire_time.raw).unix() - dayjs(item.start_time.raw).unix()) / (30 * 24 * 3600))))}</td>
                <td>
                  {dayjs(item.expire_time.raw).unix() < dayjs().unix() ? <TxButton
                    accountId={account}
                    className={'colorButton'}
                    isPrimary
                    label={t('Unbond')}
                    params={[{ "Ring": item.value.toString() }]}
                    tx='staking.unbond'
                  /> : <TxButton
                      accountId={account}
                      className={'colorButton'}
                      // isNegative
                      params={[
                        item.value.toString(),
                        item.expire_time.raw
                      ]}
                      label={
                        t('Redeem')
                      }
                      key='Redeem'
                      tx='staking.unbondWithPunish'
                    />}
                  {/* <ColorButton onClick={onStakingNow}>{t('Redeem')}</ColorButton> */}
                </td>
              </tr>
            })}
          </tbody>
        </table>
      </Wrapper>
    );
  }

  //   return (
  //     <Wrapper>
  //       <table className={'stakingTable'}>
  //         <tbody>
  //           <tr className='stakingTh'><td>Date</td><td>Deposit</td><td>Reward</td><td>Setting</td></tr>
  //           {regularList.map((item, index) => {
  //             item.start_at = '1565758536'
  //             return <tr key={index}>
  //               <td>
  //                 <p className="stakingRange">{`${this.formatDate(new BN(item.start_at).toNumber() * 1000)} - ${this.formatDate(dayjs(new BN(item.start_at).toNumber() * 1000).add(new BN(item.month).toNumber() * 30, 'day').valueOf())}`}</p>
  //                 <div className="stakingProcess">
  //                   <div className="stakingProcessPassed" style={{ width: `${this.process(new BN(item.start_at).toNumber() * 1000, new BN(item.month).toNumber())}%` }}></div>
  //                 </div>
  //               </td>
  //               <td>{formatBalance(item.value)}</td>
  //               <td className="textGradient">{formatKtonBalance(0)}</td>
  //               <td>----</td>
  //             </tr>
  //           })}
  //         </tbody>
  //       </table>
  //     </Wrapper>
  //   );
}

const Wrapper = styled.div`
    padding-bottom: 30px;
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
      
    }

    .stakingTableEmpty{
      .no-items{
        padding: 15px;
        text-align: center;
        color: #B4B6BC;
        margin-bottom: 0;
      }
      .emptyTd{
        padding: 100px 0!important;
        background: #fff!important;
      }
    }

    /* .textGradient{
      background: linear-gradient(to right, red, blue);
        -webkit-background-clip: text;
        color: transparent;
    } */
`

export default withMulti(
  Overview,
  translate,
  withCalls<Props>(
    ['query.balances.locks', { paramName: 'account' }],
    ['query.staking.ledger', { paramName: 'account' }],
  ),
  // withObservable(accountObservable.subject, { propName: 'accounts' })
);
