let currentQuiz = null;
let userAnswers = {};


async function generateQuiz() {

    const materialId =
        document.getElementById(
            "materialSelect"
        ).value;

    const numQuestions =
        document.getElementById(
            "questionCount"
        ).value;

    const result =
        document.getElementById(
            "quizResult"
        );


    if (!materialId) {

        result.innerHTML = `
            <div class="error-message">
                Please select a material first.
            </div>
        `;

        return;
    }


    result.innerHTML = `
        <div class="quiz-loading">

            <div class="loading-spinner"></div>

            <h3>Generating your quiz...</h3>

            <p>
                EduMate is preparing your questions.
            </p>

        </div>
    `;


    try {

        const response =
            await fetch("/api/quiz", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    material_id: materialId,

                    num_questions:
                        Number(numQuestions)

                })

            });


        const data =
            await response.json();


        if (!response.ok) {

            result.innerHTML = `
                <div class="error-message">
                    ${escapeHTML(
                        data.error ||
                        "Quiz generation failed."
                    )}
                </div>
            `;

            return;
        }


        currentQuiz = data;

        userAnswers = {};

        renderQuiz(data);

    } catch (error) {

        console.error(error);

        result.innerHTML = `
            <div class="error-message">
                Quiz generation failed:
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}


function renderQuiz(quiz) {

    const result =
        document.getElementById(
            "quizResult"
        );


    let html = `

        <div class="quiz-header">

            <div>

                <span class="quiz-label">
                    AI Generated Quiz
                </span>

                <h2>
                    ${escapeHTML(quiz.title)}
                </h2>

            </div>

            <div class="quiz-count">
                ${quiz.questions.length} Questions
            </div>

        </div>


        <div class="questions-container">
    `;


    quiz.questions.forEach(
        (question, index) => {

            html += `

                <div
                    class="question-card"
                    id="question-${index}"
                >

                    <div class="question-number">
                        Question ${index + 1}
                    </div>

                    <h3>
                        ${escapeHTML(
                            question.question
                        )}
                    </h3>


                    <div class="options">

                        ${createOption(
                            index,
                            "A",
                            question.options.A
                        )}

                        ${createOption(
                            index,
                            "B",
                            question.options.B
                        )}

                        ${createOption(
                            index,
                            "C",
                            question.options.C
                        )}

                        ${createOption(
                            index,
                            "D",
                            question.options.D
                        )}

                    </div>


                    <div
                        id="explanation-${index}"
                        class="answer-explanation"
                    >
                    </div>

                </div>
            `;
        }
    );


    html += `

        </div>

        <div class="quiz-submit">

            <button
                onclick="submitQuiz()"
                class="submit-quiz-button"
            >
                Submit Quiz
            </button>

        </div>

        <div id="quizScore"></div>

    `;


    result.innerHTML = html;
}


function createOption(
    questionIndex,
    letter,
    text
) {

    return `

        <button
            class="quiz-option"
            onclick="selectAnswer(
                ${questionIndex},
                '${letter}'
            )"
            id="option-${questionIndex}-${letter}"
        >

            <span class="option-letter">
                ${letter}
            </span>

            <span class="option-text">
                ${escapeHTML(text)}
            </span>

        </button>

    `;
}


function selectAnswer(
    questionIndex,
    answer
) {

    userAnswers[questionIndex] =
        answer;


    const question =
        currentQuiz.questions[
            questionIndex
        ];


    ["A", "B", "C", "D"].forEach(
        letter => {

            const option =
                document.getElementById(
                    `option-${questionIndex}-${letter}`
                );

            option.classList.remove(
                "selected"
            );
        }
    );


    const selected =
        document.getElementById(
            `option-${questionIndex}-${answer}`
        );

    selected.classList.add(
        "selected"
    );
}


function submitQuiz() {

    if (!currentQuiz) {
        return;
    }


    const total =
        currentQuiz.questions.length;


    const answered =
        Object.keys(userAnswers).length;


    if (answered < total) {

        alert(
            `Please answer all questions first. ${total - answered} question(s) remaining.`
        );

        return;
    }


    let score = 0;


    currentQuiz.questions.forEach(
        (question, index) => {

            const userAnswer =
                userAnswers[index];

            const correctAnswer =
                question.answer;


            const questionCard =
                document.getElementById(
                    `question-${index}`
                );


            const explanation =
                document.getElementById(
                    `explanation-${index}`
                );


            questionCard.classList.add(
                "answered"
            );


            if (
                userAnswer ===
                correctAnswer
            ) {

                score++;

                document
                    .getElementById(
                        `option-${index}-${userAnswer}`
                    )
                    .classList.add(
                        "correct"
                    );

            } else {

                document
                    .getElementById(
                        `option-${index}-${userAnswer}`
                    )
                    .classList.add(
                        "incorrect"
                    );


                document
                    .getElementById(
                        `option-${index}-${correctAnswer}`
                    )
                    .classList.add(
                        "correct"
                    );
            }


            explanation.innerHTML = `

                <strong>
                    Correct Answer:
                    ${correctAnswer}
                </strong>

                <p>
                    ${escapeHTML(
                        question.explanation
                    )}
                </p>

            `;

            explanation.style.display =
                "block";
        }
    );


    const percentage =
        Math.round(
            (score / total) * 100
        );


    let message = "";


    if (percentage === 100) {
        message = "Perfect score!";
    } else if (percentage >= 80) {
        message = "Excellent work!";
    } else if (percentage >= 60) {
        message = "Good job! Keep practicing.";
    } else {
        message = "Keep studying and try again.";
    }


    document.getElementById(
        "quizScore"
    ).innerHTML = `

        <div class="score-card">

            <div class="score-number">
                ${percentage}%
            </div>

            <div>

                <h2>
                    ${score} / ${total}
                </h2>

                <p>
                    ${message}
                </p>

            </div>

        </div>

        <button
            class="retry-button"
            onclick="generateQuiz()"
        >
            Generate New Quiz
        </button>

    `;


    document.querySelector(
        ".submit-quiz-button"
    ).style.display = "none";


    window.scrollTo({
        top: document.getElementById(
            "quizScore"
        ).offsetTop - 100,

        behavior: "smooth"
    });
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}