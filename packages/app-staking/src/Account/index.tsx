// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountFilter, RecentlyOfflineMap } from '../types';
import { AccountId, Exposure, StakingLedger, ValidatorPrefs, Option, VectorAny } from '@polkadot/types';
import { ApiProps } from '@polkadot/ui-api/types';
import { DerivedBalances, DerivedBalancesMap, DerivedStaking } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { KeyringSectionOption } from '@polkadot/ui-keyring/options/types';

import React from 'react';
import { AddressInfo, AddressMini, AddressRow, Button, ColorButton, Card, TxButton, Menu, AddressInfoStaking } from '@polkadot/ui-app';
import { withCalls, withMulti } from '@polkadot/ui-api';
import { formatBalance, formatNumber } from '@polkadot/util';
import BN from 'bn.js';
import { Popup } from 'semantic-ui-react';

import styled from 'styled-components'
import Bond from './Bond';
import BondExtra from './BondExtra';
import Nominating from './Nominating';
import SessionKey from './SessionKey';
import translate from '../translate';
import SetControllerAccount from './SetControllerAccount';
import SetRewardDestination from './SetRewardDestination';
import SetSessionAccount from './SetSessionAccount';
import Unbond from './Unbond';
import Validating from './Validating';
import Validate from './Validate';
import { api } from '@polkadot/ui-api'

export type stakingLedgerType = {
  raw: {
    stash?: string,
    total_power?: number,
  },
  isNone: boolean
}

type Props = ApiProps & I18nProps & {
  accountId: string,
  balances: DerivedBalancesMap,
  filter: AccountFilter,
  isValidator: boolean,
  recentlyOffline: RecentlyOfflineMap,
  balances_all?: DerivedBalances,
  staking_info?: DerivedStaking,
  stashOptions: Array<KeyringSectionOption>,
  kton_freeBalance: BN,
  staking_nominators: any,
  staking_ledger: stakingLedgerType,
  staking_bonded: AccountId,
  staking_sessionReward: any
};

type State = {
  controllerId: string | null,
  destination: number,
  isActiveController: boolean,
  isActiveSession: boolean,
  isActiveStash: boolean,
  isBondOpen: boolean,
  isSetControllerAccountOpen: boolean,
  isSetRewardDestinationOpen: boolean,
  isSetSessionAccountOpen: boolean,
  isSettingPopupOpen: boolean,
  isStashNominating: boolean,
  isStashValidating: boolean,
  isBondExtraOpen: boolean,
  isNominateOpen: boolean,
  isSessionKeyOpen: boolean,
  isValidatingOpen: boolean,
  isUnbondOpen: boolean,
  isValidateOpen: boolean,
  nominators?: Array<AccountId>,
  sessionId: string | null,
  // stakers?: Exposure,

  stakingLedger?: StakingLedger,
  stashId: string | null,
  validatorPrefs?: ValidatorPrefs,
  isBondOpenWithStep: boolean
};

function toIdString(id?: AccountId | null): string | null {
  return id
    ? id.toString()
    : null;
}

