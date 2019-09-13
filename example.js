( async () => {
    const eterbase = require( './eterbase.js' );
    eterbase.auth( "options.json" );
    await eterbase.initialize();
    console.log( await eterbase.markets() );
    console.log( await eterbase.quote( {
        ticker: "ETH-BTC"
    } ) );
    console.log( await eterbase.ohlcv( {
        ticker: "ETH-BTC",
        interval: 1440,
        start: 1560000000000,
        end: 1568322090000
    } ) );
    // console.log(await eterbase.balances());
    console.log( await eterbase.order( {
        ticker: "ETH-BTC",
        side: 1, // 1 buy - 2 sell
        amount: 0.01,
        OrderType: 1, // 1 - Market, 2 - Limit, 3 - StopMarket, 4 - StopLimit
        price: 1,
        type: 1
    } ) );
    console.log( await eterbase.openOrders( {
        state: "ACTIVE", // ACTIVE / INACTIVE
        from: 1560000000000,
        to: Date.now()
    } ) );
} )().catch( e => console.log( e ) );
