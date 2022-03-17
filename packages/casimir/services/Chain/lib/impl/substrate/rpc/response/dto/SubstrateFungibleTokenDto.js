import FungibleTokenDto from './../../../../../base/rpc/response/dto/FungibleTokenDto';
import { fromHexFormat } from './../../../utils';


class SubstrateFungibleTokenDto extends FungibleTokenDto {

  constructor(asset, metadata) {
    const assetId = fromHexFormat(asset.assetId);
    const issuer = asset.admin;
    const currentSupply = asset.supply;
    const name = metadata ? metadata.name : "";
    const symbol = metadata ? metadata.symbol : "";
    const precision = metadata ? metadata.decimals : 0;
    
    super({ 
      assetId, 
      symbol, 
      precision, 
      issuer, 
      currentSupply, 
      name 
    });
  }

}


export default SubstrateFungibleTokenDto;