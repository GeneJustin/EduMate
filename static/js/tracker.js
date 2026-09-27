let sessionId = null;
let startTime = null;
let timerInterval = null;


function formatTime(seconds) {

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const secs =
        seconds % 60;

    return [
        hours,
        minutes,
        secs
    ]
    .map(
        value =>
            String(value).padStart(2, "0")
    )
    .join(":");
}


function updateTimer() {

    const now = Date.now();

    const elapsed =
        Math.floor(
            (now - startTime) / 1000
        );

    document.getElementById(
        "timer"
    ).textContent =
        formatTime(elapsed);
}


async function startStudy() {

    const response =
        await fetch(
            "/api/study/start",
            {
                method: "POST"
            }
        );

    const data =
        await response.json();

    sessionId =
        data.session_id;

    startTime =
        new Date(
            data.start_time
        ).getTime();

    timerInterval =
        setInterval(
            updateTimer,
            1000
        );

    document.getElementById(
        "startButton"
    ).disabled = true;

    document.getElementById(
        "stopButton"
    ).disabled = false;
}


async function stopStudy() {

    clearInterval(
        timerInterval
    );

    const response =
        await fetch(
            "/api/study/stop",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    session_id:
                        sessionId
                })
            }
        );

    await response.json();

    sessionId = null;

    document.getElementById(
        "startButton"
    ).disabled = false;

    document.getElementById(
        "stopButton"
    ).disabled = true;

    loadStats();
}


async function loadStats() {

    const response =
        await fetch(
            "/api/study/stats"
        );

    const data =
        await response.json();

    const hours =
        (
            data.total_seconds / 3600
        ).toFixed(2);

    document.getElementById(
        "totalTime"
    ).textContent =
        `${hours} hours`;

    document.getElementById(
        "sessions"
    ).textContent =
        data.sessions;
}


loadStats();