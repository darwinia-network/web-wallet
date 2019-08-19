// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DerivedBalances, DerivedStaking } from '@polkadot/api-derive/types';
import { BareProps, I18nProps } from './types';

import BN from 'bn.js';
import React from 'react';
import styled from 'styled-components';
import { formatBalance, formatNumber, formatKtonBalance } from '@polkadot/util';
import { Icon, Tooltip, TxButton } from '@polkadot/ui-app';
import { withCalls, withMulti } from '@polkadot/ui-api';

import translate from './translate';
import CryptoType from './CryptoType';
import Label from './Label';
import { StructAny, Option, Struct, Compact } from '@polkadot/types';
import powerbg from './styles/icon/power-bg.svg'
import ringIcon from './styles/icon/ring.svg'
import ktonIcon from './styles/icon/kton.svg'

export interface DerivedRingBalances extends StructAny {
  freeBalance: BN;
  transferFee: BN;
}

export interface DerivedKtonBalances extends StructAny {
  freeBalance: BN;
  transferFee: BN;
}

export interface DerivedLockBalances extends StructAny {
  amount: BN;
}

export interface DerivedStakingLedger extends Compact {
  amount: BN;
}

// true to display, or (for bonded) provided values [own, ...all extras]
export type BalanceActiveType = {
  available?: boolean,
  bonded?: boolean | Array<BN>,
  free?: boolean,
  redeemable?: boolean,
  unlocking?: boolean,
};

export type CryptoActiveType = {
  crypto?: boolean,
  nonce?: boolean
};

export type stakingLedgerType = {
  raw: {
    stash?: string,
    total_power?: number,
    total_ring?: Compact,
    regular_ring?: Compact,
    active_ring?: Compact,
    total_kton?: Compact,
    active_kton?: Compact
  },
  isNone: boolean
}

