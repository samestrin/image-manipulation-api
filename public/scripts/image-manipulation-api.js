const BASE_URL = "https://seahorse-app-lacq9.ondigitalocean.app/";

/**
 * Loads the demo form for a specified API endpoint.
 *
 * @param {string} endpointName - The name of the API endpoint to load the demo for.
 *
 * @example
 * // Load demo form for the "resize" endpoint
 * loadDemo('resize');
 */
function loadDemo(endpointName) {
  const form = $("#imageForm");
  form.show();
  // Decide the method based on the endpoint
  const method = endpointName === "list_fonts" ? "GET" : "POST";
  form.attr("method", method);
  form.attr("action", `${BASE_URL}/api/${endpointName}`);

  // Clear any previous inputs and dynamically add as needed
  form.empty();

  // Dynamically add necessary inputs for the endpoint, except for list_fonts
  if (!["list_fonts"].includes(endpointName)) {
    const imageInput = createInput("file", "image", "Image File");
    imageInput.find("input").attr("accept", "image/*");
    form.append(imageInput);
  }

  // Add additional specific inputs based on endpoint requirements
  addEndpointSpecificInputs(endpointName, form);
}

/**
 * Populates the sidebar menu with clickable items for each API endpoint.
 *
 * @example
 * // Populate the sidebar menu with endpoint options
 * populateMenu();
 */
function populateMenu() {
  const menuList = $("#sidebar ul");

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
    const listItem = $("<li></li>");
    const link = $("<a></a>").attr("href", "#").text(endpoint);

    link.on("click", (event) => {
      event.preventDefault();
      loadDemo(endpoint);
    });

    listItem.append(link);
    menuList.append(listItem);
  });
}

/**
 * Handles the file upload process, reads the uploaded file to display an image preview, and handles errors.
 * This function ensures graceful error handling if the FileReader encounters an issue.
 *
 * @throws {Error} Describes the FileReader error if file reading fails.
 *
 * @example
 * // Triggered when a file is selected for upload
 * handleFileUpload();
 */
function handleFileUpload() {
  const previewContainer = $("#preview");
  if (previewContainer.length) {
    previewContainer.empty();
    previewContainer.append(previewImg);
  } else {
    console.error("Preview container not found!");
  }

  const imageUpload = $("#imageUpload")[0];
  const file = imageUpload.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const previewImg = $("<img>").attr({
        src: e.target.result,
        alt: "Preview",
      });

      const previewContainer = $("#preview");
      previewContainer.empty();
      previewContainer.append(previewImg);
    };

    reader.onerror = function () {
      alert("Failed to read file!");
      console.error("There was an error reading the file:", reader.error);
    };

    reader.readAsDataURL(file);
  }
}

/**
 * Processes the uploaded image by sending it to the server via AJAX. Updates the UI with a progress bar,
 * displays the processed image, or shows a detailed error message if processing fails.
 *
 * @param {string} endpoint - The API endpoint to which the image data is posted.
 * @param {FormData} formData - The form data that includes the image and processing parameters.
 * @throws {Error} Displays a detailed error message in the UI if the image processing fails.
 *
 * @example
 * // Process image with the "crop" endpoint
 * const formData = new FormData(document.getElementById('demoForm_crop'));
 * processImage('crop', formData);
 */
function processImage(endpoint, formData) {
  $(".progress").show();
  const progressBar = $("#progressBar");

  $.ajax({
    url: `${BASE_URL}/api/${endpoint}`,
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    xhr: function () {
      var xhr = new window.XMLHttpRequest();
      xhr.upload.addEventListener(
        "progress",
        function (evt) {
          if (evt.lengthComputable) {
            var percentComplete = Math.round((evt.loaded / evt.total) * 100);
            progressBar
              .width(percentComplete + "%")
              .text(percentComplete + "%");
          }
        },
        false
      );
      return xhr;
    },
    success: function (data) {
      const imageUrl = URL.createObjectURL(data);
      const resultImg = $("<img>").attr("src", imageUrl);
      const resultsContainer = $("#results");
      resultsContainer.empty();
      resultsContainer.append(resultImg);
    },
    complete: function () {
      progressBar.width("100%").text("100%");
      $(".progress").hide();
    },
    error: function (xhr) {
      console.error("Error:", xhr.statusText);
      $("#results").html(
        `<p style="color: red;">Image processing failed: ${xhr.statusText}. Please try again.</p>`
      );
    },
  });
}

