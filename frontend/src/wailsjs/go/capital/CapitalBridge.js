export function GetAccounts() {
  return window['go']['capital']['CapitalBridge']['GetAccounts']();
}

export function CreateTransaction(req) {
  return window['go']['capital']['CapitalBridge']['CreateTransaction'](req);
}

export function ImportCSV(content) {
  return window['go']['capital']['CapitalBridge']['ImportCSV'](content);
}

export function ExportTrialBalance() {
  return window['go']['capital']['CapitalBridge']['ExportTrialBalance']();
}

export function ExportProfitLoss() {
  return window['go']['capital']['CapitalBridge']['ExportProfitLoss']();
}