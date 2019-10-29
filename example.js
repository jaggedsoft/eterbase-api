( async () => {
    const eterbase = require( 'eterbase' );
    await eterbase.auth( "options.json" );
    
    // Get list of all actively trading symbols:
    console.log( await eterbase.symbols() );

    // Get list of all market IDs, allowed order types, asset precision and more:
    let market = await eterbase.markets();
    console.log( market["XBASE-ETH"] );
    
    // Get price of all assets:
    let ticker = await eterbase.tickers();
    console.log( ticker["ETH-USDT"] );

    // Get price of a specific asset:
    console.log( await eterbase.ticker( "XBASE-EUR" ) );
    // You can also get the price using the market ID:
    console.log( await eterbase.ticker( { id: 1 } ) );

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
    
    // Cancel open order by id:
    console.log( await eterbase.cancelOrder( {
        orderId: '4f873d28-a91d-4926-b52a-43540466ddc9'
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
    
    // Cancel all orders
    async function cancelAll() {
        let open = await eterbase.openOrders();
        for ( let obj of open ) {
            try {
                console.info( `..${obj.id}` );
                await eterbase.cancelOrder( { orderId: obj.id } );
            } catch ( error ) {
                console.warn( error );
            }
        }
    }

    /////////////////////////////////////
    // Connect to WebSocket
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
    
    /////////////////////////////////////
    // Get a list of all symbols: (including ones with trading disabled)
    console.info( Object.values( eterbase.allSymbols ) ); // or use Object.keys( await eterbase.markets() ) );

    // Map from symbols to market ID's
    console.info( eterbase.marketIds );

} )().catch( e => console.log( e ) );
