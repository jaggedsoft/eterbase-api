[![Latest Version](https://img.shields.io/github/release/jaggedsoft/eterbase-api.svg?style=flat-square)](https://github.com/jaggedsoft/eterbase-api/releases) 
[![GitHub last commit](https://img.shields.io/github/last-commit/jaggedsoft/eterbase-api.svg?maxAge=2400)](#)
[![npm downloads](https://img.shields.io/npm/dt/eterbase.svg?maxAge=7200)](https://www.npmjs.com/package/eterbase)

[![NPM](https://nodei.co/npm/eterbase.png?compact=true)](https://npmjs.org/package/eterbase)

#### Installation
```
npm install eterbase
```

This project is designed to help you make your own projects that interact with the [Eterbase API](https://developers.eterbase.exchange) in node.js. [Sign up to Eterbase here.](https://www.eterbase.com/)

#### Getting Started
```js
( async () => {
    const eterbase = require( "eterbase" );
    
    // Load apiKey and secret from json:
    await eterbase.auth( "eterbase-options.json" );
    console.log( await eterbase.balances() );
    
    // Or set credentials manually:
    await eterbase.auth( accountId, apiKey, apiSecret );
    console.log( await eterbase.balance( "BTC" ) );
} )();
```

```js
// Get list of all market IDs, allowed order types, asset precision and more.
console.log( await eterbase.markets() );

// Get price of specific asset
console.log( await eterbase.quote( {
    ticker: "ETH-BTC"
} ) );

// Get total balances
console.log(await eterbase.balances());

// Limit buy
console.log( await eterbase.limitBuy( {
    ticker: "ETH-BTC",
    amount: 0.01,
    price: 1
} ) );

// Market sell
console.log( await eterbase.marketSell( {
    ticker: "ETH-BTC",
    amount: 0.01,
    price: 1
} ) );

// Check open orders
console.log( await eterbase.openOrders( {
    state: "ACTIVE", // ACTIVE / INACTIVE
    from: 1560000000000,
    to: Date.now()
} ) );

// Download candlestick information
console.log( await eterbase.ohlcv( {
    ticker: "ETH-BTC",
    interval: 1440,
    start: 1560000000000,
    end: 1568322090000
} ) );
```

## Stargazers over time

[![Stargazers over time](https://starcharts.herokuapp.com/jaggedsoft/eterbase-api.svg)](https://starcharts.herokuapp.com/jaggedsoft/eterbase-api)
[![Views](http://hits.dwyl.io/jaggedsoft/eterbase-api.svg)](http://hits.dwyl.io/jaggedsoft/eterbase-api)
[![jaggedsoft on Twitter](https://img.shields.io/twitter/follow/jaggedsoft.svg?style=social)](https://twitter.com/jaggedsoft)
[![Chartaholic on Twitter](https://img.shields.io/twitter/follow/Chartaholic.svg?style=social)](https://twitter.com/Chartaholic)
