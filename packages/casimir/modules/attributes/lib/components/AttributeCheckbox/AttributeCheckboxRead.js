import { defineComponent } from '@deip/platform-util';
import { AttributeReadMixin, AttributeOptionsReadMixin } from '../../mixins';

/**
 * Component for attribute checkbox read only
 */
export const AttributeCheckboxRead = defineComponent({
  name: 'AttributeCheckboxRead',

  mixins: [
    AttributeReadMixin,
    AttributeOptionsReadMixin
  ],

  methods: {
    /**
     * Generate checkbox with one option for read only
     */
    genSingleAttribute() {
      return (
        <div>{this.attributeInfo.title}</div>
      );
    },

    /**
     * Generate checkbox with multiple options for read only
     */
    genMultipleAttribute() {
      return (
        <div>{this.optionsValueTitles.join(', ')}</div>
      );
    },

    /**
     * Generate checkbox depending on options count for read only
     */
    genAttribute() {
      return this.attributeInfo.isMultiple
        ? this.genMultipleAttribute()
        : this.genSingleAttribute();
    }
  }
});
