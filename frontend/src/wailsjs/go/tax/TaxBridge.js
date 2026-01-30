export function CalculateTax(amount, countryCode) {
  return window['go']['tax']['TaxBridge']['CalculateTax'](amount, countryCode);
}

export function GetTaxConfig() {
  return window['go']['tax']['TaxBridge']['GetTaxConfig']();
}
