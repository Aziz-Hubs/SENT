export function GetProducts() {
  return window['go']['stock']['StockBridge']['GetProducts']();
}

export function AdjustStock(adj) {
  return window['go']['stock']['StockBridge']['AdjustStock'](adj);
}

export function CreateProduct(p) {
  return window['go']['stock']['StockBridge']['CreateProduct'](p);
}