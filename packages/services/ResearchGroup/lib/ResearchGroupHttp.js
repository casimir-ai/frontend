import { HttpService } from '@deip/http-service';
import { Singleton } from '@deip/toolbox';
import qs from 'qs';

class ResearchGroupHttp extends Singleton {
  http = HttpService.getInstance();

  constructor() {
    super();
  }

  createResearchGroup({ researchGroupExternalId, formData }) {
    return this.http.post('/api/groups', formData, {
      headers: {
        'Research-Group-External-Id': researchGroupExternalId,
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  updateResearchGroup({ researchGroupExternalId, formData}) {
    return this.http.put('/api/groups', formData, {
      headers: {
        'Research-Group-External-Id': researchGroupExternalId,
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  getResearchGroup(researchGroupExternalId) {
    return this.http.get(`/api/groups/${researchGroupExternalId}`);
  }

  getTeamsByUser(username) {
    return this.http.get(`/api/groups/member/${username}`);
  }
  
  getJoinRequestsByGroup(groupId) {
    return this.http.get(`/api/join-requests/group/${groupId}`);
  }

  getJoinRequestsByUser(username) {
    return this.http.get(`/api/join-requests/user/${username}`);
  }

  createJoinRequest(data) {
    return this.http.post('/api/join-requests', data);
  }

  updateJoinRequest(update) {
    return this.http.put('/api/join-requests', update);
  }

  getResearchGroupPendingInvites(researchGroupExternalId) {
    return this.http.get(`/api/invites/group/${researchGroupExternalId}`);
  }

  createResearchGroupInvite({ tx, offchainMeta }) {
    return this.http.post('/api/invites', { tx, offchainMeta });
  }

  leaveResearchGroup({ tx, offchainMeta }) {
    return this.http.post('/api/groups/leave', { tx, offchainMeta });
  }

  getResearchGroupsListing(personal) {
    const query = qs.stringify({ personal });
    return this.http.get(`/api/groups/listing?${query}`);
  }

  getResearchGroupsByTenant(tenantId) {
    return this.http.get(`/api/groups/tenant/${tenantId}`);
  }

}

export {
  ResearchGroupHttp
};