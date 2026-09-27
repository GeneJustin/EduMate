const input = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");

async function sendMessage() {

    const message = input.value.trim();

    if (!message) {
        return;
    }

    addMessage(message, "user");

    input.value = "";

    addMessage("Thinking...", "ai", "loading");

    try {

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        const loading = document.querySelector(".loading");

        if (loading) {
            loading.remove();
        }

        addMessage(data.response, "ai");

    } catch (error) {

        const loading = document.querySelector(".loading");

        if (loading) {
            loading.remove();
        }

        addMessage(
            "Something went wrong.",
            "ai"
        );
    }
}


function addMessage(message, type, className = "") {

    const div = document.createElement("div");

    div.className =
        `message ${type} ${className}`;

    div.textContent = message;

    chatBox.appendChild(div);

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


input.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            sendMessage();
        }

    }
);