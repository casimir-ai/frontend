import {
  Singleton
} from '@deip/toolbox';
import {
  CreateContractAgreementCmd,
  AcceptContractAgreementCmd,
  CreateProposalCmd,
  UpdateProposalCmd,
} from '@deip/command-models';
import { APP_PROPOSAL, CONTRACT_AGREEMENT_TYPE } from '@deip/constants';
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
      contractAgreementId,
    } = payload;


    return ChainService.getInstanceAsync(env)
      .then((chainService) => {
        const chainNodeClient = chainService.getChainNodeClient();
        const chainTxBuilder = chainService.getChainTxBuilder();
        return chainTxBuilder.begin()
          .then((txBuilder) => {

            const acceptContractAgreementCmd = new AcceptContractAgreementCmd({
              entityId: contractAgreementId,
              party: party
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

            const acceptContractAgreementCmds = parties.map((party) => {
              return new AcceptContractAgreementCmd({
                entityId: contractAgreementId,
                party: party
              });
            });

            const createProposalCmd = new CreateProposalCmd({
              creator,
              type: APP_PROPOSAL.CONTRACT_AGREEMENT_PROPOSAL,
              expirationTime: endTime,
              proposedCmds: [createContractAgreementCmd, ...acceptContractAgreementCmds]
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

  getProjectLicense(licenseId) {
    return this.contractAgreementHttp.getProjectLicense(licenseId);
  }

  getProjectLicensesByLicensee(licensee) {
    return this.contractAgreementHttp.getProjectLicensesByLicensee(licensee);
  }

  getProjectLicensesByLicenser(licenser) {
    return this.contractAgreementHttp.getProjectLicensesByLicenser(licenser);
  }

  getProjectLicensesByProject(projectId) {
    return this.contractAgreementHttp.getProjectLicensesByProject(projectId);
  }

  getProjectLicensesByLicenseeAndProject(licensee, projectId) {
    return this.contractAgreementHttp.getProjectLicensesByLicenseeAndProject(licensee, projectId);
  }

  getProjectLicensesByLicenseeAndLicenser(licensee, licenser) {
    return this.contractAgreementHttp.getProjectLicensesByLicenseeAndLicenser(licensee, licenser);
  }

  getContractAgreementsListByCreator(creator) {
    return this.contractAgreementHttp.getContractAgreementsListByCreator(creator);
  }

  getIncomeShareAgreement(incomeShareAgreementId) {
    return this.contractAgreementHttp.getIncomeShareAgreement(incomeShareAgreementId);
  }

  getIncomeShareAgreementsListByCreator(creator) {
    return this.contractAgreementHttp.getIncomeShareAgreementsListByCreator(creator);
  }
}

export {
  ContractAgreementService
};