const StyledWrapper = styled.div`
  width: 100%;
  position: relative;
  border-radius:2px;
  padding-bottom: 30px;
  .ui--address-box{
    display: flex;
    padding-right: 20px;
    align-items: center;
    background: #fff;
    .ui--AddressRow{
      flex: 1;
      background: #fff;
      padding: 10px 20px;
      .ui--IdentityIcon{
        background: #fff;
        border-radius: 50%;
        
      }
    }

    .ui--Button-Group{
      margin-top: 0.25rem;
    }
    border:1px solid rgba(237,237,237,1);
  }

  .ui--address-value{
    display: flex;
    align-items: center;
    padding: 35px 20px 35px 5px;
    .flex-box{
      flex: 1;
      text-align: center;
      h1{
        font-weight:600;
        color:rgba(48,43,60,1);
        line-height:33px;
        font-size: 24px;
        margin-top: 5px;
      }
    }
  }

  .ui--string-now{
    background: #fff;
    padding: 40px 60px;
    border-radius:2px;
    border:1px solid rgba(237,237,237,1);
    
    h1{
      font-size: 26px;
      font-weight: bold;
      color: #302B3C;
      text-transform:none;
    }
    p{
      font-size: 14px;
      font-weight: bold;
      color: #302B3C;
      max-width: 512px;
    }
    button{
      background: linear-gradient(315deg,#fe3876,#7c30dd 90%,#3a30dd);
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      padding: 10px 23px;
      border: 0;
      border-radius: 2px;
      margin-top: 20px;
      cursor: pointer;
    }
  }

  .ui--accounts-link{
    display: flex;
    &>div{
      flex: 1;
    }
  }

  .titleRow {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 16px;
      color: #302B3C;
      text-transform: uppercase;
      font-weight: bold;
      
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

  .ui--accounts-box{
    border: 1px solid #EDEDED;
  }

  .staking--Account-detail{
    background: #fff;
    border-bottom: 1px solid #EDEDED;
  }

  .staking--Account-detail:last-child{
    border-bottom: none;
  }
  .nominatingBox{
    margin-left: 20px;
  }
  .staking--no-address{
    background: #fff;

    box-sizing: border-box;

    padding: 1.25rem 1.5rem;
    position: relative;
    text-align: left;
  }
  .staking--no-address-nominate{
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 52px 20px 52px 56px;
    p{
      font-size: 16px;
      font-weight: bold;
      color: #302B3C; 
    }
  }

  .staking--box{
    padding: 20px;
    border-bottom: 1px solid #EDEDED;
  }
  .staking--box:last-child{
    border-bottom: none;
  }
`

class Account extends React.PureComponent<Props, State> {
  state: State = {
    destination: 0,
    isActiveController: false,
    isActiveSession: false,
    isActiveStash: true,
    controllerId: null,
    isBondOpen: false,
    isBondOpenWithStep: false,
    isBondExtraOpen: false,
    isSessionKeyOpen: false,
    isNominateOpen: false,
    isSetControllerAccountOpen: false,
    isSettingPopupOpen: false,
    isSetRewardDestinationOpen: false,
    isSetSessionAccountOpen: false,
    isValidatingOpen: false,
    isUnbondOpen: false,
    isValidateOpen: false,
    isStashNominating: false,
    isStashValidating: false,
    sessionId: null,
    stashId: null
  };

  static getDerivedStateFromProps({ accountId, staking_info, staking_nominators, staking_bonded, staking_sessionReward }: Props): Pick<State, never> | null {
    console.log(111, staking_info);

    // const { nextSessionId, stakingLedger, validatorPrefs } = staking_info;

    let stashId = null;
    let controllerId = null;
    let rewardDestination = null
    let nextSessionId = null
    let stakingLedger = null
    let validatorPrefs = null

    api.queryMulti([
      [api.query.staking.bonded, accountId], // try to map to controller
      [api.query.staking.ledger, accountId]
    ], (re) => {
      // console.log(222,(re as VectorAny<Option<any>>))
      const [account, ledger] = (re as VectorAny<Option<any>>)
      const ledgerWrap = ledger && ledger.isSome && ledger.unwrap() || null
      console.log(222, account, ledgerWrap)
      stashId = ledgerWrap ? ledgerWrap.stash : "";

      if (stashId) {
        controllerId = accountId
      } else {
        controllerId = (account && account.isNone) ? "" : account;
      }

      api.queryMulti([
        [api.query.staking.ledger, toIdString(controllerId) || accountId],
      ], (re) => {
        const [ledger] = (re as VectorAny<Option<any>>)
        const ledgerWrap = ledger && ledger.isSome && ledger.unwrap() || null;
        stashId = ledgerWrap ? ledgerWrap.stash : "";
      })
    })

    let nominatorIndex = -1;
    let nominators = [];
    if (staking_nominators) {
      staking_nominators[0].forEach((element, index) => {
        if (toIdString(element) === toIdString(stashId)) {
          nominatorIndex = index;
        }
      });

      nominators = staking_nominators[1][nominatorIndex];
    }

    const isStashNominating = nominators && nominators.length !== 0;
    const isStashValidating = !!validatorPrefs && !validatorPrefs.isEmpty && !isStashNominating;
    console.log(99001, controllerId, stashId)
    // console.log('getDerivedStateFromProps', accountId,toIdString(controllerId), nominators)
    return {
      controllerId: toIdString(controllerId),
      destination: rewardDestination && rewardDestination.toNumber(),
      isActiveController: accountId === toIdString(controllerId),
      // isActiveController: false,
      isActiveSession: accountId === toIdString(nextSessionId),
      isActiveStash: accountId === toIdString(stashId),
      isStashNominating,
      isStashValidating,
      nominators,
      sessionId: toIdString(nextSessionId),
      // stakers,
      stakingLedger,
      stashId: toIdString(stashId),
      validatorPrefs,
    };
  }

