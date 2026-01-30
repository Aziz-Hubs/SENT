export function GetAccounts():Promise<any[]>;
export function CreateTransaction(req:any):Promise<string>;
export function ImportCSV(content:string):Promise<string>;
export function ExportTrialBalance():Promise<string>;
export function ExportProfitLoss():Promise<string>;