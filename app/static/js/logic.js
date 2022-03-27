//or u could initialize like this
const serverUrl = "https://vnxt2uhutuem.usemoralis.com:2053/server";
const appId = "5kDFWpUkqb9flCuQO32KhxFmNsQSmAKfcmPJgP8E";
Moralis.start({serverUrl, appId});

//play nft address on rinkeby
const nft_contract_address = "0xa89C173bFd03b433542B9f0Fe81f1229F36a3fdf" //NFT Minting Contract Use This One "Batteries Included", code of this contract is in the github repository under contract_base for your reference.
/*
Other Available deployed contracts
Ethereum Rinkeby 0x0Fb6EF3505b9c52Ed39595433a21aF9B5FCc4431
Polygon Mumbai 0x351bbee7C6E9268A1BF741B098448477E08A0a53
BSC Testnet 0x88624DD1c725C6A95E223170fa99ddB22E1C6DDD
*/

const web3 = new Web3(window.ethereum);

//frontend logic

async function login(){
  document.getElementById('login').setAttribute("disabled", null);
  document.getElementById('username').setAttribute("disabled", null);
  document.getElementById('useremail').setAttribute("disabled", null);
  await Moralis.Web3.authenticate({signingMessage:"Welcome Dog Boy"}).then(async function (user) {
      user.set("name",document.getElementById('username').value);
      user.set("email",document.getElementById('useremail').value);
      user.save();
      address = user.get('ethAddress');
      let options = {chain: "rinkeby", address: address};
      let balance = await Moralis.Web3API.account.getNativeBalance(options);
      document.getElementById("balance").innerHTML = balance['balance']/ 10**18;
      document.getElementById("upload").removeAttribute("disabled");
      document.getElementById("file").removeAttribute("disabled");
      document.getElementById("name").removeAttribute("disabled");
      document.getElementById("description").removeAttribute("disabled");
  })
}

async function logOut(){
  await Moralis.User.logOut();
  console.log('User logged out');
  document.getElementById('login').removeAttribute("disabled");
  document.getElementById('username').removeAttribute("disabled");
  document.getElementById('useremail').removeAttribute("disabled");
}

async function upload(){
  const fileInput = document.getElementById("file");
  const data = fileInput.files[0];
  console.log(data);
  const imageFile = new Moralis.File(data.name, data);
  document.getElementById('upload').setAttribute("disabled", null);
  document.getElementById('file').setAttribute("disabled", null);
  document.getElementById('name').setAttribute("disabled", null);
  document.getElementById('description').setAttribute("disabled", null);
  await imageFile.saveIPFS();
  const imageURI = imageFile.ipfs();
  console.log(imageURI)
  const metadata = {
    "name":document.getElementById("name").value,
    "description":document.getElementById("description").value,
    "image":imageURI
  }
  const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
  await metadataFile.saveIPFS();
  const metadataURI = metadataFile.ipfs();
  console.log(metadataURI);
  const txt = await mintToken(metadataURI).then(notify);
  console.log(txt);
  logOut();
}

async function mintToken(_uri){
  const encodedFunction = web3.eth.abi.encodeFunctionCall({
    name: "mintToken",
    type: "function",
    inputs: [{
      type: 'string',
      name: 'tokenURI'
      }]
  }, [_uri]);

  //nftMint = web3.eth.contract(nft_contract_address, abi = nftAbi)


  const transactionParameters = {
    to: nft_contract_address,
    from: ethereum.selectedAddress,
    data: encodedFunction,
    //value: 30000000000000000
  };
  const txt = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [transactionParameters],
  });
  return txt
}

async function notify(_txt){
  document.getElementById("resultSpace").innerHTML =  
  `<input disabled = "true" id="result" type="text" class="form-control" placeholder="Description" aria-label="URL" aria-describedby="basic-addon1" value="Your NFT was minted in transaction ${_txt}">`;
} 

//document.getElementById("login").onclick = login();