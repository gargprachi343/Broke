function copyCode() {
    const codeInput = document.getElementById("promoCode");
    codeInput.select();
    codeInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(codeInput.value);
    alert("Code copied to clipboard!");
  }

  function rateOffer(type) {
    if (type === "up") {
      alert("Thanks for the thumbs up! 👍");
    } else {
      alert("Sorry this didn’t work for you. 👎");
    }
  }

  function getNewCode() {
    const codeInput = document.getElementById("promoCode");
    // Simulate new code generation
    const newCode = "NEWC-OD34-GENE-RATE";
    codeInput.value = newCode;
    alert("New code generated!");
  }
