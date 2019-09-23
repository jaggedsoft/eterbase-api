( async () => {
    const crypto = require( 'crypto' );
    const EventEmitter = require('events');
    const axios = require( 'axios' );
    const webSocket = require( 'ws' );
    const fs = require( 'fs' ), exports = module.exports;
    const baseURL = "https://api.eterbase.exchange";
    let accountId = '', key = '', secret = '', marketIds = [];

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

    let dataFeed = undefined;

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

    exports.auth = ( _accountId, _key = false, _secret = false ) => {
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
    };

    // Initialize instance
    exports.initialize = async ( params = {} ) => {
        let markets = await request( '/api/markets', params );
        for ( let market of markets ) {
            marketIds[`${market.base}-${market.quote}`] = market.id;
        }

        // const token = await exports.wsToken();
        dataFeed = new webSocket( 'wss://api.eterbase.exchange/feed'); // ?wstoken=' + token );

        dataFeed.on( 'open', () => {
            setInterval( () => {
                dataFeed.ping( "ping" );
            }, 30000 );
            emitter.emit("open");
        } );

        dataFeed.on( 'message', data => {
            const message = JSON.parse(data);
            emitter.emit(message.type, data);
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
    exports.tickers = async ( params = {} ) => {
        return request( '/api/v1/tickers', params );
    };

    // Quote details
    exports.quote = async ( params = {} ) => {
        return request( '/api/tickers/' + marketIds[params.symbol] + '/ticker', {} );
    };

    // OHLCV Data
    exports.ohlcv = async ( params = {} ) => {
        return request( '/api/markets/' + marketIds[params.symbol] + '/ohlcv', params );
    };

    // My account balances
    exports.balances = async ( params = {} ) => {
        //let payload = {
        //    timestamp: Date.now()
        //};
        return signedRequest( '/api/accounts/' + accountId + '/balances', {} );
    };

    // Places a new order
    exports.order = async ( params = {} ) => {
        if ( typeof params.type == "undefined" ) params.type = 1;
        let payload = {
            accountId,
            marketId: marketIds[params.symbol],
            type: params.type,
            side: params.side
        };
        if ( typeof params.amount !== "undefined" ) payload.qty = params.amount;
        if ( typeof params.cost !== "undefined" ) payload.cost = params.cost;
        if ( params.type === 2 ) payload.limitPrice = params.price; // limit order
        return signedRequest( '/api/orders', payload, 'POST' );
    };

    // Places a new order
    exports.limitBuy = async ( payload = {} ) => {
        payload.type = 2;
        payload.side = 1;
        payload.postOnly = false;
        return exports.order( payload );
    };

    // Places a new order
    exports.limitSell = async ( payload = {} ) => {
        payload.type = 2;
        payload.side = 2;
        payload.postOnly = false;
        return exports.order( payload );
    };

    // Places a new order
    exports.marketBuy = async ( payload = {} ) => {
        payload.type = 1;
        payload.side = 1;
        return exports.order( payload );
    };

    // Places a new order
    exports.marketSell = async ( payload = {} ) => {
        payload.type = 1;
        payload.side = 2;
        return exports.order( payload );
    };

    // Cancel order by id
    exports.cancelOrder = async ( params = {} ) => {
        return signedRequest( '/api/orders/' + params.orderId, {}, 'DELETE' );
    };

    // Return open orders
    exports.openOrders = async ( params = {} ) => {
        return signedRequest( '/api/accounts/' + accountId + '/orders', params, 'GET' );
    };

    // Return filled/open order detail
    exports.orderDetail = async ( id, params = {} ) => {
        return signedRequest( '/api/orders/' + id, params, 'GET' );
    };

    // Get a list of all trades (fills)
    exports.orderFills = async ( params = {} ) => {
        const end_params = {
            symbol: marketIds[params.symbol],
            side: params.side,
            offset: params.offset,
            limit: params.limit,
            from: params.from,
            to: params.to
        };
        return signedRequest( '/api/v1/accounts/' + accountId + '/fills', end_params, 'GET' );
    };

    exports.withdraw = async (params = {}) => {
        const final_params = {
            accountId,
            assetId: params.assetId,
            amount: params.amount,
            cryptoAddress: params.address
        };
        return signedRequest( '/api/v1/accounts/' + accountId + '/withdrawals', final_params, 'POST' );
    };

    /*
    ** Websockets
     */
    function subscribe(payload, events) {
        for (const event of events) {
            emitter.on(event.name, (data) => {
                if (event.callback) {
                    event.callback(data);
                } else {
                    console.log(data);
                }
            });
        }
        dataFeed.send(JSON.stringify(payload));
    }

    exports.orderBookStream = (symbol, onSnapshot, onUpdate) => {
        if (dataFeed.readyState !== dataFeed.OPEN) {
            emitter.once("open", () => { exports.orderBookStream(symbol, onSnapshot, onUpdate) });
        } else {
            let payload = { "type": "subscribe", "channelId": "order_book", "marketIds": [marketIds[symbol]] };
            subscribe(payload, [{ name: "ob_snapshot", callback: onSnapshot }, { name: "ob_update", callback: onUpdate }]);
        }
    };

    exports.tradeHistoryStream = (symbol, onTrade) => {
        if (dataFeed.readyState !== dataFeed.OPEN) {
            emitter.once("open", () => { exports.tradeHistoryStream(symbol, onTrade) });
        } else {
            let payload = { "type": "subscribe", "channelId": "trade_history", "marketIds": [marketIds[symbol]] };
            subscribe(payload, [{ name: "trade", callback: onTrade }]);
        }
    };

    exports.ohlcvStream = (symbol, onTick) => {
        if (dataFeed.readyState !== dataFeed.OPEN) {
            emitter.once("open", () => { exports.ohlcvStream(symbol, onTick) });
        } else {
            let payload = { "type": "subscribe", "channelId": "ohlcv_tick", "marketIds": [marketIds[symbol]] };
            subscribe(payload, [{ name: "ohlcv", callback: onTick }]);
        }
    };

    exports.myOrdersStream = (symbol) => {
        if (dataFeed.readyState !== dataFeed.OPEN) {
            emitter.once("open", () => { exports.myOrdersStream(symbol) });
        } else {
            let payload = { "type": "subscribe", "channelId": "my_orders", "marketIds": [marketIds[symbol]] };
            subscribe(payload, ["o_placed", "o_rejected", "o_fill", "o_closed", "o_triggered"]);
        }
    };

    exports.wsToken = async () => {
        return signedRequest('/api/v1/wstoken', {});
    }

} )();
