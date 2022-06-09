function App() {
    const ethereum = window.ethereum
    const [accounts, setAccounts] = useState([])

    const web3 = new Web3()

    if (typeof ethereum !== 'undefined') {
        console.log('MetaMask is installed!')
    }

    // 계정정보 가져오기
    const connectMetamask = async () => {
        const list = await ethereum.request({ method: 'eth_requestAccounts' })
        setAccounts(list)
    }

    // ref: https://docs.metamask.io/guide/sending-transactions.html
    const transactionParameters = {
        from: accounts[0], // must match user's active address.
        gas: web3.utils.toHex(2400000), // "0x2710", // customizable by user during MetaMask confirmation.
        gasPrice: web3.utils.toHex(web3.utils.toWei('90', 'gwei')), // "0x09184e72a000", // customizable by user during MetaMask confirmation.
        data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.

        // chainId: "0x3", // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
        // nonce: "0x00", //! ignored by MetaMask
        // to: "0xcee918103cD9fd6434EA9B4b59602eB3F4444FaE", //! Required except during contract publications.
        // value: "0x00", //! Only required to send ether to the recipient from the initiating external account.
    }

    // txHash is a hex string
    // As with any RPC call, it may throw an error
    const txHash = async () => {
        await ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        })
    }

    return (
        <div className="App">
            {/* <h1>리액트로 메타마스크 접근 시도</h1>
          <button onClick={connectMetamask}>연결하기</button>
          <button onClick={() => console.dir(window.ethereum)}>Test</button>
          <button onClick={txHash}>테스트해보기</button> */}
        </div>
    )
}

export default App
