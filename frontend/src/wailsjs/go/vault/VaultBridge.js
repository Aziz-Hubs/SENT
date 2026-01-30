export function ListFiles(dir) {
  return window['go']['vault']['VaultBridge']['ListFiles'](dir);
}

export function ReadFile(path) {
  return window['go']['vault']['VaultBridge']['ReadFile'](path);
}

export function SaveFile(path, content) {
  return window['go']['vault']['VaultBridge']['SaveFile'](path, content);
}

export function CreateFolder(path) {
  return window['go']['vault']['VaultBridge']['CreateFolder'](path);
}

export function DeleteFile(path) {
  return window['go']['vault']['VaultBridge']['DeleteFile'](path);
}

export function GetFileHistory(path) {
  return window['go']['vault']['VaultBridge']['GetFileHistory'](path);
}