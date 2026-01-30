export function GetOrgs() {
  return window['go']['admin']['AdminBridge']['GetOrgs']();
}

export function GetUsers() {
  return window['go']['admin']['AdminBridge']['GetUsers']();
}

export function DeleteOrg(id) {
  return window['go']['admin']['AdminBridge']['DeleteOrg'](id);
}

export function DeleteUser(id) {
  return window['go']['admin']['AdminBridge']['DeleteUser'](id);
}

export function GetStats() {
  return window['go']['admin']['AdminBridge']['GetStats']();
}
