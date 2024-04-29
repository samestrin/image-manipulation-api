function loadDemo(endpointName) {
  // 1. Clear any existing content in the 'content' area
  const contentArea = document.getElementById("content");
  contentArea.innerHTML = "";

  // 2. Call the form creation function
  createDemoForm(endpointName);
}

function populateMenu() {
  const menuList = document.querySelector("#sidebar ul");

  // You'll likely have an array of endpoint names. Example:
  const endpoints = ["resize", "crop", "rotate", "grayscale", "filter"];

  endpoints.forEach((endpoint) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#"; // Prevents default navigation
    link.textContent = endpoint; // Display the endpoint name

    // Event listener for the menu item
    link.addEventListener("click", (event) => {
      event.preventDefault();
      loadDemo(endpoint);
    });

    listItem.appendChild(link);
    menuList.appendChild(listItem);
  });
}

function handleFileUpload() {
  const imageUpload = document.getElementById("imageUpload");
  const file = imageUpload.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // Create the preview image element
      const previewImg = document.createElement("img");
      previewImg.src = e.target.result;
      previewImg.alt = "Preview";

      // Get the preview container and clear any existing image
      const previewContainer = document.getElementById("preview");
      previewContainer.innerHTML = ""; // Clear existing content

      // Add the new preview image
      previewContainer.appendChild(previewImg);
    };
    reader.readAsDataURL(file);
  }
}

async function processImage(endpoint, formData) {
  // Show the progress bar
  document.querySelector(".progress").style.display = "block";

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      body: formData,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        document.getElementById("progressBar").style.width =
          percentCompleted + "%";
        document.getElementById("progressBar").innerText =
          percentCompleted + "%"; // Optional: Displays percentage text
      },
    });

    if (!response.ok) {
      throw new Error("Image processing failed. Please try again.");
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    // Create image element for the results
    const resultImg = document.createElement("img");
    resultImg.src = imageUrl;

    // Get the results container and clear existing images
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    // Append the result image
    resultsContainer.appendChild(resultImg);
  } catch (error) {
    console.error("Error:", error);
    alert("Image processing failed. Please try again.");
  } finally {
    // Hide the progress bar
    document.querySelector(".progress").style.display = "none";
  }
}

function createDemoForm(endpoint) {
  // Clear any existing content in the demo area
  const contentArea = document.getElementById("content");
  contentArea.innerHTML = "";

  // Create the form element
  const demoForm = document.createElement("form");
  demoForm.id = `demoForm_${endpoint}`;

  // Add necessary input fields based on the endpoint's parameters.
  // Example for a 'resize' endpoint:
  if (endpoint === "resize") {
    const widthInput = createInput("number", "width", "Width");
    const heightInput = createInput("number", "height", "Height");
    demoForm.appendChild(widthInput);
    demoForm.appendChild(heightInput);
  } // ... (Add input fields for other endpoints)

  // Create a submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Process Image";
  demoForm.appendChild(submitButton);

  // Add event listener to the form submission
  demoForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(demoForm);
    processImage(endpoint, formData);
  });

  // Append the form to the content area
  contentArea.appendChild(demoForm);
}

// Helper function to create input elements
function createInput(type, name, labelText) {
  const label = document.createElement("label");
  label.htmlFor = name; // Ensure the label links to the input
  label.textContent = labelText;

  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.id = name;
  input.required = true; // Assuming we want input fields to be required

  // Optional: Add a container for styling
  const inputContainer = document.createElement("div");
  inputContainer.classList.add("form-group"); // Adds a Bootstrap class
  inputContainer.appendChild(label);
  inputContainer.appendChild(input);

  return inputContainer;
}
