// src/components/CourseContent.tsx
import React from 'react';
import type { Course, Chapter, Teacher } from '@/types';
import type { CourseSection } from '@/types';
import TeacherCard from './TeacherCard';

interface CourseContentProps {
  course: Course;
  teacher?: Teacher;
  section: CourseSection;
  chapterIndex: number;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2
        className="text-lg font-bold pb-2 border-b-2"
        style={{ color: '#008c8c', borderColor: '#008c8c' }}
      >
        {children}
      </h2>
    </div>
  );
}

function TextBlock({ text }: { text: string }) {
  return (
    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-song">
      {text || <span className="text-gray-400 italic">（暂无内容）</span>}
    </div>
  );
}

export default function CourseContent({
  course,
  teacher,
  section,
  chapterIndex,
}: CourseContentProps) {
  const chapter: Chapter | undefined = course.chapters[chapterIndex];

  if (section === 'intro') {
    return (
      <div>
        <SectionTitle>课程简介</SectionTitle>

        {/* Teacher card */}
        {teacher && (
          <div className="flex gap-6 mb-6">
            <TeacherCard teacher={teacher} showLink={true} />
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-800 mb-2">
                {course.name} — {course.category} {course.subcategory}
              </div>
              <TextBlock text={course.description} />
            </div>
          </div>
        )}

        {!teacher && <TextBlock text={course.description} />}

        {course.objectives && (
          <div className="mt-5">
            <h3 className="text-sm font-bold text-gray-800 mb-2">教学目标</h3>
            <TextBlock text={course.objectives} />
          </div>
        )}
      </div>
    );
  }

  if (section === 'requirements') {
    return (
      <div>
        <SectionTitle>教学内容要求</SectionTitle>
        <div className="space-y-2">
          {course.chapters.map((ch, idx) => (
            <div key={ch.id} className="border-b border-gray-100 pb-2">
              <div className="text-sm text-gray-700 font-medium">{ch.title}</div>
              {ch.requirements && (
                <div className="text-xs text-gray-500 mt-1 ml-4">{ch.requirements}</div>
              )}
            </div>
          ))}
        </div>
        {course.keyPoints && (
          <div className="mt-5">
            <h3 className="text-sm font-bold text-gray-800 mb-2">教学重点</h3>
            <TextBlock text={course.keyPoints} />
          </div>
        )}
        {course.difficulties && (
          <div className="mt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">教学难点</h3>
            <TextBlock text={course.difficulties} />
          </div>
        )}
      </div>
    );
  }

  if (!chapter) {
    return <div className="text-gray-400 text-sm">请选择章节</div>;
  }

  if (section === 'background') {
    return (
      <div>
        <SectionTitle>教学曲目背景 — {chapter.title}</SectionTitle>
        <TextBlock text={chapter.background} />
        {chapter.images.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {chapter.images.map((src, i) => (
              <img key={i} src={src} alt={`图片${i + 1}`} className="w-full rounded border" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (section === 'appreciation') {
    return (
      <div>
        <SectionTitle>教学曲目赏析 — {chapter.title}</SectionTitle>
        <TextBlock text={chapter.appreciation} />
        {chapter.videos.length > 0 && (
          <div className="mt-5 space-y-4">
            {chapter.videos.map((src, i) => (
              <video key={i} controls className="w-full rounded border" src={src}>
                您的浏览器不支持视频播放
              </video>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (section === 'practice') {
    return (
      <div>
        <SectionTitle>教学曲目练习 — {chapter.title}</SectionTitle>
        <TextBlock text={chapter.practice} />
      </div>
    );
  }

  return null;
}
