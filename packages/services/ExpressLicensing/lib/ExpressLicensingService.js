import deipRpc from '@deip/rpc-client';
import { Singleton } from '@deip/toolbox';
import { ExpressLicensingHttp } from './ExpressLicensingHttp';
import { BlockchainService } from '@deip/blockchain-service';
import { ProposalsService } from '@deip/proposals-service';

class ExpressLicensingService extends Singleton {
  expressLicensingHttp = ExpressLicensingHttp.getInstance();
  blockchainService = BlockchainService.getInstance();
  proposalsService = ProposalsService.getInstance();


  createExpressLicensingRequest({ privKey, username }, {
    requester,
    researchGroup,
    fee,
    expirationDate
  }, { 
    researchExternalId,
    licencePlan
  }) {

    const offchainMeta = { researchExternalId, licencePlan };

    const transfer_op = ['transfer', {
      from: requester,
      to: researchGroup,
      amount: fee,
      memo: "",
      extensions: []
    }];

    // Dummy op to wait for research group member approval. 
    // Needs to be replaced with op that grants access to research content once we will have it done.
    const update_account_op = ['update_account', { 
      account: researchGroup,
      owner: undefined,
      active: undefined,
      active_overrides: undefined,
      memo_key: undefined,
      json_metadata: undefined,
      traits: undefined,
      extensions: []
    }];

    const proposal = {
      creator: requester,
      proposedOps: [{ "op": transfer_op }, { "op": update_account_op }],
      expirationTime: expirationDate,
      reviewPeriodSeconds: undefined,
      extensions: []
    }

    return this.proposalsService.createProposal({ privKey, username }, false, proposal)
      .then(({ tx: signedProposalTx }) => {
        return this.expressLicensingHttp.createExpressLicensingRequest({ tx: signedProposalTx, offchainMeta })
      })
  }


  approveExpressLicensingRequest({ privKey, username }, {
    requestId,
    approver
  }) {

    const offchainMeta = {};

    const update_proposal_op = ['update_proposal', {
      external_id: requestId,
      active_approvals_to_add: approver == username ? [approver] : [approver, username],
      active_approvals_to_remove: [],
      owner_approvals_to_add: [],
      owner_approvals_to_remove: [],
      key_approvals_to_add: [],
      key_approvals_to_remove: [],
      extensions: []
    }];

    return this.blockchainService.signOperations([update_proposal_op], privKey)
      .then((signedTx) => {
        return this.expressLicensingHttp.approveExpressLicensingRequest({ requestId, tx: signedTx, offchainMeta });
      });
  }


  rejectExpressLicensingRequest({ privKey, username }, {
    requestId,
    rejector
  }) {

    const offchainMeta = {};

    const delete_proposal_op = ['delete_proposal', {
      external_id: requestId,
      account: rejector,
      authority: 2,
      extensions: []
    }];

    return this.blockchainService.signOperations([delete_proposal_op], privKey)
      .then((signedTx) => {
        return this.expressLicensingHttp.rejectExpressLicensingRequest({ requestId, tx: signedTx, offchainMeta })
      });
  }


  getExpressLicensingRequests() {
    return this.expressLicensingHttp.getExpressLicensingRequests();
  }


  getExpressLicensingRequestsByStatus(status) {
    return this.expressLicensingHttp.getExpressLicensingRequestsByStatus(status);
  }


  getExpressLicensingRequestById(requestId) {
    return this.expressLicensingHttp.getExpressLicensingRequestById(requestId);
  }


  getExpressLicensingRequestsByResearch(researchExternalId) {
    return this.expressLicensingHttp.getExpressLicensingRequestsByResearch(researchExternalId);
  }


  getExpressLicensingRequestsByRequester(requester) {
    return this.expressLicensingHttp.getExpressLicensingRequestsByRequester(requester);
  }

}

export {
  ExpressLicensingService
};