  render() {

    const { accountId, filter, kton_freeBalance } = this.props;
    const { controllerId, isActiveController, isActiveStash, stashId, nominators, validatorPrefs, sessionId } = this.state;
    // console.log('render', accountId, controllerId, nominators)

    if ((filter === 'controller' && isActiveController) || (filter === 'stash' && isActiveStash) || (filter === 'unbonded' && (controllerId || stashId))) {
      return null;
    }
    const isNominating = !!nominators && nominators.length;
    const isValidating = !!validatorPrefs && !validatorPrefs.isEmpty;
    console.log(1111, controllerId, stashId, controllerId != stashId, sessionId)
    if ((controllerId != stashId) || (sessionId)) {
      return (
        <StyledWrapper>
          <div className={'titleRow'}>
            Note
          </div>
          <div className="ui--string-now">
            <h1>Sorry！</h1>
            <p>You are in the status of a nominators and cannot be a node for now.</p>
            <p>We will develop the upgrade to be a node function in future.</p>
          </div>
        </StyledWrapper>
      );
    }


    // Each component is rendered and gets a `is[Component]Openwill` passed in a `isOpen` props.
    // These components will be loaded and return null at the first load (because is[Component]Open === false).
    // This is deliberate in order to display the Component modals in a performant matter later on
    // because their state will already be loaded.
    return (
      <StyledWrapper>
        <div className={'titleRow'}>
          My Nomination
        </div>
        <div>
          {this.renderBond()}
          {this.renderBondExtra()}
          {this.renderNominating()}
          {this.renderSessionKey()}
          {this.renderUnbond()}
          {this.renderValidating()}
          {this.renderSetValidatorPrefs()}
          {/* {this.renderNominate()} */}
          {this.renderSetControllerAccount()}
          {this.renderSetRewardDestination()}
          {this.renderSetSessionAccount()}
          <div className="ui--address-box">
            <AddressRow
              // buttons={this.renderNominateButtons()}
              value={accountId}
              className="ui--AddressRow"
            ></AddressRow>
            {this.renderNominateButtons()}
          </div>
          <div className={'titleRow'}>
            POWER MANAGER
          </div>
          <AddressInfoStaking
            value={accountId}
            withBalance={true}
            buttons={this.renderBondButtons()}
            isReadyStaking={isActiveStash}
          />
        </div>

        {!isActiveStash && !isNominating && !isValidating && <div>
          <div className={'titleRow'}>Start</div>
          <div className="ui--string-now">
            <h1>Get Power for Nominate</h1>
            <p>note: </p>
            <p>
              1. You need to stake some KTON or RING to get power for nominate.<br />
              2. Please make sure that you have some excess RING in this account as gas fee.<br />
              3. After you choose to become a nominee, this account does not support to upgrade to node for now, we will support the upgrade of the account in the future.
            </p>
            <button
              onClick={this.toggleBondWithStep}
            >Staking now</button>
          </div>
        </div>}


        {isActiveStash && <><div className={'titleRow'}>
          My Nomination
        </div>
          <div className="ui--accounts-box">
            {this.renderNominee()}
          </div>
        </>
        }
      </StyledWrapper >
    );
  }

