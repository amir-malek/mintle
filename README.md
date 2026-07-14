# Mintle — Gasless NFT Minting Platform API

Backend service that lets applications mint NFTs on **Polygon on behalf of their users, without those users paying gas or signing a transaction**. A client uploads media, creates a collection, and requests a mint; Mintle pins the assets to IPFS, deploys/uses an ERC-721 collection contract, and submits the mint from a platform relayer wallet that sponsors the gas. Minting is queued and processed asynchronously, so the API stays responsive under load and can absorb bursts of thousands of mint requests.

## Why gasless

The end user never holds MATIC, never signs, and never sees a wallet prompt. Every on-chain `mint(to, uri)` call is built, signed, and paid for by a single platform wallet (the collection's authorized minter), which mints the token directly *to* the user's address. This is what makes onboarding non-crypto-native users viable.

## How it works

```
          ┌────────────┐   upload    ┌──────────────────────┐
 client → │  /ipfs     │ ──────────► │ S3 + IPFS pinning     │
          │  upload    │             │ (nft.storage /        │
          └────────────┘             │  web3.storage)        │
                                     └──────────┬───────────┘
                                                │ ipfsUrl
          ┌────────────┐  create     ┌──────────▼───────────┐
 client → │/collections│ ──────────► │ ERC721Factory deploys │
          │  create    │             │ a MintNFT721 contract │
          └────────────┘             └──────────┬───────────┘
                                                │
          ┌────────────┐   mint      ┌──────────▼───────────┐   ┌─────────────┐
 client → │/mint/721   │ ──────────► │ BullMQ mintQueue      │ → │ mint worker │
          │  /:nftId   │             │ (Redis)               │   │ signs + pays│
          └────────────┘             └───────────────────────┘   │ gas, sends  │
                                                                  │ to Polygon  │
                                                                  └──────┬──────┘
                                                                         │ txHash
                                                                  webhook callback
                                                                    to client
```

1. **Upload** — media is streamed to AWS S3 and pinned to IPFS (nft.storage / web3.storage), returning a token URI. Uploads are themselves queued so large files don't block the request thread.
2. **Collection** — an `ERC721Factory` contract deploys a per-collection `MintNFT721` (ERC-721) contract whose only authorized minter is the platform wallet.
3. **Mint** — `POST /mint/721/:nftId` records the destination address + callback URL and pushes a job onto the Redis-backed **BullMQ** `mintQueue`. The API returns immediately.
4. **Worker** — a BullMQ worker builds the `mint(to, uri)` transaction, signs it with the platform wallet's private key, submits it to Polygon via Alchemy, and writes `txHash` / `tokenId` back to MongoDB.
5. **Callback** — on success the worker POSTs the `nftId` and `txHash` to the client's webhook. Failed jobs are marked `FAILED` and can be requeued.

### Handling scale

- **Staggered bulk minting** — bulk jobs are enqueued with a per-job delay (2 minutes apart) to avoid nonce collisions and gas-price spikes when minting for many users at once.
- **Retry pipeline** — `PUT /mint/nfts/retry` requeues every `FAILED` mint with the same staggered spacing, so a bad RPC window or gas spike is self-healing rather than a manual cleanup.
- **Async everywhere** — IPFS uploads and mints both run on their own Redis queues, keeping the HTTP layer thin.

## Tech stack

| Layer        | Choice                                                        |
|--------------|---------------------------------------------------------------|
| Runtime/API  | Node.js, Express                                              |
| Queues       | BullMQ + Bull on Redis                                        |
| Database     | MongoDB (Mongoose)                                            |
| Blockchain   | Polygon via web3.js + Alchemy; Hardhat for contracts          |
| Contracts    | Solidity `MintNFT721` (ERC-721 URI Storage, OpenZeppelin) + `ERC721Factory` |
| Storage      | AWS S3 (presigned uploads) + IPFS (nft.storage / web3.storage) |
| Auth/hardening | Passport, JWT, Helmet, rate limiting, mongo-sanitize        |

## API

| Method | Route                     | Purpose                                  |
|--------|---------------------------|------------------------------------------|
| POST   | `/ipfs/upload`            | Upload a file, pin to IPFS + S3          |
| POST   | `/ipfs/upload/url`        | Pin a file from a remote URL             |
| POST   | `/collections/create`     | Deploy a new ERC-721 collection contract |
| POST   | `/mint/721/:nftId`        | Queue a gasless mint to a user address   |
| PUT    | `/mint/nfts/retry`        | Requeue all failed mints                 |

## Smart contracts

- **`MintNFT721`** — ERC-721 with on-chain token URIs (`ERC721URIStorage`), `Ownable`. Minting is restricted to the collection's authorized minter (the platform wallet), which is what enforces the gasless/custodial-relayer model.
- **`ERC721Factory`** — deploys collection contracts on demand and emits a `CollectionCreation` event.

Contracts live in `server/contracts/` and are compiled/deployed with Hardhat (`hardhat.config.js`, `server/scripts/deploy.js`).

## Running locally

```bash
# 1. Config — copy the samples and fill in your own values
cp config/dev.sample.json config/dev.json
cp redis.env.example redis.env      # set REDIS_HOST_PASSWORD

# 2. Start the stack (API + MongoDB + Redis)
docker-compose build
docker-compose up
```

The API listens on the port set in `config/dev.json` (`server.port`, default `9000`).

### Configuration

`config/*.json` (loaded by [`node-config`](https://github.com/node-config/node-config)) supplies MongoDB, Redis, AWS, mail, and the `web3` block (Alchemy Polygon RPC, contract addresses, and the platform wallet address + private key used to sponsor mints). **Never commit real secrets** — keep them in the untracked `config/dev.json` / `config/production.json` and commit only the `.sample.json` templates.

## License

MIT
