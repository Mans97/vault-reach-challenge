'reach 0.1';
'use strict';

const countdown = 5;

const Player = {
  ...hasRandom,
  ...hasConsoleLogger,
  askStillHere: Fun([], Bool), 
  seeOutcome: Fun([Bool], Null),
  informTimeout: Fun([],Null)
}


export const main = Reach.App(() => {

  const Alice = Participant('Alice',{
    ...Player,
    vault: UInt,
    deadline: UInt
  })

  const Bob = Participant('Bob',{
    ...Player,
    acceptVault: Fun([UInt], Bool)
  })


  const informTimeout = () => {
    each([Alice, Bob], () => {
      interact.informTimeout()
    })
  }

  init();

  Alice.only(() => {
    const deadline = declassify(interact.deadline)
    const vault = declassify(interact.vault);
    
  })

  Alice.publish(vault, deadline)
  .pay(vault);
  commit();

  
  Bob.only(() => {
    const bobAccept = declassify(interact.acceptVault(vault));
  })
  Bob.publish(bobAccept)
  .timeout(relativeTime(deadline),() => closeTo(Alice, informTimeout));
  

  if(!bobAccept){
    transfer(balance()).to(Alice);
    commit();
    exit();
  }
  else {
    const cd = lastConsensusTime() + countdown;
    var stillHere = true
    invariant( balance() == balance() )
    while ( stillHere == true && cd-lastConsensusTime() != 0) {
      commit();
      Alice.only (() => {
        const aliceStillHere = declassify(interact.askStillHere());
      })
      Alice.publish(aliceStillHere)
      .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
      stillHere = aliceStillHere;
      continue;
    }

    if(stillHere){
      transfer(balance()).to(Alice);
    }
    else {
      transfer(balance()).to(Bob);
    }

    commit();
    each ([Alice,Bob], () => {
      interact.seeOutcome(stillHere);
    })

    // commit();
    // Alice.only(() => {
    //   const aliceStillHere = declassify(interact.askStillHere());
    // })
    // Alice.publish(aliceStillHere)
    // .timeout(relativeTime(deadline),() => closeTo(Bob, informTimeout));
    // transfer(balance()).to(Alice);
    // commit();
  }
  
  exit();
});


  

  