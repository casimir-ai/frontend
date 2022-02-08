import { proxydi } from '@deip/proxydi';
import { JsonDataMsg } from '@deip/messages';
import { APP_PROPOSAL, TS_TYPES } from '@deip/constants';
import {
  AcceptProposalCmd,
  CreateProposalCmd,
  CreateInvestmentOpportunityCmd,
  InvestCmd
} from '@deip/commands';
import { ChainService } from '@deip/chain-service';
import { createInstanceGetter } from '@deip/toolbox';
import { InvestmentsHttp } from './InvestmentsHttp';

const proposalDefaultLifetime = new Date(new Date().getTime() + 86400000 * 365 * 3).getTime();

export class InvestmentsService {
  investmentsHttp = InvestmentsHttp.getInstance();

  proxydi = proxydi;

  async getAccountRevenueHistoryByAsset(account, symbol, step = 0, cursor = 0, targetAsset = 'USD') {
    return this.investmentsHttp.getAccountRevenueHistoryByAsset(
      account,
      symbol,
      cursor,
      step,
      targetAsset
    );
  }

  async getAccountRevenueHistory(account, cursor = 0) {
    return this.investmentsHttp.getAccountRevenueHistory(account, cursor);
  }

  async getAssetRevenueHistory(symbol, cursor = 0) {
    return this.investmentsHttp.getAssetRevenueHistory(symbol, cursor);
  }

  async getCurrentTokenSaleByProject(projectId) {
    const res = await this.investmentsHttp.getProjectTokenSalesByProject(projectId);
    return {
      ...res,
      data: {
        items: res.data.items.find(
          (ts) => ts.status === TS_TYPES.ACTIVE || ts.status === TS_TYPES.INACTIVE
        )
      }
    };
  }

  async createProjectTokenSale({ privKey, username }, {
    teamId,
    projectId,
    startTime,
    endTime,
    shares,
    softCap,
    hardCap,
    title,
    metadata
  }, proposalInfo) {
    const { isProposal, isProposalApproved, proposalLifetime } = {
      isProposal: false,
      isProposalApproved: true,
      proposalLifetime: proposalDefaultLifetime,
      ...proposalInfo
    };

    const env = this.proxydi.get('env');
    return ChainService.getInstanceAsync(env)
      .then((chainService) => {
        const chainNodeClient = chainService.getChainNodeClient();
        const chainTxBuilder = chainService.getChainTxBuilder();
        return chainTxBuilder.begin()
          .then((txBuilder) => {
            const createInvestmentOpportunityCmd = new CreateInvestmentOpportunityCmd({
              teamId,
              projectId,
              startTime,
              endTime,
              shares,
              softCap,
              hardCap,
              creator: username,
              title,
              metadata
            });

            if (isProposal) {
              const createProposalCmd = new CreateProposalCmd({
                type: APP_PROPOSAL.INVESTMENT_OPPORTUNITY_PROPOSAL,
                creator: username,
                expirationTime: proposalLifetime || proposalDefaultLifetime,
                proposedCmds: [createInvestmentOpportunityCmd]
              });
              txBuilder.addCmd(createProposalCmd);

              if (isProposalApproved) {
                const updateProposalId = createProposalCmd.getProtocolEntityId();
                const updateProposalCmd = new AcceptProposalCmd({
                  entityId: updateProposalId,
                  account: username
                });
                txBuilder.addCmd(updateProposalCmd);
              }
            } else {
              txBuilder.addCmd(createInvestmentOpportunityCmd);
            }
            return txBuilder.end();
          })
          .then((packedTx) => packedTx.signAsync(privKey, chainNodeClient))
          .then((packedTx) => {
            const msg = new JsonDataMsg(packedTx.getPayload());
            return this.investmentsHttp.createProjectTokenSale(msg);
          });
      });
  }

  async investProjectTokenSale({ privKey }, {
    investmentOpportunityId,
    investor,
    asset
  }) {
    const env = this.proxydi.get('env');
    return ChainService.getInstanceAsync(env)
      .then((chainService) => {
        const chainNodeClient = chainService.getChainNodeClient();
        const chainTxBuilder = chainService.getChainTxBuilder();

        return chainTxBuilder.begin()
          .then((txBuilder) => {
            const investCmd = new InvestCmd({
              investmentOpportunityId,
              investor,
              asset
            });
            txBuilder.addCmd(investCmd);
            return txBuilder.end();
          })
          .then((packedTx) => packedTx.signAsync(privKey, chainNodeClient))
          .then((packedTx) => {
            const msg = new JsonDataMsg(packedTx.getPayload());
            return this.investmentsHttp.investProjectTokenSale(msg);
          });
      });
  }

  async getProjectTokenSalesByProject(projectId) {
    return this.investmentsHttp.getProjectTokenSalesByProject(projectId);
  }

  async getProjectTokenSaleInvestmentsByProject(projectId) {
    return this.investmentsHttp.getProjectTokenSaleInvestmentsByProject(projectId);
  }

  async getAccountInvestmentsHistory(account) {
    return this.investmentsHttp.getAccountInvestmentsHistory(account);
  }

  async getInvestmentsHistoryByTokenSale(tokenSaleId) {
    return this.investmentsHttp.getInvestmentsHistoryByTokenSale(tokenSaleId);
  }

  async getProjectTokenSale(investmentOpportunityId) {
    return this.investmentsHttp.getProjectTokenSale(investmentOpportunityId);
  }

  /** @type {() => InvestmentsService} */
  static getInstance = createInstanceGetter(InvestmentsService);
}
