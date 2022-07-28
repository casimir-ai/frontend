/* eslint-disable max-len */
export default {
  module: {
    nftItems: {
      form: {
        title: 'Title',
        type: 'Material type',
        formatType: 'Format type',
        authors: 'Authors',
        references: 'References to material posted on platform',
        file: 'File',
        contentPlaceholder: 'Start typing here...',
        text: 'Text',
        package: 'Package',
        cancel: 'Cancel',
        upload: 'Upload',
        update: 'Update',
        create: 'Create'
      },
      contentList: {
        type: 'Type',
        title: 'Title'
      },
      draftList: {
        draft: 'Draft',
        type: 'Type',
        title: 'Title',
        proposed: 'proposed'
      },
      draft: {
        confirmDelete: {
          title: 'Delete content draft',
          message: 'Are you sure you want to delete content draft "{title}"? This action is irreversible.'
        },
        confirmPublish: {
          title: 'Publish content',
          message: 'Are you sure you want to publish content draft "{title}"? You won\'t be able to edit it.'
        },
        delete: 'Delete',
        edit: 'Edit',
        publish: 'Publish'
      },
      details: {
        authors: 'Authors',
        download: 'Download'
      },
      nftItemsInfiniteScroll: {
        noMore: 'No more data',
        noResults: 'No results found'
      },
      moderation: {
        declineDialog: {
          title: 'Decline',
          message: 'Are you sure you would like to decline{title}?',
          reason: 'Reason',
          cancel: 'No, cancel',
          confirm: 'Yes, confirm',
          declineSuccess: 'The item declined successfully!'
        },
        card: {
          decline: 'Decline',
          approve: 'Approve',
          approveConfirm: {
            message: 'Are you sure you want to approve{title}?',
            title: 'Approve'
          },
          approveSuccess: 'The item approved successfully!',
          declineSuccess: 'The item declined successfully!'
        }
      }
    }
  }
};