type Props = BareProps & I18nProps & {
  balances_all?: DerivedBalances,
  children?: React.ReactNode,
  buttons?: React.ReactNode,
  staking_info?: DerivedStaking,
  value: string,
  stashId?: string,
  withBalance?: boolean | BalanceActiveType,
  withExtended?: boolean | CryptoActiveType,
  ringBalances_freeBalance?: BN,
  kton_freeBalance?: BN,
  kton_locks: Array<any>,
  balances_locks: Array<any>,
  isReadyStaking: boolean,
  staking_ledger: stakingLedgerType,
  balances_freeBalance?: BN
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
class AddressInfoAccountList extends React.PureComponent<Props> {
  render() {
    const { children, className } = this.props;

    return (
      <div className={className}>
        {this.renderPower()}
        {this.renderBalances()}
        {this.renderExtended()}
        {children && (
          <div className='column'>
            {children}
          </div>
        )}
      </div>
    );
  }

  private renderPower() {
    const { staking_ledger, value } = this.props

    if (!staking_ledger) {
      return null;
    }

    const power = formatBalance(staking_ledger.raw.total_power, false)
    return (
      <div className="power-box">
        <h3>Power</h3>
        <p>{power}</p>
      </div>
    );
  }

  private renderBalances() {
    const { balances_all, ringBalances_freeBalance, balances_freeBalance, kton_freeBalance, staking_info, t, withBalance = true, kton_locks, balances_locks, buttons, isReadyStaking = false, staking_ledger, value } = this.props;

    const balanceDisplay = withBalance === true
      ? { available: true, bonded: true, free: true, redeemable: true, unlocking: true }
      : withBalance
        ? withBalance
        : undefined;

    if (!balanceDisplay || !balances_all) {
      return null;
    }
    console.log('renderBalance', value, formatBalance(balances_all.availableBalance || 0, false))
    let _balances_locks = new BN(0)
    let _ktonBalances_locks = new BN(0)
    
    if (balances_locks) {
      balances_locks.forEach((item) => {
        _balances_locks = _balances_locks.add(item.amount)
      })
    }
    if (kton_locks) {
      kton_locks.forEach((item) => {
        _ktonBalances_locks = _ktonBalances_locks.add(item.amount)
      })
    }

    if (!isReadyStaking) {
      return (
        <div className='column'>
          <div className="ui--address-value">
            <div className="balance-box">
              <p>KTON</p>
              <h1>{formatKtonBalance(kton_freeBalance ? kton_freeBalance.toString() : '0')}</h1>
            </div>
            <div className="balance-box">
              <p>RING</p>
              <h1>{formatBalance(balances_all.freeBalance)}</h1>
            </div>
          </div>
        </div>
      );
    }

    if (!staking_ledger || staking_ledger.isNone) {
      return null;
    }

    return (
      <div className='column'>
        <div className="ui--address-value">
          <div className="flex-box">
            <div className="nominate-balance-box">
              <div className="box-left">
                <img src={ringIcon} />
                <p>{t('ring')}</p>
              </div>
              <div className="box-right">
                <p><label>Available</label><span>{formatBalance((balances_freeBalance && balances_locks) ? balances_freeBalance.sub(_balances_locks).toString() : '0', false)}</span></p>
                <p><label>Bonded</label><span>{formatBalance(staking_ledger.raw.active_ring.toBn(), false)}</span></p>
                <p><label>Unbonding</label><span>{formatBalance(staking_ledger.raw.total_ring.toBn().sub(staking_ledger.raw.active_ring.toBn()), false)}</span></p>
              </div>
            </div>
          </div>

          <div className="flex-box">
            <div className="nominate-balance-box">
              <div className="box-left">
                <img src={ktonIcon} />
                <p>{t('kton')}</p>
              </div>
              <div className="box-right">
                <p><label>Available</label><span>{formatKtonBalance((kton_freeBalance && kton_locks) ? kton_freeBalance.sub(_ktonBalances_locks).toString() : '0', false)}</span></p>
                <p><label>Bonded</label><span>{formatBalance(staking_ledger.raw.active_kton.toBn(), false)}</span></p>
                <p><label>Unbonding</label><span>{formatBalance(staking_ledger.raw.total_kton.toBn().sub(staking_ledger.raw.active_kton.toBn()), false)}</span></p>
              </div>
            </div>
          </div>
          {/*           
          <div className="flex-box">
            <p>total</p>
            <h1>{formatKtonBalance(kton_freeBalance ? kton_freeBalance.toString() : '0')}</h1>
          </div>
          <div className="flex-box">
            <p>available</p>
            <h1>{formatKtonBalance((kton_freeBalance && kton_locks) ? kton_freeBalance.sub(_ktonBalances_locks).toString() : '0')}</h1>
          </div>
          <div className="flex-box">
            <p>bonded</p>
            <h1>{balanceDisplay.bonded && this.renderBonded(balanceDisplay.bonded)}</h1>
          </div>
          <div className="flex-box">
            <p>unbonding</p>
            <h1>{this.renderUnlocking()}</h1>
          </div>
          {balanceDisplay.redeemable && staking_info && staking_info.redeemable && staking_info.redeemable.gtn(0) && (
            <div className="flex-box">
              <p>{t('redeemable')}</p>
              <h1>{formatKtonBalance(staking_info.redeemable)}
                {this.renderRedeemButton()}</h1>
            </div>
          )} */}
          {buttons}
        </div>
      </div>
    )

    // return (
    //   <div className='column'>
    //     <div className="ui--address-value">
    //       <div className="flex-box">
    //         <p>total</p>
    //         <h1>{formatKtonBalance(kton_freeBalance ? kton_freeBalance.toString() : '0')}</h1>
    //       </div>
    //       <div className="flex-box">
    //         <p>available</p>
    //         <h1>{formatKtonBalance((kton_freeBalance && kton_locks) ? kton_freeBalance.sub(_ktonBalances_locks).toString() : '0')}</h1>
    //       </div>
    //       <div className="flex-box">
    //         <p>bonded</p>
    //         <h1>{balanceDisplay.bonded && this.renderBonded(balanceDisplay.bonded)}</h1>
    //       </div>
    //       <div className="flex-box">
    //         <p>unbonding</p>
    //         <h1>{this.renderUnlocking()}</h1>
    //       </div>
    //       {balanceDisplay.redeemable && staking_info && staking_info.redeemable && staking_info.redeemable.gtn(0) && (
    //         <div className="flex-box">
    //           <p>{t('redeemable')}</p>
    //           <h1>{formatKtonBalance(staking_info.redeemable)}
    //             {this.renderRedeemButton()}</h1>
    //         </div>
    //       )}
    //       {buttons}
    //     </div>
    //   </div>
    // );
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

    return value || '0';
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

    if (!staking_info || !staking_info.unlocking) {
      return <div>0 KTON</div>
    }

    return (
      staking_info &&
      staking_info.unlocking &&
      staking_info.unlocking.map(({ remainingBlocks, value }, index) => (
        <div key={index}>
          {formatKtonBalance(value)}
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
  styled(AddressInfoAccountList)`
    align-items: flex-start;
    display: flex;
    flex: 1;
    justify-content: center;
    background: #fff;
    border: 1px solid #EDEDED;
    align-items: center;
    .power-box{
      display: flex;
      background: url(${powerbg}) no-repeat;
      flex-direction: column;
      align-items: flex-start;
      width: 175px;
      height: 102px;
      justify-content: center;
      margin: 15px;
      padding-left: 15px;
      color: #fff;
      h3,p{
        color:#fff;
        font-weight: bold;
      }
      h3{
        font-size: 14px;
      }
      p{
        font-size: 24px;
      }
    }

    .column {
      flex: 1;
      display: grid;
      opacity: 1;
      .flex-box{
        
      }
      .balance-box{
        flex-basis: 205px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        h1{
          font-size: 18px;
          font-weight: bold;
          margin-top: 0;
          color: #302B3C;
        }
        p{
          font-size: 14px;
          font-weight: bold;
          color: #302B3C;
        }
      }
      .nominate-balance-box {
        margin: 0 5px;
        flex-basis: 332px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 10px 30px;
        background: #FBFBFB;
        .box-left{
          text-align: center;
          margin-top: 5px;
          
          img{
            width: 40px;
          }
          p{
            text-transform: uppercase;
            font-weight: bold;
          }
        }
        .box-right{
          flex: 1;
          margin-left: 30px;
          p {
            display: flex;
            flex-direction: row;
            margin-bottom: 0.9rem;
            label{
              color: #98959F;
              font-size: 12px;
              flex-basis: 88px;
              text-align: left;
            }
            span{
              color: #5930DD;
              font-size: 16px;
              font-weight: bold;
            }
          }
          p:last-child {
            margin-bottom: 0;
          }
        }
      }
      h1{
        text-transform: none;
      }
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
        margin-right: 1rem;
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
    ['query.staking.ledger', { paramName: 'value' }],
    ['derive.balances.all', { paramName: 'value' }],
    ['derive.staking.info', { paramName: 'value' }],
    ['query.kton.locks', { paramName: 'stashId' }],
    ['query.balances.locks', { paramName: 'stashId' }],
    ['query.kton.freeBalance', { paramName: 'stashId' }],
    ['query.balances.freeBalance', { paramName: 'stashId' }],
  )
);
