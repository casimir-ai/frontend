<template>
  <vex-dialog
    v-model="isDialogOpened"
    :title="$t('module.wallet.balances.deposit')"
    :disabled="isLoading"
    :loading="isLoading"
    :button-true-text="$t('module.wallet.balances.process')"
    :button-false-text="$t('module.wallet.balances.cancel')"
    :hide-buttons="step !== STEPS.FORM"
    :persistent="true"
    @click:confirm="submitForm"
  >
    <validation-observer v-if="step === STEPS.FORM" ref="observer">
      <v-form>
        <validation-provider
          v-slot="{ errors }"
          :name="$t('module.wallet.balances.amount')"
          rules="required|assetGreaterOrEqual:1"
        >
          <asset-input
            v-model="asset"
            :label="$t('module.wallet.balances.amount')"
            required
            :assets-filter="assetsFilter"
            :error-messages="errors"
          />
        </validation-provider>
      </v-form>
    </validation-observer>

    <div v-else class="d-flex flex-column justify-center">
      <v-progress-circular
        v-show="isIframeSrcLoading"
        indeterminate
        color="primary"
        class="align-self-center"
      />
      <iframe
        :src="redirectToPaymentUrl"
        :height="iframeHeight"
        frameborder="0"
        @load="handleIframeLoad"
      />
    </div>
  </vex-dialog>
</template>

<script>
  import { VexDialog } from '@deip/vuetify-extended';
  import { extend } from '@deip/validation-plugin';
  import { AssetInput } from '@deip/assets-module';
  import { AssetType } from '@casimir/platform-core';
  import { createEnum } from '@deip/toolbox';
  import { proxydi } from '@deip/proxydi';

  const STEPS = createEnum({
    FORM: 1,
    PAYMENT: 2
  });

  extend('assetGreaterOrEqual', {
    params: ['target'],
    validate(value, { target }) {
      if (!target || !(value && value.amount)) return true;
      return parseFloat(value.amount) >= parseFloat(target);
    },
    message: (_, values) => {
      const i18n = proxydi.get('i18n');
      return i18n.t('module.wallet.balances.validations.assetGreaterOrEqual', values);
    }
  });
  /**
   * Component for creating a deposit in various assets
   */
  export default {
    name: 'DepositDialog',
    components: {
      VexDialog,
      AssetInput
    },

    props: {
      /**
       * Is dialog opened
       * default: true
       */
      value: {
        type: Boolean,
        default: false
      },
      /**
       * Balance
       * @example {
       *  amount: string,    - the amount of money in the balance
       *  precision: number, - a number of simbols after comma
       *  symbol: string,    - short currency symbol USD,EUR, etc.
       *  type: number,      - currency type: COIN - 1, NFT - 2, CORE - 3,
       *  owner: string      - user _id or blockchain wallet
       * }
       *
       */
      assetBalance: {
        type: Object,
        default: null
      }
    },

    data() {
      return {
        asset: null,
        redirectToPaymentUrl: null,
        isLoading: false,
        isIframeSrcLoading: false,
        iframeHeight: 250,
        step: STEPS.FORM,
        STEPS
      };
    },

    computed: {
      isDialogOpened: {
        get() {
          return this.value;
        },

        set(val) {
          this.$emit('input', val);

          if (this.asset) {
            this.asset.amount = null;
          }

          this.redirectToPaymentUrl = null;
          this.step = STEPS.FORM;

          if (this.$refs.observer) {
            this.$refs.observer.reset();
          }
        }
      },

      assetsFilter() {
        return this.assetBalance
          ? { symbol: this.assetBalance.symbol }
          : { type: AssetType.FT };
      }
    },

    watch: {
      assetBalance: {
        handler(val) {
          this.asset = val ? { symbol: val.symbol } : null;
        },
        deep: true
      }
    },

    mounted() {
      window.addEventListener('message', this.handleMessageReceive, false);
    },

    beforeDestroy() {
      window.removeEventListener('message', this.handleMessageReceive);
    },

    methods: {
      /**
       * Check receive message
       * @param {Object} e MessageEvent
       */
      handleMessageReceive(e) {
        if (!e.origin.startsWith(this.$env.DEIP_PAYMENT_SERVICE_URL)) return;

        if (e.data === 'stripe-payment-processed') {
          this.closeDialog();
          /**
           * Fires on a message event
           * @property {Object} e - MessageEvent
           * @event payment-processed
           */
          this.$emit('payment-processed');
          this.$notifier.showSuccess(this.$t('module.wallet.balances.paymentProcessed'));
        }

        if (e.data.name === 'document-size') {
          this.iframeHeight = e.data.height + 40;
        }
      },
      /**
       * Make a deposit
       */
      async deposit() {
        this.isLoading = true;

        const account = this.assetBalance
          ? this.assetBalance.owner
          : this.$currentUser._id;
        const payload = {
          initiator: this.$currentUser,
          amount: parseFloat(this.asset.amount) * 100, // cents
          currency: this.asset.symbol,
          account,
          timestamp: Date.now()
        };

        try {
          const data = await this.$store.dispatch('wallet/deposit', payload);
          this.redirectToPaymentUrl = data.redirectUrl;
          this.step = STEPS.PAYMENT;
          this.isIframeSrcLoading = true;
        } catch (error) {
          console.error(error);
          this.$notifier.showError(error);
        }

        this.isLoading = false;
      },
      /**
       * Submit deposit form
       */
      submitForm() {
        this.$refs.observer.handleSubmit(this.deposit);
      },
      /**
       * Handle iframe loading
       * Disables iframe loading spinner
       */
      handleIframeLoad() {
        this.isIframeSrcLoading = false;
      },
      /**
       * Close deposit popup
       */
      closeDialog() {
        this.isDialogOpened = false;
      }
    }
  };
</script>
