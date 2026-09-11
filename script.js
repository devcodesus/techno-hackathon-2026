/* =========================================================
   HACKATHON 2026 — QUIZ PORTAL
   SCRIPT.JS
   ========================================================= */

const QUIZ_BACKEND_URL =
    "https://script.google.com/macros/s/AKfycbyFwzFQSHsHgKDgxFEyLufRU3mPtz-NkB5Gy05GFiNbGyN_Ntz8qYcV3tWQYiP5ryxD5w/exec";


/* =========================================================
   QUESTION BANK & STATE
   ========================================================= */

const questions = buildQuestionBank();

const state = {
    candidate: {},

    current: 0,

    answers: Array(100).fill(null),

    review: Array(100).fill(false),

    remaining: 5400, // 90 minutes

    timer: null,

    submitted: false,

    submitting: false
};


/* =========================================================
   ELEMENT HELPER
   ========================================================= */

const $ = id => document.getElementById(id);


/* =========================================================
   SECTIONS
   ========================================================= */

const sections = [
    {
        name: "APTITUDE",
        start: 0,
        end: 30
    },
    {
        name: "COMPUTER",
        start: 30,
        end: 50
    },
    {
        name: "REASONING",
        start: 50,
        end: 75
    },
    {
        name: "CODING",
        start: 75,
        end: 100
    }
];


/* =========================================================
   SCREEN CONTROL
   ========================================================= */

function show(id) {

    [
        "welcomeScreen",
        "quizScreen",
        "submitScreen",
        "resultScreen"
    ].forEach(x => {

        const element = $(x);

        if (element) {
            element.classList.toggle(
                "active",
                x === id
            );
        }

    });

    window.scrollTo(0, 0);
}


/* =========================================================
   TIME FORMAT
   ========================================================= */

function fmt(seconds) {

    return (
        String(Math.floor(seconds / 60)).padStart(2, "0") +
        ":" +
        String(seconds % 60).padStart(2, "0")
    );

}


/* =========================================================
   FIND SECTION
   ========================================================= */

function sec(index) {

    return sections.findIndex(
        s => index >= s.start && index < s.end
    );

}


/* =========================================================
   QUESTION PALETTE
   ========================================================= */

function palette() {

    const p = $("palette");

    if (!p) return;

    p.innerHTML = "";

    questions.forEach((q, i) => {

        const b = document.createElement("button");

        b.type = "button";

        b.textContent =
            String(i + 1).padStart(2, "0");

        b.className =
            (i === state.current ? "current " : "") +
            (state.answers[i] !== null ? "answered " : "") +
            (state.review[i] ? "review" : "");

        b.onclick = () => {

            state.current = i;

            render();

        };

        p.appendChild(b);

    });

}


/* =========================================================
   RENDER QUESTION
   ========================================================= */

function render() {

    const q = questions[state.current];

    const s = sec(state.current);

    $("sectionTitle").textContent =
        sections[s].name;

    $("questionNumber").textContent =
        `QUESTION ${String(state.current + 1).padStart(2, "0")} / 100`;

    $("questionType").textContent =
        q.code
            ? "CODING SNIPPET"
            : "SINGLE CHOICE";

    $("questionText").textContent =
        q.text;

    const codeBlock = $("codeBlock");

    if (codeBlock) {

        codeBlock.hidden = !q.code;

        codeBlock.textContent =
            q.code || "";

    }


    /* OPTIONS */

    const options = $("options");

    options.innerHTML = "";


    q.options.forEach((option, i) => {

        const label =
            document.createElement("label");

        label.className =
            "option" +
            (
                state.answers[state.current] === i
                    ? " selected"
                    : ""
            );


        const radio =
            document.createElement("input");

        radio.type = "radio";

        radio.name = "answer";

        radio.checked =
            state.answers[state.current] === i;


        radio.onchange = () => {

            state.answers[state.current] = i;

            render();

        };


        const letter =
            document.createElement("span");

        letter.className = "letter";

        letter.textContent =
            String.fromCharCode(65 + i);


        const text =
            document.createElement("span");

        text.textContent =
            option;


        label.append(
            radio,
            letter,
            text
        );


        options.appendChild(label);

    });


    /* REVIEW BUTTON */

    $("reviewBtn").textContent =
        state.review[state.current]
            ? "★ REMOVE REVIEW"
            : "☆ MARK FOR REVIEW";


    /* PREVIOUS */

    $("prevBtn").disabled =
        state.current === 0;


    /* NEXT */

    $("nextBtn").textContent =
        state.current === 99
            ? "REVIEW & SUBMIT →"
            : "NEXT →";


    /* PROGRESS */

    $("progressBar").style.width =
        ((state.current + 1) + "%");


    palette();

}


/* =========================================================
   TIMER
   ========================================================= */

