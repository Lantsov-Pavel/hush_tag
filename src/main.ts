import { Hush } from './Hush.js';
import { Field, Mina, PrivateKey, AccountUpdate, PublicKey } from 'o1js';
import { generateQRCode, readQRCode } from './qr_utils.js';
import path from 'path';

const useProof = false;

const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);

const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key;
// ----------------------------------------------------

// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();
let zkAppAddressStr = zkAppAddress.toBase58();
console.log('PublicKey:', zkAppAddressStr);

// Generate QR code for zkAppAddress
await generateQRCode(zkAppAddress.toBase58(), zkAppAddressStr);

// ----------------------------------------------------
// create an instance of Square - and deploy it to zkAppAddress
const zkAppInstance = new Hush(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, async () => {
  // 1 Mina fee is required to create a new account for the zkApp
  // This line means the deployer account will pay the fee for any account created in this transaction
  AccountUpdate.fundNewAccount(deployerAccount);
  await zkAppInstance.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// get the initial state of Square after deployment
const num0 = zkAppInstance.used.get();
console.log('state after init:', num0.toString());

// ----------------------------------------------------

// const txn1 = await Mina.transaction(senderAccount, async () => {
//   await zkAppInstance.update();
// });
// await txn1.prove();
// await txn1.sign([senderKey]).send();

// const num1 = zkAppInstance.used.get();
// console.log('state after txn1:', num1.toString());

// ----------------------------------------------------
console.log('Reading addr from QR code');
// Read QR code from the generated image
const imgFilePath = path.format({
  dir: 'img',
  name: zkAppAddressStr,
  ext: '.bmp'
});
let readAddress = await readQRCode(imgFilePath);
// readAddress = 'B62qmko6uGgxB7yvcaBfrWycebrBAokf3ps8qbFpVX7vivuKVUSL25a';
if (readAddress != '') {
let zkAppAddress_rd = PublicKey.fromBase58(readAddress);
let zkAppInstance_rd = new Hush(zkAppAddress_rd);
let num2 = zkAppInstance_rd.used.get();
console.log('state after read:', num2.toString());
};
