export function Checkout(req) {
  return window['go']['stock']['KioskBridge']['Checkout'](req);
}

export function OpenDrawer() {
  return window['go']['stock']['KioskBridge']['OpenDrawer']();
}

export function PrintReceipt(req) {
  return window['go']['stock']['KioskBridge']['PrintReceipt'](req);
}