function timer() {

    clearInterval(state.timer);

    $("timer").textContent =
        fmt(state.remaining);


    state.timer =
        setInterval(() => {

            state.remaining--;

            const timerElement =
                $("timer");


            timerElement.textContent =
                fmt(Math.max(0, state.remaining));


            const parent =
                timerElement.parentElement;


            parent.classList.toggle(
                "warning",
                state.remaining <= 600 &&
                state.remaining > 120
            );


            parent.classList.toggle(
                "danger",
                state.remaining <= 120
            );


            /* TIME UP */

            if (state.remaining <= 0) {

                clearInterval(state.timer);

                openSubmit();

            }

        }, 1000);

}


/* =========================================================
   OPEN SUBMIT SCREEN
   ========================================================= */

function openSubmit() {

    clearInterval(state.timer);


    const answered =
        state.answers.filter(
            x => x !== null
        ).length;


    const reviewed =
        state.review.filter(
            Boolean
        ).length;


    $("summaryStats").innerHTML = `

        <div>
            <strong>${answered} / 100</strong>
            <span>ANSWERED</span>
        </div>

        <div>
            <strong>${100 - answered}</strong>
            <span>UNANSWERED</span>
        </div>

        <div>
            <strong>${reviewed}</strong>
            <span>MARKED FOR REVIEW</span>
        </div>

    `;


    $("submitWarning").textContent =
        answered < 100
            ? `You have ${100 - answered} unanswered question(s). You can still submit.`
            : "All questions have been answered. You are ready to submit.";


    show("submitScreen");

}


/* =========================================================
   CALCULATE RESULT
   ========================================================= */

function calculateResult() {

    const score = {

        APTITUDE: 0,

        COMPUTER: 0,

        REASONING: 0,

        CODING: 0

    };


    questions.forEach((q, i) => {

        if (
            state.answers[i] === q.answer
        ) {

            score[q.section]++;

        }

    });


    const total =
        Object.values(score)
            .reduce(
                (a, b) => a + b,
                0
            );


    const attempted =
        state.answers.filter(
            x => x !== null
        ).length;


    const wrong =
        attempted - total;


    const unanswered =
        100 - attempted;


    const timeTaken =
        5400 - state.remaining;


    return {

        total,

        score,

        attempted,

        wrong,

        unanswered,

        timeTaken

    };

}


/* =========================================================
   SEND RESULT TO GOOGLE APPS SCRIPT
   ========================================================= */

function sendResultToBackend(result) {

    return new Promise((resolve, reject) => {


        /*
         * Hidden iframe method.
         *
         * This avoids the CORS problem that can occur
         * with Google Apps Script Web Apps.
         */

        const iframe =
            document.createElement("iframe");


        iframe.name =
            "quizSubmissionFrame";


        iframe.style.display =
            "none";


        document.body.appendChild(iframe);


        const form =
            document.createElement("form");


        form.method =
            "POST";


        form.action =
            QUIZ_BACKEND_URL;


        form.target =
            "quizSubmissionFrame";


        form.style.display =
            "none";


        /* Candidate information */

        addField(
            form,
            "name",
            state.candidate.name
        );


        addField(
            form,
            "enrollment",
            state.candidate.enrollment
        );


        addField(
            form,
            "course",
            state.candidate.course
        );


        /* Result */

        addField(
            form,
            "total",
            result.total
        );


        addField(
            form,
            "aptitude",
            result.score.APTITUDE
        );


        addField(
            form,
            "computer",
            result.score.COMPUTER
        );


        addField(
            form,
            "reasoning",
            result.score.REASONING
        );


        addField(
            form,
            "coding",
            result.score.CODING
        );


        addField(
            form,
            "attempted",
            result.attempted
        );


        addField(
            form,
            "wrong",
            result.wrong
        );


        addField(
            form,
            "unanswered",
            result.unanswered
        );


        addField(
            form,
            "timeTaken",
            result.timeTaken
        );


        addField(
            form,
            "status",
            "SUBMITTED"
        );


        document.body.appendChild(form);


        /*
         * Submit to Apps Script.
         */

        try {

            form.submit();

            /*
             * Give Apps Script time to receive
             * the request.
             */

            setTimeout(() => {

                iframe.remove();

                form.remove();

                resolve();

            }, 1500);


        } catch (error) {

            iframe.remove();

            form.remove();

            reject(error);

        }

    });

}


/* =========================================================
   ADD FORM FIELD
   ========================================================= */

function addField(form, name, value) {

    const input =
        document.createElement("input");


    input.type =
        "hidden";


    input.name =
        name;


    input.value =
        value == null
            ? ""
            : value;


    form.appendChild(input);

}


/* =========================================================
   SHOW RESULT
   ========================================================= */

