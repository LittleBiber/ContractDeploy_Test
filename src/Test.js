const Web3 = require("web3");
const EthereumTx = require("ethereumjs-tx").Transaction;

const rpcURL = "http://127.0.0.1:7545";
const web3 = new Web3(rpcURL);

const NUBI = require("./Data/NUBICoin.json");
const abi = NUBI.abi;
const bytecode = NUBI.bytecode;

let deploy_contract = new web3.eth.Contract(abi);

const account = "0x3100F19B46E56b04d01dfB8Dd71094E4c930693d";

let payload = {
  data: bytecode,
};

//! 컨트랙트 배포에 필요한 요소들
//1: from > 컨트랙트 배포에 사용될 지갑의 주소 (배포를 위한 이더 필요)
//2: gas > 배포에 사용할 수수료의 최대값. 가스비가 이 값을 초과하면 취소됨.
//3: gasPrice > 배포에 사용하려는 가스비 값. 이 값 기반으로 처리하려고 시도

let parameter = {
  from: account,
  gas: web3.utils.toHex(800000), // 굳이 헥스값 계산 안해도 이 함수로 바로 처리할수 있을듯
  gasPrice: web3.utils.toHex(web3.utils.toWei("30", "gwei")),
};

deploy_contract
  .deploy(payload)
  .send(parameter, (err, transactionHash) => {
    console.log("TransactionHash: ", transactionHash);
  })
  .on("confirmation", () => {})
  .then((newContractInstance) => {
    console.log(
      "Deployed Contract Address : ",
      newContractInstance.options.address
    );
  });
