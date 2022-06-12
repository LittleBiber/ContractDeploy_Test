import Web3 from 'web3'
import { useState, useRef } from 'react'

export default function App() {
    const sendTarget = useRef()

    //! 토큰의 정보 JSON파일 불러오기
    const TokenJSON = require('./Data/Web3Token/Web3Token.json')

    //! 지갑 주소 저장하는 상태값
    const [walletAddress, setWalletAddress] = useState(null)

    //! Web3
    const web3 = new Web3(window.ethereum)

    //! 지갑 연결
    const connectWallet = async () => {
        // Check if MetaMask is installed on user's browser
        if (window.ethereum) {
            // Try to get MetaMask account
            const accounts = await window.ethereum.request({
                method: 'eth_accounts',
            })
            setWalletAddress(accounts[0])
            web3.eth.defaultAccount = accounts[0]
        } else {
            alert('Install MetaMask first!')
        }
    }

    //! 송금
    const sendReq = () => {
        // 파라미터
        const requestParams = [
            {
                from: walletAddress, // 20byte 트랜잭션 전송하는 주소
                to: '0x52da6ae219Ee4188b9a020aE70B888B45B6E742e', // 20byte 트랜잭션 받는 주소 (컨트랙트 배포 시 사용하지 않음)
                gas: web3.utils.toHex(30400), // '0x76c0', // 30400 // 정수형, 트랜잭션 실행 시 사용하는 가스비. 반환값은 미사용된 가스, 기본값 90000
                gasPrice: web3.utils.toHex(100000000000), // 10000000000000 // 각 트랜잭션에 사용되는 가스비?, 기본값은 실행 시 결정됨
                value: web3.utils.toHex(10000000000000000), // 2441406250 // 정수형, 실행 시 전송되는 값, 단위 Wei
                data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
                // ABI 또는 인코딩된 파라미터의 해쉬값?
                // nonce // 정수형, pending 상태의 트랜잭션을 덮어씌울 수 있다.
            },
        ]

        window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: requestParams,
            })
            .then((result) => {
                console.log(result) // 성공 시 실행. 반환값은 해당 트랜잭션 주소
            })
            .catch((error) => {
                console.log(error) // 실패 시 실행, 코드와 메세지로 오류 확인
            })
    }

    //! 컨트랙트 배포
    // provider로 메타마스크(정확히는 주입된 window.ethereum)을 넘겨준다.
    // 지금 연결된 건 메타마스크뿐이니까 가능하지만, 추후 수정을 통해 메타마스크만 대상으로 할지 명확히 지정해야 한다.

    // 페이로드를 배포하고 파라미터로 발송자 정보를 제공, 콜백은 에러/성공여부에 따라 받은 데이터 출력
    // 맨 앞에서 Provider를 메타마스크가 주입한 window.ethereum 객체로 지정했기 때문에, 이 함수가 실행되면 메타마스크가 개입해 사이닝 + 배포를 해 준다.
    const deployContract = () => {
        // 컨트랙트 생성
        const newContract = new web3.eth.Contract(TokenJSON.abi)

        // 컨트랙트의 페이로드, EVM을 위한 바이트코드와 컨스트럭터에 들어갈 변수가 저장된다.
        const payload = {
            data: TokenJSON.bytecode,
            arguments: ['Web3Token', 'W3T', 'http://localhost:3000/', ''],
        }

        // 컨트랙트의 파라미터, 컨트랙트를 전송하는 대상을 지정한다.
        // 가스비는 지정할 수 있지만, 메타마스크에서 알아서 계산해주는 쪽이 더 잘 되는 편
        const deployParams = {
            from: walletAddress,
            // gas: web3.utils.toHex(1000000),
            // gasPrice: web3.utils.toHex(web3.utils.toWei('90', 'gwei')),
        }

        newContract
            .deploy(payload)
            .send(deployParams, (err, transactionHash) => {
                if (err) console.log('ERROR!!!')
                else console.log('TransactionHash: ', transactionHash)
            })
            .on('confirmation', () => {})
            .then((newContractInstance) => {
                console.log(
                    'Deployed Contract Address : ',
                    newContractInstance.options.address
                )
            })
    }

    //! 배포한 토큰의 함수 실행
    const getTokenName = () => {
        const myContract = new web3.eth.Contract(
            TokenJSON.abi, // 컨트랙트의 ABI를 갖고 있어야 한다
            '0xe8264392add85eb2e398dbc42023c0ec88ff7370' // 컨트랙트의 주소
        )
        myContract.methods
            .name() // 그냥 값을 받아오는 것이어도 함수처럼 괄호를 붙여 실행해줘야 한다.
            .call() // 앞에 적은값을 불러오겠다는 뜻
            .then((result) => console.log(result)) // Promise로 오므로 then으로 출력
    }

    //! 토큰을 민팅 가능하게 설정
    const changePaused = () => {
        const myContract = new web3.eth.Contract(
            TokenJSON.abi,
            '0xe8264392add85eb2e398dbc42023c0ec88ff7370'
        )

        myContract.methods
            .pause(false)
            .send({ from: walletAddress })
            .then((result) => console.log(result))
    }

    //! 토큰 민팅
    const mintNFT = () => {
        const myContract = new web3.eth.Contract(
            TokenJSON.abi,
            '0xe8264392add85eb2e398dbc42023c0ec88ff7370'
        )

        myContract.methods
            .mint(1)
            .send({
                from: walletAddress,
                value: web3.utils.toHex(500000000000000000),
            })
            .then((result) => console.log(result))
    }

    //! 토큰을 다른 유저에게 전달

    //! NUBICoin 정보 불러오기
    const NUBICoin = require('./Data/NUBI/NUBICoin.json')

    //! NUBI Coin 배포
    const deployNUBICoin = () => {
        const newContract = new web3.eth.Contract(NUBICoin.abi)

        const payload = {
            data: NUBICoin.bytecode,
        }

        const deployParams = {
            from: walletAddress,
        }

        newContract
            .deploy(payload)
            .send(deployParams, (err, transactionHash) => {
                if (err) console.log('ERROR!!!')
                else console.log('TransactionHash: ', transactionHash)
            })
            .on('confirmation', () => {})
            .then((newContractInstance) => {
                console.log(
                    'Deployed Contract Address : ',
                    newContractInstance.options.address
                )
            })
    }

    return (
        <div className="App">
            <h1>메타마스크 연결 테스트</h1>
            <div>
                <button onClick={connectWallet}>메타마스크 지갑 연결</button>
                {walletAddress ? (
                    <span>현재 지갑주소 {walletAddress}</span>
                ) : (
                    ''
                )}
            </div>
            <div>
                <button onClick={sendReq}>송금</button>
            </div>
            <div>
                <button onClick={deployContract}>토큰 배포</button>
            </div>
            <div>
                <button onClick={getTokenName}>토큰이름 불러오기</button>
            </div>
            <div>
                <button onClick={changePaused}>토큰 pause 상태변경</button>
            </div>
            <div>
                <button onClick={mintNFT}>토큰 민팅</button>
            </div>
            <div>
                <input ref={sendTarget} />
                <button>해당 주소로 토큰 전달</button>
            </div>
            <br />
            <h1>NUBI Coin</h1>
            <div>
                <button onClick={deployNUBICoin}>NUBI Coin 배포</button>
            </div>
        </div>
    )
}
