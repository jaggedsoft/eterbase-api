( async () => {
    const crypto = require( 'crypto' );
    const axios = require( 'axios' ), exports = module.exports;
    const baseURL = "https://api.eterbase.exchange";
    const accountId = '', key = '', secret = '';
    const marketIds = [];
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
            let date = new Date().toGMTString();
            let message = 'date: ' + date + '\n' + method.toUpperCase() + ' ' + endpoint + ' HTTP/1.1';
            let signature = crypto.createHmac( 'sha256', secret ).update( message ).digest( 'base64' );
            let sha256 = crypto.createHash( 'sha256' ).update( JSON.stringify( params ), 'utf8' ).digest( 'base64' );
            let authOptions = {
                method,
                url: baseURL + endpoint,
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
            accountId = _accountId
            key = _key
            secret = _secret
        }
    };

    // Initialize instance
    exports.initialize = async ( params = {} ) => {
        let markets = await request( '/api/markets', params );
        for ( let market of markets ) {
            marketIds[`${market.base}-${market.quote}`] = market.id;
        }
    };

    // List all markets
    exports.markets = async ( params = {} ) => {
        return request( '/api/markets', params );
    };

    // Quote details
    exports.quote = async ( params = {} ) => {
        return request( '/api/tickers/' + marketIds[params.ticker] + '/ticker', {} );
    };

    // OHLCV Data
    exports.ohlcv = async ( params = {} ) => {
        return request( '/api/markets/' + marketIds[params.ticker] + '/ohlcv', params );
    };

    // My account balances
    exports.balances = async ( params = {} ) => {
        let end_params = {
            timestamp: Date.now()
        };
        return signedRequest( '/api/accounts/' + accountId + '/balances', {} );
    };

    // Places a new order
    exports.order = async ( params = {} ) => {
        if ( typeof params.type == "undefined" ) params.type = 1;
        let end_params = {
            accountId,
            marketId: marketIds[params.ticker],
            type: params.type,
            side: params.side,
            qty: params.amount,
            cost: params.price,
        };
        return signedRequest( '/api/orders', end_params, 'POST' );
    };

    // Cancel order by id
    exports.cancelOrder = async ( params = {} ) => {
        return signedRequest( '/api/orders/' + params.orderId, {}, 'DELETE' );
    };
} )();
