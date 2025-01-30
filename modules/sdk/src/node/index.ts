
/**
 * THE FOLLOWING IS BUILD WITH A NODE COMPILE TARGET
 */
import { URL } from "url";
import * as fs from "fs";
import * as anchor from "@project-serum/anchor";
import bs58 from "bs58"; 
import { pathFromRoot } from '@hydraprotocol/utils-node';
type PathLike = string | Buffer | URL;


export function loadKeySync(path:PathLike): anchor.web3.Keypair{
  const rawdata = fs.readFileSync(pathFromRoot(path.toString()));
  const keydata = JSON.parse(rawdata.toString());
  return anchor.web3.Keypair.fromSecretKey(new Uint8Array(keydata));
}

export async function loadKey(path: PathLike): Promise<anchor.web3.Keypair> {
  return loadKeySync(path);
}

export async function saveKey(keypair: anchor.web3.Keypair, type:'tokens' | 'users' = 'tokens'): Promise<void> {
  const name = keypair.publicKey.toString();
  const path = pathFromRoot(`keys/${type}/${name}.json`);
  const file  = JSON.stringify(Array.from(keypair.secretKey));
  fs.writeFileSync(path, Buffer.from(file));
}

export async function getPrivateKey(filepath:string) {
  if (!fs.existsSync(filepath)) {
    throw new Error("could not find file");
  }
  const sk = JSON.parse(fs.readFileSync(filepath).toString());
  return bs58.encode(sk);
}