  private renderSetValidatorPrefs() {
    const { controllerId, isValidateOpen, stashId, validatorPrefs } = this.state;

    if (!controllerId || !validatorPrefs || !stashId) {
      return null;
    }

    return (
      <Validate
        controllerId={controllerId}
        isOpen={isValidateOpen}
        onClose={this.toggleValidate}
        stashId={stashId}
        validatorPrefs={validatorPrefs}
      />
    );
  }

  private renderSetControllerAccount() {
    const { controllerId, isSetControllerAccountOpen, isStashValidating, stashId } = this.state;

    if (!isSetControllerAccountOpen || !stashId) {
      return null;
    }

    return (
      <SetControllerAccount
        defaultControllerId={controllerId}
        isValidating={isStashValidating}
        onClose={this.toggleSetControllerAccount}
        stashId={stashId}
      />
    );
  }

  private renderSetRewardDestination() {
    const { controllerId, destination, isSetRewardDestinationOpen } = this.state;

    if (!isSetRewardDestinationOpen || !controllerId) {
      return null;
    }

    return (
      <SetRewardDestination
        controllerId={controllerId}
        defaultDestination={destination}
        onClose={this.toggleSetRewardDestination}
      />
    );
  }

  private renderSetSessionAccount() {
    const { controllerId, isSetSessionAccountOpen, stashId, sessionId } = this.state;

    if (!controllerId || !stashId) {
      return null;
    }

    return (
      <SetSessionAccount
        controllerId={controllerId}
        isOpen={isSetSessionAccountOpen}
        onClose={this.toggleSetSessionAccount}
        sessionId={sessionId}
        stashId={stashId}
      />
    );
  }

  private renderBond() {
    const { accountId } = this.props;
    const { controllerId, isBondOpen, isBondOpenWithStep } = this.state;

    return (
      <>
        <Bond
          accountId={accountId}
          controllerId={controllerId}
          isOpen={isBondOpen}
          onClose={this.toggleBond}
          disableController={true}
          easyMode={true}
        />
        <Bond
          accountId={accountId}
          controllerId={controllerId}
          isOpen={isBondOpenWithStep}
          onClose={this.toggleBondWithStep}
          onSuccess={() => {
            this.toggleBondWithStep();
            this.toggleNominate();
          }}
          disableController={true}
          easyMode={true}
        />
      </>
    );
  }

  private renderBondExtra() {
    const { accountId } = this.props;
    const { controllerId, isBondExtraOpen } = this.state;

    return (
      <BondExtra
        accountId={accountId}
        controllerId={controllerId}
        isOpen={isBondExtraOpen}
        onClose={this.toggleBondExtra}
      />
    );
  }

  private renderUnbond() {
    const { controllerId, isUnbondOpen } = this.state;

    return (
      <Unbond
        controllerId={controllerId}
        isOpen={isUnbondOpen}
        onClose={this.toggleUnbond}
      />
    );
  }

  private renderValidating() {
    const { accountId } = this.props;
    const { isValidatingOpen, stashId, validatorPrefs } = this.state;

    if (!validatorPrefs || !isValidatingOpen || !stashId) {
      return null;
    }

    return (
      <Validating
        accountId={accountId}
        isOpen
        onClose={this.toggleValidating}
        stashId={stashId}
        validatorPrefs={validatorPrefs}
      />
    );
  }

