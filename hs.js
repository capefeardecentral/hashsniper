import fetch from "node-fetch";
import readline from "readline";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

const rpc = process.env.TEZOS_RPC || "https://mainnet.api.tez.ie"
const tezos = new TezosToolkit(rpc)
tezos.setProvider({signer: await InMemorySigner.fromSecretKey(process.env.TEZOS_PKH)})
const args = process.argv.slice(2)
const mintIndex = args[0]
const skipValidate = args[1] === "-y"
const upGas = args[1] === "--gas-war" || args[2] === "--gas-war"
const fee = upGas ? 1000000 : 100000

async function getTokenInfo(tokenId) {
    let tokenInfo
    // pull last 150 tokens
    await fetch("https://api.tzkt.io/v1/bigmaps/70072/keys?sort.desc=id&select=value%2Ckey&limit=150")
        .then((data => data.json()))
        .then((data) => {
            const head = data[0].key
            const diff = head - tokenId
            tokenInfo = data[diff]
        })

    return tokenInfo
}

function askContinue(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans)
    }))
}

async function validateMint(data) {
    if (skipValidate) {
        return true
    }
    if (!data.value.enabled) {
        console.log("token not enabled yet")
        return false
    }
    const query = `Token_id: ${data.key} \nPrice: ${data.value.price} \nWallet: ${data.value.author} \nPress y to continue \n`
    const carryOn = await askContinue(query)
    return carryOn === "y";
}

function callContract(data) {
    tezos.contract
        .at('KT1XCoGnfupWk7Sp8536EfrxcP73LmT68Nyr')
        .then((contract) => {
            return contract.methodsObject.mint(data.key)
            .send({amount: data.value.price, fee: fee, mutez: true})
        }).then((op) => {
        console.log(`Awaiting for ${op.hash} to be confirmed...`);
        return op.confirmation().then(() => op.hash);
    })
        .then((hash) => {
            console.log(`Operation injected: https://tzkt.io/${hash}`)
        })
        .catch((error) => {
            console.log(`Error: ${error.message}`)
        })
}

const tokenInfo = await getTokenInfo(mintIndex)
const doMint = await validateMint(tokenInfo)
if (!doMint) {
    console.log("transaction canceled")
} else {
    callContract(tokenInfo)
}
