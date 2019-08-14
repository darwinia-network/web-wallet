// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DerivedBalances, DerivedStaking } from '@polkadot/api-derive/types';
import { BareProps, I18nProps } from './types';

import BN from 'bn.js';
import React from 'react';
import styled from 'styled-components';
import { formatBalance, formatNumber, formatKtonBalance } from '@polkadot/util';
import { Icon, Tooltip, TxButton, Button } from '@polkadot/ui-app';
import { withCalls, withMulti } from '@polkadot/ui-api';
// import {DerivedRingBalances} from '../../app-darwina/types'
import translate from './translate';
import CryptoType from './CryptoType';
import Label from './Label';
import Ring from './styles/icon/ring.svg'
import Kton from './styles/icon/kton.svg'
import { withRouter } from "react-router";

import { StructAny, Vector, getTypeDef } from '@polkadot/types';
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
  balances_freeBalance?: BN,
  kton_freeBalance?: BN,
  balances_locks?: Vector<any>,

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
    const { balances_all, kton_freeBalance, staking_info, t, withBalance = true, children, className, transferCb, history } = this.props;

    const balanceDisplay = withBalance === true
      ? { available: true, bonded: true, free: true, redeemable: true, unlocking: true }
      : withBalance
        ? withBalance
        : undefined;

        if (!balanceDisplay || !balances_all) {
          return null;
        }

    const ringBalance = this.renderQueryRingBalances()
  
    return (
      <div className={className}>
        <div>
          <div className="allvalueBox">
            <div>
              <img className="logo" src={Ring} />
            </div>
            <div>
              <h1>RING</h1>
              {/* <p className='ui--value'>{formatBalance(ringBalances_freeBalance)}</p> */}
              <p className='ui--value'>{formatBalance(balances_all.freeBalance)}</p>
            </div>
          </div>
          <div className="info-bottom">
            <div className="ui--value-box">
              <p>availible:</p>
              <p className="p-amount">{ringBalance[0]}</p>
              <p><Button
                isBasic={true}
                isSecondary={true}
                label={t('Transfer')}
                onClick={() => { (transferCb && transferCb('balances')) }}
              /></p>
            </div>
            <div className="ui--value-box">
              <p>bonded:</p>
              <p className="p-amount">{ringBalance[1]}</p>
              <p><Button
                isBasic={true}
                isSecondary={true}
                label={t('Staking')}
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
              <p className='ui--value'>{formatKtonBalance(kton_freeBalance)}</p>
            </div>
          </div>
          <div className="info-bottom">
            <div className="ui--value-box">
              <p>availible:</p>
              <p className="p-amount">{formatKtonBalance(kton_freeBalance)}</p>
              <p><Button
                isBasic={true}
                isSecondary={true}
                label={t('Transfer')}
                onClick={() => { (transferCb && transferCb('kton')) }}
              /></p>
            </div>
            <div className="ui--value-box">
              <p>bonded:</p>
              <p className="p-amount">{balanceDisplay.bonded ? this.renderBonded(balanceDisplay.bonded) : '0'}</p>
              <p><Button
                isBasic={true}
                isSecondary={true}
                label={t('Staking')}
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
    const { balances_all, staking_info, t, withBalance = true } = this.props;
    // console.log('balance', balances_all)
    // console.log('2222222', ringBalances_freeBalance && ringBalances_freeBalance.toString())
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

  private renderRingBalances() {
    const { balances_all, staking_info, t, withBalance = true } = this.props;
    const balanceDisplay = withBalance === true
      ? { available: true, bonded: true, free: true, redeemable: true, unlocking: true }
      : withBalance
        ? withBalance
        : undefined;

    if (!balanceDisplay || !balances_all) {
      return null;
    }
    return [formatBalance(balances_all.availableBalance), formatBalance(balances_all.lockedBalance)]
  }

  private renderQueryRingBalances() {
    const { balances_locks, balances_freeBalance = new BN(0) } = this.props;
    
    if(!balances_locks) return [formatBalance(balances_freeBalance), formatBalance(0)]
    const values = balances_locks.toArray().map((value) => ({
      value
    }));

    let ringBonded = new BN(0);
    values.forEach((value: { value: {amount:BN} }, _: number) => {
      ringBonded = ringBonded.add(value.value.amount)
    })

    if(balances_freeBalance.lt(ringBonded)) return [formatBalance(0),formatBalance(ringBonded)]
    return [formatBalance(balances_freeBalance.sub(ringBonded)), formatBalance(ringBonded)]
  }

  // either true (filtered above already) or [own, ...all extras]
  private renderBonded(bonded: true | Array<BN>) {
    const { staking_info, t } = this.props;
    let value = undefined;

    if (Array.isArray(bonded)) {
      // Get the sum of all extra values (if available)
      const extras = bonded.filter((value, index) => index !== 0);
      const extra = extras.reduce((total, value) => total.add(value), new BN(0)).gtn(0)
        ? `(+${extras.map((bonded) => formatKtonBalance(bonded)).join(', ')})`
        : '';

      value = `${formatKtonBalance(bonded[0])} ${extra}`;
    } else if (staking_info && staking_info.stakingLedger && staking_info.accountId.eq(staking_info.stashId)) {
      value = formatKtonBalance(staking_info.stakingLedger.active);
    }

    return value
      ? value
      : '0';
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
      .p-amount{
        // flex: 1;
        // text-align: left;
        color: #302B3C;
        font-size: 16px;
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
        color: #302B3C;
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
    ['query.balances.freeBalance', { paramName: 'value' }],
    ['query.balances.locks', { paramName: 'value' }],
    ['query.kton.freeBalance', { paramName: 'value' }],
    ['derive.staking.info', { paramName: 'value' }]
  )
);
