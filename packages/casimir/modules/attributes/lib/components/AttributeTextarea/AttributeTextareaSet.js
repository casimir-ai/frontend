import {
  VTextarea
// eslint-disable-next-line import/extensions,import/no-unresolved
} from 'vuetify/lib/components';

import { defineComponent } from '@deip/platform-util';
import { AttributeSetMixin } from '../../mixins';

/**
 * Component for changing textarea attribute
 */
export const AttributeTextareaSet = defineComponent({
  name: 'AttributeTextareaSet',

  mixins: [AttributeSetMixin],

  methods: {
    /**
     * Generate changing textarea attribute
     *
     * @param {Array} errors
     */
    genAttribute(errors) {
      return (
        <VTextarea
          vModel={this.internalValue}
          label={this.attributeInfo.title}
          errorMessages={errors}
          rows={10}
          noResize={false}
        />
      );
    }
  }
});
