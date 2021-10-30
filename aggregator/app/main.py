import ccxt # import ccxt.async_support as ccxt
import pandas as pd
import numpy as np
# import tasks

from sqlalchemy import create_engine
from argparse import ArgumentParser

### NOTES
"""
Read OHLCV+ data from exchange and store in database.  The data will be created if it 
does not exist, otherwise appended.  Each exchange/symbol will have it's own table since
this is likely to be called async and from a celery worker.

TODO: ability to include exchange as column to be able to store multi symbols same table
TODO: automate with CLI params; call from celery workers
TODO: to use async, must include await methods

Helpers:
----------
find symbols with string
> list(filter(None, [m if (m.find('ERG') != -1) else None for m in ccxt.hitbtc().load_markets()]))

get symbol in form for database
> pd.DataFrame.from_dict(ccxt.hitbtc().fetch_symbol('ERG/BTC'), orient='index').drop('info').T

if pulling from symbol, can use this to format as dataframe
> df = pd.DataFrame.from_dict(exchange.fetch_symbol(symbol), orient='index')
> df = df.drop('info') # ignore
> df.T.to_sql(tbl, con=con, if_exists='append') # transpose dataframe with default cols from ccxt

Initial:
---------
frm = exchange.parse8601('2021-10-20 00:00:00')
now = exchange.milliseconds()
symbol = 'ERG/USDT'
data = []
msec = 1000
minute = 60 * msec
hold = 30

while from_timestamp < now:
    try:
        print(exchange.milliseconds(), 'Fetching candles starting from', exchange.iso8601(from_timestamp))
        ohlcvs = exchange.fetch_ohlcv(symbol, '1m', from_timestamp)
        print(exchange.milliseconds(), 'Fetched', len(ohlcvs), 'candles')
        from_timestamp = ohlcvs[-1][0]
        data += ohlcvs
    except (ccxt.ExchangeError, ccxt.AuthenticationError, ccxt.ExchangeNotAvailable, ccxt.RequestTimeout) as error:
        print('Got an error', type(error).__name__, error.args, ', retrying in', hold, 'seconds...')
        time.sleep(hold)

"""
### ENVIRONMENT
import os
from dotenv import load_dotenv
load_dotenv()

parser = ArgumentParser(description='ready, go.')
parser.add_argument('-t', '--timeframe', default='5m', choices=['1m', '5m', '1d', '1w'], help='common interval between candles')
parser.add_argument('-s', '--symbol', default='ERG/USDT', help='crypto symbol available on exchange')
parser.add_argument('-x', '--exchange', default='coinex', choices=ccxt.exchanges, help='exchange to gather candles')
parser.add_argument('-l', '--limit', default=1000, type=int, help='exchange to gather candles')
args = parser.parse_args()
exchangeName = args.exchange
symbol = args.symbol
timeframe = args.timeframe
limit = args.limit

POSTGRES_PORT = 5432 # os.getenv('POSTGRES_PORT')
apiKeys = {
    'coinex': {
        'ACCESS_ID': '8CD70BBCE0544FAAB454A3638A769EC0',
        'SECRET_KEY': 'A7A7988516DD784E78742D21CB732A2291C04AD203F478F1'
    }
}
ACCESS_ID = apiKeys[exchangeName]['ACCESS_ID']
SECRET_KEY = apiKeys[exchangeName]['SECRET_KEY']

### LOGGING
import logging
level = logging.ERROR # TODO: set from .env
logging.basicConfig(format="%(asctime)s %(levelname)s %(threadName)s %(name)s %(message)s", datefmt='%m-%d %H:%M', level=level)

### INIT
usr = 'hello'
pwd = 'world'
dbn = 'hello'
con = create_engine(f'postgresql://{usr}:{pwd}@postgres:{POSTGRES_PORT}/{dbn}')

# for xcg in ccxt.exchanges: ...
apiKey = ACCESS_ID
secret = SECRET_KEY
exchange = getattr(ccxt, exchangeName)({'apiKey': apiKey, 'secret': secret}) # exchange = eval(f'ccxt.{exchangeName}()') # alternative using eval

def getLatestTimestamp(tbl, since='1970-01-01T00:00:00Z', removeLatest=True):
    """
    Find last imported row and remove
    """
    try:
        sqlLatest = f'select max(timestamp_utc) as timestamp_utc from "{tbl}"'
        dfLatest = pd.read_sql(sql=sqlLatest, con=con)
    
        # from ccxt docs, indicates last close value may be inaccurate
        since = dfLatest.iloc[0]['timestamp_utc']

        # remove latest to avoid dups and provide more accurate closing value
        if removeLatest:
            sqlRemoveLatest = f"""delete from "{tbl}" where timestamp_utc = '{since}'"""
            res = con.execute(sqlRemoveLatest, con=con)
            if res == 0:
                logging.warning('No rows deleted; maybe table is blank, or issue with latest timestamp_utc')

        return exchange.parse8601(since.isoformat())

    except Exception as e: # consider narrowing exception handing from generic, "Exception"
        logging.error(f'table, {tbl} may not exist, or connection to SQL invalid.')
        pass

    return 0

def getLatestOHLCV(exchange, symbol, since=None):
    """
    Find the latest X rows of ohlcv data from exchange and save to SQL
    """
    data = []
    limit = 1000
    timeframe = '5m'
    tf_milliseconds = 5*60*1000
    try:
        if exchange.has['fetchOHLCV']:
            # paginate latest ohlcv from exchange
            if since == None:
                since  = exchange.milliseconds() - 86400000 # 1 day

            while since < exchange.milliseconds()-tf_milliseconds:
                print(f'since: {since}...')
                data += exchange.fetch_ohlcv(symbol, timeframe=timeframe, since=since, limit=limit)
                since = int(data[len(data)-1][0])

    except Exception as e:
        logging.debug(e)

    return data

def putLatestOHLCV(ohlcv, tbl, utcLatest):
    """
    comments go here
    """
    try:
        # save ohlcv to sql
        columns = ['timestamp_utc', 'open', 'high', 'low', 'close', 'volume']
        df = pd.DataFrame(np.row_stack(ohlcv), columns=columns)
        dfLatest = df[df['timestamp_utc'] >= utcLatest].astype({'timestamp_utc': 'datetime64[ms]'}).set_index('timestamp_utc')
        dfLatest.to_sql(tbl, con=con, if_exists='append', index_label='timestamp_utc')

    except Exception as e:
        logging.debug(e)

### MAIN
if (__name__ == '__main__'):
    
    # destination
    tbl = f'{exchangeName}_{symbol}_{timeframe}'

    # get latest timestamp; remove from table, if exists
    since = getLatestTimestamp(tbl)
    
    # get lastest X OHLCV
    # ohlcv = getLatestOHLCV(exchange, symbol) # TODO: pagination
    ohlcv = exchange.fetch_ohlcv(symbol, timeframe=timeframe, since=since, limit=limit) # coinex buggy with, "since" -hack

    # save most recent OHLCV to SQL
    putLatestOHLCV(ohlcv, tbl, since)
