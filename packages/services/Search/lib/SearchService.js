import { createInstanceGetter } from '@deip/toolbox';
import { SearchHttp } from './SearchHttp';

export class SearchService {
  searchHttp = SearchHttp.getInstance();

  /** @type {() => SearchService} */
  static getInstance = createInstanceGetter(SearchService);
}
