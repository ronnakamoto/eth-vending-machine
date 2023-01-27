import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CokeVendingMachineABI } from "@/abi/cokeVendingMachine";

export default function Summary({ contractAddress, currentAccount, transactions }) {
    const [remainingCoke, setRemainingCoke] = useState('0');
    useEffect(() => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const cokeVendingMachine = new ethers.Contract(contractAddress, CokeVendingMachineABI, provider);
            cokeVendingMachine.remainingCoke().then((result) => {
                console.log(result);
                setRemainingCoke(result.toString(10));
            });
        }
    }, [currentAccount, transactions?.length]);

    const transactionList = transactions?.map((tx, i) => (
        <div className="card w-96 bg-base-100 card-bordered card-compact my-2" key={tx?.txHash}>
        <div className="card-body">
            <h2 className="card-title">Transaction {i+1}</h2>
            <p className="break-all">To: {tx?.to}</p>
            <p className="break-all">Tx Hash: {tx?.txHash}</p>
        </div>
        </div>
    ));

  return (
    <div className="flex flex-col width-full">
        <div className="stats shadow h-fit">
            <div className="stat">
                <div className="stat-figure">
                </div>
                <div className="stat-title">Available Coke</div>
                <div className="stat-value">{remainingCoke}</div>
            </div>

            <div className="stat">
                <div className="stat-figure">
                </div>
                <div className="stat-title">Purchased</div>
                <div className="stat-value">0</div>
            </div>
        </div>
        <div className="divider">Transactions</div>
        {transactions.length ? transactionList : null}
    </div>
  );
}
