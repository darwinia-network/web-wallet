// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, AccountIndex, Address } from '@polkadot/types';
import { I18nProps } from './types';

import BN from 'bn.js';
import { Label } from 'semantic-ui-react';
import React from 'react';
import styled from 'styled-components';
import { withCalls, withMulti } from '@polkadot/ui-api';
import { Button, Input, InputTags } from '@polkadot/ui-app';
import BaseIdentityIcon from '@polkadot/ui-identicon';
import keyring from '@polkadot/ui-keyring';

import AddressInfo, { BalanceActiveType } from './AddressInfo';
import CopyButton from './CopyButton';
import IdentityIcon from './IdentityIcon';
import LinkPolkascan from './LinkPolkascan';
import translate from './translate';
import { classes, getAddressName, getAddressTags, toShortAddress } from './util';

export type Props = I18nProps & {
  accounts_idAndIndex?: [AccountId?, AccountIndex?],
  bonded?: BN | Array<BN>,
  buttons?: React.ReactNode,
  children?: React.ReactNode,
  defaultName?: string,
  extraInfo?: React.ReactNode,
  isEditable?: boolean,
  isInline?: boolean,
  value: AccountId | AccountIndex | Address | string | null,
  withBalance?: boolean | BalanceActiveType,
  withExplorer?: boolean,
  withIcon?: boolean,
  withIndex?: boolean,
  withTags?: boolean
};

type State = {
  address: string,
  isEditingName: boolean,
  isEditingTags: boolean,
  name: string,
  tags: string[]
};

const DEFAULT_ADDR = '5'.padEnd(16, 'x');
const ICON_SIZE = 48;

