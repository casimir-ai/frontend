/* eslint-disable no-unused-vars */
import { APP_CMD } from '@deip/constants';
import { assert, isNumber } from '@deip/toolbox';
import ProtocolEntityCmd from '../base/ProtocolEntityCmd';

/**
 * @typedef {{entityId: string} & import('@casimir/platform-core').FungibleTokenCreateData} FungibleTokenCreateCmdPayload
 */

/**
 * Create fungible token command
 * @extends ProtocolEntityCmd
 */
class CreateFungibleTokenCmd extends ProtocolEntityCmd {
  /**
   * Create fungible token
   * @param {FungibleTokenCreateCmdPayload} cmdPayload
   */
  constructor(cmdPayload) {
    const {
      entityId,
      issuer,
      symbol,
      precision,
      minBalance,
      description,
      projectTokenSettings
    } = cmdPayload;

    assert(!!issuer, "'issuer' is required");
    assert(!!symbol, "'symbol' is required");
    assert(isNumber(precision), "'precision' must be a number");

    if (projectTokenSettings) { // keep this until we have working F-NFT
      const { projectId, teamId, licenseRevenue } = projectTokenSettings;
      assert(!!projectId, "'projectId' is required for project token");
      assert(!!teamId, "'teamId' is required for project token");

      if (licenseRevenue) {
        const { holdersShare } = licenseRevenue;
        assert(!!holdersShare, "'holdersShare' is required for project 'licenseRevenue' option");
      }
    }

    super(APP_CMD.CREATE_FT, cmdPayload);
  }
}

export default CreateFungibleTokenCmd;
