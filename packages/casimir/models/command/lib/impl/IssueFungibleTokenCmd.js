import { APP_CMD } from '@deip/constants';
import { assert, isNumber, isString } from '@deip/toolbox';
import ProtocolCmd from '../base/ProtocolCmd';

/**
 * @typedef {import('@casimir/platform-core').FungibleTokenIssueData} FungibleTokenIssueCmdPayload
 */

/**
 * Issue fungible token amount command
 * @extends ProtocolCmd
 */
class IssueFungibleTokenCmd extends ProtocolCmd {
  /**
   * Issue fungible token amount
   * @param {FungibleTokenIssueCmdPayload} cmdPayload
   */
  constructor(cmdPayload) {
    const {
      issuer,
      tokenId,
      amount,
      recipient
    } = cmdPayload;

    assert(!!issuer, "FT 'issuer' is required");
    assert(isNumber(tokenId) || isString(tokenId), "FT 'tokenId' is required");
    assert(isNumber(amount) || isString(amount), "FT 'amount' is required");
    assert(!!recipient, "'recipient' is required");

    super(APP_CMD.ISSUE_FT, cmdPayload);
  }
}

export default IssueFungibleTokenCmd;
