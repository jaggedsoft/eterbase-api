( async () => {
    const axios = require( 'axios' );
    const crypto = require( 'crypto' );
    const WebSocket = require( 'ws' );
    const EventEmitter = require( 'events' );
    const fs = require( 'fs' ), exports = module.exports;
    const baseURL = "https://api.eterbase.exchange";
    let accountId = '', key = '', secret = '', marketIds = {}, symbols = {}, dataFeed;

    const emitter = new EventEmitter();

    const instance = axios.create( {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'node-eterbase-api'
        },
        timeout: 30000,
        baseURL
    } );

    async function request( url, params = {} ) {
        return new Promise( ( resolve, reject ) => {
            instance.get( url, { params } )
                .then( response => {
                    resolve( response.data );
                } )
                .catch( error => {
                    if ( error.response ) console.warn( error.response.data );
                    reject( error.message );
                } );
        } );
    }

    async function signedRequest( endpoint, params = {}, method = 'GET' ) {
        return new Promise( ( resolve, reject ) => {
            let query = method === 'GET' ? `?${Object.entries( params ).map( ( [key, val] ) => `${key}=${val}` ).join( '&' )}` : "";
            let date = new Date().toGMTString();
            let message = 'date: ' + date + '\n' + method.toUpperCase() + ' ' + endpoint + ' HTTP/1.1';
            let signature = crypto.createHmac( 'sha256', secret ).update( message ).digest( 'base64' );
            let sha256 = crypto.createHash( 'sha256' ).update( JSON.stringify( params ), 'utf8' ).digest( 'base64' );
            let authOptions = {
                method,
                url: baseURL + endpoint + query,
                headers: {
                    'Content-Type': 'application/json',
                    'Date': date,
                    'Digest': 'SHA-256=' + sha256,
                    'Authorization': 'hmac username="' + key + '",algorithm="hmac-sha256",headers="date request-line",signature="' + signature + '"'
                },
                data: params,
            };
            return axios( authOptions ).then( response => {
                resolve( response.data );
            } ).catch( error => {
                if ( error.response ) console.warn( error.response.data );
            } );
        } );
    }

    exports.auth = async ( _accountId, _key = false, _secret = false ) => {
        if ( _accountId.endsWith( ".json" ) ) {
            let json = JSON.parse( fs.readFileSync( _accountId, "utf8" ) );
            accountId = json.accountId;
            key = json.key;
            secret = json.secret;
        } else {
            accountId = _accountId;
            key = _key;
            secret = _secret;
        }
        if ( !accountId || !key || !secret ) throw "Invalid accountId, key, or secret";
        if ( !Object.keys( marketIds ).length ) await exports.initialize();
    };

    // Initialize instance
    exports.initialize = async ( params = {} ) => {
        let markets = await request( '/api/markets', params );
        for ( let market of markets ) {
            let symbol = `${market.base.replace( /-/g, '' )}-${market.quote.replace( /-/g, '' )}`;
            marketIds[symbol] = market.id;
            symbols[market.id] = symbol;
        }
    };

    // Initialize WebSockets
    exports.connect = async ( params = {} ) => {
        if ( !Object.keys( marketIds ).length ) await exports.initialize();
        let url = 'wss://api.eterbase.exchange/feed';
        if ( accountId ) {
            let token = await signedRequest( '/api/v1/wstoken' );
            url += `?wstoken=${token.wstoken}`;
        }
        return new Promise( ( resolve, reject ) => {
            dataFeed = new WebSocket( url );

            dataFeed.on( 'open', () => {
                setInterval( () => {
                    dataFeed.ping( "ping" );
                }, 30000 );
                emitter.emit( "open" );
                console.info( "connected" );
                resolve();
            } );

            dataFeed.on( 'message', data => {
                const message = JSON.parse( data );
                emitter.emit( message.type, data );
            } );
        } );
    };

    // Connectivity test
    exports.ping = async ( params = {} ) => {
        return request( '/api/v1/ping', params );
    };

    // List all assets
    exports.assets = async ( params = {} ) => {
        return request( '/api/v1/assets', params );
    };

    // List all markets
    exports.markets = async ( params = {} ) => {
        return request( '/api/v1/markets', params );
    };

    // Informations about all markets
    exports.tickers = async ( raw = false, params = {} ) => {
        let tickers = await request( '/api/v1/tickers', params ), output = {};
        if ( raw ) return tickers;
        for ( let obj of tickers ) {
            output[symbols[obj.marketId]] = obj;
        }
        return output;
    };

    // Get price of a specific asset
    exports.ticker = async ( params = {} ) => {
        if ( typeof params === "string" ) params = { symbol: params };
        return request( `/api/tickers/${symbolId( params )}/ticker`, {} );
    };

    // Quote details (bid/ask.. coming soon)
    exports.quote = async ( params = {} ) => {
        throw "BREAKING CHANGE: Quote was renamed to ticker!";
        //if ( typeof params === "string" ) params = { symbol: params };
        //return request( `/api/markets/${symbolId( params )}/quote`, {} );
    };

    // Market Depth
    exports.orderBook = async ( params = {} ) => {
        if ( typeof params === "string" ) params = { symbol: params };
        return request( `/api/markets/${symbolId( params )}/order-book`, params );
    };

    // OHLCV Data
    exports.ohlcv = async ( params = {} ) => {
        return request( `/api/markets/${symbolId( params )}/ohlcv`, params );
    };

    // Account balances
    exports.balances = async ( params = {} ) => {
        return signedRequest( `/api/accounts/${accountId}/balances`, {} );
    };

    // Place a new order
    exports.order = async ( params = {} ) => {
        if ( typeof params.type == "undefined" ) params.type = 1;
        let payload = {
            accountId,
            marketId: symbolId( params ),
            type: params.type,
            side: params.side
        };
        if ( typeof params.amount !== "undefined" ) payload.qty = params.amount;
        if ( typeof params.cost !== "undefined" ) payload.cost = params.cost;
        if ( params.type === 2 ) payload.limitPrice = params.price; // limit order
        return signedRequest( '/api/orders', payload, 'POST' );
    };

    // Limit buy
    exports.limitBuy = async ( payload = {} ) => {
        payload.type = 2;
        payload.side = 1;
        payload.postOnly = false;
        return exports.order( payload );
    };

    // Limit sell
    exports.limitSell = async ( payload = {} ) => {
        payload.type = 2;
        payload.side = 2;
        payload.postOnly = false;
        return exports.order( payload );
    };

    // Market buy
    exports.marketBuy = async ( payload = {} ) => {
        payload.type = 1;
        payload.side = 1;
        return exports.order( payload );
    };

    // Market sell
    exports.marketSell = async ( payload = {} ) => {
        payload.type = 1;
        payload.side = 2;
        return exports.order( payload );
    };

    // Cancel order by id
    exports.cancelOrder = async ( params = {} ) => {
        return signedRequest( `/api/orders/${params.orderId}`, {}, 'DELETE' );
    };

    // Return open orders
    exports.openOrders = async ( params = {} ) => {
        if ( typeof params === "string" ) params = { symbol: params };
        if ( typeof params.from == "undefined" ) params.from = 1546297200000;
        if ( typeof params.state == "undefined" ) params.state = "ACTIVE";
        if ( typeof params.symbol !== "undefined" ) {
            params.marketId = marketIds[params.symbol];
            delete params.symbol;
        }
        const now = new Date().getTime();
        if ( typeof params.from == "undefined" ) params.from = now - ( 60 * 60 * 24 * 90 * 1e3 ); // 90 days ago default
        if ( typeof params.to == "undefined" ) params.to = now;
        return signedRequest( `/api/accounts/${accountId}/orders`, params, 'GET' );
    };

    // Return filled/open order detail
    exports.orderDetail = async ( id, params = {} ) => {
        return signedRequest( `/api/orders/${id}`, params, 'GET' );
    };

    // Get a list of all trades (fills)
    exports.orderFills = async ( params = {} ) => {
        if ( typeof params === "string" ) params = { symbol: params };
        if ( typeof params.symbol !== "undefined" ) {
            params.marketId = marketIds[params.symbol];
            delete params.symbol;
        }
        const now = new Date().getTime();
        if ( typeof params.from == "undefined" ) params.from = now - ( 60 * 60 * 24 * 90 * 1e3 ); // 90 days ago default
        if ( typeof params.to == "undefined" ) params.to = now;
        return signedRequest( `/api/v1/accounts/${accountId}/fills`, params, 'GET' );
    };

    exports.withdraw = async ( params = {} ) => {
        const payload = {
            accountId,
            assetId: params.assetId,
            amount: params.amount,
            cryptoAddress: params.address
        };
        return signedRequest( `/api/v1/accounts/${accountId}/withdrawals`, payload, 'POST' );
    };

    /*
    ** WebSockets
     */
    function subscribe( payload, events ) {
        for ( const event of events ) {
            emitter.on( event.name, ( data ) => {
                if ( event.callback ) {
                    event.callback( data );
                } else {
                    console.log( data );
                }
            } );
        }
        dataFeed.send( JSON.stringify( payload ) );
    }

    exports.orderBookStream = ( symbol, onSnapshot, onUpdate ) => {
        if ( dataFeed.readyState !== dataFeed.OPEN ) {
            emitter.once( "open", () => { exports.orderBookStream( symbol, onSnapshot, onUpdate ) } );
        } else {
            let payload = { "type": "subscribe", "channelId": "order_book", "marketIds": [marketIds[symbol]] };
            subscribe( payload, [{ name: "ob_snapshot", callback: onSnapshot }, { name: "ob_update", callback: onUpdate }] );
        }
    };

    exports.tradeHistoryStream = ( symbol, onTrade ) => {
        if ( dataFeed.readyState !== dataFeed.OPEN ) {
            emitter.once( "open", () => { exports.tradeHistoryStream( symbol, onTrade ) } );
        } else {
            let payload = { "type": "subscribe", "channelId": "trade_history", "marketIds": [marketIds[symbol]] };
            subscribe( payload, [{ name: "trade", callback: onTrade }] );
        }
    };

    exports.ohlcvStream = ( symbol, onTick ) => {
        if ( dataFeed.readyState !== dataFeed.OPEN ) {
            emitter.once( "open", () => { exports.ohlcvStream( symbol, onTick ) } );
        } else {
            let payload = { "type": "subscribe", "channelId": "ohlcv_tick", "marketIds": [marketIds[symbol]] };
            subscribe( payload, [{ name: "ohlcv", callback: onTick }] );
        }
    };

    exports.myOrdersStream = ( symbol ) => {
        if ( dataFeed.readyState !== dataFeed.OPEN ) {
            emitter.once( "open", () => { exports.myOrdersStream( symbol ) } );
        } else {
            let payload = { "type": "subscribe", "channelId": "my_orders", "marketIds": [marketIds[symbol]] };
            subscribe( payload, ["o_placed", "o_rejected", "o_fill", "o_closed", "o_triggered"] );
        }
    };

    exports.wsToken = async () => {
        return signedRequest( '/api/v1/wstoken' );
    }

    function symbolId( params ) { // Return .id, or id of .symbol
        if ( typeof params.id !== "undefined" ) return params.id;
        return marketIds[params.symbol];
    }

    ////////////////////////////////////////
    // Undocumented and unsupported features
    exports.crossRates = async ( params = {} ) => {
        return request( '/api/tickers/cross-rates', params );
    };
} )();
