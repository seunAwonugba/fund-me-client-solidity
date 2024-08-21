import "./App.css";
import { useEffect, useState } from "react";
import { useSDK } from "@metamask/sdk-react";
// import { ethers } from "ethers";
import { abi, contractAddress } from "./constant/constant";
const { ethers } = require("ethers");

// We know there are two types of functions in solidity, one that doesn't change the state(or read-only functions) and others that do change the state of the contract..

// So, for the read-only functions, we need to use the provider and for state-changing transactions or functions we need to use the signer. Also make sure to implement that signer variable in the form const signer = await provider.getSigner()
function App() {
    const [account, setAccount] = useState();
    const [amount, setAmount] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const { sdk, connected, connecting, provider, chainId } = useSDK();

    useEffect(() => {
        if (account) {
            setIsConnected(true);
        }
    }, []);

    const connect = async () => {
        try {
            if (window.ethereum) {
                const accounts = await sdk?.connect();
                setAccount(accounts?.[0]);
                setIsConnected(true);
            } else {
                alert("Add a meta mask wallet");
            }
        } catch (error) {
            console.log(error);
        }
    };
    const disconnect = async () => {
        try {
            sdk?.terminate();
            console.log("disconnected");
            setIsConnected(false);
        } catch (error) {
            console.log(error);
        }
    };

    const fund = async (e) => {
        try {
            e.preventDefault();
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            // The Contract object
            const contract = new ethers.Contract(contractAddress, abi, signer);

            try {
                const transactionResponse = await contract.fund({
                    value: ethers.parseEther(amount),
                });
                await listenForTransactionMined(transactionResponse, provider);

                console.log("Done");
            } catch (error) {
                console.log("fund_error", error);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const listenForTransactionMined = (transactionResponse, provider) => {
        console.log(`Mining ${transactionResponse.hash}`);
        //listen for transaction to finish

        return new Promise((resolve, reject) => {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with transaction receipt`,
                    transactionReceipt
                );
                resolve();
            });
        });
    };

    const getBalance = async () => {
        try {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const balance = await provider.getBalance(contractAddress);
                console.log(ethers.formatEther(balance));
            }
        } catch (error) {}
    };
    const withdraw = async () => {
        try {
            if (window.ethereum) {
                console.log("Withdrawing...");

                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                // The Contract object
                const contract = new ethers.Contract(
                    contractAddress,
                    abi,
                    signer
                );
                try {
                    const transactionResponse = await contract.withdraw();
                    await listenForTransactionMined(
                        transactionResponse,
                        provider
                    );
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="App">
            <div className="container">
                {isConnected ? (
                    <div className="connected">
                        <div className="connected-items">Connected</div>
                        <button
                            className="connected-items"
                            onClick={disconnect}
                        >
                            Disconnect
                        </button>
                        <div className="connected-items">
                            <form className="fund-container" onSubmit={fund}>
                                <input
                                    className="fund-container-items"
                                    name="amount"
                                    placeholder="Input fund amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    type="number"
                                    required
                                />
                                <button
                                    className="fund-container-items"
                                    type="submit"
                                >
                                    Fund
                                </button>
                            </form>
                        </div>
                        <button
                            className="connected-items"
                            onClick={getBalance}
                        >
                            Get Balance
                        </button>
                        <button className="connected-items" onClick={withdraw}>
                            Withdraw Balance
                        </button>
                    </div>
                ) : (
                    <button onClick={connect}>Connect</button>
                )}
            </div>
        </div>
    );
}

export default App;
