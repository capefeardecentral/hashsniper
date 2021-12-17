import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { request, gql } from "graphql-request";
import * as readline from "readline";

const rpc = process.env.TEZOS_RPC || "https://mainnet.api.tez.ie"
const tezos = new TezosToolkit(rpc)
tezos.setProvider({signer: await InMemorySigner.fromSecretKey(process.env.TEZOS_PKH)})
const args = process.argv.slice(2)
const mintIndex = args[0]

async function getTokenInfo(tokenId) {
    const query = gql`
    {
        generativeTokensByIds(ids: ${tokenId}) {
            id,
            name,
            balance,
            price,
            enabled,
            author {
                id,
                name
            }
        }
    }
    `
    return request('https://api.fxhash.xyz/graphql', query)
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
    // if (!data.enabled) {
    //     console.log("token not enabled yet")
    //     return false
    // }
    const query = `Token_id: ${data.id} \nName: ${data.name} \nPrice: ${data.price} \nAuthor: ${data.author.name} \nWallet: ${data.author.id} \nPress y to continue \n`
    const carryOn = await askContinue(query)
    return carryOn === "y";
}


function callContract(data) {
    tezos.contract
        .at('KT1AEVuykWeuuFX7QkEAMNtffzwhe1Z98hJS')
        .then((contract) => {
            return contract.methodsObject.mint({
                issuer_address: data.author.id,
                issuer_id: data.id,
            }).send({amount: data.price, mutez: true, gasLimit: 100000})
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

let data = await getTokenInfo(mintIndex)
const doMint = await validateMint(data.generativeTokensByIds[0])
if (!doMint) {
    console.log("transaction canceled")
} else {
    callContract(data.generativeTokensByIds[0])
}