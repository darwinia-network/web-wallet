// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DerivedBalances, DerivedStaking } from '@polkadot/api-derive/types';
import { BareProps, I18nProps } from './types';

import BN from 'bn.js';
import React from 'react';
import styled from 'styled-components';
import { formatBalance, formatNumber } from '@polkadot/util';
import { Icon, Tooltip, TxButton, Button } from '@polkadot/ui-app';
import { withCalls, withMulti } from '@polkadot/ui-api';
// import {DerivedRingBalances} from '../../app-darwina/types'
import translate from './translate';
import CryptoType from './CryptoType';
import Label from './Label';
import Ring from './styles/icon/ring.svg'
import Kton from './styles/icon/kton.svg'
import { withRouter } from "react-router";

import { StructAny } from '@polkadot/types';
import { noop } from 'rxjs';
export interface DerivedRingBalances extends StructAny {
  freeBalance: BN;
  transferFee: BN;
}

export interface DerivedKtonBalances extends StructAny {
  freeBalance: BN;
  transferFee: BN;
}

// true to display, or (for bonded) provided values [own, ...all extras]
export type BalanceActiveType = {
  available?: boolean,
  bonded?: boolean | Array<BN>,
  free?: boolean,
  redeemable?: boolean,
  unlocking?: boolean
};

export type CryptoActiveType = {
  crypto?: boolean,
  nonce?: boolean
};

type Props = BareProps & I18nProps & {
  balances_all?: DerivedBalances,
  ringBalances_freeBalance?: DerivedRingBalances,
  ktonBalances_freeBalance?: DerivedKtonBalances,
  
  ringBalances_totalLock?: BN,
  ktonBalances_totalLock?: BN,
  children?: React.ReactNode,
  staking_info?: DerivedStaking,
  value: string,
  withBalance?: boolean | BalanceActiveType,
  withExtended?: boolean | CryptoActiveType,
  transferCb?: (type: string) => void,
  history: any
};

// <AddressInfo
//   withBalance // default
//   withExtended={true} // optional
//   value={address}
// >{children></AddressInfo>
//
// Additionally to tweak the display, i.e. only available
//
// <AddressInfo withBalance={{ available: true }} />
class AddressInfoDarwinia extends React.PureComponent<Props> {
  render() {
    const { balances_all, ringBalances_freeBalance, ktonBalances_freeBalance, ringBalances_totalLock, ktonBalances_totalLock, staking_info, t, withBalance = true, children, className, transferCb, history } = this.props;

    return (
      <div className={className}>
        <div>
          <div className="allvalueBox">
            <div>
              <img className="logo" src={Ring} />
            </div>
            <div>
              <h1>RING</h1>
              <p className='ui--value'>{ringBalances_freeBalance && ringBalances_freeBalance.toString()}</p>
            </div>
          </div>
          <div className="info-bottom">
            <div className="ui--value-box">
              <p>availible:</p>
              <p>{ringBalances_freeBalance && ringBalances_freeBalance.toString()}</p>
              <p><Button
                isBasic={true}
                isSecondary={true}
                label={t('Transfer')}
                onClick={() => { (transferCb && transferCb('ring')) }}
              /></p>
            </div>
            <div className="ui--value-box">
              <p>bonded:</p>
              <p>{ringBalances_totalLock && ringBalances_totalLock.toString()}</p>
              <p><Button
                isBasic={true}
                isSecondary={true}
                label={t('Setting')}
                onClick={() => {
                  history.push('ringstaking');
                }}
              /></p>
            </div>
          </div>
        </div>

        <div>
          <div className="allvalueBox">
            <div>
              <img className="logo" src={Kton} />
            </div>
            <div>
              <h1>KTON</h1>
              <p className='ui--value'>{ktonBalances_freeBalance && ktonBalances_freeBalance.toString()}</p>
            </div>
          </div>
          <div className="info-bottom">
            <div className="ui--value-box">
              <p>availible:</p>
              <p>{ktonBalances_freeBalance && ktonBalances_freeBalance.toString()}</p>
              <p><Button
                isBasic={true}
                isSecondary={true}
                label={t('Transfer')}
                onClick={() => { (transferCb && transferCb('kton')) }}
              /></p>
            </div>
            <div className="ui--value-box">
              <p>bonded:</p>
              <p>{ktonBalances_totalLock && ktonBalances_totalLock.toString()}</p>
              <p><Button
                isBasic={true}
                isSecondary={true}
                label={t('Setting')}
                onClick={() => {
                  history.push('staking');
                }}
              /></p>
            </div>
          </div>
        </div>
      </div>

    )
  }

  private renderBalances() {
    const { balances_all, ringBalances_freeBalance, staking_info, t, withBalance = true } = this.props;
    // console.log('balance', balances_all)
    console.log('2222222', ringBalances_freeBalance && ringBalances_freeBalance.toString())
    const balanceDisplay = withBalance === true
      ? { available: true, bonded: true, free: true, redeemable: true, unlocking: true }
      : withBalance
        ? withBalance
        : undefined;

    if (!balanceDisplay || !balances_all) {
      return null;
    }

    return (
      <div className='column'>
        {balanceDisplay.free && (
          <>
            <Label label={t('total')} />
            <div className='result'>{formatBalance(balances_all.freeBalance)}</div>
          </>
        )}
        {balanceDisplay.available && (
          <>
            <Label label={t('available')} />
            <div className='result'>{formatBalance(balances_all.availableBalance)}</div>
          </>
        )}
        {balanceDisplay.bonded && this.renderBonded(balanceDisplay.bonded)}
        {balanceDisplay.redeemable && staking_info && staking_info.redeemable && staking_info.redeemable.gtn(0) && (
          <>
            <Label label={t('redeemable')} />
            <div className='result'>
              {formatBalance(staking_info.redeemable)}
              {this.renderRedeemButton()}
            </div>
          </>
        )}
        {balanceDisplay.unlocking && staking_info && staking_info.unlocking && (
          <>
            <Label label={t('unbonding')} />
            <div className='result'>
              {this.renderUnlocking()}
            </div>
          </>
        )}
      </div>
    );
  }

