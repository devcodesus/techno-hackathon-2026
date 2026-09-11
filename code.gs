const SPREADSHEET_ID = "1YGzSHMwQNofgTO5T00jPSmN8LW_YlWRv0MuBLSxTp1s";
const SHEET_NAME = "Quiz Results";


function doGet() {
  return ContentService
    .createTextOutput("HACKATHON 2026 QUIZ BACKEND IS LIVE");
}


function doPost(e) {

  try {

    const sheet = getSheet();

    const data = e.parameter;

    const name = data.name || "";
    const enrollment = data.enrollment || "";
    const course = data.course || "";

    const total = data.total || 0;
    const aptitude = data.aptitude || 0;
    const computer = data.computer || 0;
    const reasoning = data.reasoning || 0;
    const coding = data.coding || 0;

    const attempted = data.attempted || 0;
    const wrong = data.wrong || 0;
    const unanswered = data.unanswered || 0;

    const timeTaken = data.timeTaken || 0;

    const status = data.status || "SUBMITTED";


    if (!name || !enrollment || !course) {

      return output(
        "ERROR: Missing student information"
      );

    }


    /* CHECK DUPLICATE ENROLLMENT */

    const lastRow = sheet.getLastRow();

    if (lastRow > 1) {

      const existing =
        sheet
          .getRange(2, 3, lastRow - 1, 1)
          .getValues();

      for (let i = 0; i < existing.length; i++) {

        if (
          String(existing[i][0])
            .trim()
            .toLowerCase()
          ===
          String(enrollment)
            .trim()
            .toLowerCase()
        ) {

          return output(
            "DUPLICATE: This enrollment number has already submitted."
          );

        }

      }

    }


    /* SAVE RESULT */

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

      status

    ]);


    SpreadsheetApp.flush();


    return output(
      "SUCCESS: Quiz result saved."
    );


  } catch (error) {

    console.error(error);

    return output(
      "ERROR: " + error.message
    );

  }

}


/* =====================================================
   GET SHEET
   ===================================================== */

function getSheet() {

  const spreadsheet =
    SpreadsheetApp.openById(
      SPREADSHEET_ID
    );


  let sheet =
    spreadsheet.getSheetByName(
      SHEET_NAME
    );


  if (!sheet) {

    sheet =
      spreadsheet.insertSheet(
        SHEET_NAME
      );

  }


  /* ADD HEADERS IF SHEET IS EMPTY */

  if (sheet.getLastRow() === 0) {

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


  return sheet;

}


/* =====================================================
   OUTPUT
   ===================================================== */

function output(message) {

  return ContentService
    .createTextOutput(message)
    .setMimeType(
      ContentService.MimeType.TEXT
    );

}


/* =====================================================
   DIRECT TEST
   ===================================================== */

function testQuizSubmission() {

  const fakeEvent = {

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
    doPost(fakeEvent);


  Logger.log(
    result.getContent()
  );

}
