import AssetList from '@components/dashboard/AssetList';
import GlassContainer from '@components/GlassContainer';
import { Grid, Typography, TextField, Box, Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { VictoryArea, VictoryContainer, VictoryPie } from 'victory';
import axios from 'axios';
// import { useAuth } from 'src/auth';

const rawData = 
{
  "address": "9fPRvaMYzBPotu6NGvZn4A6N4J2jDmRGs4Zwc9UhFFeSXgRJ8pS",
  "balance": {
    "ERG": {
      "blockchain": "ergo",
      "balance": 2.072445086,
      "unconfirmed": 0,
      "tokens": [
        {
          "tokenId": "003bd19d018711",
          "amount": 115215,
          "decimals": 0,
          "name": "SigRSV",
          "price": 0.00900232725612
        },

        {
          "tokenId": "003bd19d0187117f130b62e1bca2234439929ff5c7709f843c5c4",
          "amount": 163221,
          "decimals": 0,
          "name": "Tulip",
          "price": 0.00005
        },
        {
          "tokenId": "003bd19d0187117ff5c7709f843c5c4dd158949285d0",
          "amount": 17432,
          "decimals": 0,
          "name": "Kushti",
          "price": 0.3
        },
        {
          "tokenId": "003bd19d0187117f13123bcab0939929ff5c7709f843c5c40",
          "amount": 675,
          "decimals": 0,
          "name": "ErDoge",
          "price": 0.01
        },
        {
          "tokenId": "003117f130b62e3bcab09392354f549285d0",
          "amount": 2456,
          "decimals": 0,
          "name": "Token1",
          "price": 1
        },
        {
          "tokenId": "003bd19d08949285d0",
          "amount": 32521,
          "decimals": 0,
          "name": "TwoToken",
          "price": 0.01
        },
        {
          "tokenId": "003bd19d0187dd158949285d0",
          "amount": 67,
          "decimals": 0,
          "name": "Hello",
          "price": 12
        },
        {
          "tokenId": "003bd19d111110187117f13123bcab0939929ff5c7709f843c5c40",
          "amount": 675,
          "decimals": 0,
          "name": "another",
          "price": 0.01
        },
        {
          "tokenId": "0111103117f130b62e3bcab09392354f549285d0",
          "amount": 2456,
          "decimals": 0,
          "name": "testtoken",
          "price": 1
        },
        {
          "tokenId": "003bd19d089411119285d0",
          "amount": 32521,
          "decimals": 0,
          "name": "three",
          "price": 0.01
        },
        {
          "tokenId": "003bd19d0187dd1589492851111d0",
          "amount": 67,
          "decimals": 0,
          "name": "four",
          "price": 12
        }
      ],
      "price": 10.3
    }
  }
};
/* 
const rawData = 
{
  "address": "9fPRvaMYzBPotu6NGvZn4A6N4J2jDmRGs4Zwc9UhFFeSXgRJ8pS",
  "balance": {
    "ERG": {
      "blockchain": "ergo",
      "balance": 0.44,
      "unconfirmed": 0,
      "tokens": [
        {
          "tokenId": "003bd19d0187117f130b654b0939929ff5c7709f843c5c4dd158949285d0",
          "amount": 468060,
          "decimals": 0,
          "name": "SigRSV",
          "price": 0.000994344209289505
        },
        {
          "tokenId": "003bd19d0187117f130b62e1bca2234439929ff5c7709f843c5c4dd158949285d0",
          "amount": 211,
          "decimals": 0,
          "name": "SigUSD",
          "price": 0.9782067949315545
        },
      ],
      "price": 10.3
    }
  }
}; */

const historicData = [
{ x: 1, y: 2 },
{ x: 2, y: 3 },
{ x: 3, y: 5 },
{ x: 4, y: 4 },
{ x: 5, y: 6}
];

const wantedHoldingData = tokenDataArray(rawData);

console.log(wantedHoldingData);

const portfolioValue = sumTotals(wantedHoldingData);
console.log(portfolioValue);


const defaultHoldingData = wantedHoldingData.map((item) => {
  const container = {};
  container.x = item.x;
  container.y = 0;
  return container;
});
defaultHoldingData[defaultHoldingData.length - 1].y = portfolioValue;

const Dashboard = () => {
  // const auth = useAuth();
  const [holdingData, setHoldingData] = useState(defaultHoldingData);
  const [walletInput, setWalletInput] = useState('');
  const [assetList, setAssetList] = useState(assetListArray(rawData));
  const [imgNftList, setImgNftList] = useState([]);
  const [audNftList, setAudNftList] = useState([]);

  useEffect(() => {
    setHoldingData(wantedHoldingData); // Setting the data that we want to display
  }, []);

  const handleWalletFormChange = (e) => {
    setWalletInput(e.target.value);
  };

  const handleSubmitWallet = async () => {
    console.log('submit clicked with:', walletInput);

    // Spaghetti code, will use api client later.
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        // Authorization: auth?.accessToken ? `Bearer ${auth.accessToken}` : '',
      },
    }; 

    const res = await axios
      .get(`${process.env.API_URL}/asset/balance/${walletInput}`, { ...defaultOptions })
      .catch((err) => {
        console.log('ERROR FETCHING: ', err);
      });
    if (res?.data) {
      let victoryData = tokenDataArray(res.data);

      let portfolioTotal = sumTotals(victoryData);

      // create list of assets 
      let initialAssetList = assetListArray(res.data);

      let newImgNftList = [];
      let newAudNftList = [];
      let newAssetList = [];

      for(let i = 0; i < initialAssetList.length; i++){
        if (initialAssetList[i].id != 'ergid') {
          const res2 = await axios
          .get(`https://api.ergoplatform.com/api/v0/assets/${initialAssetList[i].id}/issuingBox`, { ...defaultOptions })
          .catch((err) => {
            console.log('ERROR FETCHING: ', err);
          });
          if (res2?.data) {
            let data2 = res2?.data;

              let tokenObject = {
                name: data2.map(token => token.assets[0].name),
                ch: data2.map(token => token.creationHeight),
                description: data2.map(token => toUtf8String(token.additionalRegisters.R5).substr(2)),
                r7: data2.map(token => token.additionalRegisters.R7),
                r9: data2[0].additionalRegisters?.R9 ? resolveIpfs(toUtf8String(data2[0].additionalRegisters?.R9).substr(2)) : undefined,
                r5: data2.map(token => toUtf8String(token.additionalRegisters.R5).substr(2)),
                ext: data2.map(token => toUtf8String(token.additionalRegisters.R9).substr(2).slice(-4)),
                token: initialAssetList[i].token,
                id: initialAssetList[i].id,
                amount: initialAssetList[i].amount,
                amountUSD: initialAssetList[i].amountUSD ? initialAssetList[i].amountUSD : ''
              }

              // console.log(tokenObject.r9);
              
              // if audio NFT
              if (tokenObject.ext == '.mp3' || tokenObject.ext == '.ogg' || tokenObject.ext == '.wma' || tokenObject.ext == '.wav' || tokenObject.ext == '.aac' || tokenObject.ext == 'aiff' || tokenObject.r7 == '0e020102'){
                newAudNftList[newAudNftList.length] = tokenObject;
              }
              // if image NFT
              else if (tokenObject.ext == '.png' || tokenObject.ext == '.gif' || tokenObject.ext == '.jpg' || tokenObject.ext == 'jpeg' || tokenObject.ext == '.bmp' || tokenObject.ext == '.svg' || tokenObject.ext == '.raf' || tokenObject.ext == '.nef' || tokenObject.r7 == '0e020101' || tokenObject.r7 == '0e0430313031' ) {
                newImgNftList[newImgNftList.length] = tokenObject;
              }
              else {
                newAssetList[newAssetList.length] = tokenObject;
              }
          }
        }
        else {
          newAssetList[newAssetList.length] = initialAssetList[i];
        }
      };
      
      setHoldingData(victoryData);
      setAssetList(newAssetList);
      setAudNftList(newAudNftList);
      setImgNftList(newImgNftList);

      // console.log(res.data);
      // console.log(victoryData);
      // console.log(assetListArray(res.data));
      // console.log(portfolioTotal);
    }

    
    // setWalletInput(walletInput);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          '& .MuiButton-root': {
            paddingLeft: 2,
          },
        }}
      >
        <TextField
          value={walletInput}
          onChange={handleWalletFormChange}
          fullWidth
          label='Enter wallet address'
          id='address'
        />
        <Button variant='contained' onClick={handleSubmitWallet}>
          View Wallet
        </Button>
      </Box>
      


      <Grid container spacing={1} alignItems="stretch" sx={{ pt: 4 }}>

          <Grid item xs={12} md={6}>
            <GlassContainer>
              <Typography variant='h4'>Wallet Holdings</Typography>
              <VictoryPie
                id='victory-pie-chart'
                innerRadius={100}
                padAngle={2}
                data={holdingData}
                colorScale='cool'
                style={{ labels: { fill: 'white' } }}
                containerComponent={
                  <VictoryContainer
                    id='victory-pie-chart-container'
                    style={{
                      touchAction: 'auto',
                    }}
                  />
                }
                animate={{ easing: 'exp' }}
              />
            </GlassContainer>
          </Grid>
          
          
          <Grid item xs={12} md={6}>
            <GlassContainer>
              <Typography variant='h4'>Portfolio Hisory</Typography>
              <VictoryArea
                id='victory-area-chart'
                style={{ data: { fill: "rgb(57, 186, 181)" } }}
                data={historicData}
                containerComponent={
                  <VictoryContainer
                    id='victory-area-chart-container'
                    style={{
                      touchAction: 'auto',
                    }}
                  />
                }
              />
            </GlassContainer>
          </Grid>

          <Grid item xs={12} md={4}>
          <GlassContainer>
            <AssetList assets={assetList} title='Assets' />
          </GlassContainer>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <GlassContainer>
            <AssetList assets={imgNftList} title='Image NFTs' />
          </GlassContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          <GlassContainer>
            <AssetList assets={audNftList} title='Audio NFTs' />
          </GlassContainer>
        </Grid>
        
      </Grid>

    </>
  );
};



