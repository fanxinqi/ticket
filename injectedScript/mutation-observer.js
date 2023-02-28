const config = {
  attributes: true,
};

const searchButton = document.querySelector("#query_ticket");
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    console.log(mutation);
    if (mutation.type === "childList") {
      console.log("A child node has been added or removed.");
    } else if (
      mutation.type === "attributes" &&
      mutation.attributeName === "class"
    ) {
      retrySearchButton();
    }
  }
};

const retrySearchButton = () => {
  const searchButton = document.querySelector("#query_ticket");
  if (
    searchButton.attributes["class"] &&
    !searchButton.attributes["class"].nodeValue.includes("btn-disabled")
  ) {
    window.emit("clickButton", reserveButton);
    if (!document.querySelector(reserveButton)) {
      setTimeout(() => {
        searchButton.click();
      }, 16);
    }
  }
};
const searchButtonObserver = new MutationObserver(callback);

searchButtonObserver.observe(searchButton, config);
