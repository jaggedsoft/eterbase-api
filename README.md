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
    
    // Load apikey and secret from json
    await eterbase.auth( "eterbase-options.json" );
    console.log( await eterbase.balances() );
    
    // Load api key and secret with string instead
    await eterbase.auth( "[apikey]", "[secret]" );
    console.log( await eterbase.balance( "BTC" ) );
} )();
```

```js
    console.log( await eterbase.markets() );
    console.log( await eterbase.quote( {
        ticker: "ETH-BTC"
    } ) );
```

## Stargazers over time

[![Stargazers over time](https://starcharts.herokuapp.com/jaggedsoft/node-binance-api.svg)](https://starcharts.herokuapp.com/jaggedsoft/node-binance-api)

[![Views](http://hits.dwyl.io/jaggedsoft/eterbase-api.svg)](http://hits.dwyl.io/jaggedsoft/eterbase-api)
[![jaggedsoft on Twitter](https://img.shields.io/twitter/follow/jaggedsoft.svg?style=social)](https://twitter.com/jaggedsoft)
[![Chartaholic on Twitter](https://img.shields.io/twitter/follow/Chartaholic.svg?style=social)](https://twitter.com/Chartaholic)
