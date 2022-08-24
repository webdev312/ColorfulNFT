import React, { useEffect, useState } from 'react';
import Web3 from 'web3'
import Color from '../abis/Color.json'

const App = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [colors, setColors] = useState([])
  const [colorValue, setColorValue] = useState('')

  useEffect(() => {
    const load = async () => {
      await loadWeb3();
      await loadBlockchainData();
    }
    load();
  },[colors])

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  const loadBlockchainData = async () => {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])

    const networkId = await web3.eth.net.getId()
    const networkData = Color.networks[networkId]
    if (networkData) {
      const abi = Color.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      setContract(contract)
      const totalSupply = await contract.methods.totalSupply().call()
      // Load Colors
      const tempColors = []
      for (var i = 1; i <= totalSupply; i++) {
        const color = await contract.methods.colors(i - 1).call()
        tempColors.push(color)
      }
      setColors(tempColors)
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  const mint = (color) => {
    console.log(color)
    contract.methods.mint(color).send({ from: account })
      .once('receipt', (receipt) => {
        setColors({
          colors: [...colors, color]
        })
      })
  }
  const coin = {
      border: "1px solid",
      borderRadius: "50%",
      width: "100px",
      height: "100px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }
  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Color Tokens
        </a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-white"><span id="account">{account}</span></small>
          </li>
        </ul>
      </nav>
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <h1>Issue Token</h1>

                <input
                  type='text'
                  className='form-control mb-1'
                  placeholder='e.g. #FFFFFF'
                  value={colorValue}
                  onChange={(e)=> {setColorValue(e.target.value)}}
                />
                <input
                  type='button'
                  className='btn btn-block btn-primary'
                  value='MINT'
                  onClick={() => {
                    mint(colorValue)
                  }}
                />
            </div>
          </main>
        </div>
        <hr />
        {
          !!colors.length && 
          <div className="row text-center">
          {colors.map((color, key) => {
            return (
              <div key={key} className="col-md-3 mb-3">
                <div className="token" style={{ backgroundColor: color }}></div>
                <div style={{...coin, backgroundColor: color}}>{color}</div>
              </div>
            )
          })}
        </div>
        }
      </div>
    </div>
  );
}

export default App;