function showResult(result) {

    $("resultCandidate").textContent =
        `${state.candidate.name} · ${state.candidate.enrollment} · ${state.candidate.course}`;


    $("scoreTotal").textContent =
        `${result.total}/100`;


    $("scoreAptitude").textContent =
        `${result.score.APTITUDE}/30`;


    $("scoreComputer").textContent =
        `${result.score.COMPUTER}/20`;


    $("scoreReasoning").textContent =
        `${result.score.REASONING}/25`;


    $("scoreCoding").textContent =
        `${result.score.CODING}/25`;


    show("resultScreen");

}


/* =========================================================
   FINAL SUBMISSION
   ========================================================= */

async function submit() {

    if (state.submitted ||
        state.submitting) {

        return;

    }


    state.submitting = true;


    clearInterval(state.timer);


    const result =
        calculateResult();


    /*
     * Show result immediately.
     * Backend submission happens alongside it.
     */

    showResult(result);


    /*
     * Send result to Google Sheet.
     */

    if (
        QUIZ_BACKEND_URL &&
        !QUIZ_BACKEND_URL.includes(
            "PASTE_YOUR_QUIZ_BACKEND_URL_HERE"
        )
    ) {

        try {

            await sendResultToBackend(
                result
            );

        } catch (error) {

            console.error(
                "Backend submission error:",
                error
            );

        }

    }


    state.submitted = true;

    state.submitting = false;

}


/* =========================================================
   START QUIZ
   ========================================================= */

$("startBtn").onclick = () => {

    const name =
        $("candidateName")
            .value
            .trim();


    const enrollment =
        $("candidateEnrollment")
            .value
            .trim();


    const course =
        $("candidateCourse")
            .value;


    if (!name ||
        !enrollment ||
        !course) {

        $("welcomeError").textContent =
            "Please enter your name, enrollment number and course.";

        return;

    }


    state.candidate = {

        name,

        enrollment,

        course

    };


    $("miniName").textContent =
        name.toUpperCase();


    $("miniEnrollment").textContent =
        enrollment;


    show("quizScreen");


    render();


    timer();

};


/* =========================================================
   MARK FOR REVIEW
   ========================================================= */

$("reviewBtn").onclick = () => {

    state.review[state.current] =
        !state.review[state.current];

    render();

};


/* =========================================================
   CLEAR ANSWER
   ========================================================= */

$("clearBtn").onclick = () => {

    state.answers[state.current] =
        null;

    render();

};


/* =========================================================
   PREVIOUS BUTTON
   ========================================================= */

$("prevBtn").onclick = () => {

    if (state.current > 0) {

        state.current--;

        render();

    }

};


/* =========================================================
   NEXT BUTTON
   ========================================================= */

$("nextBtn").onclick = () => {

    if (state.current === 99) {

        openSubmit();

    } else {

        state.current++;

        render();

    }

};


/* =========================================================
   BACK TO QUIZ
   ========================================================= */

$("backToQuizBtn").onclick = () => {

    if (state.submitted) return;

    show("quizScreen");

    render();

    timer();

};


/* =========================================================
   FINAL SUBMIT BUTTON
   ========================================================= */

$("finalSubmitBtn").onclick =
    submit;


/* =========================================================
   SECTION JUMP BUTTONS
   ========================================================= */

document
    .querySelectorAll(".section-jump button")
    .forEach(button => {

        button.onclick = () => {

            state.current =
                sections[
                    Number(button.dataset.section)
                ].start;

            render();

        };

    });


/* =========================================================
   BINARY RAIN BACKGROUND
   ========================================================= */

const binaryCanvas =
    $("binaryCanvas");


if (binaryCanvas) {

    const ctx =
        binaryCanvas.getContext("2d");


    let drops = [];


    function resize() {

        binaryCanvas.width =
            window.innerWidth;


        binaryCanvas.height =
            window.innerHeight;


        drops =
            Array(
                Math.ceil(
                    binaryCanvas.width / 16
                )
            )
            .fill(0)
            .map(
                () => Math.random() * -40
            );

    }


    function rain() {

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {

            return;

        }


        ctx.clearRect(
            0,
            0,
            binaryCanvas.width,
            binaryCanvas.height
        );


        ctx.font =
            "12px monospace";


        drops.forEach((value, index) => {

            ctx.fillStyle =
                "rgba(80,255,145,.65)";


            ctx.fillText(
                Math.random() > 0.5
                    ? "1"
                    : "0",
                index * 16,
                value * 16
            );


            drops[index] =
                value + 0.45;


            if (
                value * 16 >
                binaryCanvas.height + 100
            ) {

                drops[index] =
                    Math.random() * -30;

            }

        });


        requestAnimationFrame(
            rain
        );

    }


    window.addEventListener(
        "resize",
        resize
    );


    resize();

    rain();

}