  private renderSessionKey() {
    const { accountId } = this.props;
    const { isSessionKeyOpen, stashId } = this.state;

    if (!stashId) {
      return null;
    }

    return (
      <SessionKey
        accountId={accountId}
        isOpen={isSessionKeyOpen}
        onClose={this.toggleSessionKey}
        stashId={stashId}
      />
    );
  }

  private renderNominee() {
    const { recentlyOffline, t, staking_info } = this.props;
    const { nominators, isActiveStash, controllerId } = this.state;

    if (!nominators || !nominators.length) {
      return (
        <div className="staking--no-address-nominate">
          <div>
            <p>Not nominating yet<br />
              Participating in node nominating may gain more earnings
            </p>
          </div>
          <ColorButton
            key='nominate'
            onClick={this.toggleNominate}
          >{t('Nominate')}</ColorButton>
        </div>
      );
    }

    return (
      <div className='staking--Account-detail'>
        {
          nominators.map((nomineeId, index) => (
            <div className="staking--box" key={index}>
              <AddressRow
                // key={`${nomineeId}-nominee`}
                value={nomineeId}
                nominator={controllerId}
                isShare
                defaultName={t('validator (stash)')}
                offlineStatus={recentlyOffline[nomineeId.toString()]}
                withBalance={false}
                withBonded
                className="ui--AddressRow"
              ></AddressRow>
            </div>
          ))
        }
      </div>
    );
  }

  private renderLinkedAccountEmpty() {
    const { t } = this.props;
    const { controllerId, isActiveController, sessionId, isActiveSession, stashId, isActiveStash } = this.state;

    if ((!controllerId) && (!sessionId || isActiveSession) && (!stashId || isActiveStash)) {
      return (
        <div className="staking--no-address">{t('no addresses found')}</div>
      );
    }
  }

  private renderControllerId() {
    const { recentlyOffline, t } = this.props;
    const { controllerId, isActiveController } = this.state;

    if (!controllerId) {
      // if (!controllerId || isActiveController) {
      return null;
    }

    return (
      <div className='staking--Account-detail'>
        <label className='staking--label'>{t('controller')}</label>
        {/* <AddressMini
          value={controllerId}
          offlineStatus={recentlyOffline[controllerId]}
        /> */}
        <AddressRow
          value={controllerId}
          className="ui--AddressRow"
        ></AddressRow>
      </div>
    );
  }

  private renderSessionId() {
    const { t } = this.props;
    const { isActiveSession, sessionId } = this.state;

    if (!sessionId || isActiveSession) {
      return null;
    }

    return (
      <div className='staking--Account-detail'>
        <label className='staking--label'>{t('session')}</label>
        {/* <AddressMini value={sessionId} /> */}
        <AddressRow
          // buttons={this.renderButtons()}
          value={sessionId}
          className="ui--AddressRow"
        ></AddressRow>
      </div>
    );
  }

  private renderStashId() {
    const { recentlyOffline, t } = this.props;
    const { isActiveStash, stashId } = this.state;

    if (!stashId || isActiveStash) {
      return null;
    }

    return (
      <div className='staking--Account-detail'>
        <label className='staking--label'>{t('stash')}</label>
        {/* <AddressMini
          value={stashId}
          offlineStatus={recentlyOffline[stashId]}
          withBalance={false}
          withBonded
        /> */}
        <AddressRow
          // buttons={this.renderButtons()}
          value={stashId}
          className="ui--AddressRow"
        ></AddressRow>
      </div>
    );
  }

  private renderNominating() {
    const { accountId, stashOptions } = this.props;
    const { isNominateOpen, stashId } = this.state;

    if (!stashId) {
      return null;
    }

    return (
      <Nominating
        accountId={accountId}
        isOpen={isNominateOpen}
        onClose={this.toggleNominate}
        stashId={stashId}
        stashOptions={stashOptions}
        easyMode={true}
      />
    );
  }

