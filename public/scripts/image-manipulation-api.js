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
  const contentArea = $("#content");
  contentArea.empty();

  createDemoForm(endpointName);
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

/**
 * Creates and appends a demo form for image processing based on the selected endpoint.
 *
 * @param {string} endpoint - The endpoint for which the form is being created.
 *
 * @example
 * // Create a demo form for the "contrast" endpoint
 * createDemoForm('contrast');
 */
function createDemoForm(endpoint) {
  const contentArea = $("#content");
  contentArea.empty();
  contentArea.show();

  const demoForm = $("<form>").attr({
    id: `demoForm_${endpoint}`,
    enctype: "multipart/form-data",
  });

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
    demoForm.append(imageInput);
  }

  switch (endpoint) {
    case "resize":
      demoForm.append(createInput("number", "width", "Width"));
      demoForm.append(createInput("number", "height", "Height"));
      break;
    case "crop":
      demoForm.append(createInput("number", "x1", "X1 Coordinate"));
      demoForm.append(createInput("number", "y1", "Y1 Coordinate"));
      demoForm.append(createInput("number", "x2", "X2 Coordinate"));
      demoForm.append(createInput("number", "y2", "Y2 Coordinate"));
      break;
    case "rotate":
      demoForm.append(
        createInput("number", "angle", "Rotation Angle (degrees)")
      );
      break;
    case "brightness":
      demoForm.append(createInput("number", "factor", "Brightness Factor"));
      break;
    case "contrast":
      demoForm.append(createInput("number", "factor", "Contrast Factor"));
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
      const axisContainer = $("<div>").append(
        $("<label>").attr("for", "axis").text("Flip Axis"),
        axisSelect
      );
      demoForm.append(axisContainer);
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
      const filterTypeContainer = $("<div>").append(
        $("<label>").attr("for", "filter_type").text("Filter Type"),
        filterTypeSelect
      );
      demoForm.append(filterTypeContainer);
      break;
    case "convert":
      demoForm.append(
        createInput("text", "output_format", "Output Format (e.g., png, jpeg)")
      );
      break;
    case "add_text":
      demoForm.append(createInput("text", "text", "Text to Add"));
      demoForm.append(createInput("number", "font", "Font (ID)"));
      demoForm.append(createInput("number", "font_size", "Font Size"));
      demoForm.append(createInput("number", "left", "Left Position"));
      demoForm.append(createInput("number", "top", "Top Position"));
      demoForm.append(
        createInput("text", "color", "Color (e.g., 255,255,255)")
      );
      break;
    case "list_fonts":
      // No specific inputs needed, just the action to list fonts.
      break;
  }

  const submitButton = $("<button>")
    .attr("type", "submit")
    .text("Process Image");
  demoForm.append(submitButton);

  demoForm.on("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(demoForm[0]);
    processImage(endpoint, formData);
  });

  contentArea.append(demoForm);
}

/**
 * Creates a labeled input field and returns the constructed element.
 *
 * @param {string} type - The type of the input element (e.g., 'text', 'number').
 * @param {string} name - The name attribute for the input element.
 * @param {string} labelText - The text to be used for the label of the input.
 * @returns {jQuery} The jQuery object containing the constructed input and label.
 *
 * @example
 * // Create a number input for an angle with label "Rotation Angle (degrees)"
 * createInput('number', 'angle', 'Rotation Angle (degrees)');
 */
function createInput(type, name, labelText) {
  const label = $("<label>").attr("for", name).text(labelText);
  const input = $("<input>").attr({
    type: type,
    name: name,
    id: name,
    required: true,
  });

  const inputContainer = $("<div>").addClass("form-group");
  inputContainer.append(label).append(input);
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
