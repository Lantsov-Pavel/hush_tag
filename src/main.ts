import { Hush } from './Hush.js';
import { Field, Mina, PrivateKey, AccountUpdate, PublicKey } from 'o1js';
import { generateQRCode, readQRCode} from './qr_utils.js';
import path from 'path';

const useProof = false;

const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);

const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key;
// ----------------------------------------------------
// await generateTicket();

// const imgFilePath = path.format({
//   dir: 'img',
//   name: 'B62qqL47z8LL1tALQEEqhpvDJrH8nV1NVTefvKUxqE7rdi6mmACmc8C',
//   // name: zkAppAddressStr,
//   ext: '.bmp'
// });
// const readStatus = await validateTicket(imgFilePath);
// console.log(readStatus);

// Create a public/private key pair.
// Create an instance of Hush - and deploy it to zkAppAddress
export async function generateTicket() {
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();
  let zkAppAddressStr = zkAppAddress.toBase58();
  console.log('PublicKey:', zkAppAddressStr);
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
  await generateQRCode(zkAppAddress.toBase58(), zkAppAddressStr);
  
  // Return useful data that the API can send to the frontend
  return {
    publicKey: zkAppAddressStr,
    privateKey: zkAppPrivateKey.toBase58()
  };
}

// ----------------------------------------------------
// Read QR code from the generated image
// console.log('Reading addr from QR code');

export async function validateTicket(imgFilePath: string) {
  let readAddress = await readQRCode(imgFilePath);
  if (readAddress != '') {
  try {
      let zkAppAddress_rd = PublicKey.fromBase58(readAddress);
      let zkAppInstance_rd = new Hush(zkAppAddress_rd);
      let num2 = zkAppInstance_rd.used.get();
      // console.log('state after read:', num2.toString());
      if (num2.toString() == '0') {
        // console.log('Ticket is valid');
        const txn1 = await Mina.transaction(senderAccount, async () => {
          await zkAppInstance_rd.update();
        });
        await txn1.prove();
        await txn1.sign([senderKey]).send();
        return 'ACCEPTED';
        // const num1 = zkAppInstance_rd.used.get();
        // console.log('state after txn1:', num1.toString());
      } else {
      // console.log('Ticket has been used');
      return 'HANDLED';
      }
    } catch (error: any) {
        // console.log('Record does not exist: ', error.message);
        return 'UNCOVERED';
    }
  } else {
    return 'UNCOVERED';
  }
}


