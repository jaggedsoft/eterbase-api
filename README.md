[![Latest Version](https://img.shields.io/github/release/jaggedsoft/eterbase-api.svg?style=flat-square)](https://github.com/jaggedsoft/eterbase-api/releases) 
[![GitHub last commit](https://img.shields.io/github/last-commit/jaggedsoft/eterbase-api.svg?maxAge=2400)](#)
[![npm downloads](https://img.shields.io/npm/dt/eterbase.svg?maxAge=7200)](https://www.npmjs.com/package/eterbase)

[![NPM](https://nodei.co/npm/eterbase.png?compact=true)](https://npmjs.org/package/eterbase)

#### Installation
```
npm install eterbase
```

This project is designed to help you make your own projects that interact with the [Eterbase API](https://developers.eterbase.exchange) in node.js. Eterbase is Europe's Premier Digital Asset Exchange, the first compliant cryptocurrency exchange in Europe with crypto to fiat banking. [Sign up to Eterbase here.](https://eterbase.exchange/invite/zRGhzCdV)

#### Getting Started
```js
( async () => {
    const eterbase = require( "eterbase" );
    
    // Load credentials from json: (accountId, key and secret)
    await eterbase.auth( "options.json" );
    console.log( await eterbase.balances() );
    
    // Or authenticate manually:
    await eterbase.auth( accountId, key, secret );
    console.log( await eterbase.balance( "BTC" ) );
} )();
```

#### Examples
```js
// Get all actively trading symbols:
console.log( await eterbase.symbols() );

// Get price of all assets:
console.log( await eterbase.tickers() );

// Get price of a specific asset:
console.log( await eterbase.ticker( "XBASE-EUR" ) );

// Get all market IDs, asset precision, minimum orders and allowed order types:
console.log( await eterbase.markets() );

// Get total balances:
console.log( await eterbase.balances() );

// Market buy:
console.log( await eterbase.marketBuy( {
    symbol: "XBASE-ETH",
    cost: "0.006"
} ) );

// Limit buy:
console.log( await eterbase.limitBuy( {
    symbol: "XBASE-ETH",
    amount: 320,
    price: 0.00002333
} ) );

// Market sell:
console.log( await eterbase.marketSell( {
    symbol: "ETH-BTC",
    amount: 0.01
} ) );

// Check open orders:
console.log( await eterbase.openOrders( { symbol: "XBASE-ETH" } ) );

// Get a list of all trades (fills)
console.log( await eterbase.orderFills( { symbol: "XBASE-ETH" } ) );

// Market depth
console.log( await eterbase.orderBook( { symbol: "XBASE-EUR" } ) );

// Download OHLC candlestick information:
console.log( await eterbase.ohlcv( {
    symbol: "ETH-BTC",
    interval: 1440,
    start: 1560000000000,
    end: 1568322090000
} ) );
```

#### WebSocket Examples
```js
await eterbase.connect();

// Stream orderbook - snapshot is the current state of the order book and update messages is what is actually streamed
eterbase.orderBookStream( "XBASE-ETH",
    message => {
        console.log( "orderBook snapshot: " + message )
    },
    message => {
        console.log( "orderBook update: " + message )
    } );

// Stream OHLCV - every new tick triggers the callback
eterbase.ohlcvStream( "XBASE-ETH",
    message => {
        console.log( "ohlcvStream: " + message )
    } );

// Stream trades - every incoming trade triggers the callback
eterbase.tradeHistoryStream( "XBASE-ETH",
    message => {
        console.log( "tradeHistory: " + message );
    } );
    
// Stream of new orders
eterbase.myOrdersStream( "XBASE-ETH",
    message => {
        console.log( "myOrders: " + message );
    } );
```

## Troubleshooting
Automatically 'throw' errors to reveal more information:
```js
process.on( 'unhandledRejection', up => { throw up } );
```
<!-- ## Stargazers over time

[![Stargazers over time](https://starcharts.herokuapp.com/jaggedsoft/eterbase-api.svg)](https://starcharts.herokuapp.com/jaggedsoft/eterbase-api)
-->

[![Views](http://hits.dwyl.io/jaggedsoft/eterbase-api.svg)](http://hits.dwyl.io/jaggedsoft/eterbase-api)
[![jaggedsoft on Twitter](https://img.shields.io/twitter/follow/jaggedsoft.svg?style=social)](https://twitter.com/jaggedsoft)
[![ETERBASE on Twitter](https://img.shields.io/twitter/follow/ETERBASE.svg?style=social)](https://twitter.com/ETERBASE)
