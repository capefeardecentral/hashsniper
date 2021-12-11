# hashsniper

## cli tool for buying fxhash pieces without worrying about ui issues

### This is a quick and easy script I have done minimal QA and testing.
### Use at your own  risk
# USE A BURNER WALLET
## only transfer as much tez as you need.

## requirements 
* nodejs 16
* wallet pkh
  * export your pkh from temple wallet under settings (use a burner wallet)
  * set env var `TEZOS_PKH` to the exported pkh

## run
`npm install`

`node hashsniper.js {issuer_address} {issuer id} {amount}`

`node hashsniper.js tz1McsuQc8hDd6uyJ6k6gjUJXB9jvb3YkEWU 1234 0.25`

## docker
`docker-compose up -d`

`docker exec hs node hashsniper.js {issuer_address} {issuer id} {amount}`