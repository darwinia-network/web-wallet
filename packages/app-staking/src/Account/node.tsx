// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountFilter, RecentlyOfflineMap } from '../types';
import { AccountId, Exposure, StakingLedger, ValidatorPrefs, VectorAny, Option, Compact, Bytes } from '@polkadot/types';
import { ApiProps } from '@polkadot/ui-api/types';
import { DerivedBalances, DerivedBalancesMap, DerivedStaking } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { KeyringSectionOption } from '@polkadot/ui-keyring/options/types';

import React from 'react';
import { AddressInfo, AddressMini, AddressRow, Button, ColorButton, Card, TxButton, Menu, AddressInfoStaking } from '@polkadot/ui-app';
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

type Props = ApiProps & I18nProps & {
  accountId: string,
  balances: DerivedBalancesMap,
  filter: AccountFilter,
  // isValidator: boolean,
  recentlyOffline: RecentlyOfflineMap,
  balances_all?: DerivedBalances,
  staking_info?: DerivedStaking,
  stashOptions: Array<KeyringSectionOption>,
  kton_freeBalance: BN,
  session_validators?: Array<AccountId>,
  staking_controllers?: [Array<AccountId>, Array<Option<AccountId>>],
  onStatusChange: () => void,
  staking_validators: any,
  staking_nominators: any,

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
  staking_ledger: stakingLedgerType,
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
`

class Account extends React.PureComponent<Props, State> {
  state: State = {
    destination: 1,
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
    staking_nodeName: null
  };

  // static getDerivedStateFromProps({ accountId, staking_info, staking_controllers = [[], []], session_validators = [], staking_validators }: Props): Pick<State, never> | null {

  //   if (!staking_info) {
  //     return null;
  //   }

  //   const { controllerId, nextSessionId, nominators, rewardDestination, stakers, stakingLedger, stashId, validatorPrefs } = staking_info;
  //   const isStashNominating = nominators && nominators.length !== 0;
  //   const isStashValidating = !!validatorPrefs && !validatorPrefs.isEmpty && !isStashNominating;



  //   // console.log('getDerivedStateFromProps', accountId,toIdString(controllerId), nominators)
  //   return {
  //     controllerId: toIdString(controllerId),
  //     destination: rewardDestination && rewardDestination.toNumber(),
  //     isActiveController: accountId === toIdString(controllerId),
  //     // isActiveController: false,
  //     isActiveSession: accountId === toIdString(nextSessionId),
  //     isActiveStash: accountId === toIdString(stashId),
  //     isStashNominating,
  //     isStashValidating,
  //     nominators,
  //     sessionId: toIdString(nextSessionId),
  //     stakers,
  //     stakingLedger,
  //     stashId: toIdString(stashId),
  //     validatorPrefs,

  //     controllers: staking_controllers[1].filter((optId) => optId && optId.isSome).map((accountId) =>
  //       accountId.unwrap().toString()
  //     ),
  //     validators: session_validators.map((authorityId) =>
  //       authorityId.toString()
  //     ),
  //   };
  // }

  static getDerivedStateFromProps({ accountId, staking_info, staking_nominators, staking_controllers = [[], []], session_validators = [], staking_validators }: Props): Pick<State, never> | null {
    console.log('getDerivedStateFromProps', staking_info, accountId);
    console.log('staking_validators', staking_validators)
    // const { nextSessionId, stakingLedger, validatorPrefs } = staking_info;
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

    let stashId = null;
    let controllerId = null;
    let rewardDestination = null
    let nextSessionId = null
    let stakingLedger = null
    let validatorPrefs = null
    let staking_ledger = null
    let staking_nodeName = null
    // let staking_validators = null


    // const apis = new Promise((resolve, reject) => {
    api.queryMulti([
      [api.query.staking.bonded, accountId], // try to map to controller
      [api.query.staking.ledger, accountId]
    ], (re) => {
      // console.log(222,(re as VectorAny<Option<any>>))
      const [account, ledger] = (re as VectorAny<Option<any>>)
      const ledgerWrap = ledger && ledger.isSome && ledger.unwrap() || null

      console.log('ledgerWrap', ledgerWrap)
      stashId = ledgerWrap ? ledgerWrap.stash : "";
      if (stashId) {
        controllerId = accountId
      } else {
        controllerId = (account && account.isNone) ? "" : account;
      }

      console.log('controllerId', controllerId, toIdString(controllerId), ledgerWrap)

      if (!controllerId) {
        // resolve(0)
        return;
      }

      api.queryMulti([
        [api.query.session.nextKeyFor, toIdString(controllerId)],
        // [api.query.staking.nominators, stashId],
        // [api.query.staking.payee, stashId],
        // [api.query.staking.stakers, stashId],
        [api.query.staking.validators, toIdString(controllerId)],
        [api.query.staking.ledger, toIdString(controllerId) || accountId],
        [api.query.staking.nodeName, toIdString(controllerId) || accountId],
      ], (re) => {
        console.log('result', re)
        const [nextKeyFor, vp, ledger, nodeName] = (re as VectorAny<Option<any>>)
        // const [nextKeyFor, ledger] = re;
        const ledgerWrap = ledger && ledger.isSome && ledger.unwrap() || null;
        stashId = ledgerWrap ? ledgerWrap.stash : "";
        validatorPrefs = filterValidatorPrefs(staking_validators, stashId);
        console.log('ledger', nextKeyFor, toIdString(nextKeyFor.unwrapOr(null)), staking_validators, validatorPrefs, ledger, toIdString(stashId))
        console.log('nodeName', nodeName)
        staking_ledger = ledger
        nextSessionId = nextKeyFor
        staking_nodeName = nodeName
        // resolve(1)
        // staking_validators = stakingValidators
      })
    })
    // })

    // const result = await apis
    // console.log('api-result', result)
    // return
    // if (!staking_info) {
    //   return null;
    // }

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
    console.log(99001, controllerId, toIdString(controllerId), stashId)
    const validators = staking_validators && staking_validators[0].map((authorityId) =>
      authorityId.toString()
    )
    console.log('validators', validators)
    console.log('controllers', staking_controllers[1].filter((optId) => optId && optId.isSome).map((accountId) =>
      accountId.unwrap().toString()
    ))
    // console.log(validators && validators.some((id) => {
    //   console.log(id, toIdString(stashId))
    //   return id === toIdString(stashId)
    // }))
    // console.log('getDerivedStateFromProps', accountId,toIdString(controllerId), nominators)
    console.log('nextSessionId', nextSessionId)
    const nextSessionIdUnwrap = nextSessionId && nextSessionId.isSome && nextSessionId.unwrapOr({})
    return {
      controllerId: toIdString(controllerId),
      destination: rewardDestination && rewardDestination.toNumber(),
      isActiveController: toIdString(controllerId),
      // isActiveController: false,
      isActiveSession: accountId === toIdString(nextSessionId),
      isActiveStash: accountId === toIdString(stashId),
      isStashNominating,
      isStashValidating,
      nominators,
      sessionId: toIdString(nextSessionIdUnwrap && nextSessionIdUnwrap.grandpaKey),
      // stakers,
      stakingLedger,
      stashId: toIdString(stashId),
      validatorPrefs,
      controllers: staking_controllers[1].filter((optId) => optId && optId.isSome).map((accountId) =>
        accountId.unwrap().toString()
      ),
      validators: validators,
      staking_ledger: staking_ledger,
      isValidator: validators && validators.some((id) => {
        return id === toIdString(stashId)
      }),
      staking_nodeName
    }
  }

  componentDidUpdate() {

  }

  render() {
    // @ts-ignore
    const { accountId, filter, kton_freeBalance, session_validators, onStatusChange } = this.props;
    const { controllerId, isActiveController, isActiveStash, stashId, nominators, validatorPrefs, validators, controllers, isCreateOpen, sessionId } = this.state;
    console.log('render1', controllerId, isActiveController, isActiveStash, stashId, nominators, validatorPrefs, validators, controllers, isCreateOpen, sessionId)

    if ((filter === 'controller' && isActiveController) || (filter === 'stash' && isActiveStash) || (filter === 'unbonded' && (controllerId || stashId))) {
      return null;
    }

    const isNominating = !!nominators && nominators.length;
    const isValidating = !!validatorPrefs && !validatorPrefs.isEmpty;

    // const next = controllers.filter((address) =>
    //   !validators.includes(address)
    // );

    console.log('render', controllerId, stashId, isNominating)
    console.log('status', isActiveStash, isNominating, isValidating, sessionId)

    if ((controllerId == stashId && controllerId != null) || isNominating) {
      return (
        <StyledWrapper>
          <div className={'titleRow'}>
            Note
          </div>
          <div className="ui--string-now">
            <h1>Sorry！</h1>
            <p>You are in the status of a node and cannot be a nominators for now.</p>
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
            <p className="nodeName">Validators Node</p>
            {this.renderStatus()}
            <div className="splitSpace"></div>
            {this.renderControllerButtons()}
          </div>
          <div className={'titleRow'}>
            Nomination share
          </div>
          <AddressInfoStaking
            // value={stashId || accountId}
            value={controllerId || accountId}
            withBalance={true}
            buttons={this.renderBondButtons()}
            isReadyStaking={controllerId}
          />
        </div>
        {!stashId && !isNominating && !isValidating && !sessionId && <div>
          <div className={'titleRow'}>Start a KTON staking</div>
          <div className="ui--string-now">
            <h1>Start a KTON staking</h1>
            <p>note: </p>
            <p>
              1. Please make sure you have 2 available accounts. <a className="ui-addaccount" onClick={this.toggleCreate}>ADD ACCOUNT</a><br />
              2. Please make sure that there are a few ring in the account as gas fee.<br />
              3. After the kton is bonded,  you can apply to become a verifier or vote for the verifier and get earnings from it<br />
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

        {controllerId !== null && <>
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

        {/* <div className="ui--accounts-link">
          <div>
            <div className={'titleRow'}>
              Linked account
            </div>
            <div className="ui--accounts-box">
              {this.renderControllerId()}
              {this.renderStashId()}
              {this.renderSessionId()}
              {this.renderLinkedAccountEmpty()}
            </div>
          </div>
          <div className="nominatingBox">
            <div className={'titleRow'}>
              Nominating
            </div>
            <div className="ui--accounts-box">
              {this.renderNominee()}
            </div>
          </div>
        </div> */}

        {/* <AddressRow
          buttons={this.renderButtons()}
          value={accountId}
        >
          <AddressInfo
            withBalance
            value={accountId}
          >
            <div className='staking--Account-links'>
              {this.renderControllerId()}
              {this.renderStashId()}
              {this.renderSessionId()}
              {this.renderNominee()}
            </div>
          </AddressInfo>
        </AddressRow> */}
      </StyledWrapper >
    );
  }

  private renderStatus() {

    const { controllerId, validators, controllers } = this.state;
    const { staking_info } = this.props;

    if (!validators) {
      return null;
    }

    const next = controllers.filter((address) =>
      !validators.includes(address)
    );

    if (!staking_info || !validators.includes(controllerId) && !next.includes(controllerId)) {
      return null;
    }

    return (
      <div className="validatingBox">
        {validators.includes(controllerId) && <p>validating ({staking_info.stakers.others.length} Nominators)</p>}
        {next.includes(controllerId) && <p>next up ({staking_info.stakers.others.length} Nominators)</p>}
      </div>
    );
  }

  private renderSetValidatorPrefs() {
    const { controllerId, isValidateOpen, stashId, validatorPrefs, isValidateOpenWithStep } = this.state;

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
        />
        <Validate
          controllerId={controllerId}
          isOpen={isValidateOpenWithStep}
          onClose={this.toggleValidateWithStep}
          withStep
          stashId={stashId}
          validatorPrefs={validatorPrefs}
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
    const { accountId } = this.props;
    const { isValidatingOpen, stashId, validatorPrefs, controllerId } = this.state;
    console.log(validatorPrefs, isValidatingOpen, stashId)
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

    if (!sessionId || isActiveSession) {
      return null;
    }

    return (
      <div className='staking--Account-detail'>
        {/* <label className='staking--label'>{t('reward')}</label> */}
        {/* <AddressMini value={sessionId} /> */}
        <AddressRow
          // buttons={this.renderButtons()}
          suffixName={'(reward)'}
          value={destination === 1 ? stashId : controllerId}
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
    console.log('renderSessionId', sessionId)
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
    const { accountId, balances_all, t } = this.props;
    const { isActiveStash, isActiveController, nominators, sessionId, stakingLedger, validatorPrefs, isSettingPopupOpen, isValidator, controllerId } = this.state;
    const buttons = [];

    if (isActiveController) {
      console.log('nominators', nominators)
      console.log('validatorPrefs', validatorPrefs)
      const isNominating = !!nominators && nominators.length;
      const isValidating = !!validatorPrefs && !validatorPrefs.isEmpty;

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
            label={
              isNominating
                ? t('Stop Nominating')
                : t('Stop Validating')
            }
            key='stop'
            tx='staking.chill'
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
        // buttons.push(
        //   <Button
        //     isBasic={true}
        //     isSecondary={true}
        //     key='nominate1'
        //     onClick={this.toggleNominate}
        //     label={t('Nominate')}
        //   />
        // );
      }
    }

    return (
      <Button.Group>
        {buttons}
      </Button.Group>
    );
  }


  private renderBondButtons() {
    const { accountId, balances_all, t } = this.props;
    const { isActiveStash, isActiveController, nominators, sessionId, stashId, stakingLedger, validatorPrefs, isSettingPopupOpen, staking_ledger } = this.state;
    const buttons = [];
    console.log('renderBondButtons', stashId, staking_ledger)
    if (stashId) {
      // only show a "Bond Additional" button if this stash account actually doesn't bond everything already
      // staking_ledger.total gives the total amount that can be slashed (any active amount + what is being unlocked)
      // if (balances_all && stakingLedger && stakingLedger.total && (balances_all.freeBalance.gt(stakingLedger.total))) {
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
            isNegative
            label={
              isNominating
                ? t('Stop Nominating')
                : t('Stop Validating')
            }
            key='stop'
            tx='staking.chill'
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
  styled(Account as React.ComponentClass<Props>)`
   
  `,
  translate,
  withCalls<Props>(
    ['derive.staking.info', { paramName: 'accountId' }],
    'derive.staking.controllers',
    ['query.staking.validators', { paramName: 'accountId' }],
    'query.session.validators',
    // 'query.staking.recentlyOffline',
    ['derive.balances.all', { paramName: 'accountId' }],
    ['query.kton.freeBalance', { paramName: 'accountId' }],

  ),
  // withObservable(accountObservable.subject, { propName: 'accounts' })
);