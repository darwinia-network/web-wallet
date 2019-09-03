// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiProps } from '@polkadot/ui-api/types';
import { DropdownOptions } from '../util/types';
import { BareProps } from '../types';

import React from 'react';
import { StorageEntry } from '@polkadot/types/primitive/StorageKey';
import { withApi } from '@polkadot/ui-api';

import Dropdown from '../Dropdown';
import { classes } from '../util';

type Props = ApiProps & BareProps & {
  isError?: boolean,
  onChange: (value: StorageEntry) => void,
  options: DropdownOptions,
  value: StorageEntry,

};

class SelectKey extends React.PureComponent<Props> {
  render() {
    const { api, className, isError, onChange, options, style, value } = this.props;

    if (!options.length) {
      return null;
    }

    const transform = (method: string): StorageEntry =>
      api.query[value.section][method] as any;

    return (
      <Dropdown
        className={classes('ui--DropdownLinked-Items', className)}
        isError={isError}
        onChange={onChange}
        options={options}
        style={style}
        transform={this.transform}
        value={value.method}
        withLabel={false}
      />
    );
  }

  private transform = (method: string): StorageEntry => {
    const { api, value } = this.props;

    // We should not get to the fallback, but ... https://github.com/polkadot-js/apps/issues/1375
    let result = api.query[value.section]
      ? api.query[value.section][method] as any
      : value;

    result.section = value.section;
    return result;
  }
}

export default withApi(SelectKey);