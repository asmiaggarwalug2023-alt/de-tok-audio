import type {DigestPaper} from './evidence';
export type StatementUpdate={status:'searching'|'complete'|'error';papers?:DigestPaper[];total?:number;error?:string};
export function runStatementSearches(options:{claims:{claim:string;query:string}[];signal:AbortSignal;onUpdate:(index:number,update:StatementUpdate)=>void;fetcher?:typeof fetch;timeoutMs?:number}):Promise<void>;
