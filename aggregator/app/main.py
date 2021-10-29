import ccxt # import ccxt.async_support as ccxt
import pandas as pd
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

"""
### ENVIRONMENT
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_PORT = 5432 # os.getenv('POSTGRES_PORT')

### LOGGING
import logging
level = logging.DEBUG # TODO: set from .env
logging.basicConfig(format="%(asctime)s %(levelname)s %(threadName)s %(name)s %(message)s", datefmt='%m-%d %H:%M', level=level)

### INIT
usr = 'hello'
pwd = 'world'
dbn = 'hello'


# for xcg in ccxt.exchanges: ...
exchangeName = 'hitbtc'
exchange = eval(f'ccxt.{exchangeName}()')

# ERGO, for now
ticker = 'ERG/BTC' # cli

con = create_engine(f'postgresql://{usr}:{pwd}@postgres:{POSTGRES_PORT}/{dbn}')

### MAIN
if (__name__ == '__main__'):

    # store exchange+ticker in own table?
    tbl = f'{exchangeName}_{ticker}'

    # validate sql structure exists, or create
    # .. dw.to_sql will automatically create if it doesn't exist

    # find last import
    sqlLastImport = f'select max(timestamp) from {tbl}'
    dfLastImport = pd.Datafrom.from_sql(tbl, con=con, sql=sqlLastImport)

    # get ticker from last import
    ohlcv = exchange.fetch_ticker(ticker)

    # save ohlcv+ to sql
    df = pd.DataFrame.from_dict(ohlcv, orient='index')
    df = df.drop('info') # ignore
    df.T.to_sql('', con=con, if_exists='append') # transpose dataframe with default cols from ccxt
