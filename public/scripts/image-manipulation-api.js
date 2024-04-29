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