  private renderNominateButtons() {
    const { accountId, balances_all, t } = this.props;
    const { isActiveStash, isActiveController, nominators, sessionId, stakingLedger, validatorPrefs, isSettingPopupOpen } = this.state;
    const buttons = [];
    const isNominating = !!nominators && nominators.length;
    const isValidating = !!validatorPrefs && !validatorPrefs.isEmpty;

    if (isActiveStash) {
      // if we are validating/nominating show stop
      if (isValidating || isNominating) {
        buttons.push(
          <TxButton
            accountId={accountId}
            // isNegative
            isBasic
            isSecondary
            label={
              isNominating
                ? t('Stop Nominating')
                : t('Stop Validating')
            }
            key='stop'
            tx='staking.chill'
          />

        );
        buttons.push(
          <Button
            isBasic={true}
            isSecondary={true}
            key='nominate1'
            onClick={this.toggleNominate}
            label={t('Nominate')}
          />
        );
      } else {
        if (!sessionId) {
          // buttons.push(
          //   <Button
          //     isBasic={true}
          //     isSecondary={true}
          //     key='session'
          //     onClick={this.toggleSessionKey}
          //     label={t('Set Session Key')}
          //   />
          // );
        } else {
          buttons.push(
            <Button
              isBasic={true}
              isSecondary={true}
              key='validate'
              onClick={this.toggleValidating}
              label={t('Validate')}
            />
          );
        }
        buttons.push(
          <Button
            isBasic={true}
            isSecondary={true}
            key='nominate1'
            onClick={this.toggleNominate}
            label={t('Nominate')}
          />
        );
      }
    }

    return (
      <Button.Group>
        {buttons}
      </Button.Group>
    );
  }

  private renderBondButtons() {
    const { accountId, balances_all, staking_ledger, t } = this.props;
    const { isActiveStash, isActiveController, nominators, sessionId, stakingLedger, validatorPrefs, isSettingPopupOpen } = this.state;
    const buttons = [];

    console.log('isActiveStash', isActiveStash, staking_ledger)
    if (isActiveStash) {
      // only show a "Bond Additional" button if this stash account actually doesn't bond everything already
      // staking_ledger.total gives the total amount that can be slashed (any active amount + what is being unlocked)

      // console.log(balances_all , stakingLedger , stakingLedger.total, stakingLedger.active)
      if (staking_ledger && !staking_ledger.isNone) {
        buttons.push(
          <Button
            isBasic={true}
            isSecondary={true}
            key='bond'
            onClick={this.toggleBondExtra}
            label={t('Bond More')}
          />
        );

        buttons.push(
          <Button
            isBasic={true}
            isSecondary={true}
            key='unbond'
            onClick={this.toggleUnbond}
            label={t('Unbond')}
          />
        );
      }

      // don't show the `unbond` button if there's nothing to unbond
      // staking_ledger.active gives the amount that can be unbonded (total - what's being unlocked).
      // if (stakingLedger && stakingLedger.active && stakingLedger.active.gtn(0)) {
      //   // buttons.length && buttons.push(<Button.Or key='bondAdditional.or' />);
      //   buttons.push(
      //     <Button
      //       isBasic={true}
      //       isSecondary={true}
      //       key='unbond'
      //       onClick={this.toggleUnbond}
      //       label={t('Unbond')}
      //     />
      //   );
      // }
    }

    if (buttons.length === 0) {
      return null;
    }

    return (
      <Button.Group>
        {buttons}
      </Button.Group>
    );
  }

