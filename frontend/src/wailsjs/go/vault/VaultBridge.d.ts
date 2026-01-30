export function ListFiles(dir: string):Promise<any[]>;
export function ReadFile(path: string):Promise<string>;
export function SaveFile(path: string, content: string):Promise<void>;
export function CreateFolder(path: string):Promise<void>;
export function DeleteFile(path: string):Promise<void>;
export function GetFileHistory(path: string):Promise<string[]>;