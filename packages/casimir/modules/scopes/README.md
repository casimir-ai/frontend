
# Scopes-module

##Description
If the portal has several scopes (normally it has, e.g.: `Users`, `Teams`, `Projects`),
module allows extending portal store with based on model (scopesRegistry) special sections.

## Usage
for using this module in new portal, you need to set up it in `main.js` file
```
import { ScopesModule } from '@casimir/scopes-module';
```
then add module to app using addModule(moduleName):
```
const testApp = new CreateApp(Vue, {
  store,
  router,
  vuetify,
  i18n
});
testApp
  .addModule(ScopesModule)
```
## Notice
there is a minimum set of modules, without them this module won't work:
* @deip/env-module
* @deip/validation-plugin
* @deip/attributes-module
* @deip/layouts-module
* @casimir/scopes-module
* @deip/auth-module
