export function Login() {
  return window['go']['auth']['AuthBridge']['Login']();
}

export function Logout() {
  return window['go']['auth']['AuthBridge']['Logout']();
}

export function GetUserProfile() {
  return window['go']['auth']['AuthBridge']['GetUserProfile']();
}

export function IsAuthenticated() {
  return window['go']['auth']['AuthBridge']['IsAuthenticated']();
}
