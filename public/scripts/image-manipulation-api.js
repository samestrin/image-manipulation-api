const BASE_URL = process.env.REACT_APP_API_URL;

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
  const endpoints = [
    "resize",
    "crop",
    "rotate",
    "grayscale",
    "brightness",
    "contrast",
    "flip",
    "filter",
    "convert",
    "list_fonts",
    "add_text",
  ];

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

function processImage(endpoint, formData) {
  document.querySelector(".progress").style.display = "block";
  const progressBar = document.getElementById("progressBar");

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${BASE_URL}/${endpoint}`);

  xhr.upload.onprogress = function (event) {
    if (event.lengthComputable) {
      const percentCompleted = Math.round((event.loaded * 100) / event.total);
      progressBar.style.width = percentCompleted + "%";
      progressBar.innerText = percentCompleted + "%";
    }
  };

  xhr.onload = function () {
    if (xhr.status === 200) {
      const imageUrl = URL.createObjectURL(xhr.response);
      const resultImg = document.createElement("img");
      resultImg.src = imageUrl;
      const resultsContainer = document.getElementById("results");
      resultsContainer.innerHTML = "";
      resultsContainer.appendChild(resultImg);
    } else {
      console.error("Error:", xhr.statusText);
      alert("Image processing failed. Please try again.");
    }
    document.querySelector(".progress").style.display = "none";
  };

  xhr.onerror = function () {
    console.error("Error:", xhr.statusText);
    alert("Image processing failed. Please try again.");
    document.querySelector(".progress").style.display = "none";
  };

  xhr.responseType = "blob";
  xhr.send(formData);
}

function createDemoForm(endpoint) {
  const contentArea = document.getElementById("content");
  contentArea.innerHTML = ""; // Clear existing content

  const demoForm = document.createElement("form");
  demoForm.id = `demoForm_${endpoint}`;
  demoForm.enctype = "multipart/form-data"; // Important for file uploads

  // Create a common image file input for endpoints that require an image file
  if (
    [
      "crop",
      "rotate",
      "grayscale",
      "brightness",
      "contrast",
      "flip",
      "filter",
      "convert",
      "add_text",
    ].includes(endpoint)
  ) {
    const imageInput = createInput("file", "image", "Image File");
    imageInput.children[1].accept = "image/*"; // Only accept image files
    demoForm.appendChild(imageInput);
  }

  // Add specific input fields based on the endpoint
  switch (endpoint) {
    case "crop":
      demoForm.appendChild(createInput("number", "x1", "X1 Coordinate"));
      demoForm.appendChild(createInput("number", "y1", "Y1 Coordinate"));
      demoForm.appendChild(createInput("number", "x2", "X2 Coordinate"));
      demoForm.appendChild(createInput("number", "y2", "Y2 Coordinate"));
      break;
    case "rotate":
      demoForm.appendChild(
        createInput("number", "angle", "Rotation Angle (degrees)")
      );
      break;
    case "brightness":
      demoForm.appendChild(
        createInput("number", "factor", "Brightness Factor")
      );
      break;
    case "contrast":
      demoForm.appendChild(createInput("number", "factor", "Contrast Factor"));
      break;
    case "flip":
      const axisSelect = document.createElement("select");
      axisSelect.name = "axis";
      axisSelect.id = "axis";
      ["horizontal", "vertical"].forEach((axis) => {
        const option = document.createElement("option");
        option.value = axis;
        option.textContent = axis.charAt(0).toUpperCase() + axis.slice(1);
        axisSelect.appendChild(option);
      });
      const axisContainer = document.createElement("div");
      axisContainer.appendChild(
        (document.createElement("label").textContent = "Flip Axis")
      );
      axisContainer.children[0].htmlFor = "axis";
      axisContainer.appendChild(axisSelect);
      demoForm.appendChild(axisContainer);
      break;
    case "filter":
      const filterTypeSelect = document.createElement("select");
      filterTypeSelect.name = "filter_type";
      filterTypeSelect.id = "filter_type";
      ["blur", "sharpen", "edge_detect"].forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        filterTypeSelect.appendChild(option);
      });
      const filterTypeContainer = document.createElement("div");
      filterTypeContainer.appendChild(
        (document.createElement("label").textContent = "Filter Type")
      );
      filterTypeContainer.children[0].htmlFor = "filter_type";
      filterTypeContainer.appendChild(filterTypeSelect);
      demoForm.appendChild(filterTypeContainer);
      break;
    case "convert":
      demoForm.appendChild(
        createInput("text", "output_format", "Output Format (e.g., png, jpeg)")
      );
      break;
    case "add_text":
      demoForm.appendChild(createInput("text", "text", "Text to Add"));
      demoForm.appendChild(createInput("number", "font", "Font (ID)"));
      demoForm.appendChild(createInput("number", "font_size", "Font Size"));
      demoForm.appendChild(createInput("number", "left", "Left Position"));
      demoForm.appendChild(createInput("number", "top", "Top Position"));
      demoForm.appendChild(
        createInput("text", "color", "Color (e.g., 255,255,255)")
      );
      break;
    case "list_fonts":
      // No additional fields required for listing fonts
      break;
  }

  // Add submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Process Image";
  demoForm.appendChild(submitButton);

  // Handle form submission
  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(demoForm);
    processImage(endpoint, formData);
  });

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
