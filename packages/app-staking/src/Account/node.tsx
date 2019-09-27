// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountFilter, RecentlyOfflineMap } from '../types';
import { AccountId, Exposure, StakingLedger, ValidatorPrefs, VectorAny, Option, Compact, Bytes, Enum , RewardDestination, StakingLedgers} from '@polkadot/types';
import { ApiProps } from '@polkadot/ui-api/types';
import { DerivedBalances, DerivedBalancesMap, DerivedStaking } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { KeyringSectionOption } from '@polkadot/ui-keyring/options/types';

import React from 'react';
import { AddressInfo, AddressMini, AddressRow, Button, ColorButton, Card, TxButton, Menu, AddressInfoStaking, LabelHelp } from '@polkadot/ui-app';
import { withCalls, withMulti, withObservable } from '@polkadot/ui-api';
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
import NodeController from './nodeController';
import NodeIcon from '../img/nodeIcon.svg';
import CreateModal from '@polkadot/app-accounts/modals/Create';
import accountObservable from '@polkadot/ui-keyring/observable/accounts';
import { ignoreElements } from 'rxjs/operators';
import { api } from '@polkadot/ui-api'
import { u8aToU8a, u8aToString, u8aToHex } from '@polkadot/util';

/** Enum */
// export interface RewardDestination extends Enum {
//   /** 0:: Stash */
//   readonly isStash: boolean;
//   /** 1:: Controller */
//   readonly isController: boolean;
// }

type Props = ApiProps & I18nProps & {
  accountId: string,
  balances: DerivedBalancesMap,
  filter: AccountFilter,
  // isValidator: boolean,
  recentlyOffline: RecentlyOfflineMap,
  staking_info?: DerivedStaking,
  stashOptions: Array<KeyringSectionOption>,
  session_validators?: Array<AccountId>,
  staking_controllers?: [Array<AccountId>, Array<Option<AccountId>>],
  onStatusChange: () => void,
  staking_validators: any,
  staking_nominators: any,
  ledger?: any,
  stashId?: string,
  controllerId?: string,
  sessionKey?: string,
  nodeName?: Bytes,
  staking_payee: RewardDestination
};

