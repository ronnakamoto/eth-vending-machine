import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { fabric } from "fabric";
import { useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';

import NavBar from '@/components/Navbar';
import Summary from '@/components/Summary';
import { CokeVendingMachineABI } from "@/abi/cokeVendingMachine";
import { parseEther } from 'ethers/lib/utils';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function Home() {
  const { editor, onReady } = useFabricJSEditor()
  const dispenser = useRef();
  const canvas = useMemo(() => editor?.canvas, [editor?.canvas]);
  const [currentAccount, setCurrentAccount] = useState({
    account: null,
    provider: null,
    transactions: [],
  });

  const pressedAnimation = (ele) => {
        // Using the animate method and passing scaleX property
        ele.animate("scaleX", "0.8", {
          onChange: canvas.renderAll.bind(canvas),
          easing: fabric.util.ease.easeInCubic,
          duration: 200,
          onComplete: () =>  {
            ele.scaleX = 1;
            canvas.renderAll();
          }
      });
      ele.animate("scaleY", "0.8", {
          onChange: canvas.renderAll.bind(canvas),
          easing: fabric.util.ease.easeInCubic,
          duration: 200,
          onComplete: () =>  {
            ele.scaleY = 1;
            canvas.renderAll();
          }
      });
  }

  const runSlideDownAnimation = (ele) => {
    ele.animate("top", ele.top + 5, {
      onChange: canvas.renderAll.bind(canvas),
      easing: fabric.util.ease.easeInCubic,
      duration: 600,
      onComplete: () => {
        canvas.renderAll();
      }
    });
  }

  const dispenseCoke = (cb) => {
    // canvas.setActiveObject(dispenser.current);
    const coords = dispenser.current.getCenterPoint();
    fabric.loadSVGFromURL('/coke.svg', (objects, opts) => {
      const coke = fabric.util.groupSVGElements(objects, opts);
      coke.hasControls = false;
      coke.hoverCursor = 'pointer';
      canvas.add(coke);
      coke.setPositionByOrigin(coords, 'center', 'center');
      runSlideDownAnimation(coke);
      cb(coke);
    });
  }

  const contractHandler = () => {
    if (!currentAccount.provider) {
      return;
    }
    const {provider} = currentAccount;
    const signer = provider?.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CokeVendingMachineABI, signer)
  }

  const onAddCoke = (contract) => {
    return contract.addCoke(1);
  }

  const onHandleOpClick = (ele) => {
    // get hold of contract
    const contract = contractHandler();

    if (!contract) {
      return;
    }
    // run animation
    pressedAnimation(ele);
    
    let txHandler;
    if (ele.id == 'purchase') {
      txHandler = onPurchase(contract, ele);
    } else if (ele.id == 'addCoke') {
      txHandler = onAddCoke(contract, ele);
    }

    txHandler.then(tx => {
      tx.wait().then(receipt =>{ 
        console.log('receipt: ', receipt);
        setCurrentAccount((prevState) => ({ ...prevState, transactions: [ ...prevState.transactions, {
          to: receipt.to,
          txHash: receipt.transactionHash,
        }]}));
        if (receipt?.status == 1) {

          if (ele.id == 'purchase') {
            dispenseCoke((coke) => {
              setTimeout(() => {
                canvas.remove(coke);
              }, 5000);
            });
            return;
          }
        }
      }).catch(e => console.log(e));
    });
  }

  const onPurchase = (contract) => {
    return contract.purchase(1, { value: parseEther("0.01")})
  }

  const isCanvasEmpty = () => {
    return !canvas.getContext('2d')
    .getImageData(0, 0, canvas.width, canvas.height).data
    .some(channel => channel !== 0);
  }

  useEffect(() => {
    if (canvas && isCanvasEmpty()) {
      fabric.loadSVGFromURL('/vending-machine.svg', (objects, options) => {
        objects.forEach((obj) => {
          obj.lockMovementX = true;
          obj.lockMovementY = true;
          obj.hasControls = false;
          obj.selectable = false;
          if (['purchase', 'addCoke'].includes(obj?.id)) {
            obj.hoverCursor = 'pointer';
          }
          if (obj?.id == 'dispenser') {
            console.log("dispenser matched...")
            dispenser.current = obj;
          }
          canvas.add(obj);
        });
        canvas.renderAll(); 
      });
    }
    canvas?.on("mouse:down", function(evt) {
      onHandleOpClick(evt.target);
    });
    
  }, [canvas, dispenser.current]);
  return (
    <>
    <div className="container h-screen w-screen">
      <NavBar onCurrentAccountSet={({account, provider}) => {
        setCurrentAccount({account, provider, transactions: [], });
      }} />
      <div className='flex flex-auto p-4 mx-auto justify-between'>
        <FabricJSCanvas className='min-h-screen w-1/2' onReady={onReady} />
        <Summary 
          currentAccount={currentAccount.account} 
          contractAddress={CONTRACT_ADDRESS} 
          transactions={currentAccount.transactions}
        />
      </div>
    </div>
    </>
  )
}
