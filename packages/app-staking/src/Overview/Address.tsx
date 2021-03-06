// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DerivedBalancesMap, DerivedStaking } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { ValidatorFilter, RecentlyOfflineMap } from '../types';

import React from 'react';
import { AccountId, Balance, Exposure, Bytes } from '@polkadot/types';
import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AddressMini, AddressRow, RecentlyOffline } from '@polkadot/ui-app';
import keyring from '@polkadot/ui-keyring';
import { formatBalance } from '@polkadot/util';
import { u8aToU8a, u8aToString, u8aToHex } from '@polkadot/util'
import { api } from '@polkadot/ui-api'
import translate from '../translate';

function toIdString(id?: AccountId | null): string | null {
  return id
    ? id.toString()
    : null;
}

function filterValidatorPrefs(validators, stashId) {
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

type Props = I18nProps & {
  address: string,
  balances: DerivedBalancesMap,
  defaultName: string,
  lastAuthor: string,
  lastBlock: string,
  recentlyOffline: RecentlyOfflineMap,
  filter: ValidatorFilter,
  staking_info?: DerivedStaking,
  staking_ringPool?: Balance,
  stakingValidators?: any
};

type State = {
  controllerId: string,
  stashActive: string | null,
  stashTotal: string | null,
  sessionId: string | null,
  stakers?: Exposure,
  stashId: string | null,
  badgeExpanded: boolean,
  nodeName?: string,
  validatorPrefs?: any
};

class Address extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    this.state = {
      controllerId: props.address,
      sessionId: null,
      stashActive: null,
      stashId: null,
      stashTotal: null,
      badgeExpanded: false,
      nodeName: '',
      validatorPrefs: null
    };
  }

  static getDerivedStateFromProps ({ staking_info, stakingValidators }: Props, prevState: State): State | null {
    if (!staking_info) {
      return null;
    }

    let validatorPrefs = null
    

    const { controllerId, nextSessionId, stakers, stashId, stakingLedger } = staking_info;

    if(stakingValidators){
      validatorPrefs = filterValidatorPrefs(stakingValidators, stashId)
    }
    return {
      controllerId: controllerId && controllerId.toString(),
      sessionId: nextSessionId && nextSessionId.toString(),
      stashActive: stakingLedger
        ? formatBalance(stakingLedger.active)
        : prevState.stashActive,
      stakers,
      stashId: stashId && stashId.toString(),
      stashTotal: stakingLedger
        ? formatBalance(stakingLedger.total)
        : prevState.stashTotal,
      validatorPrefs: validatorPrefs
    } as State;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.stashId !== this.state.stashId && this.state.stashId) {

      api.query.staking.nodeName(this.state.controllerId).then((nodeName) => {
        this.setState({
          nodeName: (nodeName && !nodeName.isEmpty) ? u8aToString(nodeName.toU8a(true)) : ''
        })
      })
    }
  }

  render () {
    const { address, defaultName, lastAuthor, lastBlock, filter } = this.props;
    const { controllerId, stakers, stashId, nodeName, validatorPrefs } = this.state;
    const isAuthor = [address, controllerId, stashId].includes(lastAuthor);
    const bonded = stakers && !stakers.own.isZero()
      ? [stakers.own, stakers.total.sub(stakers.own)]
      : true;

    if ((filter === 'hasNominators' && !this.hasNominators())
        || (filter === 'noNominators' && this.hasNominators())
        || (filter === 'hasWarnings' && !this.hasWarnings())
        || (filter === 'noWarnings' && this.hasWarnings())
        || (filter === 'iNominated' && !this.iNominated())) {
      return null;
    }


    return (
      <article key={stashId || controllerId}>
        <AddressRow
          buttons={this.renderKeys()}
          defaultName={defaultName}
          nodeName={nodeName}
          value={stashId}
          withBalance={{ bonded }}
          validatorPrefs={validatorPrefs}
        >
          {this.renderNominators()}
        </AddressRow>
        {this.renderOffline()}
        {
          isAuthor && stashId
            ? <div className='blockNumber'>#{lastBlock}</div>
            : null
        }
      </article>
    );
  }

  private renderKeys () {
    const { t } = this.props;
    const { controllerId, sessionId } = this.state;
    const isSame = controllerId === sessionId;

    return (
      <div className='staking--accounts-info'>
        {controllerId
          ? (
            <div>
              <label className='staking--label'>{
                isSame
                  ? t('controller/session')
                  : t('controller')
              }</label>
              <AddressMini value={controllerId} />
            </div>
          )
          : null
        }
        {!isSame && sessionId
          ? (
            <div>
              <label className='staking--label'>{t('session')}</label>
              <AddressMini value={sessionId} />
            </div>
          )
          : null
        }
      </div>
    );
  }

  private getNominators () {
    const { stakers } = this.state;

    return stakers
      ? stakers.others.map(({ who, value }): [AccountId, Balance] => [who, value])
      : [];
  }

  private iNominated () {
    const nominators = this.getNominators();
    const myAddresses = keyring.getAccounts().map(({ address }) => address);

    return nominators.some(([who]) =>
      myAddresses.includes(who.toString())
    );
  }

  private hasNominators () {
    const nominators = this.getNominators();

    return !!nominators.length;
  }

  private hasWarnings () {
    const { recentlyOffline } = this.props;
    const { stashId } = this.state;

    if (!stashId || !recentlyOffline[stashId]) {
      return false;
    }

    return true;
  }

  private renderNominators () {
    const { t, staking_ringPool } = this.props;
    const nominators = this.getNominators();

    if (!nominators.length) {
      return null;
    }

    return (
      <details>
        <summary>
          {t('Nominators ({{count}})', {
            replace: {
              count: nominators.length
            }
          })}
        </summary>
        {nominators.map(([who, bonded]) =>
          <AddressMini
            bonded={bonded}
            ringPool={staking_ringPool}
            key={who.toString()}
            value={who}
            withBonded
          />
        )}
      </details>
    );
  }

  private renderOffline () {
    const { recentlyOffline } = this.props;
    const { stashId } = this.state;

    if (!stashId || !recentlyOffline[stashId]) {
      return null;
    }

    const offline = recentlyOffline[stashId];

    return (
      <RecentlyOffline
        accountId={stashId}
        offline={offline}
        tooltip
      />
    );
  }
}

export default withMulti(
  Address,
  translate,
  withCalls<Props>(
    ['derive.staking.info', { paramName: 'address' }],
    'query.staking.ringPool'
  )
);
