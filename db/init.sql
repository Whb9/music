-- Hermes D1 Schema: 湖北文理学院 音乐与舞蹈学院 课程建设网站
-- Tables mirror data/site.json structure

-- Site configuration (single row)
CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  schoolName TEXT NOT NULL DEFAULT '',
  collegeName TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  campusImage TEXT NOT NULL DEFAULT '',
  schoolUrl TEXT NOT NULL DEFAULT '',
  nav JSON NOT NULL DEFAULT '[]',
  footer JSON NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (id = 1)  -- enforce single row
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  rank TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  subcategory TEXT NOT NULL DEFAULT '',
  teacherId TEXT NOT NULL DEFAULT '',
  coverImage TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  objectives TEXT NOT NULL DEFAULT '',
  keyPoints TEXT NOT NULL DEFAULT '',
  difficulties TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (teacherId) REFERENCES teachers(id)
);

-- Chapters (belongs to a course)
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  courseId TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  background TEXT NOT NULL DEFAULT '',
  appreciation TEXT NOT NULL DEFAULT '',
  practice TEXT NOT NULL DEFAULT '',
  images JSON NOT NULL DEFAULT '[]',
  videos JSON NOT NULL DEFAULT '[]',
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chapters_course ON chapters(courseId);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacherId);
