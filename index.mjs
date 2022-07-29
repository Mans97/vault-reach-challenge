import { loadStdlib, ask } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
//import { done } from '@reach-sh/stdlib/ask.mjs'
const stdlib = loadStdlib();
var isOk = false;
 
(async () => {

  

  const accAlice = "upper destroy arrest urge flush kit seven carpet slow gym mobile wasp tuition fat pond valley pyramid clap sun elephant seven great genre able flower"

  const accBob = "clock outdoor feed visa weekend tennis edit brave hope patrol funny lava stock act vote matter pass best myth lonely tell box rotate able wolf"

  const isAlice = await ask.ask(
    'Are you Alice?',
    ask.yesno
  )

  const who = isAlice ? 'Alice': 'Bob';

  console.log (`Welcome to this Vault program ${who}!`);

  stdlib.setProviderByName('TestNet');

  let acc;

  if(isAlice){
    acc = await stdlib.newAccountFromMnemonic(accAlice);
  }
  else {
    acc = await stdlib.newAccountFromMnemonic(accBob);
  }

  let ctc = null;

  if(isAlice){
    ctc = acc.contract(backend)
    ctc.getInfo().then((info => {
      console.log(`ctc id = ${JSON.parse(info)}`)
    }))
  } else {
    const info = await ask.ask(
      'Please paste the contract information:',
      // check that the input given is in the proper format
      JSON.parse
    )
    ctc = acc.contract(backend, info)
  }

  // function to reduce decimal number, in this case 4
  const fmt = (x) => stdlib.formatCurrency(x, 4) 

  // retreive the balance for the account passed as parameter
  const getBalance = async() => fmt(await stdlib.balanceOf(acc))

  const before = await getBalance();
  console.log(`Your balance is ${before}`)

  const interact = { ...stdlib.hasRandom }

  interact.log = async (...args) => {
    console.log(...args)
  };

  interact.informTimeout = async() => {
    console.log(`There was a timeout`)

    const outcome = isOk ? 'Alice' : 'Bob';
    console.log(`Founds transferred to: ${outcome}`)
    

    const after = await getBalance();
    console.log(`Your balance is ${after}`)
    process.exit(0)
  }

  if(isAlice){
    const amt = await ask.ask(
      'How much is your vault?',
      stdlib.parseCurrency
    )
    interact.vault = amt;
    //deadline different for consensus network
    interact.deadline = 40/5
  } else {
    interact.acceptVault = async (amt) => {
      const accepted = await ask.ask(
        `Accept the contract with a vault of ${fmt(amt)}?`,
        ask.yesno
      )
      if (!accepted){
        return false;
      }
      else {
        return true;
      }
    }
  }

  if(isAlice){
    interact.askStillHere = async()=> {
      const aliceOk = await ask.ask(
        `Are you still here?`,
        ask.yesno
      )  
      return aliceOk ? true : false;
    }
  }

  interact.seeOutcome = async(stillThere) => {
    if(stillThere){
      console.log(`Founds transferred to: Alice`);
    }
    else {
      console.log(`Founds transferred to: Bob`);
    }
    
  }

  const part = isAlice ? backend.Alice : backend.Bob;
  await part(ctc, interact);

  const after = await getBalance();
  console.log(`Your balance is ${after}`)
  

  // interact.getHand = async()=> {
  //   const hand = await ask(
  //     `What will you play`,
  //     (x) => {
  //       const playerHand = HANDS[x];
  //       if(playerHand == null){
  //         throw Error(`Not a valid hand ${playerHand}`)
  //       }
  //       return playerHand
  //     }
  //   )
  //   console.log(`You player ${HAND[hand]}`)
  //   return hand
  // }

  // const OUTCOME = ['Bob wins', 'Draw', 'Alice wins']

  
  ask.done();

})();
