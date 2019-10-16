// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import { ComponentProps } from './types';
import styled from 'styled-components';

import React from 'react';
import { withMulti, withObservable, withCalls } from '@polkadot/ui-api';
import { TxButton } from '@polkadot/ui-app';
import { StructAny, Option, Struct, Compact, StakingLedgers } from '@polkadot/types';
import BN from 'bn.js';
import translate from './translate';
import { formatBalance, formatKtonBalance, formatNumber, ringToKton } from '@polkadot/util';
import dayjs from 'dayjs'

type Props = ComponentProps & I18nProps & {
  accounts?: SubjectInfo[],
  balances_locks: Array<{ amount: BN }>,
  account: string,
  onStakingNow: () => void,
  staking_ledger: StakingLedgers
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
    const { account, staking_ledger, t } = this.props;
    let ledger = staking_ledger

    if (!ledger || !ledger.deposit_items || (ledger.deposit_items.length === 0)) {
      return (
        <Wrapper>
          <table className={'stakingTable stakingTableEmpty'}>
            <tbody>
              <tr className='stakingTh'>
                <td>{t('Date')}</td>
                <td>{t('Lock')}</td>
                <td>{t('Reward')}</td>
                <td>{t('Setting')}</td>
              </tr>
              <tr>
                <td colSpan={4} className="emptyTd">
                  <p className="no-items">{t('No items')}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </Wrapper>
      );
    }

    let regularList = ledger.deposit_items;
    return (
      <Wrapper>
        <table className={'stakingTable'}>
          <tbody>
            <tr className='stakingTh'>
              <td>{t('Date')}</td>
              <td>{t('Lock')}</td>
              <td>{t('Reward')}</td>
              <td>{t('Setting')}</td>
            </tr>
            {regularList.map((item, index) => {
              return <tr key={index}>
                <td>
                  <p className="stakingRange">{`${this.formatDate(item.start_time)} - ${this.formatDate(item.expire_time)}`}</p>
                  <div className="stakingProcess">
                    <div className="stakingProcessPassed" style={{ width: `${this.process(item.start_time, item.expire_time)}%` }}></div>
                  </div>
                </td>
                <td>{formatBalance(item.value)}</td>
                <td className="textGradient">{formatKtonBalance(ringToKton(item.value, ((dayjs(item.expire_time).unix() - dayjs(item.start_time).unix()) / (30 * 24 * 3600))))}</td>
                <td>
                  {dayjs(item.expire_time).unix() < dayjs().unix() ? <TxButton
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
                        item.expire_time
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
    @media (max-width: 767px) {
      .stakingTable{
        tr{
          td{
            text-align: center;
            padding: 15px 2px;
          }
        }

        .stakingRange{
          font-size: 12px;
        }
      }
    }
`

export default withMulti(
  Overview,
  translate,
  withCalls<Props>(
    ['query.balances.locks', { paramName: 'account' }],
    ['query.staking.ledger', {
      paramName: 'account', transform: (value: Option<StakingLedgers>) =>
        value.unwrapOr(null)
    }],
  ),
);
