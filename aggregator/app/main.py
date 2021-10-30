import ccxt # import ccxt.async_support as ccxt
import pandas as pd
import numpy as np
# import tasks

from sqlalchemy import create_engine

### NOTES
"""
Read OHLCV+ data from exchange and store in database.  The data will be created if it 
does not exist, otherwise appended.  Each exchange/ticker will have it's own table since
this is likely to be called async and from a celery worker.

TODO: ability to include exchange as column to be able to store multi tickers same table
TODO: automate with CLI params; call from celery workers
TODO: to use async, must include await methods

Helpers:
----------
find tickers with string
> list(filter(None, [m if (m.find('ERG') != -1) else None for m in ccxt.hitbtc().load_markets()]))

get ticker in form for database
> pd.DataFrame.from_dict(ccxt.hitbtc().fetch_ticker('ERG/BTC'), orient='index').drop('info').T

if pulling from ticker, can use this to format as dataframe
> df = pd.DataFrame.from_dict(exchange.fetch_ticker(ticker), orient='index')
> df = df.drop('info') # ignore
> df.T.to_sql(tbl, con=con, if_exists='append') # transpose dataframe with default cols from ccxt

Initial:
---------
frm = exchange.parse8601('2021-10-20 00:00:00')
now = exchange.milliseconds()
ticker = 'ERG/USDT'
data = []
msec = 1000
minute = 60 * msec
hold = 30

while from_timestamp < now:
    try:
        print(exchange.milliseconds(), 'Fetching candles starting from', exchange.iso8601(from_timestamp))
        ohlcvs = exchange.fetch_ohlcv(ticker, '1m', from_timestamp)
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

POSTGRES_PORT = 5432 # os.getenv('POSTGRES_PORT')

COINEX_ACCESS_ID = '8CD70BBCE0544FAAB454A3638A769EC0'
COINEX_SECRET_KEY = 'A7A7988516DD784E78742D21CB732A2291C04AD203F478F1'

### LOGGING
import logging
level = logging.DEBUG # TODO: set from .env
logging.basicConfig(format="%(asctime)s %(levelname)s %(threadName)s %(name)s %(message)s", datefmt='%m-%d %H:%M', level=level)

### INIT
usr = 'hello'
pwd = 'world'
dbn = 'hello'
con = create_engine(f'postgresql://{usr}:{pwd}@postgres:{POSTGRES_PORT}/{dbn}')

# for xcg in ccxt.exchanges: ...
exchangeName = 'coinex' # exchangeName = 'hitbtc'
apiKey = COINEX_ACCESS_ID
secret = COINEX_SECRET_KEY
exchange = getattr(ccxt, exchangeName)(apikey, secret) # exchange = eval(f'ccxt.{exchangeName}()') # alternative using eval


def getLatestTimestamp(tbl, removeLatest = True):
    """
    Find last imported row and remove
    """
    try:
        sqlLatest = f'select max(timestamp_utc) as timestamp_utc from "{tbl}"'
        dfLatest = pd.read_sql(sql=sqlLatest, con=con)
    
        # from ccxt docs, indicates last close value may be inaccurate
        utcLatest = dfLatest.iloc[0]['timestamp_utc']

        # remove latest to avoid dups and provide more accurate closing value
        if removeLatest:
            sqlRemoveLatest = f'delete from "{tbl}" where timestamp_utc = {utcLatest}'
            res = con.execute(sqlRemoveLatest, con=con)
            if res == 0:
                logging.warning('No rows deleted; maybe table is blank, or issue with latest timestamp_utc')
        
        return utcLatest

    except Exception as e: # consider narrowing exception handing from generic, "Exception"
        logging.warning(f'table, {tbl} may not exist, or connection to SQL invalid.')
        pass

    return 0

def getLatestOHLCV(exchange, ticker):
    """
    Find the latest X rows of ohlcv data from exchange and save to SQL
    """
    try:
        if exchange.has['fetchOHLCV']:
            # get latest ohlcv from exchange
            ohlcv = exchange.fetch_ohlcv(ticker)
            return ohlcv

        else:
            return None

    except Exception as e:
        logging.debug(e)

def putLatestOHLCV(ohlcv, tbl, utcLatest):
    """
    comments go here
    """
    try:
        # save ohlcv to sql
        columns = ['timestamp_utc', 'open', 'high', 'low', 'close', 'volume']
        df = pd.DataFrame(np.row_stack(ohlcv), columns=columns)
        dfLatest = df[df['timestamp_utc'] >= utcLatest].astype({'timestamp_utc': 'int64'}).set_index('timestamp_utc')
        dfLatest.to_sql(tbl, con=con, if_exists='append', index_label='timestamp_utc')

    except Exception as e:
        logging.debug(e)

### MAIN
if (__name__ == '__main__'):
    
    # ERGO, for now
    ticker = 'ERG/BTC' # TODO: cli
    tbl = f'{exchangeName}_{ticker}'

    # get latest timestamp; remove from table, if exists
    utcLatest = getLatestTimestamp(tbl)
    logging.debug(f'UTCLATEST: {utcLatest}')
    
    # get lastest X OHLCV
    ohlcv = getLatestOHLCV(exchange, ticker)

    # save most recent OHLCV to SQL
    putLatestOHLCV(ohlcv, tbl, utcLatest)

    # fin
    logging.debug('the end.')