function tokenDataArray(data) {
  let tokenObject = data.balance.ERG.tokens;
  const keys = Object.keys(tokenObject);
  const res = [];
  for (let i = 0; i < keys.length; i++) {
    let token = tokenObject[keys[i]];
    let obj = {
      x: token.name,
      y: token.price * (token.amount * Math.pow(10, -token.decimals))
    };
    if (token.price > 0) res.push(obj);
  }
  const ergoValue = {
    x: 'Ergo',
    y: data.balance.ERG.price * data.balance.ERG.balance
  };
  res.unshift(ergoValue);
  return res;
};

function assetListArray(data) {
  let tokenObject = data.balance.ERG.tokens;
  let keys = Object.keys(tokenObject);
  let res = [];
  for (let i = 0; i < keys.length; i++) {
    let token = tokenObject[keys[i]];
    let amount = +parseFloat((token.amount * Math.pow(10, -token.decimals)).toFixed(2))
    let price = (token.price * amount).toFixed(2)
    let obj = {
      token: token.name ? token.name.substring(0,3).toUpperCase() : '',
      name: token.name ? token.name : '',
      id: token.tokenId,
      amount: amount,
      amountUSD: price
    };
    
    res.push(obj);
  }
  const ergoValue = {
    token: 'ERG',
    name: 'Ergo',
    id: 'ergid',
    amount: data.balance.ERG.balance.toFixed(3),
    amountUSD: (data.balance.ERG.price * data.balance.ERG.balance).toFixed(2),
  };
  res.unshift(ergoValue);
  return res;
};

function sumTotals(data){
  let value = data.map((item) => item.y).reduce((a, b) => a + b);
  return value; 
}

function toUtf8String(hex) {
  if(!hex){
    hex = ''
  }
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

function resolveIpfs(url) {
  const ipfsPrefix = 'ipfs://'
  if (!url.startsWith(ipfsPrefix)) return url
  else return url.replace(ipfsPrefix, `https://cloudflare-ipfs.com/ipfs/`)
}

export default Dashboard;