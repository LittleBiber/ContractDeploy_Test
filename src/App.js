import Web3 from 'web3'
import { useState } from 'react'

export default function App() {
    //! 토큰의 정보 JSON파일 불러오기
    const TokenJSON = require('./Data/Web3Token/Web3Token.json')

    //! 지갑 주소 저장하는 상태값
    const [walletAddress, setWalletAddress] = useState(null)

    //! 지갑 연결하는 함수.
    const connectWallet = async () => {
        // Check if MetaMask is installed on user's browser
        if (window.ethereum) {
            // Try to get MetaMask account
            const accounts = await window.ethereum.request({
                method: 'eth_accounts',
            })
            setWalletAddress(accounts[0])
        } else {
            alert('Install MetaMask first!')
        }
    }

    // 송금 테스트 파라미터
    const requestParams = [
        {
            from: walletAddress, // 20byte 트랜잭션 전송하는 주소
            // to: '0x52da6ae219Ee4188b9a020aE70B888B45B6E742e', // 20byte 트랜잭션 받는 주소 (컨트랙트 배포 시 사용하지 않음)
            gas: '0x' + '12800'.toString(16), // '0x76c0', // 30400 // 정수형, 트랜잭션 실행 시 사용하는 가스비. 반환값은 미사용된 가스, 기본값 90000
            gasPrice: '0x9184e72a000', // 10000000000000 // 각 트랜잭션에 사용되는 가스비?, 기본값은 실행 시 결정됨
            value: '100000000000000'.toString(16), // 2441406250 // 정수형, 실행 시 전송되는 값, 단위 Wei
            data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
            // ABI 또는 인코딩된 파라미터의 해쉬값?
            // nonce // 정수형, pending 상태의 트랜잭션을 덮어씌울 수 있다.
        },
    ]

    // 송금 함수
    const sendReq = () => {
        window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: requestParams,
            })
            .then((result) => {
                // 성공 시 실행. 반환값은 해당 트랜잭션 주소
                console.log(result)
            })
            .catch((error) => {
                // 실패 시 실행, 코드와 메세지로 오류 확인
                console.log(error)
            })
    }

    //! 컨트랙트 배포
    // provider로 메타마스크를 넘겨준다.
    // 지금 연결된 건 메타마스크뿐이니까 가능하지만, 추후 수정을 통해 메타마스크만 대상으로 할지 명확히 지정해야 한다.
    const web3 = new Web3(window.ethereum)

    // 컨트랙트 객체 생성
    const newContract = new web3.eth.Contract(TokenJSON.abi)

    // 컨트랙트의 페이로드, EVM을 위한 바이트코드와 컨스트럭터에 들어갈 변수가 저장된다.
    const payload = {
        data: TokenJSON.bytecode,
        arguments: ['Web3Token', 'W3T', 'http://localhost:3000/', ''],
    }

    // 컨트랙트의 파라미터, 컨트랙트를 전송하는 대상을 지정한다.
    // 가스비는 지정할 수 있지만, 메타마스크에서 알아서 계산해주는 쪽이 더 잘 되는 편
    const parameter = {
        from: walletAddress,
        // gas: web3.utils.toHex(1000000), // 굳이 헥스값 계산 안해도 이 함수로 바로 처리할수 있을듯
        // gasPrice: web3.utils.toHex(web3.utils.toWei('90', 'gwei')),
    }

    // 컨트랙트 배포 함수
    // 페이로드를 배포하고 파라미터로 발송자 정보를 제공, 콜백은 에러/성공여부에 따라 받은 데이터 출력
    // 맨 앞에서 Provider를 메타마스크가 주입한 window.ethereum 객체로 지정했기 때문에, 이 함수가 실행되면 메타마스크가 개입해 사이닝 + 배포를 해 준다.
    const deployContract = () => {
        newContract
            .deploy(payload)
            .send(parameter, (err, transactionHash) => {
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
            <button onClick={connectWallet}>연결 테스트</button>
            <div>{walletAddress}</div>
            <button onClick={sendReq}>송금 테스트(성공)</button>
            <button onClick={deployContract}>배포 테스트(성공)</button>
        </div>
    )
}

//! https://velog.io/@jaewoneee/Webpack
//! https://stackoverflow.com/questions/70557596/couldnt-import-web3-library-in-react-application
