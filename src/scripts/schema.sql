create type "language" as enum (
    'c',
    'cpp',
    'python',
    'java'
);

create type "result_status" as enum (
    'AC', --- accepted
    'WA', --- wrong answer
    'TLE', --- time limit exceeded
    'MLE', --- memory limit exceeded
    'CE', --- compiler error
    'RE', --- runtime error
    'PR' --- partially right
);

create table if not exists users (
    id uuid primary key,
    email varchar(319) not null,
    "firstName" varchar not null,
    "lastName" varchar not null,
    password bytea not null,
    "uiTheme" varchar,
    "editorTheme" varchar,
    "wantsEmailNotifications" boolean
);

create table if not exists students (
    id uuid primary key,
    "userId" uuid references users(id) on delete cascade,
    "rollNumber" bigint not null
);

create table if not exists faculties (
    id uuid primary key,
    "userId" uuid references users(id) on delete cascade,
    "employeesNumber" bigint not null
);

create table if not exists classes (
    id uuid primary key,
    "facultyId" uuid references faculties(id) on delete cascade,
    name varchar not null,
    code varchar not null
);

create table if not exists members (
    id uuid primary key,
    "classId" uuid references classes(id) on delete cascade,
    "studentId" uuid references students(id) on delete cascade
);

create table if not exists assignments (
    id uuid primary key,
    "classId" uuid references classes(id) on delete cascade,
    title varchar,
    description text,
    "sampleInput" text,
    "sampleOutput" text,
    constraints text,
    points real,
    "hasTemplate" boolean,
    "acceptedLanguages" language[],
    holdPoints boolean,
    deadline timestamp
);

create table if not exists templates (
    id uuid primary key,
    "assignmentId" uuid references assignments(id) on delete cascade,
    lang language,
    code text
);

create table if not exists "testCases" (
    id uuid primary key,
    "assignmentId" uuid references assignments(id) on delete cascade,
    points real,
    input text,
    output text
);

create table if not exists submissions (
    id uuid primary key,
    "assignmentId" uuid references assignments(id) on delete cascade,
    "studentId" uuid references students(id) on delete cascade,
    code text,
    lang language,
    "resultStatus" result_status,
    "resultMessage" varchar,
    "timeTaken" real,
    "memoryUsedInKiloBytes" real,
    points real,
    "submittedAt" timestamp
);