function handleFeedback(type) {
    if (type === "good") {
      alert("Thanks for the feedback! 😊");
    } else {
      alert("We'll try to do better next time. 🙁");
    }
  }

  function toggleTerms(event) {
    event.preventDefault();
    const moreText = document.getElementById("moreText");
    const toggleLink = document.getElementById("toggleLink");

    if (moreText.style.display === "none") {
      moreText.style.display = "inline";
      toggleLink.textContent = "Hide Terms & Conditions";
    } else {
      moreText.style.display = "none";
      toggleLink.textContent = "Show Terms & Conditions";
    }
  }
