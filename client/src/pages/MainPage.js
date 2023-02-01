import Chart from "../components/Chart/Chart"
import LimitOrderBook from '../components/LimitOrderBook'
import Order from '../components/Order'
import OrderList from "../components/OrderList"
import Assets
from "../components/Assets"
import Footer from "../components/Footer"
import Navigator from "../components/Navigator"
import Header from "../components/Header"
import { useEffect, useState, useRef } from "react"
import Historys from "../components/Historys"
import Welcome from "./WelcomePage"
import { useWeb3React } from "@web3-react/core"
import axios from "axios"

// import {FaucetWallet} from '../apis/user'
const MainPage =()=>{
    const [stv, setStv] = useState(0);
    const [incomeRatio, setIncomeRatio] = useState(0);
    const [candleHis, setCandleHis] = useState([1.2]);
    const [volumeHis, setVolumeHis] = useState([100,[]]);
    const [candleFormatHis, setCandleFormatHis] = useState([])
    const [volumeFormatHis, setVolumeFormatHis] = useState([])
    const [formatLengthHis, setFormatLengthHis] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnroll,setIsEnroll] =useState({});
    const [userPosition,setUserPosition] = useState();
    const [copy, setCopy] = useState('');
    const {chainId, account, active, activate, deactivate} = useWeb3React();
    const copyHandler = (e) => {
        copy = e;
    }
    useEffect(()=>{
        Position(account)
        EnrollWallet(account)
    },[account]);

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
    // const getRTD = async({/*st_name*/}) => {
    //     // if(st_name===null || st_name ===undefined)return new Error('Invalid Request!')
    //     const resultRDT = await axios.get('http://localhost:5051/chart')
    //     .then(res=>res)
    //     .then(err=>err)
    //     console.log(resultRDT)  
    // }
    // getRTD()
    const setRTD=(async () => 
        {try {
            const resultRDT = await axios.get('http://localhost:5050/chart')
            console.log(resultRDT.data.close) 
            
        } catch (e) {
        console.log(e) // caught
        }
    })


    const Position = async(wallet) => {
        if(wallet===null || wallet ===undefined)return new Error('Invalid Request!')
        const resultPosition = await axios.get(position + wallet)
        .then(res=>res.data)
        .then(err=>err)
        setUserPosition(resultPosition)
        return  resultPosition
    }
    const EnrollWallet = async(wallet) => {
        if(wallet===null || wallet ===undefined)return new Error('Invalid Request!')
        const resultEnrollWallet =  await axios.post(enroll + wallet)
        .then(res=>res.data)
        .then(err=>err)
        return  setIsEnroll(resultEnrollWallet)
    }

    const stv_ref = useRef(0.000001);
    const incomeRatio_ref = useRef(0.000002);

    useEffect(() => {
        const loop = setInterval(() => {
            stv_ref.current = Math.random()*(0.001-(-0.00101))-0.001;
            setStv(stv_ref.current);
            setRTD()

        if (stv_ref.current === 10||
            stv_ref.current === 10) clearInterval(loop);
        }, 1000);
    }, []);

    useEffect(() => {
        const loop = setInterval(() => {
            incomeRatio_ref.current = Math.random()*(0.005-(-0.00505))-0.005;
            setIncomeRatio(incomeRatio_ref.current);
        if (incomeRatio_ref.current === 10||
            incomeRatio_ref.current === 10) clearInterval(loop);
        }, 100000);
    }, []);

    let ST_CurrentVolume = volumeHis[0] * (1 + stv*90)*(1+incomeRatio*90)
    let ST_CurrentPrice = candleHis[candleHis.length-1] * (1 + stv)*(1+incomeRatio) * (1+ST_CurrentVolume/100000000)

        let candleData = [
        new Date().getHours()+ ':'+new Date().getMinutes()+ ':'+ new Date().getSeconds(),
        candleHis[0],
        candleHis[candleHis.length-1],
        candleHis.reduce((acc,cur)=>{
                if(acc<cur) return cur 
                else if(acc>=cur) return acc
            }),
        candleHis.reduce((acc,cur)=>{
            if(acc>cur) return cur 
            else if(acc<=cur) return acc
        })
    ]

        let totalHisFrom = 0;
        let totalHisTo = 0;
        volumeHis[1].forEach(element => {totalHisTo+=element});        

        let volumeData = [
            0,
            volumeHis[0],
            totalHisTo,
            totalHisFrom
        ]    

        let CP_his =(e)=>{
            candleHis.push(e)
            if(candleHis.length >= 60 ){
                candleFormatHis.push(candleData);
                candleHis.splice(0,candleHis.length-1);
                if(candleFormatHis.length>2){return setIsLoading(false)}
                else{return setIsLoading(true)}
            }}

        let CV_his =(e)=>{
            volumeHis[1].push(e)
            if(volumeHis[1].length >= 60 ){
                volumeFormatHis.push(volumeData);
                totalHisTo=0
                volumeHis[1].splice(0,volumeHis[1].length-1);
            }}
        CP_his(ST_CurrentPrice)
        CV_his(ST_CurrentVolume)

        let powerOfMarket = candleFormatHis!==null&&candleFormatHis!==undefined&&candleFormatHis.length>0?(candleFormatHis[candleFormatHis.length-1][2] - candleFormatHis[candleFormatHis.length-1][1])*10:0

        const onMouseEnterHandler = () => {
            document.body.style.overflow = 'unset';
        }

    return(
    <div className="main_page" onMouseEnter={onMouseEnterHandler}>
        {/* <Welcome
            account={account}
            tutorialCnt={isEnroll.cnt}
            isLoading={isLoading}
        /> */}
        <Header isLoading={isLoading} onMouseEnter={onMouseEnterHandler}/>
        <Navigator/>
        <div className="main_head">
            <Chart 
            candleFormatHis={candleFormatHis}
            ST_CurrentPrice={ST_CurrentPrice} 
            candleData={candleData}
            volumeFormatHis={volumeFormatHis}
            volumeData={volumeData}
            />
            <LimitOrderBook
                powerOfMarket={powerOfMarket}
                ST_CurrentPrice={ST_CurrentPrice} 
            />
            <Order/>
        </div>
        <div className="main_bottom">
            <Historys/>
            <Assets
                ST_CurrentPrice={ST_CurrentPrice} 
            />
        </div>
        <Footer/>
    </div>
    )
}
export default MainPage