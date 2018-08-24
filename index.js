const BITBOXCli = require('bitbox-cli/lib/bitbox-cli').default;

// Settings for local node mode below:
let bitboxConfig = [{ 
  protocol: 'http',
  host: 'host.server.com',
  port: 8332,
  username: 'user',
  password: 'pass',
  corsproxy: false,
}, { 
  protocol: 'http',
  host: 'host2.server.com',
  port: 8332,
  username: 'user2',
  password: 'pass2',
  corsproxy: false,
}, { 
  protocol: 'rest',
  host: 'rest.bitcoin.com'
}];

let bitbox = [];

for(let i = 0; i < bitboxConfig.length; i++)
{
  if(bitboxConfig[i].protocol !== 'rest')
    bitbox.push(new BITBOXCli(bitboxConfig[i]));
  else
    bitbox.push(new BITBOXCli());
}



let main = async () => {
  let replayed = new Set();
  for(let i = 0; i < bitboxConfig.length; i++)
  {
    const res = await bitbox[i].Blockchain.getRawMempool();
    for(let j = 0; j < res.length; j++) 
    {
      if(!replayed.has(res[j])) 
      {
        try {
        console.log('Trying to replay ' + res[j]);
        const tx = await bitbox[i].RawTransactions.getRawTransaction(res[j]);
        console.log('Got raw tx ' + tx);
        for(let k = 0; k < bitboxConfig.length && tx !== undefined; k++) {
          if(k !== i) {
            bitbox[k].RawTransactions.sendRawTransaction(tx).then(txId => {
              if(txId !== undefined)
                console.log('Replayed tx ' + txId + ' on ' + bitboxConfig[k].host);
            }, err => {
              console.log('Error replaying tx');
              console.log(err);
            });
          }
        }
        } catch (err) {
          console.log(err);
        }
      }
    }
    return true;
  }
}

let start = async () => {
  while(true) {
    await main();
  }
}

start();


