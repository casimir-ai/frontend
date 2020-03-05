import { HttpService } from '@deip/http-service';
import { Singleton } from '@deip/toolbox';

class ResearchGroupProposalVotingHttp extends Singleton {
  http = HttpService.getInstance();

  sendContentProposal(tx, type) {
    return this.http.post(`/api/proposals/content/${type}`, tx);
  }

  sendResearchProposal(tx, meta) {
    return this.http.post('/api/proposals/research', { tx, researchMeta: meta });
  }

  sendInviteProposal(tx) {
    return this.http.post('/api/proposals/invite', tx);
  }

  sendTokenSaleProposal(tx) {
    return this.http.post('/api/proposals/token-sale', tx);
  }
}

export {
  ResearchGroupProposalVotingHttp
};
