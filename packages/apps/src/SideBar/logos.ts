// Copyright 2017-2019 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import polkadotLogo from '@polkadot/ui-assets/polkadot-white.svg';
import polkadotSmall from '@polkadot/ui-assets/notext-polkadot.svg';
import substrateLogo from '@polkadot/ui-assets/parity-substrate-white.svg';
import darwiniaLogo from '../assets/darwinia-white-logo.svg'

import substrateSmall from '@polkadot/ui-assets/notext-parity-substrate-white.svg';
import settings from '@polkadot/ui-settings';

type LogoMap = Map<string, any>;

const LOGOS_NORMAL: LogoMap = new Map([
  ['polkadot', polkadotLogo],
  ['substrate', substrateLogo],
  ['darwiniaLogo', darwiniaLogo]
]);

const LOGOS_SMALL: LogoMap = new Map([
  ['polkadot', polkadotSmall],
  ['substrate', substrateSmall],
  ['darwiniaLogo', darwiniaLogo]
]);

export default function getLogo (isSmall: boolean) {
  return isSmall
    ? (darwiniaLogo)
    : (darwiniaLogo);
}
