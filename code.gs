/* =========================================================
   HACKATHON 2026 — QUIZ BACKEND
   GOOGLE APPS SCRIPT
   ========================================================= */


/* =========================================================
   SETTINGS
   ========================================================= */

// IMPORTANT:
// Change this to the ID of your QUIZ RESULTS Google Sheet.

const SPREADSHEET_ID = "PASTE_YOUR_QUIZ_SHEET_ID_HERE";


// Name of the sheet/tab inside the spreadsheet.

const SHEET_NAME = "Quiz Results";


/* =========================================================
   DO GET
   ========================================================= */

function doGet(e) {

    return ContentService
        .createTextOutput(
            JSON.stringify({
                status: "success",
                message: "HACKATHON 2026 Quiz Backend is LIVE."
            })
        )
        .setMimeType(
            ContentService.MimeType.JSON
        );

}


/* =========================================================
   DO POST
   ========================================================= */

function doPost(e) {

    try {

        if (!e || !e.parameter) {

            return response(
                "error",
                "No submission data received."
            );

        }


        const data = e.parameter;


        /* -----------------------------------------
           CANDIDATE INFORMATION
           ----------------------------------------- */

        const name =
            clean(data.name);

        const enrollment =
            clean(data.enrollment);

        const course =
            clean(data.course);


        /* -----------------------------------------
           RESULT INFORMATION
           ----------------------------------------- */

        const total =
            numberValue(data.total);

        const aptitude =
            numberValue(data.aptitude);

        const computer =
            numberValue(data.computer);

        const reasoning =
            numberValue(data.reasoning);

        const coding =
            numberValue(data.coding);

        const attempted =
            numberValue(data.attempted);

        const wrong =
            numberValue(data.wrong);

        const unanswered =
            numberValue(data.unanswered);

        const timeTaken =
            numberValue(data.timeTaken);


        const status =
            clean(data.status);


        /* -----------------------------------------
           BASIC VALIDATION
           ----------------------------------------- */

        if (!name) {

            return response(
                "error",
                "Participant name is missing."
            );

        }


        if (!enrollment) {

            return response(
                "error",
                "Enrollment number is missing."
            );

        }


        if (!course) {

            return response(
                "error",
                "Course is missing."
            );

        }


        /* -----------------------------------------
           OPEN SPREADSHEET
           ----------------------------------------- */

        const spreadsheet =
            SpreadsheetApp.openById(
                SPREADSHEET_ID
            );


        let sheet =
            spreadsheet.getSheetByName(
                SHEET_NAME
            );


        /* -----------------------------------------
           CREATE SHEET IF REQUIRED
           ----------------------------------------- */

        if (!sheet) {

            sheet =
                spreadsheet.insertSheet(
                    SHEET_NAME
                );


            sheet.appendRow([

                "Timestamp",

                "Name",

                "Enrollment Number",

                "Course",

                "Total Score",

                "Aptitude",

                "Computer",

                "Reasoning",

                "Coding",

                "Attempted",

                "Wrong",

                "Unanswered",

                "Time Taken (Seconds)",

                "Status"

            ]);

        }


        /* -----------------------------------------
           PREVENT DUPLICATE SUBMISSION
           ----------------------------------------- */

        const lock =
            LockService.getScriptLock();


        lock.waitLock(10000);


        try {

            const lastRow =
                sheet.getLastRow();


            if (lastRow > 1) {

                const enrollmentValues =
                    sheet
                        .getRange(
                            2,
                            3,
                            lastRow - 1,
                            1
                        )
                        .getValues();


                const duplicate =
                    enrollmentValues.some(
                        row =>
                            String(row[0])
                                .trim()
                                .toLowerCase()
                            ===
                            enrollment
                                .trim()
                                .toLowerCase()
                    );


                if (duplicate) {

                    return response(
                        "duplicate",
                        "This Enrollment Number has already submitted the quiz."
                    );

                }

            }


            /* -----------------------------------------
               SAVE RESULT
               ----------------------------------------- */

            sheet.appendRow([

                new Date(),

                name,

                enrollment,

                course,

                total,

                aptitude,

                computer,

                reasoning,

                coding,

                attempted,

                wrong,

                unanswered,

                timeTaken,

                status || "SUBMITTED"

            ]);


            SpreadsheetApp.flush();


            return response(
                "success",
                "Quiz result saved successfully."
            );


        } finally {

            lock.releaseLock();

        }


    } catch (error) {

        console.error(
            error
        );


        return response(
            "error",
            "Unable to save quiz result."
        );

    }

}


/* =========================================================
   RESPONSE
   ========================================================= */

function response(status, message) {

    return ContentService
        .createTextOutput(
            JSON.stringify({

                status: status,

                message: message

            })
        )
        .setMimeType(
            ContentService.MimeType.JSON
        );

}


/* =========================================================
   CLEAN TEXT
   ========================================================= */

function clean(value) {

    return String(
        value == null
            ? ""
            : value
    ).trim();

}


/* =========================================================
   NUMBER CONVERSION
   ========================================================= */

function numberValue(value) {

    const n =
        Number(value);


    return isNaN(n)
        ? 0
        : n;

}


/* =========================================================
   TEST FUNCTION
   ========================================================= */

function testQuizSubmission() {

    const testData = {

        parameter: {

            name: "TEST STUDENT",

            enrollment: "TEST001",

            course: "BCA",

            total: "75",

            aptitude: "23",

            computer: "16",

            reasoning: "19",

            coding: "17",

            attempted: "95",

            wrong: "20",

            unanswered: "5",

            timeTaken: "4200",

            status: "TEST"

        }

    };


    const result =
        doPost(testData);


    Logger.log(
        result.getContent()
    );

}