import Chart from "../components/Chart/Chart"
import LimitOrderBook from '../components/LimitOrderBook'
import Order from '../components/Order'
import Assets from "../components/Assets"
import Footer from "../components/Footer"
import Navigator from "../components/Navigator"
import Header from "../components/Header"
import { useEffect, useState, useRef } from "react"
import Historys from "../components/Historys"
import TransactionsPage from "./TransactionsPage"
import WelcomePage from "./WelcomePage"
import { useWeb3React } from "@web3-react/core"
import axios from "axios"
import ChartWrapper from "../components/Chart/ChartWrapper"

// import {FaucetWallet} from '../apis/user'
const MainPage =()=>{
    const [currentPrice, setCurrentPrice] = useState(0)
    const [isLoading, setIsLoading] = useState(true);
    const [isEnroll,setIsEnroll] =useState({});
    const [userPosition,setUserPosition] = useState();
    const [copy, setCopy] = useState('');
    const [number, setNumber] = useState(0);
    const currentPrice_ref = useRef({});
    const {chainId, account, active, activate, deactivate} = useWeb3React();
    let powerOfMarket = (currentPrice.open - currentPrice.close)

    useEffect(() => {
        const setChartRTD=(async () => 
        {try {
            currentPrice_ref.current = await axios.get('http://localhost:5050/rtd')
            setCurrentPrice(currentPrice_ref.current.data)
        } catch (e) {
        console.log(e) // caught
        }
    })
        const loop = setInterval(() => {
        setIsLoading(false)
        setChartRTD()
        clearInterval(loop);
        powerOfMarket = 0;
        }, 100);

    }, [currentPrice_ref.current]);

    const copyHandler = (e) => {
        copy = e;
    }
    // URL
    const origin = "http://localhost:5050/";
    const getUserURL = origin + "user/"; 
    const enroll = getUserURL + "enroll/?wallet="
    const position = getUserURL + "position/?wallet="
    const chart = origin + "chart/data"

    // API Request
    const getChart = async({ offset, limit, unit, st_name}) => {
        if(st_name===null || st_name ===undefined)return new Error('Invalid Request!')
        const resultSTChart =  axios.get(chart + `/${offset} + ${limit} + ${unit} + ${st_name}`)
        .then(res=>res)
        .then(err=>err)
        return  resultSTChart
    }


    useEffect(()=>{
        const Position = async(wallet) => {
            if(wallet===null || wallet ===undefined)return new Error('Invalid Request!')
            const resultPosition = await axios.get(position + wallet)
            .then(res=>res.data)
            .then(err=>err)
            setUserPosition(resultPosition)
        }
        const EnrollWallet = async(wallet) => {
            if(wallet===null || wallet ===undefined)return new Error('Invalid Request!')
            const resultEnrollWallet =  await axios.post(enroll + wallet)
            .then(res=>res.data)
            .then(err=>err)
            setIsEnroll(resultEnrollWallet)
        }
        Position(account)
        EnrollWallet(account)
    },[account]);
        const onMouseEnterHandler = () => {
            document.body.style.overflow = 'unset';
        }
        
    return(
    <div className="main_page" onMouseEnter={onMouseEnterHandler}>
        <WelcomePage
            account={account}
            tutorialCnt={isEnroll.cnt}
            isLoading={isLoading}
        />
        <Header isLoading={isLoading} onMouseEnter={onMouseEnterHandler}/>
        <Navigator/>
        <div className="main_head">
            <ChartWrapper
                currentPrice={currentPrice}
            />
            <LimitOrderBook
                powerOfMarket={-powerOfMarket}
                ST_CurrentPrice={currentPrice.close} 
            />
            <Order
                ST_CurrentPrice={currentPrice.close} 
            />
        </div>
        <div className="main_bottom">
            <Historys/>
            <Assets
                ST_CurrentPrice={currentPrice.close} 
                powerOfMarket={powerOfMarket}
            />
        </div>
        <Footer/>
    </div>
    )
}
export default MainPage