# hashsniper

# NOT YET UPDATED FOR v1.0 of FXHASH
# WILL NOT WORK CURRENTLY

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
  * set env var `TEZOS_RPC` for custom rpc node

## run
`npm install`

`node hs.js {mint_id}`

`node hs.js 5883`

you will be prompted with the mint details, press y and enter to proceed or ctrl-c or any other letter and enter to cancel

you can skip verification with 

`node hs.js {mint_id} -y`

## docker
`docker-compose up -d`

`docker exec -it hs node hs.js {mint id}`
