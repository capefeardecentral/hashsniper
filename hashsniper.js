import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer"

let rpc = process.env.TEZOS_RPC || "https://mainnet.smartpy.io"
const tezos = new TezosToolkit(rpc)
tezos.setProvider({signer: await InMemorySigner.fromSecretKey(process.env.TEZOS_PKH)})
const args = process.argv.slice(2)
const artistWallet = args[0]
const mintIndex = args[1]
const amount = args[2]

tezos.contract
    .at('KT1AEVuykWeuuFX7QkEAMNtffzwhe1Z98hJS')
    .then((contract) => {
        console.log("sending contract call")
        return contract.methodsObject.mint({
            issuer_address: artistWallet,
            issuer_id: mintIndex,
            amount: amount
        }).send()
    }).then((op) => {
        console.log(`Awaiting for ${op.hash} to be confirmed...`);
        return op.confirmation().then(() => op.hash);
    })
    .then((hash) => {
        console.log(`Operation injected: https://tzkt.io/${hash}`)
    })
    .catch((error) => {
        console.log(`Error: ${JSON.stringify(error, null, 2)}`)
    })