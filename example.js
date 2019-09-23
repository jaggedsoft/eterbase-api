( async () => {
    const eterbase = require( './eterbase.js' );
    eterbase.auth( "options.json" );
    await eterbase.initialize();

    // Get list of all market IDs, allowed order types, asset precision and more:
    console.log( await eterbase.markets() );

    // Get price of a specific asset:
    console.log( await eterbase.quote( {
        symbol: "XBASE-EUR"
    } ) );

    // Get informations about all markets
    console.log( await eterbase.tickers() );

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
    console.log( await eterbase.openOrders( {
        state: "ACTIVE", // ACTIVE / INACTIVE
        from: 1560000000000,
        to: Date.now()
    } ) );

    // Download OHLC candlestick information:
    console.log( await eterbase.ohlcv( {
        symbol: "ETH-BTC",
        interval: 1440,
        start: 1560000000000,
        end: 1568322090000
    } ) );

    // Withdraw coins from your wallet
    await eterbase.withdraw({
        assetId: "LTO",
        amount: 1,
        address: "0xdeadbeef",
    });

    // Get a list of all trades (fills)
    console.log( await eterbase.orderFills({
        symbol: "XBASE-ETH",
        side: 1, // 1 - Buy, 2 - Sell
        offset: 0,
        limit: 100,
        from: Date.now() - 7689600000, // Maximum 90days in the past
        to: Date.now()
    }) );

    eterbase.orderBookStream("XBASE-ETH",
        (message) => {
            console.log("snapshot: " + message)
        }
        , (message) => {
            console.log("update: " + message)
        });
    eterbase.ohlcvStream("XBASE-ETH",
        (message) => {
            console.log("tick: " + message)
        });
    eterbase.tradeHistoryStream("XBASE-ETH",
        (message) => {
            console.log("trade: " + message);
        });

} )().catch( e => console.log( e ) );
