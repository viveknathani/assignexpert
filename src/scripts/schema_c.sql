CREATE TYPE "language" AS ENUM (
  'c',
  'cpp',
  'python',
  'java' 
);

CREATE TYPE "resultStatus" AS ENUM (
  'AC',
  'WA',
  'TLE',
  'MLE',
  'CE',
  'RE',
  'PR'
);

CREATE TABLE "users" (
  "id" uuid,
  "email" varchar,
  "password" bytea,
  "firstName" varchar,
  "lastName" varchar,
  "uiTheme" varchar,
  "editorTheme" varchar,
  "wantsEmailNotifications" boolean
);

CREATE TABLE "students" (
  "id" uuid,
  "userId" uuid,
  "rollNumber" bigint
);

CREATE TABLE "faculties" (
  "id" uuid,
  "userId" uuid,
  "employeeNumber" bigint
);

CREATE TABLE "classes" (
  "id" uuid,
  "facultyId" uuid,
  "name" varchar,
  "code" varchar
);

CREATE TABLE "members" (
  "id" uuid,
  "classId" uuid,
  "studentId" uuid
);

CREATE TABLE "assignments" (
  "id" uuid,
  "classId" uuid,
  "title" varchar,
  "description" text,
  "sampleInput" text,
  "sampleOutput" text,
  "constraints" text,
  "points" float,
  "hasTemplate" boolean,
  "acceptedLanguages" language[],
  "holdPoints" bool,
  "deadline" timestamp
);

CREATE TABLE "templates" (
  "id" uuid,
  "assignmentId" uuid,
  "language" integer,
  "code" text
);

CREATE TABLE "testCases" (
  "id" uuid,
  "assignmentId" uuid,
  "points" float,
  "input" text,
  "output" text
);

CREATE TABLE "submissions" (
  "id" uuid,
  "assignmentId" uuid,
  "studentId" uuid,
  "code" text,
  "language" integer,
  "resultStatus" "resultStatus",
  "resultMessage" varchar,
  "timeTaken" float,
  "memoryUsed" varchar,
  "points" float,
  "submittedAt" timestamp
);

ALTER TABLE "students" ADD FOREIGN KEY ("userId") REFERENCES "users" ("id");

ALTER TABLE "faculties" ADD FOREIGN KEY ("userId") REFERENCES "users" ("id");

ALTER TABLE "classes" ADD FOREIGN KEY ("facultyId") REFERENCES "faculties" ("id");

CREATE TABLE "classes_members" (
  "classes_id" uuid NOT NULL,
  "members_classId" uuid NOT NULL,
  PRIMARY KEY ("classes_id", "members_classId")
);

ALTER TABLE "classes_members" ADD FOREIGN KEY ("classes_id") REFERENCES "classes" ("id");

ALTER TABLE "classes_members" ADD FOREIGN KEY ("members_classId") REFERENCES "members" ("classId");


CREATE TABLE "students_members" (
  "students_id" uuid NOT NULL,
  "members_studentId" uuid NOT NULL,
  PRIMARY KEY ("students_id", "members_studentId")
);

ALTER TABLE "students_members" ADD FOREIGN KEY ("students_id") REFERENCES "students" ("id");

ALTER TABLE "students_members" ADD FOREIGN KEY ("members_studentId") REFERENCES "members" ("studentId");


CREATE TABLE "classes_assignments" (
  "classes_id" uuid NOT NULL,
  "assignments_classId" uuid NOT NULL,
  PRIMARY KEY ("classes_id", "assignments_classId")
);

ALTER TABLE "classes_assignments" ADD FOREIGN KEY ("classes_id") REFERENCES "classes" ("id");

ALTER TABLE "classes_assignments" ADD FOREIGN KEY ("assignments_classId") REFERENCES "assignments" ("classId");


ALTER TABLE "templates" ADD FOREIGN KEY ("assignmentId") REFERENCES "assignments" ("id");

ALTER TABLE "testCases" ADD FOREIGN KEY ("assignmentId") REFERENCES "assignments" ("id");

ALTER TABLE "submissions" ADD FOREIGN KEY ("assignmentId") REFERENCES "assignments" ("id");

ALTER TABLE "submissions" ADD FOREIGN KEY ("studentId") REFERENCES "students" ("id");
