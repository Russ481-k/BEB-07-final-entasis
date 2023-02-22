import {useWeb3React} from "@web3-react/core";
import React from "react"
import {useState, useEffect} from 'react';
import {FaucetWallet, EnrollWallet, ChName, Tutorial, Score, Position, Account} from '../apis/user';
import {BuyToken, SellToken} from '../apis/token';
import Web3 from "web3";
import TokenABI from "../ABIs/ERC1400.json"
import SelectBox from "./Select";
import { useTranslation } from "react-i18next";
import ReactModal from "react-modal";

const Order =({ST_CurrentPrice,userEth,userEntaToken,userBebToken,userLeoToken,tokenName,totalCurrentPrices,refresh,setRefresh,ST_Name,setTokenName,amount,price,web3,userAccount,serverAddress,token,tokenContract,setAmount,curPrice,isFaucet,faucetBtn,account,stName,setStName,myPage,setStaking,bebStakeToken,entaStakeToken,leoStakeToken,staking

})=>{
    const [isFaucetModalOpen,setIsFaucetModalOpen]=useState(false);

    const { t } = useTranslation();
    const modalStyle_2 = {
        overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
            zIndex: 10,
        },
        content: {
            display: "block",
            justifyContent: "center",
            background: "#222223",
            overflow: "hidden",
            top: "15%",
            left: "33%",
            right: "33%",
            bottom: "15%",
            border:"0",
            borderRadius: "20px",
            WebkitOverflowScrolling: "touch",
            outline: "none",
            zIndex: 10,
            opacity:0.9
        },
    };

    // 구매
    async function SendETH(){
        const totalValue = amount * price * 1.0004;
        web3.eth.sendTransaction({
            from: userAccount,
            to: serverAddress,
            value: web3.utils.toWei(String(totalValue), 'ether')
        }).then(function(receipt){
            console.log(receipt)
            console.log(token)
            BuyToken(token, String(price), String(amount), userAccount, receipt.transactionHash)
        });
        setRefresh(!refresh)
    }
    // 판매
    async function SendToken(){
        const data = await tokenContract.methods.transfer(serverAddress, web3.utils.toWei(amount)).encodeABI()
        const tx = {
            from: userAccount,
            to: tokenContract._address,
            data: data,
            gas: 210000,
            gasPrice: 100000000
        }

        await web3.eth.sendTransaction(tx).then(function(receipt){
            console.log(receipt)
            console.log(token)
            SellToken(token, String(price), String(amount), userAccount, receipt.transactionHash)
        })
        setRefresh(!refresh)
    }




    const ST_1 = {
        name:'ENTA',price:(totalCurrentPrices.enta * userEntaToken).toFixed(4) ,amount: userEntaToken
    };
    const ST_2 = {
        name:'BEB',price:(totalCurrentPrices.beb * userBebToken).toFixed(4) ,amount: userBebToken
    };
    const ST_3 = {
        name:'LEO',price:(totalCurrentPrices.leo * userLeoToken).toFixed(4) ,amount: userLeoToken
    };
    let buyMaxST_1 = (userEth/totalCurrentPrices.enta)
    let sellMaxST_1 = ST_1.amount
    let buyMaxST_2 = (userEth/totalCurrentPrices.beb)
    let sellMaxST_2 = ST_2.amount
    let buyMaxST_3 = (userEth/totalCurrentPrices.leo)
    let sellMaxST_3 = ST_3.amount
    let amountMax = (buyMax,sellMax)=>{return Math.max(buyMax,sellMax)}
    function amountChange(e){
        let curamount = e.target.value;
        
        if((stName === 'ENTAToken')&&(amountMax(buyMaxST_1,sellMaxST_1)<curamount)){
            setAmount(amountMax(buyMaxST_1,sellMaxST_1))
            e.target.value=amountMax(buyMaxST_1,sellMaxST_1)
        }
        else if((stName === 'BEBToken')&&(amountMax(buyMaxST_2,sellMaxST_2)<curamount)){
            setAmount(amountMax(buyMaxST_2,sellMaxST_2))
            e.target.value=amountMax(buyMaxST_2,sellMaxST_2)
            console.log(e.target.value)
        }
        else if((stName === 'LEOToken')&&(amountMax(buyMaxST_3,sellMaxST_3)<curamount)){
            setAmount(amountMax(buyMaxST_3,sellMaxST_3))
            e.target.value=amountMax(buyMaxST_3,sellMaxST_3)
        } else setAmount(curamount)
    }
    if(stName === 'ENTAToken') setTokenName('enta')
    if(stName === 'BEBToken') setTokenName('beb')
    if(stName === 'LEOToken') setTokenName('leo')
    // console.log(buyMaxST_1)


    return(
    <div className="order">
        {staking?
        <div className="order_mode">
            {/* <h3>Limit</h3> */}

            <h4 className="Click_Order" onClick={()=>setStaking(false)}>{t("Market Order")}</h4>
            <h4 className="Click_Stake" onClick={()=>setStaking(true)}>{t("Staking")}</h4>

            <div className="order_select">
                <SelectBox
                    set={ST_Name}
                    termValue={stName}
                    value={setStName}
                ></SelectBox>
            </div>
        </div>:
        <div className="order_mode">
            {/* <h3>Limit</h3> */}

            <h4 className="Click_Stake" onClick={()=>setStaking(false)}>{t("Market Order")}</h4>
            <h4 className="Click_Order" onClick={()=>setStaking(true)}>{t("Staking")}</h4>

            <div className="order_select">
                <SelectBox
                    set={ST_Name}
                    termValue={stName}
                    value={setStName}
                ></SelectBox>
            </div>
        </div>
        }
        <form>
            <h6 className="order_available">{t("Available Eth")} : {userEth}</h6>
            <input type="text" className="order_price" /* onChange={e => priceChange(e)} */ placeholder={curPrice} readOnly></input>
            {/* <h6 className="order_price_eth">ETH</h6> */}
            <input type="text" className="order_amount" onChange={e => amountChange(e)} placeholder={t("Amount")}></input>
            <div className="make_order">
                <button type="button" className="order_buy" onClick={SendETH}>
                    <h5>{t("Buy")}</h5>
                    <h5>{t("Max Open")} {stName === 'ENTAToken'? Number(buyMaxST_1).toFixed(3):
                        stName === 'BEBToken'?Number(buyMaxST_2).toFixed(3):
                        stName === 'LEOToken'?Number(buyMaxST_3).toFixed(3):0} {stName.slice(0,stName.length-5)}</h5>
                </button>


                <button type="button" className="order_sell" onClick={SendToken}>
                    <h5>{t("Sell")}</h5>
                    <h5>{t("Max Open")} {stName === 'ENTAToken'? Number(sellMaxST_1).toFixed(3):
                        stName === 'BEBToken'?Number(sellMaxST_2).toFixed(3):
                        stName === 'LEOToken'?Number(sellMaxST_3).toFixed(3):0} {stName.slice(0,stName.length-5)}</h5>
                </button>

            </div>
        </form>
        <div className='assets'>
            <div className="total_assets">
                <h4>{t("Assets")}</h4><h6>{(Number(ST_1.price)+Number(ST_2.price)+Number(ST_3.price)).toFixed(4)}ETH</h6>
            </div>      
            <div className='assets_wraper'>
                <h6>{ST_1.name+" ("+ST_1.amount+")"+" "+ST_1.price+"ETH"}</h6>
                <h6>{ST_2.name+" ("+ST_2.amount+")"+" "+ST_2.price+"ETH"}</h6>
                <h6>{ST_3.name+" ("+ST_3.amount+")"+" "+ST_3.price+"ETH"}</h6>
            </div>
        </div>
        <div className='deposit'>
            <h4>{t("Deposit")}</h4>
            <div className='deposit_wrapper'>
                <div className='deposit_faucet'>
                    <h5>{isFaucet?50:0}ETH</h5>
                    <div className='btn' onClick={()=>{faucetBtn(account);setIsFaucetModalOpen(true)}}><h5>{t("Faucet")}</h5></div>
                </div>
                <div className='account_address'>
                    <div className='account'><h5>{account}</h5></div>
                    <div className='btn' onClick={()=>faucetBtn(account)}><h5>{t("Copy")}</h5>
                    {myPage.data!==undefined?
                    <ReactModal
                        appElement={document.getElementById('root') || undefined}
                        onRequestClose={()=>setIsFaucetModalOpen(false)}

                        isOpen={isFaucetModalOpen}
                        style={modalStyle_2}
                        className="welcome_tutorial_faucet_complete" onClick={() => setIsFaucetModalOpen(false)} onFocus={document.body.style.overflow='hidden'}
                        >{myPage.data.faucet?<div className='welcome_connection'>
                        <img src={require('../assets/images/ENTASIS.png')} alt='entasis'></img>
                        <img className='close' onClick={()=>setIsFaucetModalOpen(false)} src={require('../assets/images/close.png')} alt='close'></img>
                        <img className="congratulations" src={require('../assets/images/no.gif')} alt='entasis'></img>
                        <h4>You Already Got 50.00 ETH</h4>
                        </div>:
                        <div className='welcome_connection'>
                        <img src={require('../assets/images/ENTASIS.png')} alt='entasis'></img><br/>
                        <img className='close' onClick={()=>setIsFaucetModalOpen(false)} src={require('../assets/images/close.png')} alt='close'></img><br/>
                        <img className="congratulations" src={require('../assets/images/voted.gif')} alt='entasis'></img>
                        <h4>Check Your 50.00ETH in Deposit</h4>
                        </div>}
                    </ReactModal>:<></>
                    }
                    </div>
                </div>
            </div>

            <h4>{t("Staking")}</h4>
                <div className='deposit_wrapper'>
                    <h6>ENTAToken : {entaStakeToken}</h6>
                    <h6>BEBToken : {bebStakeToken}</h6>
                    <h6>LEOToken : {leoStakeToken}</h6>
                </div>
        </div>
    </div>
    )
}
export default Order