  private renderButtons() {
    const { accountId, balances_all, t } = this.props;
    const { isActiveStash, isActiveController, nominators, sessionId, stakingLedger, validatorPrefs, isSettingPopupOpen } = this.state;
    const buttons = [];

    if (isActiveStash) {
      // only show a "Bond Additional" button if this stash account actually doesn't bond everything already
      // staking_ledger.total gives the total amount that can be slashed (any active amount + what is being unlocked)
      if (balances_all && stakingLedger && stakingLedger.total && (balances_all.freeBalance.gt(stakingLedger.total))) {
        buttons.push(
          <Button
            isBasic={true}
            isSecondary={true}
            key='bond'
            onClick={this.toggleBondExtra}
            label={t('Bond Additional')}
          />
        );
      }

      // don't show the `unbond` button if there's nothing to unbond
      // staking_ledger.active gives the amount that can be unbonded (total - what's being unlocked).
      if (stakingLedger && stakingLedger.active && stakingLedger.active.gtn(0)) {
        // buttons.length && buttons.push(<Button.Or key='bondAdditional.or' />);
        buttons.push(
          <Button
            isBasic={true}
            isSecondary={true}
            key='unbond'
            onClick={this.toggleUnbond}
            label={t('Unbond')}
          />
        );
        buttons.push(
          <Popup
            key='settings'
            onClose={this.toggleSettingPopup}
            open={isSettingPopupOpen}
            position='bottom left'
            trigger={
              <Button
                icon='setting'
                onClick={this.toggleSettingPopup}
                size='tiny'
              />
            }
          >
            {this.renderPopupMenu()}
          </Popup>
        );
      }
    } else if (isActiveController) {
      const isNominating = !!nominators && nominators.length;
      const isValidating = !!validatorPrefs && !validatorPrefs.isEmpty;

      // if we are validating/nominating show stop
      if (isValidating || isNominating) {
        buttons.push(
          <TxButton
            accountId={accountId}
            // isNegative
            isBasic
            isSecondary
            label={
              isNominating
                ? t('Stop Nominating')
                : t('Stop Validating')
            }
            key='stop'
            tx='staking.chill'
          />
        );
        if (!sessionId) {
          buttons.push(
            <Button
              isBasic={true}
              isSecondary={true}
              key='session'
              onClick={this.toggleSessionKey}
              label={t('Set Session Key')}
            />
          );
        } else {
          buttons.push(
            <Button
              isBasic={true}
              isSecondary={true}
              key='validate'
              onClick={this.toggleValidating}
              label={t('Validate')}
            />
          );
        }
      } else {
        if (!sessionId) {
          buttons.push(
            <Button
              isBasic={true}
              isSecondary={true}
              key='session'
              onClick={this.toggleSessionKey}
              label={t('Set Session Key')}
            />
          );
        } else {
          buttons.push(
            <Button
              isBasic={true}
              isSecondary={true}
              key='validate'
              onClick={this.toggleValidating}
              label={t('Validate')}
            />
          );
        }
        buttons.push(
          <Button
            isBasic={true}
            isSecondary={true}
            key='nominate'
            onClick={this.toggleNominate}
            label={t('Nominate')}
          />
        );
      }
    } else {
      // we have nothing here, show the bond to get started
      // buttons.push(
      //   <Button
      //     isBasic={true}
      //     isSecondary={true}
      //     key='bond'
      //     onClick={this.toggleBond}
      //     label={t('Bond Funds')}
      //   />
      // );
    }
    return (
      <Button.Group>
        {buttons}
      </Button.Group>
    );
  }

