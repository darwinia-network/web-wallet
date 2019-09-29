// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { AccountFilter, ComponentProps } from './types';

import React from 'react';
import { CardGrid, Dropdown, FilterOverlay } from '@polkadot/ui-app';
import { getAddressName } from '@polkadot/ui-app/util';
import keyring from '@polkadot/ui-keyring';
import createOption from '@polkadot/ui-keyring/options/item';
import styled from 'styled-components';

import Account from './Account';
import translate from './translate';
import { KeyringSectionOption } from '@polkadot/ui-keyring/options/types';

type Props = I18nProps & ComponentProps & {
  accountMain: string,
  stashId?: string,
  controllerId?: string
};

type State = {
  filter: AccountFilter,
  filterOptions: Array<{ text: React.ReactNode, value: AccountFilter }>
};

class Accounts extends React.PureComponent<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);

    const { t } = props;

    this.state = {
      filter: 'all',
      filterOptions: [
        { text: t('Show all accounts'), value: 'all' },
        { text: t('Show all unbonded'), value: 'unbonded' },
        { text: t('Show only stashes'), value: 'stash' },
        { text: t('Show only controllers'), value: 'controller' }
      ]
    };
  }

  render() {
    const { balances, recentlyOffline, t, validators, accountMain , stashId, controllerId} = this.props;

    const { filter, filterOptions } = this.state;
    const stashOptions = this.getStashOptions();
    
    return (
      <StyledWrapper>
        {/* 
  // @ts-ignore */}
        <Account
          accountId={accountMain}
          stashId={stashId}
          controllerId={controllerId}
          balances={balances}
          filter={filter}
          isValidator={validators.includes(accountMain)}
          key={accountMain}
          recentlyOffline={recentlyOffline}
          stashOptions={stashOptions}
        />

        {/* {accounts.map((account) => {
            const address = account.address();

            return (
              <Account
                accountId={address}
                balances={balances}
                filter={filter}
                isValidator={validators.includes(address)}
                key={address}
                recentlyOffline={recentlyOffline}
                stashOptions={stashOptions}
              />
            );
          })} */}

      </StyledWrapper>
    );
  }

  private getStashOptions(): Array<KeyringSectionOption> {
    const { stashes } = this.props;

    return stashes.map((stashId) =>
      createOption(stashId, getAddressName(stashId))
    );
  }

  private onChangeFilter = (filter: AccountFilter): void => {
    this.setState({ filter });
  }
}

const StyledWrapper = styled.div`
  margin-top: 10px;
`

export default translate(Accounts);