  // either true (filtered above already) or [own, ...all extras]
  private renderBonded(bonded: true | Array<BN>) {
    const { staking_info, t } = this.props;
    let value = undefined;

    if (Array.isArray(bonded)) {
      // Get the sum of all extra values (if available)
      const extras = bonded.filter((value, index) => index !== 0);
      const extra = extras.reduce((total, value) => total.add(value), new BN(0)).gtn(0)
        ? `(+${extras.map((bonded) => formatBalance(bonded)).join(', ')})`
        : '';

      value = `${formatBalance(bonded[0])} ${extra}`;
    } else if (staking_info && staking_info.stakingLedger && staking_info.accountId.eq(staking_info.stashId)) {
      value = formatBalance(staking_info.stakingLedger.active);
    }

    return value
      ? (
        <>
          <Label label={t('bonded')} />
          <div className='result'>{value}</div>
        </>
      )
      : undefined;
  }

  private renderExtended() {
    const { balances_all, t, value, withExtended } = this.props;
    const extendedDisplay = withExtended === true
      ? { crypto: true, nonce: true }
      : withExtended
        ? withExtended
        : undefined;

    if (!extendedDisplay || !balances_all) {
      return null;
    }

    return (
      <div className='column'>
        {extendedDisplay.nonce && (
          <>
            <Label label={t('transactions')} />
            <div className='result'>{formatNumber(balances_all.accountNonce)}</div>
          </>
        )}
        {extendedDisplay.crypto && (
          <>
            <Label label={t('crypto type')} />
            <CryptoType
              accountId={value}
              className='result'
            />
          </>
        )}
      </div>
    );
  }

  private renderRedeemButton() {
    const { staking_info, t } = this.props;

    return (staking_info && staking_info.controllerId && (
      <TxButton
        accountId={staking_info.controllerId.toString()}
        className='iconButton'
        icon='lock'
        size='small'
        isPrimary
        key='unlock'
        params={[]}
        tooltip={t('Redeem these funds')}
        tx='staking.withdrawUnbonded'
      />
    ));
  }

  private renderUnlocking() {
    const { staking_info, t } = this.props;

    return (
      staking_info &&
      staking_info.unlocking &&
      staking_info.unlocking.map(({ remainingBlocks, value }, index) => (
        <div key={index}>
          {formatBalance(value)}
          <Icon
            name='info circle'
            data-tip
            data-for={`unlocking-trigger-${index}`}
          />
          <Tooltip
            text={t('{{remainingBlocks}} blocks left', { replace: { remainingBlocks } })}
            trigger={`unlocking-trigger-${index}`}
          />
        </div>
      ))
    );
  }
}

export default withMulti(
  // @ts-ignore
  styled(withRouter(AddressInfoDarwinia))`

    align-items: flex-start;
    display: flex;
    flex: 1;
    justify-content: center;
    &>div{
      flex: 1;
      border: 1px solid #EDEDED;
      background: #fff;
    }
    &>div+div{
      margin-left: 20px;
    }

    .ui--value{
      font-weight: bold;
    }
    .ui--value-box+.ui--value-box{
      margin-top: 20px;
    }
    .ui--value-box {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      p{
        margin-bottom: 0;
        color: #98959F;
      }
      button{
        width: 110px;
        padding: 8px 0px;
        font-weight: bold!important;
      }
    }

    .logo{
      width: 60px;
      height: 60px;
      margin-right: 20px;
    }
    .allvalueBox {
      display: flex;
      flex-direction: row;
      align-items: center;
      background: #fbfbfb;
      padding: 31px 41px;
      border-bottom: 1px solid #EDEDED;

      h1{
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 0px;
        text-transform: uppercase;
      }
      p{
        color: #5930DD;
        font-size: 18px;
      }
    }

    .info-bottom{
      padding: 23px 40px;
    }

    .column {
      flex: 1;
      display: grid;
      opacity: 1;

      label {
        grid-column:  1;
        padding-right: 0.5rem;
        text-align: right;

        .help.circle.icon {
          display: none;
        }
      }

      .result {
        grid-column:  2;

        .iconButton {
          padding-left: 0!important;
        }

        i.info.circle.icon {
          margin-left: .3em;
        }
      }
    }
  `,
  translate,
  withCalls<Props>(
    ['derive.balances.all', { paramName: 'value' }],
    ['query.ringBalances.freeBalance', { paramName: 'value' }],
    ['query.ringBalances.totalLock', { paramName: 'value' }],
    ['query.ktonBalances.totalLock', { paramName: 'value' }],
    ['query.ktonBalances.freeBalance', { paramName: 'value' }],
    ['derive.staking.info', { paramName: 'value' }]
  )
);
