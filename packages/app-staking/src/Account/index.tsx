// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountFilter, RecentlyOfflineMap } from '../types';
import { AccountId, Exposure, StakingLedger, ValidatorPrefs, Option, VectorAny, StakingLedgers } from '@polkadot/types';
import { ApiProps } from '@polkadot/ui-api/types';
import { DerivedBalances, DerivedBalancesMap, DerivedStaking } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { KeyringSectionOption } from '@polkadot/ui-keyring/options/types';

import React from 'react';
import { AddressInfo, AddressMini, AddressRow, Button, ColorButton, Card, TxButton, Menu, AddressInfoStaking, LabelHelp } from '@polkadot/ui-app';
import { withCalls, withMulti } from '@polkadot/ui-api';
import { formatBalance, formatNumber } from '@polkadot/util';
import BN from 'bn.js';
import { Popup } from 'semantic-ui-react';

import styled from 'styled-components'
import Bond from './Bond';
import BondExtra from './BondExtra';
import Nominating from './Nominating';
import translate from '../translate';
import SetControllerAccount from './SetControllerAccount';
import Unbond from './Unbond';
import Validating from './Validating';
import Earnings from './Earnings'

type Props = ApiProps & I18nProps & {
  accountId: string,
  stashId?: string,
  controllerId?: string,
  balances: DerivedBalancesMap,
  filter: AccountFilter,
  isValidator: boolean,
  recentlyOffline: RecentlyOfflineMap,

  stashOptions: Array<KeyringSectionOption>,
  staking_nominators: any,
  staking_ledger: StakingLedgers,
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

  stakingLedger?: StakingLedgers,
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
    padding: 15px 20px 15px 5px;
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

  static getDerivedStateFromProps({ accountId, staking_nominators, staking_bonded, staking_sessionReward, stashId, controllerId }: Props): Pick<State, never> | null {


    let rewardDestination = null
    let nextSessionId = null
    let stakingLedger = null
    let validatorPrefs = null

    let nominatorIndex = -1;
    let nominators = [];
    if (staking_nominators) {
      staking_nominators[0].forEach((element, index) => {
        if (toIdString(element) === stashId) {
          nominatorIndex = index;
        }
      });

      nominators = staking_nominators[1][nominatorIndex];
    }

    const isStashNominating = nominators && nominators.length !== 0;
    const isStashValidating = !!validatorPrefs && !validatorPrefs.isEmpty && !isStashNominating;

    return {
      controllerId: controllerId,
      destination: rewardDestination && rewardDestination.toNumber(),
      isActiveController: accountId === controllerId,
      // isActiveController: false,
      isActiveSession: accountId === toIdString(nextSessionId),
      isActiveStash: accountId === stashId,
      isStashNominating,
      isStashValidating,
      nominators,
      sessionId: toIdString(nextSessionId),
      // stakers,
      stakingLedger,
      stashId: stashId,
      validatorPrefs,
    };
  }

  render() {

    const { accountId, filter, t } = this.props;
    const { controllerId, isActiveController, isActiveStash, stashId, nominators, validatorPrefs, sessionId } = this.state;

    if ((filter === 'controller' && isActiveController) || (filter === 'stash' && isActiveStash) || (filter === 'unbonded' && (controllerId || stashId))) {
      return null;
    }
    const isNominating = !!nominators && nominators.length;
    const isValidating = !!validatorPrefs && !validatorPrefs.isEmpty;

    if ((controllerId != stashId) || (sessionId)) {
      return (
        <StyledWrapper>
          <div className={'titleRow'}>
            {t('Note')}
          </div>
          <div className="ui--string-now">
            <h1>{t('Sorry！')}</h1>
            <p>{t('You are in the status of a nominators and cannot be a node for now.')}</p>
            <p>{t('We will develop the upgrade to be a node function in future.')}</p>
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
          {t('My Nomination')}
        </div>
        <div>
          {this.renderBond()}
          {this.renderBondExtra()}
          {this.renderNominating()}
          {/* {this.renderSessionKey()} */}
          {this.renderUnbond()}
          {this.renderValidating()}
          {/* {this.renderSetValidatorPrefs()} */}
          {/* {this.renderNominate()} */}
          {this.renderSetControllerAccount()}
          {/* {this.renderSetRewardDestination()} */}
          {/* {this.renderSetSessionAccount()} */}
          <div className="ui--address-box">
            <AddressRow
              // buttons={this.renderNominateButtons()}
              value={accountId}
              className="ui--AddressRow"
            ></AddressRow>
            {this.renderNominateButtons()}
          </div>
          <div className={'titleRow'}>
            {t('POWER MANAGER')}
            <LabelHelp help={t('You can manage POWER with bond more/unbond asset, which can be used to nominate nodes to earn RING. RING/KTON will have 21days of unbonding status after unbond. Assets in thiis state can not nominate and transfer')} />
          </div>
          <AddressInfoStaking
            value={accountId}
            stashId={stashId || accountId}
            withBalance={true}
            buttons={this.renderBondButtons()}
            isReadyStaking={isActiveStash}
          />
        </div>

        {!isActiveStash && !isNominating && !isValidating && <div>
          <div className={'titleRow'}>{t('Start')}</div>
          <div className="ui--string-now">
            <h1>{t('Get Power for Nominate')}</h1>
            <p>{t('note')}: </p>
            <p>
              {t('1. You need to stake some KTON or RING to get power for nominate.')}<br />
              {t('2. Please make sure that you have some excess RING in this account as gas fee.')}<br />
              {t('3. After you choose to become a nominee, this account does not support to upgrade to node for now, we will support the upgrade of the account in the future.')}
            </p>
            <button
              onClick={this.toggleBondWithStep}
            >{t('Staking now')}</button>
          </div>
        </div>}

        {isActiveStash && <Earnings address={stashId}/>}

        {isActiveStash && <><div className={'titleRow'}>
          {t('My Nomination')}
        </div>
          <div className="ui--accounts-box">
            {this.renderNominee()}
          </div>
        </>
        }
      </StyledWrapper >
    );
  }

  // private renderSetValidatorPrefs() {
  //   const { controllerId, isValidateOpen, stashId, validatorPrefs } = this.state;

  //   if (!controllerId || !validatorPrefs || !stashId) {
  //     return null;
  //   }

  //   return (
  //     <Validate
  //       controllerId={controllerId}
  //       isOpen={isValidateOpen}
  //       onClose={this.toggleValidate}
  //       stashId={stashId}
  //       validatorPrefs={validatorPrefs}
  //     />
  //   );
  // }

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

  // private renderSetRewardDestination() {
  //   const { controllerId, destination, isSetRewardDestinationOpen } = this.state;

  //   if (!isSetRewardDestinationOpen || !controllerId) {
  //     return null;
  //   }

  //   return (
  //     <SetRewardDestination
  //       controllerId={controllerId}
  //       defaultDestination={destination}
  //       onClose={this.toggleSetRewardDestination}
  //     />
  //   );
  // }

  // private renderSetSessionAccount() {
  //   const { controllerId, isSetSessionAccountOpen, stashId, sessionId } = this.state;

  //   if (!controllerId || !stashId) {
  //     return null;
  //   }

  //   return (
  //     <SetSessionAccount
  //       controllerId={controllerId}
  //       isOpen={isSetSessionAccountOpen}
  //       onClose={this.toggleSetSessionAccount}
  //       sessionId={sessionId}
  //       stashId={stashId}
  //     />
  //   );
  // }

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
    const { accountId, stashId } = this.props;
    const { controllerId, isBondExtraOpen } = this.state;

    return (
      <BondExtra
        accountId={accountId}
        stashId={stashId}
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

  // private renderSessionKey() {
  //   const { accountId } = this.props;
  //   const { isSessionKeyOpen, stashId } = this.state;

  //   if (!stashId) {
  //     return null;
  //   }

  //   return (
  //     <SessionKey
  //       accountId={accountId}
  //       isOpen={isSessionKeyOpen}
  //       onClose={this.toggleSessionKey}
  //       stashId={stashId}
  //     />
  //   );
  // }

  private renderNominee() {
    const { recentlyOffline, t } = this.props;
    const { nominators, isActiveStash, controllerId } = this.state;

    if (!nominators || !nominators.length) {
      return (
        <div className="staking--no-address-nominate">
          <div>
            <p>{t('Not nominating yet')}<br />
              {t('Participating in node nominating may gain more earnings')}
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
    const { accountId, t } = this.props;
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
    const { staking_ledger, t } = this.props;
    const { isActiveStash, isActiveController, nominators, sessionId, stakingLedger, validatorPrefs, isSettingPopupOpen } = this.state;
    const buttons = [];
    if (isActiveStash) {
      // only show a "Bond Additional" button if this stash account actually doesn't bond everything already
      // staking_ledger.total gives the total amount that can be slashed (any active amount + what is being unlocked)

      if (staking_ledger && !staking_ledger.isEmpty) {
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
    ['query.staking.nominators', { paramName: 'accountId' }],
    ['query.staking.ledger', {
      paramName: 'accountId', transform: (value: Option<StakingLedgers>) =>
        value.unwrapOr(null)
    }],
    ['query.staking.bonded', { paramName: 'accountId' }],
    ['query.staking.sessionReward', { paramName: 'accountId' }],
    // 'query.staking.recentlyOffline',
    ['query.kton.freeBalance', { paramName: 'accountId' }],
    ['derive.staking.info', { paramName: 'accountId' }],
    'query.session.validators',
  )
);
