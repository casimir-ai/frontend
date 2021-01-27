import { Singleton } from '@deip/toolbox';
import { TenantHttp } from './TenantHttp';
import { BlockchainService } from '@deip/blockchain-service';

class TenantService extends Singleton {
  tenantHttp = TenantHttp.getInstance();
  blockchainService = BlockchainService.getInstance();

  getTenant(tenantId) {
    return this.tenantHttp.getTenant(tenantId);
  }

  updateTenantProfile(updatedProfile) {
    return this.tenantHttp.updateTenantProfile(updatedProfile);
  }

  createTenantResearchAttribute(researchAttribute) {
    return this.tenantHttp.createTenantResearchAttribute(researchAttribute);
  }

  updateTenantResearchAttribute(researchAttribute) {
    return this.tenantHttp.updateTenantResearchAttribute(researchAttribute);
  }

  deleteTenantResearchAttribute(researchAttribute) {
    return this.tenantHttp.deleteTenantResearchAttribute(researchAttribute);
  }

  postSignUp(data) {
    return this.tenantHttp.postSignUp(data);
  }

  getSignUpRequests() {
    return this.tenantHttp.getSignUpRequests();
  }

  approveSignUpRequest(username) {
    return this.tenantHttp.approveSignUpRequest(username);
  }

  rejectSignUpRequest(username) {
    return this.tenantHttp.rejectSignUpRequest(username);
  }
  
}

export {
  TenantService
};
