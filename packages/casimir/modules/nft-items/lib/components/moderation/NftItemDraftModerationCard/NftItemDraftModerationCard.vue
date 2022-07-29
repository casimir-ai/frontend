<template>
  <div>
    <v-card outlined>
      <layout-renderer
        :value="nftItem"
        :schema="cardSchema"
        :schema-data="cardSchemaData"
      />

      <ve-stack :gap="8" flow="column" class="align-end justify-end ma-4">
        <v-btn
          text
          outlined
          small
          :disabled="disabled"
          @click="handleDeclineClick"
        >
          {{ $t('module.nftItems.moderation.card.decline') }}
        </v-btn>
        <v-btn
          color="primary"
          small
          :disabled="disabled"
          @click="handleApproveClick"
        >
          {{ $t('module.nftItems.moderation.card.approve') }}
        </v-btn>
      </ve-stack>
    </v-card>

    <nft-item-draft-decline-dialog
      v-if="isDeclineDialogOpened"
      v-model="isDeclineDialogOpened"
      :nft-item-draft="nftItemDraft"
      :nft-item-title="itemTitle"
      :success-message="successDeclineMessage"
      @success="handleDeclineSuccess"
    />
  </div>
</template>

<script>
  import { NftItemMetadataDraftStatus } from '@casimir/platform-core';

  import { dateMixin } from '@deip/platform-components';
  import { VeStack } from '@deip/vue-elements';
  import { attributedDetailsFactory, LayoutRenderer } from '@deip/layouts-module';
  import { attributeMethodsFactory, expandAttributes } from '@deip/attributes-module';
  import { NftItemDraftDeclineDialog } from '../NftItemDraftDeclineDialog';

  /**
   * NFT item moderation card
   */
  export default {
    name: 'NftItemDraftModerationCard',

    components: {
      VeStack,
      LayoutRenderer,
      NftItemDraftDeclineDialog
    },

    mixins: [dateMixin, attributedDetailsFactory('nftItem')],

    props: {
      /** NFT item draft */
      nftItemDraft: {
        type: Object,
        required: true
      },

      nameAttributeKey: {
        type: String,
        default: null
      },

      /** Message to show in notification after success approve */
      successApproveMessage: {
        type: String,
        default() { return this.$t('module.nftItems.moderation.card.approveSuccess'); }
      },

      /** Message to show in notification after success decline */
      successDeclineMessage: {
        type: String,
        default() {
          return this.$t('module.nftItems.moderation.declineDialog.declineSuccess');
        }
      }
    },

    data() {
      return {
        isDeclineDialogOpened: false,
        loading: false,
        disabled: false
      };
    },

    computed: {
      itemTitle() {
        const isAttributeName = this.$attributes.getMappedData(
          this.nameAttributeKey,
          this.nftItemDraft.attributes
        )?.value;
        return isAttributeName ? ` ${isAttributeName}` : '';
      },
      cardSchema() {
        return this.$layouts.getMappedData('nftItem.moderation')?.value;
      },
      cardSchemaData() {
        return {
          ...attributeMethodsFactory(
            expandAttributes(this.nftItemDraft),
            {
              scopeName: 'nftItem',
              scopeId: {
                nftItemId: this.nftItemDraft.nftItemId,
                nftCollectionId: this.nftItemDraft.nftCollectionId
              }
            }
          ),
          ...this.schemaData
        };
      }
    },

    methods: {
      /** Handle decline button click */
      handleDeclineClick() {
        this.isDeclineDialogOpened = true;
      },

      /** Disable buttons after decline */
      handleDeclineSuccess() {
        this.setDisabled(true);
      },

      /**
       * Set disabled
       * @param {boolean} value
       */
      setDisabled(value) {
        this.disabled = value;
      },

      /** Handle approve button click */
      async handleApproveClick() {
        const isConfirmed = await this.$confirm(
          this.$t('module.nftItems.moderation.card.approveConfirm.message',
                  { title: this.itemTitle }),
          {
            title: this.$t('module.nftItems.moderation.card.approveConfirm.title')
          }
        );

        if (isConfirmed) {
          await this.approveNftItemDraft();
        }
      },

      /** Approve NFT item draft */
      async approveNftItemDraft() {
        try {
          const payload = {
            data: {
              _id: this.nftItemDraft._id,
              status: NftItemMetadataDraftStatus.APPROVED
            }
          };

          await this.$store.dispatch('nftItemDrafts/moderate', payload);

          this.$notifier.showSuccess(this.successApproveMessage);
          this.setDisabled(true);
        } catch (error) {
          console.error(error?.error || error);
          this.$notifier.showError(error?.error?.message || error);
        }
      }
    }
  };
</script>
