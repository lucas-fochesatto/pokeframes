# Cartesi Typescript SQLite - Backend

The project is a Backend application running Typescript + SQLite to run with the respective frontend project. It is managed using npm as the package manager. The goal of the project is to create a template that streamlines the process of kickstarting new projects. The template incorporates the latest version of React and integrates with Ethers, allowing for seamless interaction with the underlying blockchain. For testing purposes, a pre-deployed demo on the Sepolia Network is available for users to explore before starting their own development.

[Live Demo](https://doiim.github.io/cartesi-ts-react-sqlite/)

## How this project is structured

![Cartesi project structure](https://github.com/doiim/cartesi-react-bootstrap/assets/13040410/2ab19829-997b-4964-82ca-b038f3fe2dd2)

A `Sunodo` template machine that runs a `Typescript` node service along with `viem` to convert values from/to Hex strings. We could have switched to `Ethers` but the idea was to reduce the amount to code, and the `Sunodo` template used already have support to `viem`. The database runs `SQLite` with WASM support due to the nature of the Risc-V Node has no native support to `SQLite` bindings.

This project is part of a `React SQLite` app template. If you want to run the frontend app together, follow intructions [here](https://github.com/doiim/cartesi-ts-react-sqlite/tree/master).

## Running Backend Locally using Cartesi CLI

Before run this app it would be required to run the backend service for it. To run a local backend service for this app it is required Cartesi CLI.

1. [Install Cartesi CLI](https://docs.cartesi.io/cartesi-rollups/1.3/quickstart/)
2. Build project and after that run the Cartesi environment

```sh
cartesi build
cartesi run
```

This will run an [anvil](https://book.getfoundry.sh/reference/anvil/) node as a local blockchain, the GraphQL service and Inspect Service.

## Deploy to Production/Testnet using Sunodo

For deploy your project on production use the following procedure for Self Hosting:
[Self Hosted Tutorial from Cartesi Docs](https://docs.cartesi.io/cartesi-rollups/1.3/deployment/self-hosted/)

## Learn More

This project is meant to run on [Cartesi Machine](https://docs.cartesi.io/), the tool used to run and deploy the backend to public networks was [Sunodo](https://docs.sunodo.io/guide/introduction/what-is-sunodo).

This project is based on the following repositories from Cartesi team:

- [Sunodo Typescript template project](https://github.com/sunodo/sunodo-templates/tree/main/typescript)
- [Backend SQLite Image](https://github.com/cartesi/rollups-examples/tree/main/sqlite)
- [Front-end Echo Example](https://github.com/cartesi/rollups-examples/tree/main/frontend-echo)