type State = {
  controllerId: string | null,
  destination: number,
  isActiveController: boolean,
  isActiveSession: boolean,
  isActiveStash: boolean,
  isBondOpen: boolean,
  isBondOpenWithStep: boolean,
  isSetControllerAccountOpen: boolean,
  isSetRewardDestinationOpen: boolean,
  isSetSessionAccountOpen: boolean,
  isSettingPopupOpen: boolean,
  isStashNominating: boolean,
  isStashValidating: boolean,
  isBondExtraOpen: boolean,
  isNominateOpen: boolean,
  isSessionKeyOpen: boolean,
  isSessionKeyOpenWithStep: boolean,
  isValidatingOpen: boolean,
  isUnbondOpen: boolean,
  isValidateOpen: boolean,
  isValidateOpenWithStep: boolean,
  nominators?: Array<AccountId>,
  sessionId: string | null,
  stakers?: Exposure,
  stakingLedger?: StakingLedger,
  stashId: string | null,
  validatorPrefs?: ValidatorPrefs,
  controllers: Array<string>,
  validators: Array<string>,
  isCreateOpen: boolean,
  staking_ledger: StakingLedgers,
  isValidator: boolean,
  staking_nodeName: Bytes
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
    padding: 10px 20px;
    align-items: center;
    color: #302B3C;
    p{
      margin-bottom: 0;
    }
    .nodeName{
      font-size: 14px;
      margin-left: 20px;
      margin-right: 30px;
      font-weight: bold;
    }
    .splitSpace{
      flex: 1;
    }
    .validatingBox {
      border-radius:13px;
      border:1px solid #5930DD;
      p{
        font-size:12px;
        font-weight:600;
        color: #5930DD;
        padding: 5px 26px;
      }
    }

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
    padding: 20px;
    .ui--AddressRow{
      display: flex;
    align-items: center;
    justify-content: space-between;
    }
    
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

  .ui--address-box-img{
    width: 50px;
    height: 50px;
  }
  .ui-addaccount{
      color: #8231D8;
      text-decoration: underline;
  }

  @media (max-width: 767px) {
    .ui--address-box {
      flex-wrap: wrap;
    }

    .ui--address-value{
      padding: 15px 5px 15px 5px;
    }

    .staking--Account-detail{
      padding: 10px;
    }
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
    isSessionKeyOpenWithStep: false,
    isNominateOpen: false,
    isSetControllerAccountOpen: false,
    isSettingPopupOpen: false,
    isSetRewardDestinationOpen: false,
    isSetSessionAccountOpen: false,
    isValidatingOpen: false,
    isUnbondOpen: false,
    isValidateOpen: false,
    isValidateOpenWithStep: false,
    isStashNominating: false,
    isStashValidating: false,
    sessionId: null,
    stashId: null,
    controllers: [],
    validators: [],
    isCreateOpen: false,
    staking_ledger: null,
    isValidator: false,
    staking_nodeName: null,
    
  };

  static getDerivedStateFromProps({ accountId, staking_info, staking_nominators, staking_controllers = [[], []], session_validators = [], staking_validators, ledger, stashId, controllerId, sessionKey, staking_payee }: Props): Pick<State, never> | null {
    // console.log('getDerivedStateFromProps', staking_info, accountId, staking_nominators);
    // console.log('staking_validators', staking_validators)
    if (!accountId) {
      return null;
    }

    const filterValidatorPrefs = (validators, stashId) => {
      if (!validators || validators && validators.isEmpty) {
        return null
      }
      let validatorIndex = -1;
      validators[0].forEach((id, index) => {
        if (toIdString(id) == toIdString(stashId)) {
          validatorIndex = index
        }
      })

      if (validatorIndex != -1) {
        return validators[1][validatorIndex]
      }
      return null
    }

    // let stashId = null;
    // let controllerId = null;
    let rewardDestination = staking_payee
    let nextSessionId = null
    let stakingLedger = null
    let validatorPrefs = null
    let staking_nodeName = null


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

    validatorPrefs = filterValidatorPrefs(staking_validators, stashId);

    const isStashNominating = nominators && nominators.length !== 0;
    const isStashValidating = !!validatorPrefs && !validatorPrefs.isEmpty && !isStashNominating;

    const validators = staking_validators && staking_validators[0].map((authorityId) =>
      authorityId.toString()
    )
    
    return {
      controllerId: controllerId,
      destination: rewardDestination && rewardDestination.toNumber(),
      isActiveController: controllerId,
      // isActiveController: false,
      isActiveSession: accountId === sessionKey,
      isActiveStash: accountId === stashId,
      isStashNominating,
      isStashValidating,
      nominators,
      sessionId: sessionKey,
      // stakers,
      stakingLedger,
      stashId: stashId,
      validatorPrefs,
      controllers: staking_controllers[1].filter((optId) => optId && optId.isSome).map((accountId) =>
        accountId.unwrap().toString()
      ),
      validators: validators,
      staking_ledger: ledger,
      isValidator: validators && validators.some((id) => {
        return id === stashId
      }),
      staking_nodeName
    }
  }

  render() {
    // @ts-ignore
    const { accountId, filter, session_validators, onStatusChange, nodeName = new Bytes() } = this.props;
    const { controllerId, isActiveController, isActiveStash, stashId, nominators, validatorPrefs, validators, controllers, isCreateOpen, sessionId } = this.state;
    // console.log('render1', controllerId, isActiveController, isActiveStash, stashId, nominators, validatorPrefs, validators, controllers, isCreateOpen, sessionId)

    if ((filter === 'controller' && isActiveController) || (filter === 'stash' && isActiveStash) || (filter === 'unbonded' && (controllerId || stashId))) {
      return null;
    }

    const nodeNameString = u8aToString(nodeName.toU8a(true))
    const isNominating = !!nominators && nominators.length;
    const isValidating = !!validatorPrefs && !validatorPrefs.isEmpty;

    if ((controllerId == stashId && controllerId != null && controllerId != '') || isNominating) {
      return (
        <StyledWrapper>
          <div className={'titleRow'}>
            Note
          </div>
          <div className="ui--string-now">
            <h1>Sorry！</h1>
            <p>You are in the status of a nominator and cannot be a node for now.</p>
            <p>Please replace the account and retry.</p>
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
          My Node
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
            <img className="ui--address-box-img" src={NodeIcon} />
            <p className="nodeName">{nodeNameString || `Default`}</p>
            {this.renderStatus()}
            <div className="splitSpace"></div>
            {this.renderControllerButtons()}
          </div>
          <div className={'titleRow'}>
            Nomination share
            <LabelHelp help={'You can manage POWER with bond more/unbond asset, which can be used to nominate nodes to earn RING. RING/KTON will have 21days of unbonding status after unbond. Assets in thiis state can not nominate and transfer'}/>
          </div>
          <AddressInfoStaking
            // value={stashId || accountId}
            value={controllerId || accountId}
            stashId={stashId || accountId}
            withBalance={true}
            buttons={this.renderBondButtons()}
            isReadyStaking={controllerId}
          />
        </div>
        {!stashId && !isNominating && !isValidating && !sessionId && <div>
          <div className={'titleRow'}>Start a KTON staking</div>
          <div className="ui--string-now">
            <h1>Get Power for Validate</h1>
            <p>note: </p>
            <p>
              1. Please make sure you have 3 available accounts. <a className="ui-addaccount" onClick={this.toggleCreate}>ADD ACCOUNT</a><br />
              2. Please make sure that there are a few ring in the account as gas fee.<br />
              3. You need to stake some KTON or RING to get power for validate.<br />
            </p>
            <button
              onClick={this.toggleBondWithStep}
            >Staking now</button>
          </div>
        </div>}


        {isCreateOpen && (
          <CreateModal
            onClose={this.toggleCreate}
            onStatusChange={onStatusChange}
          />
        )}

        {/* {isActiveStash && <><div className={'titleRow'}>
          My Nomination
        </div>
          <div className="ui--accounts-box">
            {this.renderNominee()}
          </div>
        </>
        } */}

        {controllerId && <>
          <div className={'titleRow'}>
            Account
          </div>
          <div className="ui--accounts-box">
            {this.renderStashId()}
            {this.renderControllerId()}
            {this.renderRewardId()}
            {this.renderSessionId()}
            {this.renderLinkedAccountEmpty()}
          </div>
        </>}
      </StyledWrapper >
    );
  }

  private renderStatus() {

    const { controllerId, validators, controllers, stashId } = this.state;
    const { staking_info } = this.props;

    if (!validators) {
      return null;
    }

    const next = controllers.filter((address) =>
      !validators.includes(address)
    );

    if (!staking_info || !staking_info.stakers || !validators.includes(controllerId) && !next.includes(controllerId)) {
      return null;
    }

    return (
      <div className="validatingBox">
        {validators.includes(stashId) && <p>Validating ({staking_info.stakers.others.length} Nominators)</p>}
        {next.includes(stashId) && <p>Next up ({staking_info.stakers.others.length} Nominators)</p>}
      </div>
    );
  }

  private renderSetValidatorPrefs() {
    const { controllerId, isValidateOpen, stashId, validatorPrefs, isValidateOpenWithStep } = this.state;
    const { nodeName } = this.props

    // if (!controllerId || !validatorPrefs || !stashId) {
    //   return null;
    // }

    if (!controllerId || !stashId) {
      return null;
    }

    return (
      <>
        <Validate
          controllerId={controllerId}
          isOpen={isValidateOpen}
          onClose={this.toggleValidate}
          stashId={stashId}
          validatorPrefs={validatorPrefs}
          nodeName={nodeName}
        />
        <Validate
          controllerId={controllerId}
          isOpen={isValidateOpenWithStep}
          onClose={this.toggleValidateWithStep}
          withStep
          stashId={stashId}
          validatorPrefs={validatorPrefs}
          nodeName={nodeName}
        />
      </>
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

  private toggleCreate = (): void => {
    this.setState(({ isCreateOpen }) => ({
      isCreateOpen: !isCreateOpen
    }));
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
          checkSameController={true}
        />
        <Bond
          accountId={accountId}
          controllerId={controllerId}
          isOpen={isBondOpenWithStep}
          onClose={this.toggleBondWithStep}
          checkSameController={true}
          withStep
          onSuccess={() => {
            this.toggleBondWithStep();
            this.toggleSessionKeyWithStep();
          }}
        />
      </>
    );
  }

  private renderBondExtra() {
    const { accountId } = this.props;
    const { controllerId, isBondExtraOpen, stashId } = this.state;

    return (
      <BondExtra
        accountId={stashId || accountId}
        controllerId={controllerId}
        isOpen={isBondExtraOpen}
        onClose={this.toggleBondExtra}
      />
    );
  }

  private renderUnbond() {
    const { controllerId, isUnbondOpen, stashId } = this.state;

    return (
      <Unbond
        controllerId={controllerId || stashId}
        isOpen={isUnbondOpen}
        onClose={this.toggleUnbond}
      />
    );
  }

  private renderValidating() {
    const { accountId, nodeName } = this.props;
    const { isValidatingOpen, stashId, validatorPrefs, controllerId } = this.state;
    // console.log(validatorPrefs, isValidatingOpen, stashId)
    // if (!validatorPrefs || !isValidatingOpen || !stashId) {
    //   return null;
    // }

    if (!isValidatingOpen || !stashId) {
      return null;
    }

    return (
      <Validating
        accountId={controllerId}
        isOpen
        onClose={this.toggleValidating}
        stashId={stashId}
        validatorPrefs={validatorPrefs}
        nodeName={nodeName}
      />
    );
  }

  private renderSessionKey() {
    const { accountId } = this.props;
    const { isSessionKeyOpen, isSessionKeyOpenWithStep, stashId, controllerId } = this.state;

    if (!stashId) {
      return null;
    }

    return (
      <>
        <SessionKey
          accountId={controllerId}
          isOpen={isSessionKeyOpen}
          onClose={this.toggleSessionKey}
          stashId={stashId}
        />
        <SessionKey
          accountId={controllerId}
          isOpen={isSessionKeyOpenWithStep}
          onClose={this.toggleSessionKeyWithStep}
          withStep
          onSuccess={() => {
            this.toggleSessionKeyWithStep();
            this.toggleValidateWithStep();
          }}
          stashId={stashId}
        />
      </>
    );
  }

  private renderNominee() {
    const { recentlyOffline, t } = this.props;
    const { nominators, isActiveStash } = this.state;

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
        {/* <label className='staking--label'>{t('nominating')}</label> */}
        {
          nominators.map((nomineeId, index) => (
            // <AddressMini
            //   key={index}
            //   value={nomineeId}
            //   offlineStatus={recentlyOffline[nomineeId.toString()]}
            //   withBalance={false}
            //   withBonded
            // />
            <div className="staking--box" key={index}>
              <AddressRow
                // key={`${nomineeId}-nominee`}
                value={nomineeId}
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
        {/* <label className='staking--label'>{t('controller')}</label> */}
        {/* <AddressMini
          value={controllerId}
          offlineStatus={recentlyOffline[controllerId]}
        /> */}
        <AddressRow
          value={controllerId}
          suffixName={t('(controller)')}
          className="ui--AddressRow"
        >
          <Button
            isBasic
            isSecondary
            onClick={this.toggleSetControllerAccount}
            label={t('Change')}
          />
        </AddressRow>
      </div>
    );
  }

  private renderRewardId() {
    const { destination } = this.state;
    const { t } = this.props;
    const { isActiveSession, sessionId, controllerId, stashId } = this.state;

    // if (!sessionId || isActiveSession) {
    //   return null;
    // }

    return (
      <div className='staking--Account-detail'>
        {/* <label className='staking--label'>{t('reward')}</label> */}
        {/* <AddressMini value={sessionId} /> */}
        <AddressRow
          // buttons={this.renderButtons()}
          suffixName={'(reward)'}
          value={destination === 0 ? stashId : controllerId}
          className="ui--AddressRow"
        >
          <Button
            isBasic
            isSecondary
            onClick={this.toggleSetRewardDestination}
            label={t('Change')}
          />
        </AddressRow>
      </div>
    );
  }

  private renderSessionId() {
    const { t } = this.props;
    const { isActiveSession, sessionId } = this.state;
    // console.log('renderSessionId', sessionId)
    if (!sessionId || isActiveSession) {
      return (
        <div className='staking--Account-detail'>

          <AddressRow
            value={''}
            suffixName={'(Session)'}
            className="ui--AddressRow"
          >
            <Button
              isBasic
              isSecondary
              onClick={this.toggleSetSessionAccount}
              label={t('Add')}
            />
          </AddressRow>
        </div>
      );;
    }

    return (
      <div className='staking--Account-detail'>
        <AddressRow
          suffixName={t('(session)')}
          value={sessionId}
          className="ui--AddressRow"
        >
          <Button
            isBasic
            isSecondary
            onClick={this.toggleSetSessionAccount}
            label={t('Change')}
          />
        </AddressRow>
      </div>
    );
  }

  private renderStashId() {
    const { recentlyOffline, t } = this.props;
    const { isActiveStash, stashId } = this.state;

    if (!stashId) {
      return null;
    }

    return (
      <div className='staking--Account-detail'>
        {/* <label className='staking--label'>{t('stash')}</label> */}
        <AddressRow
          suffixName={t('(stash)')}
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

      />
    );
  }
  private renderControllerButtons1() {
    const { controllerId, isActiveController } = this.state;

    return (
      <NodeController accountId={controllerId} />
    );
  }

  private renderControllerButtons() {
    const { t } = this.props;
    const { isActiveStash, isActiveController, nominators, sessionId, stakingLedger, validatorPrefs, isSettingPopupOpen, isValidator, controllerId } = this.state;
    const buttons = [];

    if (isActiveController) {
      // console.log('nominators', nominators)
      // console.log('validatorPrefs', validatorPrefs)
      const isNominating = !!nominators && nominators.length;
      // const isValidating = !!validatorPrefs && !validatorPrefs.isEmpty;
      const isValidating = !!validatorPrefs;
      
      // if we are validating/nominating show stop
      if (isValidating || isNominating) {
        // if (isValidator) {
        buttons.push(
          <TxButton
            accountId={controllerId}
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
            key='validatorPre'
            onClick={this.toggleValidate}
            label={t('Set Validator Preferences')}
          />
        );
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
      }
    }

    return (
      <Button.Group>
        {buttons}
      </Button.Group>
    );
  }

  private renderBondButtons() {
    const { t } = this.props;
    const { isActiveStash, isActiveController, nominators, sessionId, stashId, stakingLedger, validatorPrefs, isSettingPopupOpen, staking_ledger } = this.state;
    const buttons = [];
    // console.log('renderBondButtons', stashId, staking_ledger)
    if (stashId) {
      // only show a "Bond Additional" button if this stash account actually doesn't bond everything already
      // staking_ledger.total gives the total amount that can be slashed (any active amount + what is being unlocked)
      // if (balances_all && stakingLedger && stakingLedger.total && (balances_all.freeBalance.gt(stakingLedger.total))) {
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
      }
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

  private toggleSessionKeyWithStep = () => {
    this.setState(({ isSessionKeyOpenWithStep }) => ({
      isSessionKeyOpenWithStep: !isSessionKeyOpenWithStep
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

  private toggleValidateWithStep = () => {
    this.setState(({ isValidateOpenWithStep }) => ({
      isValidateOpenWithStep: !isValidateOpenWithStep
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
  Account,
  translate,
  withCalls<Props>(
    ['derive.staking.info', { paramName: 'accountId' }],
    'derive.staking.controllers',
    ['query.staking.validators', { paramName: 'accountId' }],
    ['query.staking.payee', { paramName: 'stashId' }],
    'query.session.validators',
  ),
  // withObservable(accountObservable.subject, { propName: 'accounts' })
);