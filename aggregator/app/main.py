import ccxt
import tasks

### LOGGING

### INIT
hitbtc = ccxt.hitbtc() # {'verbose': True})

### MAIN
if (__name__ == '__main__'):
    hitbtc_markets = hitbtc.load_markets()
    # print(hitbtc.id, hitbtc_markets)
    print(hitbtc.fetch_ticker('ERG/BTC'))

