const CHAIN_TYPES = {
  "InputKeySource": "KeySource",
  "KeySource": {
    "signatories": "Vec<AccountId>",
    "threshold": "u16"
  },
  "OrgOf": "Org",
  "Org": {
    "key": "AccountId",
    "key_source": "KeySource",
    "name": "OrgName"
  },
  "OrgName": "H160",
  "DomainId": "H160",
  "ReviewId": "H160",
  "AccountInfo": {
    "nonce": "Index",
    "consumers": "RefCount",
    "providers": "RefCount",
    "data": "AccountData"
  },
  "ProposalBatchItemOf": {
    "account": "AccountId",
    "call": "Call"
  },
  "ProposalId": "[u8; 32]",
  "PendingProposalsMap": "BTreeMap<ProposalId,AccountId>",
  "DeipProposal": {
    "id": "ProposalId",
    "batch": "Vec<ProposalBatchItemOf>",
    "decisions": "BTreeMap<AccountId,ProposalMemberDecision>",
    "state": "ProposalState",
    "author": "AccountId"
  },
  "ProposalState": {
    "_enum": [
      "Pending",
      "Rejected",
      "Done",
      "Failed(DispatchError)"
    ]
  },
  "ProposalMemberDecision": {
    "_enum": [
      "Pending",
      "Approve",
      "Reject"
    ]
  },
  "Domain": "H160",
  "ProjectId": "H160",
  "ProjectContentId": "H160",
  "NdaAccessRequestId": "H160",
  "NdaId": "H160",
  "NdaOf": "Nda",
  "NdaAccessRequestOf": "NdaAccessRequest",
  "ProjectOf": "Project",
  "ProjectContentOf": "ProjectContent",
  "Nda": {
    "contract_creator": "AccountId",
    "external_id": "NdaId",
    "end_date": "Moment",
    "start_date": "Option<Moment>",
    "contract_hash": "Hash",
    "parties": "Vec<AccountId>",
    "projects": "Vec<ProjectId>"
  },
  "NdaAccessRequestStatus": {
    "_enum": [
      "Pending",
      "Fulfilled",
      "Rejected"
    ]
  },
  "NdaAccessRequest": {
    "external_id": "NdaAccessRequestId",
    "nda_external_id": "NdaId",
    "requester": "AccountId",
    "encrypted_payload_hash": "Hash",
    "encrypted_payload_iv": "Text",
    "status": "NdaAccessRequestStatus",
    "grantor": "Option<AccountId>",
    "encrypted_payload_encryption_key": "Option<Text>",
    "proof_of_encrypted_payload_encryption_key": "Option<Text>"
  },
  "Project": {
    "is_private": "bool",
    "external_id": "ProjectId",
    "team_id": "AccountId",
    "description": "Hash",
    "domains": "Vec<Domain>",
    "members": "Vec<AccountId>"
  },
  "ProjectContentType": {
    "_enum": [
      "Announcement",
      "FinalResult",
      "MilestoneArticle",
      "MilestoneBook",
      "MilestoneChapter",
      "MilestoneCode",
      "MilestoneConferencePaper",
      "MilestoneCoverPage",
      "MilestoneData",
      "MilestoneExperimentFindings",
      "MilestoneMethod",
      "MilestoneNegativeResults",
      "MilestonePatent",
      "MilestonePoster",
      "MilestonePreprint",
      "MilestonePresentation",
      "MilestoneRawData",
      "MilestoneResearchProposal",
      "MilestoneTechnicalReport",
      "MilestoneThesis"
    ]
  },
  "ProjectContent": {
    "external_id": "ProjectContentId",
    "project_external_id": "ProjectId",
    "team_id": "AccountId",
    "content_type": "ProjectContentType",
    "description": "Hash",
    "content": "Hash",
    "authors": "Vec<AccountId>",
    "references": "Option<Vec<ProjectContentId>>"
  }
};

export default CHAIN_TYPES;