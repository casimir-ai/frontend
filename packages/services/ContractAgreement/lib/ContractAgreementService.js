import {
  Singleton
} from '@deip/toolbox';
import {
  CreateContractAgreementCmd,
  AcceptContractAgreementCmd,
  CreateProposalCmd,
  UpdateProposalCmd
} from '@deip/command-models';
import { APP_PROPOSAL } from '@deip/constants';
import { proxydi } from '@deip/proxydi';
import { ChainService } from '@deip/chain-service';
import { JsonDataMsg } from '@deip/message-models';
import { ContractAgreementHttp } from './ContractAgreementHttp';

class ContractAgreementService extends Singleton {
  contractAgreementHttp = ContractAgreementHttp.getInstance();

  proxydi = proxydi;

  createContractAgreement(payload) {
    const env = this.proxydi.get('env');

    const {
      initiator: {
        privKey,
        username: creator
      },
      hash,
      terms,
      parties,
      startTime,
      endTime,
      type
    } = payload;

    return ChainService.getInstanceAsync(env)
      .then((chainService) => {
        const chainNodeClient = chainService.getChainNodeClient();
        const chainTxBuilder = chainService.getChainTxBuilder();
        return chainTxBuilder.begin()
          .then((txBuilder) => {
            const createContractAgreementCmd = new CreateContractAgreementCmd({
              creator,
              parties,
              hash,
              startTime,
              endTime,
              type,
              terms
            });

            txBuilder.addCmd(createContractAgreementCmd);
            return txBuilder.end();
          })
          .then((packedTx) => packedTx.signAsync(privKey, chainNodeClient))
          .then((packedTx) => {
            const msg = new JsonDataMsg(packedTx.getPayload());
            return this.contractAgreementHttp.createContractAgreement(msg);
          });
      });
  }

  acceptContractAgreement(payload) {
    const env = this.proxydi.get('env');

    const {
      initiator: {
        privKey,
        username: party
      },
      contractAgreementId
    } = payload;

    return ChainService.getInstanceAsync(env)
      .then((chainService) => {
        const chainNodeClient = chainService.getChainNodeClient();
        const chainTxBuilder = chainService.getChainTxBuilder();
        return chainTxBuilder.begin()
          .then((txBuilder) => {
            const acceptContractAgreementCmd = new AcceptContractAgreementCmd({
              entityId: contractAgreementId,
              party
            });
            txBuilder.addCmd(acceptContractAgreementCmd);

            return txBuilder.end();
          })
          .then((packedTx) => packedTx.signAsync(privKey, chainNodeClient))
          .then((packedTx) => {
            const msg = new JsonDataMsg(packedTx.getPayload());
            return this.contractAgreementHttp.acceptContractAgreement(msg);
          });
      });
  }

  proposeContractAgreement(payload) {
    const env = this.proxydi.get('env');

    const {
      initiator: {
        privKey,
        username: creator
      },
      terms,
      hash,
      parties,
      startTime,
      endTime,
      type
    } = payload;

    return ChainService.getInstanceAsync(env)
      .then((chainService) => {
        const chainNodeClient = chainService.getChainNodeClient();
        const chainTxBuilder = chainService.getChainTxBuilder();
        return chainTxBuilder.begin()
          .then((txBuilder) => {
            const createContractAgreementCmd = new CreateContractAgreementCmd({
              creator,
              parties,
              hash,
              startTime,
              endTime,
              type,
              terms
            });
            const contractAgreementId = createContractAgreementCmd.getProtocolEntityId();

            const acceptContractsCmds = parties.map((party) => new AcceptContractAgreementCmd({
              entityId: contractAgreementId,
              party
            }));

            const createProposalCmd = new CreateProposalCmd({
              creator,
              type: APP_PROPOSAL.CONTRACT_AGREEMENT_PROPOSAL,
              expirationTime: endTime,
              proposedCmds: [createContractAgreementCmd, ...acceptContractsCmds]
            });

            txBuilder.addCmd(createProposalCmd);

            const createContractAgreementProposalId = createProposalCmd.getProtocolEntityId();
            const updateProposalCmd = new UpdateProposalCmd({
              entityId: createContractAgreementProposalId,
              activeApprovalsToAdd: [creator]
            });

            txBuilder.addCmd(updateProposalCmd);

            return txBuilder.end();
          })
          .then((packedTx) => packedTx.signAsync(privKey, chainNodeClient))
          .then((packedTx) => {
            const msg = new JsonDataMsg(packedTx.getPayload());
            return this.contractAgreementHttp.createContractAgreement(msg);
          });
      });
  }

  getContractAgreementsListByCreator(creator) {
    return this.contractAgreementHttp.getContractAgreementsListByCreator(creator);
  }

  getContractAgreements({
    parties,
    type,
    status
  } = {}) {
    const query = {
      parties: parties || [],
      type: type || '',
      status: status || ''
    };
    return this.contractAgreementHttp.getContractAgreements(query);
  }

  getContractAgreement(contractAgreementId) {
    return this.contractAgreementHttp.getIncomeShareAgreement(contractAgreementId);
  }
}

export {
  ContractAgreementService
};
