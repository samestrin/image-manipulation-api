const BASE_URL = "";

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
  form.empty(); // Clear existing contents
  form.show();
  $("#content").hide();

  // Set the form attributes based on the endpoint
  const method = endpointName === "list_fonts" ? "GET" : "POST";
  form.attr("method", method);
  form.attr("action", `${BASE_URL}/${endpointName}`);
  form.attr("endpoint", endpointName);

  // Wrap the form inside a Bootstrap card
  const card = $("<div>").addClass("card");
  const cardBody = $("<div>").addClass("card-body");
  const cardText = $("<div>").addClass("card-text");

  // Append elements to card text
  addEndpointSpecificInputs(endpointName, cardText); // Add specific inputs inside the card text
  const submitButton = $("<button>")
    .attr("type", "submit")
    .addClass("btn btn-primary")
    .text("Submit");
  cardText.append(submitButton); // Append submit button inside card text

  card.append(cardText);

  // Replace the form's usual direct appending with appending to the cardText
  form.append(card);

  // Make sure to replace the old form location with this new structure
  // Assuming the form is directly inside a specific container, e.g., a div with id="formContainer"
  $("#formContainer").html(form); // This will place the entire card inside a specific container
}

/**
 * Populates the sidebar menu with clickable items for each API endpoint.
 *
 * @example
 * // Populate the sidebar menu with endpoint options
 * populateMenu();
 */
function populateMenu() {
  const menuList = $("#nav-menu");
  menuList.empty(); // Ensure the menu is empty before adding new items
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
  endpoints.forEach((endpoint, index) => {
    const link = $("<a></a>")
      .addClass("list-group-item list-group-item-action")
      .attr("href", "#")
      .text(endpoint)
      .on("click", function (event) {
        event.preventDefault();
        $(".list-group-item-action").removeClass("active"); // Remove active from all links
        $(this).addClass("active"); // Set active on the clicked link
        loadDemo(endpoint);
      });
    menuList.append(link);
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
  const imageUpload = $("#imageUpload")[0]; // Assumes there's an input element with id="imageUpload"
  const file = imageUpload.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // Set the src of the #originalImage img element to the result of the FileReader
      $("#originalImage").attr({
        src: e.target.result,
        alt: "Original Image Preview",
      });
    };

    reader.onerror = function () {
      alert("Failed to read file!");
      console.error("There was an error reading the file:", reader.error);
    };

    reader.readAsDataURL(file); // This reads the file as a data URL encoding the file's data as base64
  } else {
    console.error("No file selected!");
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
  console.log("Processing image for endpoint:", endpoint);
  $("#message").hide();
  $("#message").empty();

  $(".progress").show();
  const progressBar = $("#progressBar");

  $.ajax({
    url: `${BASE_URL}/${endpoint}`,
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    xhr: function () {
      var xhr = new window.XMLHttpRequest();
      xhr.responseType = "blob";
      progressBar.width("0%").text("0%");
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
    success: function (data, textStatus, jqXHR) {
      var contentType = jqXHR.getResponseHeader("Content-Type");

      const blob = new Blob([data], { type: contentType }); // Use the MIME type from the response
      const imageUrl = URL.createObjectURL(blob);

      console.log("Content-Type:", contentType);
      console.log("Blob created:", blob);
      console.log("imageUrl created:", imageUrl);

      $("#processedImage").attr({
        src: imageUrl,
        alt: "Updated Image",
      });

      $("#content").show();
    },
    complete: function () {
      progressBar.width("100%").text("100%");
      $(".progress").hide();
    },
    error: function (xhr) {
      console.error("Error:", xhr.statusText);
      $("#message").html(
        `<p style="color: red;">Image processing failed: ${xhr.statusText}. Please try again.</p>`
      );
      $("#message").show();
    },
  });
}

function addEndpointSpecificInputs(endpoint, form) {
  // Dynamically add necessary inputs for the endpoint, except for list_fonts
  if (!["list_fonts"].includes(endpoint)) {
    const imageInput = createInput("file", "image", "Image File");
    imageInput.find("input").attr("accept", "image/*");
    imageInput.find("input").attr("id", "imageUpload");
    imageInput.find("input").on("change", handleFileUpload);

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
      const outputFormatSelect = $("<select>").attr({
        name: "output_format",
        id: "output_format",
      });
      ["png", "jpg", "gif"].forEach((format) => {
        outputFormatSelect.append(
          $("<option>").val(format).text(format.toUpperCase())
        );
      });
      const outputFormatContainer = $("<div>")
        .addClass("form-group")
        .append(
          $("<label>").attr("for", "output_format").text("Output Format"),
          outputFormatSelect
        );
      form.append(outputFormatContainer);
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
  const label = $("<label>")
    .attr("for", name)
    .text(labelText + ": ");
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
  const endpoint = this.getAttribute("endpoint"); // Extract endpoint from this
  processImage(endpoint, formData);
});

$(document).ready(function () {
  populateMenu();
});