  private renderPopupMenu() {
    const { balances_all, t } = this.props;
    const { isStashNominating, isStashValidating, sessionId } = this.state;

    // only show a "Bond Additional" button if this stash account actually doesn't bond everything already
    // staking_ledger.total gives the total amount that can be slashed (any active amount + what is being unlocked)
    const canBondExtra = balances_all && balances_all.availableBalance.gtn(0);

    return (
      <Menu
        vertical
        text
        onClick={this.toggleSettingPopup}
      >
        {canBondExtra &&
          <Menu.Item onClick={this.toggleBondExtra}>
            {t('Bond more funds')}
          </Menu.Item>
        }
        <Menu.Item onClick={this.toggleUnbond}>
          {t('Unbond funds')}
        </Menu.Item>
        <Menu.Item onClick={this.toggleSetControllerAccount}>
          {t('Change controller account')}
        </Menu.Item>
        <Menu.Item onClick={this.toggleSetRewardDestination}>
          {t('Change reward destination')}
        </Menu.Item>
        {isStashValidating &&
          <Menu.Item onClick={this.toggleValidate}>
            {t('Change validator preferences')}
          </Menu.Item>
        }
        {sessionId &&
          <Menu.Item onClick={this.toggleSetSessionAccount}>
            {t('Change session account')}
          </Menu.Item>
        }
        {isStashNominating &&
          <Menu.Item onClick={this.toggleNominate}>
            {t('Change nominee(s)')}
          </Menu.Item>
        }
      </Menu>
    );
  }

  private toggleBond = () => {
    this.setState(({ isBondOpen }) => ({
      isBondOpen: !isBondOpen
    }));
  }

  private toggleBondWithStep = () => {
    this.setState(({ isBondOpenWithStep }) => ({
      isBondOpenWithStep: !isBondOpenWithStep
    }));
  }

  private toggleBondExtra = () => {
    this.setState(({ isBondExtraOpen }) => ({
      isBondExtraOpen: !isBondExtraOpen
    }));
  }

  private toggleNominate = () => {
    this.setState(({ isNominateOpen }) => ({
      isNominateOpen: !isNominateOpen
    }));
  }

  private toggleSessionKey = () => {
    this.setState(({ isSessionKeyOpen }) => ({
      isSessionKeyOpen: !isSessionKeyOpen
    }));
  }


  private toggleSetControllerAccount = () => {
    this.setState(({ isSetControllerAccountOpen }) => ({
      isSetControllerAccountOpen: !isSetControllerAccountOpen
    }));
  }

  private toggleSetRewardDestination = () => {
    this.setState(({ isSetRewardDestinationOpen }) => ({
      isSetRewardDestinationOpen: !isSetRewardDestinationOpen
    }));
  }

  private toggleSetSessionAccount = () => {
    this.setState(({ isSetSessionAccountOpen }) => ({
      isSetSessionAccountOpen: !isSetSessionAccountOpen
    }));
  }

  private toggleSettingPopup = () => {
    this.setState(({ isSettingPopupOpen }) => ({
      isSettingPopupOpen: !isSettingPopupOpen
    }));
  }

  private toggleUnbond = () => {
    this.setState(({ isUnbondOpen }) => ({
      isUnbondOpen: !isUnbondOpen
    }));
  }

  private toggleValidating = () => {
    this.setState(({ isValidatingOpen }) => ({
      isValidatingOpen: !isValidatingOpen
    }));
  }

  private toggleValidate = () => {
    this.setState(({ isValidateOpen }) => ({
      isValidateOpen: !isValidateOpen
    }));
  }
}

// export default translate(
//   withCalls<Props>(
//     ['derive.staking.info', { paramName: 'accountId' }],
//     // 'query.staking.recentlyOffline',
//     ['derive.balances.all', { paramName: 'accountId' }],
//     ['query.kton.freeBalance', { paramName: 'accountId' }],
//   )(Account)
// );


export default withMulti(
  styled(Account as React.ComponentClass<Props>)`
   
  `,
  translate,
  withCalls<Props>(
    ['query.staking.ledger', { paramName: 'accountId' }],
    ['derive.staking.info', { paramName: 'accountId' }],
    ['query.staking.bonded', { paramName: 'accountId' }],
    ['query.staking.sessionReward', { paramName: 'accountId' }],
    ['query.staking.nominators', { paramName: 'accountId' }],
    // 'query.staking.recentlyOffline',
    ['derive.balances.all', { paramName: 'accountId' }],
    ['query.kton.freeBalance', { paramName: 'accountId' }],
    'query.session.validators',
  )
);