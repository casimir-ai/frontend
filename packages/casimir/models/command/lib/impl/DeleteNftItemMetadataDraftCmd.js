import { APP_CMD } from '@casimir/platform-core';
import { assert } from '@deip/toolbox';
import AppCmd from '../base/AppCmd';

/**
 * Delete nft item metadata draft command
 * @extends AppCmd
 */
class DeleteNftItemMetadataDraftCmd extends AppCmd {
  /**
   * Create command for nft item metadata draft delition
   * @param {Object} cmdPayload
   * @param {string} cmdPayload._id
   */
  constructor(cmdPayload) {
    const {
      _id
    } = cmdPayload;

    assert(!!_id, "'_id' is required");

    super(APP_CMD.DELETE_NFT_ITEM_METADATA_DRAFT, cmdPayload);
  }
}

export default DeleteNftItemMetadataDraftCmd;
