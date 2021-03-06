import { proxydi } from '@deip/proxydi';
import { AcceptProposalCmd, DeclineProposalCmd } from '@deip/commands';
import { JsonDataMsg } from '@deip/messages';
import { ChainService } from '@deip/chain-service';
import { makeSingletonInstance } from '@deip/toolbox';
import { ProtocolChain } from '@casimir/platform-core';
import { ProposalsHttp } from './ProposalsHttp';

/**
 *  Proposals data transport
 */
export class ProposalsService {
  proposalsHttp = ProposalsHttp.getInstance();
  proxydi = proxydi;

  // TODO: add createProposal endpoint and support proposal of APP_PROPOSAL.CUSTOM type

  /**
   * Accept proposal
   * @param {Object} payload
   * @param {Object} payload.initiator
   * @param {string} payload.initiator.privKey
   * @param {Object} payload.data
   * @param {string} payload.data.proposalId
   * @param {string} payload.data.account
   * @returns {Promise<Object>}
   */
  async accept(payload) {
    const {
      initiator: { privKey },
      data: {
        proposalId,
        account
      }
    } = payload;
    const env = this.proxydi.get('env');

    return ChainService.getInstanceAsync(env)
      .then((chainService) => {
        const chainNodeClient = chainService.getChainNodeClient();
        const chainTxBuilder = chainService.getChainTxBuilder();
        const chainRpc = chainService.getChainRpc();

        return chainRpc.getProposalAsync(proposalId)
          .then((proposal) => chainTxBuilder.begin()
            .then((txBuilder) => {
              const updateProposalCmd = new AcceptProposalCmd({
                entityId: proposalId,
                account,
                batchWeight: proposal.batchWeight
              });
              txBuilder.addCmd(updateProposalCmd);
              return txBuilder.end();
            })
            .then((packedTx) => packedTx.signAsync(privKey, chainNodeClient))
            .then((packedTx) => {
              const msg = new JsonDataMsg(packedTx.getPayload());

              if (env.RETURN_MSG === true) {
                return msg;
              }

              return this.proposalsHttp.accept(msg);
            }));
      });
  }

  /**
   * Decline proposal
   * @param {Object} payload
   * @param {Object} payload.initiator
   * @param {string} payload.initiator.privKey
   * @param {Object} payload.data
   * @param {string} payload.data.proposalId
   * @param {string} payload.data.account
   * @returns {Promise<Object>}
   */
  async decline(payload) {
    const {
      initiator: { privKey },
      data: {
        proposalId,
        account
      }
    } = payload;
    const env = this.proxydi.get('env');

    return ChainService.getInstanceAsync(env)
      .then((chainService) => {
        const chainNodeClient = chainService.getChainNodeClient();
        const chainTxBuilder = chainService.getChainTxBuilder();
        const chainRpc = chainService.getChainRpc();

        return chainRpc.getProposalAsync(proposalId)
          .then((proposal) => chainTxBuilder.begin()
            .then((txBuilder) => {
              const declineProposalCmd = new DeclineProposalCmd({
                entityId: proposalId,
                account,
                batchWeight: proposal.batchWeight
              });

              txBuilder.addCmd(declineProposalCmd);
              return txBuilder.end();
            })
            .then((packedTx) => packedTx.signAsync(privKey, chainNodeClient))
            .then((packedTx) => {
              const msg = new JsonDataMsg(packedTx.getPayload());

              if (env.RETURN_MSG === true) {
                return msg;
              }

              return this.proposalsHttp.decline(msg);
            }));
      });
  }

  /**
   * [DEPREACTED]
   * Get proposals by creator
   * @param {string} account
   * @returns {Promise<Object>}
   */
  async getListByCreator(account) {
    const env = this.proxydi.get('env');

    return ChainService.getInstanceAsync(env)
      .then((chainService) => {
        const chainRpc = chainService.getChainRpc();

        return chainRpc.getProposalsByCreatorAsync(account)
          .then((result) => {
            // TODO: move all mappings outside service
            if (env.PROTOCOL === ProtocolChain.GRAPHENE) {
              const deipRpc = chainService.getChainNodeClient();
              const proposals = result.map((proposal) => {
                const { operations: [[opName, opPayload]] } = proposal.serializedProposedTx;
                const opTag = deipRpc.operations.getOperationTag(opName);
                return { ...proposal, action: opTag, payload: opPayload };
              });
              return proposals;
            }
            return result;
          });
      });
  }

  /**
   * Get proposals by account and status
   * @param {string} account
   * @param {number} [status=0]
   * @returns {Promise<Object>}
   */
  async getListByAccount(account, status = 0) {
    return this.proposalsHttp.getListByAccount(account, status);
  }

  /**
   * Get proposal
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getOne(id) {
    return this.proposalsHttp.getOne(id);
  }

  /** @type {() => ProposalsService} */
  static getInstance = makeSingletonInstance(() => new ProposalsService());
}
