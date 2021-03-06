// Copyright 2017-2019 @polkadot/types authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default {
  types: {
    SessionIndex: 'u32',
    SessionKey: 'AuthorityId',
    SessionKeys: {
      grandpaKey: 'SessionKey',
      auraKey: 'SessionKey'
    },
    Keys: 'SessionKeys',

    // this needs to be moved to primitives (runtime, support)
    KeyTypeId: 'u32'
  }
};