class AddressRow extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    this.state = this.createState();
  }

  static defaultProps = {
    defaultName: '<unknown>'
  };

  static getDerivedStateFromProps ({ accounts_idAndIndex = [], defaultName, value }: Props, prevState: State) {
    const [_accountId] = accounts_idAndIndex;
    const accountId = _accountId || value;
    const address = accountId
      ? accountId.toString()
      : DEFAULT_ADDR;
    const name = getAddressName(address,null, false, defaultName) || '';
    const tags = getAddressTags(address);
    const state = { tags } as State;
    let hasChanged = false;

    if (address !== prevState.address) {
      state.address = address;
      hasChanged = true;
    }

    if (!prevState.isEditingName && name !== prevState.name) {
      state.name = name;
      hasChanged = true;
    }

    return hasChanged
      ? state
      : null;
  }

  render () {
    const { accounts_idAndIndex = [], className, isInline, style } = this.props;
    const [accountId, accountIndex] = accounts_idAndIndex;
    const isValid = accountId || accountIndex;

    return (
      <div
        className={classes('ui--AddressRow', !isValid && 'invalid', isInline && 'inline', className)}
        style={style}
      >
        <div className='ui--AddressRow-base'>
          {this.renderIcon()}
          {this.renderButtons()}
          <div className='ui--AddressRow-details'>
            <div className='ui--AddressRow-data'>
              {this.renderName()}
              {this.renderAddress()}
              {this.renderAccountIndex()}
            </div>
            {this.renderBalances()}
            {this.renderTags()}
          </div>
        </div>
        {this.renderChildren()}
        {this.renderExplorer()}
      </div>
    );
  }

  private createState () {
    const { accounts_idAndIndex = [], defaultName, value } = this.props;
    const [_accountId] = accounts_idAndIndex;
    const accountId = _accountId || value;
    const address = accountId
      ? accountId.toString()
      : DEFAULT_ADDR;
    const name = getAddressName(address, null,false, defaultName) || '';
    const tags = getAddressTags(address);

    return {
      address,
      isEditingName: false,
      isEditingTags: false,
      name,
      tags
    };
  }

  protected renderAddress () {
    const { address } = this.state;

    return (
      <div className='ui--AddressRow-accountId'>
        <CopyButton
          isAddress
          value={address}
        >
          <span>{address}</span>
        </CopyButton>
      </div>
    );
  }

  protected renderButtons () {
    const { buttons } = this.props;

    return buttons
      ? <div className='ui--AddressRow-buttons'>{buttons}</div>
      : null;
  }

  protected renderExplorer () {
    const { value, withExplorer } = this.props;

    if (!withExplorer) {
      return null;
    }

    return (
      <div className='ui--AddressRow-explorer'>
        <LinkPolkascan
          className='polkascan'
          data={value}
          type='address'
        />
      </div>
    );
  }

  protected renderName () {
    const { isEditable } = this.props;
    const { isEditingName, name } = this.state;

    return isEditingName
      ? (
        <Input
          autoFocus
          className='ui--AddressRow-name-input'
          defaultValue={name}
          onBlur={this.saveName}
          onChange={this.onChangeName}
          onEnter={this.saveName}
          withLabel={false}
        />
      )
      : (
        <div
          className={classes('ui--AddressRow-name', isEditable && 'editable')}
          onClick={isEditable ? this.toggleNameEditor : undefined}
        >
          {name}
          {isEditable && this.renderEditIcon()}
        </div>
      );
  }

  protected onChangeName = (name: string) => {
    this.setState({ name });
  }

  protected onChangeTags = (tags: string[]) => {
    this.setState({ tags });
  }

  protected renderAccountIndex () {
    const { accounts_idAndIndex = [], withIndex } = this.props;
    const [, accountIndex] = accounts_idAndIndex;

    if (!accountIndex || !withIndex) {
      return null;
    }

    return (
      <div className='ui--AddressRow-accountIndex'>
        {accountIndex.toString()}
      </div>
    );
  }

  protected renderBalances () {
    const { accounts_idAndIndex = [], withBalance } = this.props;
    const [accountId] = accounts_idAndIndex;

    if (!withBalance || !accountId) {
      return null;
    }

    return (
      <div className='ui--AddressRow-balances'>
        <AddressInfo
          value={accountId}
          withBalance={withBalance}
        />
      </div>
    );
  }

  protected renderChildren () {
    const { children } = this.props;
    // we need children, or when an array, at least 1 non-empty value
    const hasChildren = !children
      ? false
      : Array.isArray(children)
        ? children.filter((child) => child).length !== 0
        : true;

    if (!hasChildren) {
      return null;
    }

    return (
      <div className='ui--AddressRow-children'>
        {children}
      </div>
    );
  }

  protected renderEditIcon () {
    return (
      <Button
        className='iconButton'
        icon='edit'
        size='mini'
        isPrimary
        key='unlock'
      />
    );
  }

  protected renderIcon () {
    const { accounts_idAndIndex = [], withIcon = true } = this.props;
    const { address } = this.state;
    const [accountId] = accounts_idAndIndex;

    if (!withIcon) {
      return null;
    }

    // Since we do queries to storage in the wrapped example, we don't want
    // to follow that route if we don't have a valid address.
    const Component = accountId
      ? IdentityIcon
      : BaseIdentityIcon;

    return (
      <Component
        className='ui--AddressRow-icon'
        size={ICON_SIZE}
        value={address}
      />
    );
  }

  protected renderSaveIcon (callback: () => void) {
    return (
      <Button
        className='saveButton'
        onClick={callback}
        icon='save'
        size='small'
        isPrimary
        key='save'
      />
    );
  }

  protected renderTags () {
    const { isEditingTags, tags } = this.state;
    const { isEditable, withTags = false } = this.props;

    if (!withTags) {
      return null;
    }

    return isEditingTags
      ? (
        <InputTags
          className='ui--AddressRow-tags-input'
          onBlur={this.saveTags}
          onChange={this.onChangeTags}
          onClose={this.saveTags}
          openOnFocus
          defaultValue = {tags}
          searchInput={{ autoFocus: true }}
          value={tags}
          withLabel={false}
        />
      )
      : (
        <div
          className={classes('ui--AddressRow-tags', isEditable && 'editable')}
          onClick={isEditable ? this.toggleTagsEditor : undefined}
        >
          {
            !tags.length
              ? (isEditable ? <span className='addTags'>add tags</span> : undefined)
              : tags.map((tag) => (
                <Label key={tag} size='tiny' color='grey'>{tag}</Label>
              ))
          }
          {isEditable && this.renderEditIcon()}
        </div>
      );
  }

  protected saveName = () => {
    const { address, name } = this.state;
    const trimmedName = name.trim();
    const meta = {
      name: trimmedName,
      whenEdited: Date.now()
    };

    // Save only if the name was changed or if it's no empty.
    if (trimmedName && address) {
      try {
        const currentKeyring = keyring.getPair(address);

        currentKeyring && keyring.saveAccountMeta(currentKeyring, meta);
      } catch (error) {
        keyring.saveAddress(address, meta);
      }

      this.setState({ isEditingName: false });
    }
  }

  protected saveTags = () => {
    const { address, tags } = this.state;
    const meta = {
      tags,
      whenEdited: Date.now()
    };

    if (address) {
      try {
        const currentKeyring = keyring.getPair(address);

        currentKeyring && keyring.saveAccountMeta(currentKeyring, meta);
      } catch (error) {
        keyring.saveAddress(address, meta);
      }

      this.setState({ isEditingTags: false });
    }
  }

  protected toggleNameEditor = () => {
    this.setState(({ isEditingName }) => ({
      isEditingName: !isEditingName
    }));
  }

  protected toggleTagsEditor = () => {
    this.setState(({ isEditingTags }) => ({
      isEditingTags: !isEditingTags
    }));
  }
}