function addEndpointSpecificInputs(endpoint, form) {
  if (
    [
      "resize",
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
    imageInput.find("input").attr("accept", "image/*");
    form.append(imageInput);
  }

  switch (endpoint) {
    case "resize":
      form.append(createInput("number", "width", "Width"));
      form.append(createInput("number", "height", "Height"));
      break;
    case "crop":
      form.append(createInput("number", "x1", "X1 Coordinate"));
      form.append(createInput("number", "y1", "Y1 Coordinate"));
      form.append(createInput("number", "x2", "X2 Coordinate"));
      form.append(createInput("number", "y2", "Y2 Coordinate"));
      break;
    case "rotate":
      form.append(createInput("number", "angle", "Rotation Angle (degrees)"));
      break;
    case "brightness":
      form.append(createInput("number", "factor", "Brightness Factor"));
      break;
    case "contrast":
      form.append(createInput("number", "factor", "Contrast Factor"));
      break;
    case "flip":
      const axisSelect = $("<select>").attr({ name: "axis", id: "axis" });
      ["horizontal", "vertical"].forEach((axis) => {
        axisSelect.append(
          $("<option>")
            .val(axis)
            .text(axis.charAt(0).toUpperCase() + axis.slice(1))
        );
      });
      const axisContainer = $("<div>")
        .addClass("form-group")
        .append($("<label>").attr("for", "axis").text("Flip Axis"), axisSelect);
      form.append(axisContainer);
      break;
    case "filter":
      const filterTypeSelect = $("<select>").attr({
        name: "filter_type",
        id: "filter_type",
      });
      ["blur", "sharpen", "edge_detect"].forEach((type) => {
        filterTypeSelect.append(
          $("<option>")
            .val(type)
            .text(type.charAt(0).toUpperCase() + type.slice(1))
        );
      });
      const filterTypeContainer = $("<div>")
        .addClass("form-group")
        .append(
          $("<label>").attr("for", "filter_type").text("Filter Type"),
          filterTypeSelect
        );
      form.append(filterTypeContainer);
      break;
    case "convert":
      form.append(
        createInput("text", "output_format", "Output Format (e.g., png, jpeg)")
      );
      break;
    case "add_text":
      form.append(createInput("text", "text", "Text to Add"));
      form.append(createInput("number", "font", "Font (ID)"));
      form.append(createInput("number", "font_size", "Font Size"));
      form.append(createInput("number", "left", "Left Position"));
      form.append(createInput("number", "top", "Top Position"));
      form.append(createInput("text", "color", "Color (e.g., 255,255,255)"));
      break;
    case "list_fonts":
      // No specific inputs needed, just the action to list fonts.
      break;
  }
}

function createInput(type, name, labelText) {
  const label = $("<label>").attr("for", name).text(labelText);
  const input = $("<input>").attr({
    type: type,
    name: name,
    id: name,
    required: true,
  });
  const inputContainer = $("<div>").addClass("form-group").append(label, input);
  return inputContainer;
}

$(document).on("submit", "form", function (event) {
  event.preventDefault();
  const formData = new FormData(this); // 'this' refers to the form that was submitted
  const endpoint = this.id.replace("demoForm_", ""); // Extract endpoint from form id
  processImage(endpoint, formData);
});

$(document).ready(function () {
  populateMenu();
});
