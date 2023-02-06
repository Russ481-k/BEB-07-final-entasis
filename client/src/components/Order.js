import {useWeb3React} from "@web3-react/core";
import React from "react"
import {useState, useEffect} from 'react';
import {FaucetWallet, EnrollWallet, ChName, Tutorial, Score, Position, Account} from '../apis/user';
import {BuyToken, SellToken} from '../apis/token';
import Web3 from "web3";
import TokenABI from "../ABIs/ERC1400.json"

const Order =({ST_CurrentPrice,userEth,userToken})=>{
    const [amount, setAmount] = useState("");
    const [price, setPrice] = useState("");
    const [isFaucet, setIsFaucet] = useState(false)
    const {chainId, account, active, activate, deactivate} = useWeb3React();
    /* const [userEth, setUserEth] = useState("")
    const [userToken, setUserToken] = useState("") */
    const [curPrice, setCurPrice] = useState()
    const countNumber=(e)=>{
        return e.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g,",")
    }
    const pubName = 'exchange';
    const web3 = new Web3(
        window.ethereum || "http://18.182.9.156:8545"
    );
    //가나슈 변경사항 생길 시 건드려야 할 부분
    const contractAccount = '0x04794606b3065df94ef3398aA2911e56abE169B6';
    const serverAccount = '0x48c02B8aFddD9563cEF6703df4DCE1DB78A6b2Eb';
    // -----------------------------------------------------------------
    const userAccount = useWeb3React().account;
    const StABI = TokenABI.abi
    const tokenContract = new web3.eth.Contract(StABI, contractAccount);

    useEffect(() => {
        setCurPrice(ST_CurrentPrice)
        priceChange()
    },[ST_CurrentPrice])

    function priceChange(){
        let curprice = curPrice;
        setPrice(curprice)
    }

    function amountChange(e){
        let curamount = e.target.value;
        setAmount(curamount)
    }
    // 구매
    async function SendETH(){
        const totalValue = amount * price * 1.0004;
        web3.eth.sendTransaction({
            from: userAccount,
            to: serverAccount,
            value: web3.utils.toWei(String(totalValue), 'ether')
        }).then(function(receipt){
            console.log(receipt)
            BuyToken(pubName, String(price), String(amount), userAccount)
        });
    }
    // 판매
    async function SendToken(){
        const data = await tokenContract.methods.transfer(serverAccount, web3.utils.toWei(amount)).encodeABI()
        const tx = {
            from: userAccount,
            to: tokenContract._address,
            data: data,
            gas: 210000,
            gasPrice: 100000000
        }

        await web3.eth.sendTransaction(tx).then(function(receipt){
            console.log(receipt)
            SellToken(pubName, String(price), String(amount), userAccount)
        })
    }
    

    const ST_1 = {
        name:'ENTA',price:(curPrice * userToken).toFixed(4) ,amount: userToken
    };
    const ST_2 = {
        name:'DEDE',price:'100',amount:'230'
    };
    const ST_3 = {
        name:'CECE',price:'400',amount:'10'
    };
    const faucetBtn=()=>{
        FaucetWallet(account)
    }

    return(
    <div className="order">
        <div className="order_mode">
            {/* <h3>Limit</h3> */}
            <h3>Market Order</h3>
        </div>
        <form>
            <h6 className="order_available">Available Eth : {userEth}</h6>
            <div>
            <input type="text" className="order_price" /* onChange={e => priceChange(e)} */ placeholder={curPrice} readOnly></input>
            {/* <h6 className="order_price_eth">ETH</h6> */}
            </div>
            <input type="text" className="order_amount" onChange={e => amountChange(e)} placeholder='Amount'></input>
            <div className="make_order">
                <button type="button" className="order_buy" onClick={SendETH}>
                    <h5>Buy</h5>
                    <h5>Max Open {} ETH</h5>
                </button>
                <button type="button" className="order_sell" onClick={SendToken}>
                    <h5>Sell</h5>
                    <h5>Max Open {} ST</h5>
                </button>
            </div>
        </form>
        <div className='assets'>
            <h4>Assets</h4>
            <div className='assets_wraper'>
                <h6>{ST_1.name+" ("+ST_1.amount+")"+" "+ST_1.price+"ETH"}</h6>
                <h6>{ST_2.name+" ("+ST_2.amount+")"+" "+countNumber(ST_2.price+"ETH")}</h6>
                <h6>{ST_3.name+" ("+ST_3.amount+")"+" "+countNumber(ST_3.price+"ETH")}</h6>
            </div>
        </div>
        <div className='deposit'>
            <h4>Deposit</h4>
            <div className='deposit_wrapper'>
                <div className='deposit_faucet'>
                    <h6>{isFaucet?100:0}ETH</h6>
                    <div className='btn' onClick={()=>faucetBtn()}><h6>Faucet</h6></div>
                </div>
                <div className='account_address'>
                    <div className='account'><h6>{account}</h6></div>
                    <div className='btn' onClick={()=>faucetBtn()}><h6>Copy</h6></div>
                </div>
            </div>
        </div>
    </div>
    )
}
export default Order