export {
  DEFAULT_ADDR,
  AddressRow
};

export default withMulti(
  styled(AddressRow as any)`
    text-align: left;

    &.inline {
      display: flex;

      .ui--AddressRow-children {
        padding: 0 0 0 3rem;
      }
    }

    &.invalid {
      filter: grayscale(100);
      opacity: 0.5;
    }

    button.ui.icon.editButton {
      padding: 0em .3em .3em .3em;
      color: #2e86ab;
      background: none;
      /*trick to let the button in the flow but keep the content centered regardless*/
      margin-left: -2em;
      position: relative;
      right: -2.3em;
      z-index: 1;
    }

    .ui--AddressRow-accountId,
    .ui--AddressRow-accountIndex {
      font-family: monospace;
      font-size: 1.25em;
      padding: 0;
      margin-bottom: 0.25rem;
    }

    .ui--AddressRow-accountIndex {
      font-style: italic;
    }

    .ui--AddressRow-balances {
      .column {
        display: block;

        label,
        .result {
          display: inline-block;
        }
      }

      > span {
        text-align: left;
      }
    }

    .ui--AddressRow-base {
      display: flex;
    }

    .ui--AddressRow-buttons {
      position: absolute;
      right: 0.75rem;
      top: 0.75rem;
    }

    .ui--AddressRow-children {
      display: block;
      padding-top: 1rem;
    }

    .ui--AddressRow-data {
      margin: 0;
      padding: 0.25rem 0 0;
      white-space: nowrap;

      span{
        color: #B3B3B3;
        fontsize: 16px;
      }
      * {
        vertical-align: middle;
      }
    }

    .ui--AddressRow-details {
      white-space: nowrap;
    }

    .ui--AddressRow-explorer {
      content: ' ';
      margin-top: 1rem;

      .polkascan {
        position: absolute;
        bottom: 0.75rem;
        right: 1rem;
      }
    }

    .ui--AddressRow-icon {
      margin-right: 1em;
    }

    .ui--AddressRow-name {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: uppercase;
      white-space: normal;
      width: 17rem;
      color: #302B3C;
      font-size: 18px;
      font-weight: bold;
    }

    .ui--AddressRow-name-input {
      input {
        height: 1em;
        text-transform: uppercase;
        margin-top: -0.3em;
        margin-bottom: -0.35em;
      }
    }

    .ui--AddressRow-tags {
      &.editable {
        display: flex;
        flex-wrap: wrap;
        justify-content: left;

        > span {
          border: 1px #00000052 solid;
          border-radius: .5em;
          border-style: dashed;
          color: grey;
          font-size: x-small;
          padding: .1em 0.3em 0.1em 0.3em;
          margin-top: .2em;
        }

        > div.label {
          margin-top:.3em
        }
      }
    }

    .ui--AddressRow-tags-input {
      margin-bottom: -1.4em;
    }
  `,
  translate,
  withCalls<Props>(
    ['derive.accounts.idAndIndex', { paramName: 'value' }]
  )
);
