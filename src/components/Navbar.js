import { ethers } from "ethers";
import { useEffect, useState } from "react";

export default function NavBar({ onCurrentAccountSet }) {
    const [currentAccount, setCurrentAccount] = useState();

    // useEffect(() => {
    //     if(!currentAccount || !ethers.utils.isAddress(currentAccount)) {
    //         return;
    //     }
        
    //     if(!window.ethereum) {
    //         return;
    //     }
    // }, [currentAccount]);

    const onConnectWallet = async () => {
        try {
            if (!window.ethereum) {
                console.log("Please Install Metamask");
                return;
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const [account] = await provider.send("eth_requestAccounts", []);
            if (account) {
                console.log('account: ', account);
                setCurrentAccount(account);
                onCurrentAccountSet({account, provider});
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className="navbar bg-base-100">
            <div className="navbar-start">
                <a className="btn btn-ghost normal-case text-xl">Nakamoto Coke</a>
            </div>
            <div className="navbar-end px-2">
                <a className="btn" onClick={onConnectWallet}>{ currentAccount ? `${currentAccount.slice(0,6)}...${currentAccount.slice(-6)}` : 'Connect Wallet'}</a>
            </div>
        </div>
    );
}