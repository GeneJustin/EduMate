async function uploadMaterial() {
    const input = document.getElementById("fileInput");
    const status = document.getElementById("uploadStatus");

    if (!input.files.length) {
        status.textContent = "Please select a file.";
        return;
    }

    const formData = new FormData();
    formData.append("file", input.files[0]);

    status.textContent = "Uploading and summarizing...";

    try {
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            status.textContent =
                "Error: " + (data.error || "Upload failed");

            console.error(data);
            return;
        }

        status.textContent = "Upload successful!";

        setTimeout(() => {
            location.reload();
        }, 1000);

    } catch (error) {

        console.error(error);

        status.textContent =
            "Upload failed: " + error.message;
    }
}


async function viewSummary(materialId) {

    const container =
        document.getElementById(
            `summary-${materialId}`
        );

    const button =
        container.previousElementSibling;

    if (container.style.display === "block") {

        container.style.display = "none";

        button.textContent = "View Summary";

        return;
    }

    container.style.display = "block";

    button.textContent = "Loading Summary...";

    container.innerHTML = `
        <div class="loading">
            Generating summary view...
        </div>
    `;

    try {

        const response =
            await fetch(
                `/api/materials/${materialId}`
            );

        const data =
            await response.json();

        if (!response.ok) {

            container.innerHTML = `
                <div class="error-message">
                    ${data.error || "Failed to load summary."}
                </div>
            `;

            button.textContent = "View Summary";

            return;
        }

        renderSummary(
            container,
            data.summary
        );

        button.textContent = "Hide Summary";

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="error-message">
                Failed to load summary.
            </div>
        `;

        button.textContent = "View Summary";
    }
}


function renderSummary(container, summary) {

    let html = "";


    if (summary.overview) {

        html += `
            <div class="summary-section overview-section">

                <h4>Overview</h4>

                <p>
                    ${escapeHTML(summary.overview)}
                </p>

            </div>
        `;
    }


    if (
        summary.key_points &&
        summary.key_points.length > 0
    ) {

        html += `
            <div class="summary-section">

                <h4>Key Points</h4>

                <ul class="summary-list">

                    ${summary.key_points
                        .map(point => `
                            <li>
                                ${escapeHTML(point)}
                            </li>
                        `)
                        .join("")}

                </ul>

            </div>
        `;
    }


    if (
        summary.important_concepts &&
        summary.important_concepts.length > 0
    ) {

        html += `
            <div class="summary-section">

                <h4>Important Concepts</h4>

                <div class="concept-list">

                    ${summary.important_concepts
                        .map(item => `
                            <div class="concept-card">

                                <h5>
                                    ${escapeHTML(item.concept)}
                                </h5>

                                <p>
                                    ${escapeHTML(item.explanation)}
                                </p>

                            </div>
                        `)
                        .join("")}

                </div>

            </div>
        `;
    }


    if (
        summary.formulas &&
        summary.formulas.length > 0
    ) {

        html += `
            <div class="summary-section">

                <h4>Formulas</h4>

                <div class="formula-list">

                    ${summary.formulas
                        .map(formula => `
                            <div class="formula-card">
                                ${escapeHTML(formula)}
                            </div>
                        `)
                        .join("")}

                </div>

            </div>
        `;
    }


    if (
        summary.exam_focus &&
        summary.exam_focus.length > 0
    ) {

        html += `
            <div class="summary-section exam-section">

                <h4>Exam Focus</h4>

                <ul class="summary-list">

                    ${summary.exam_focus
                        .map(item => `
                            <li>
                                ${escapeHTML(item)}
                            </li>
                        `)
                        .join("")}

                </ul>

            </div>
        `;
    }


    container.innerHTML = html;
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text ?? "";

    return div.innerHTML;
}