// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { AccountFilter, ComponentProps } from './types';

import React from 'react';
import { getAddressName } from '@polkadot/ui-app/util';
import keyring from '@polkadot/ui-keyring';
import createOption from '@polkadot/ui-keyring/options/item';
import styled from 'styled-components';

import Account from './Account/node';
import translate from './translate';
import { KeyringSectionOption } from '@polkadot/ui-keyring/options/types';
import { Bytes } from '@polkadot/types';

type Props = I18nProps & ComponentProps &{
  accountMain: string,
  stashId?: string,
  controllerId?: string
  onStatusChange: () => void,
  sessionKey?: string,
  ledger?: any,
  nodeName?: Bytes
};

type State = {
  filter: AccountFilter
};

class Accounts extends React.PureComponent<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);

    const { t } = props;

    this.state = {
      filter: 'all'
    };
  }

  render() {
    const { balances, recentlyOffline, t, validators , accountMain, onStatusChange,stashId, controllerId, ledger, sessionKey, nodeName} = this.props;

    const { filter } = this.state;
    const accounts = keyring.getAccounts();
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
          onStatusChange={onStatusChange}
          ledger={ledger}
          sessionKey={sessionKey}
          nodeName={nodeName}
        />
      </StyledWrapper>
    );
  }

  private getStashOptions(): Array<KeyringSectionOption> {
    const { stashes } = this.props;

    return stashes.map((stashId) =>
      createOption(stashId, getAddressName(stashId))
    );
  }
}

const StyledWrapper = styled.div`
  margin-top: 10px;
`

export default translate(Accounts);
