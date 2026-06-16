// src/components/admin/CourseEditor.tsx
import React, { useState } from 'react';
import type { Course, Teacher } from '@/types';
import ChapterEditor from './ChapterEditor';

interface CourseEditorProps {
  courses: Course[];
  teachers: Teacher[];
  onChange: (courses: Course[]) => void;
}

function emptyCourse(): Course {
  return {
    id: `course-${Date.now()}`,
    name: '新课程',
    category: '音乐学',
    subcategory: '',
    teacherId: '',
    coverImage: '/images/choir.jpg',
    description: '',
    objectives: '',
    keyPoints: '',
    difficulties: '',
    chapters: [],
  };
}

export default function CourseEditor({ courses, teachers, onChange }: CourseEditorProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'chapters'>('basic');

  const add = () => {
    const updated = [...courses, emptyCourse()];
    onChange(updated);
    setEditIdx(updated.length - 1);
  };

  const remove = (idx: number) => {
    onChange(courses.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  const update = (idx: number, field: keyof Course, value: string) => {
    const updated = [...courses];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const updateChapters = (idx: number, chapters: Course['chapters']) => {
    const updated = [...courses];
    updated[idx] = { ...updated[idx], chapters };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: '#008c8c' }}>
        <h2 className="text-base font-bold text-gray-800">课程管理</h2>
        <button onClick={add} className="admin-btn">+ 添加课程</button>
      </div>

      {courses.map((course, idx) => (
        <div key={course.id} className="border border-gray-200 rounded">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
            onClick={() => setEditIdx(editIdx === idx ? null : idx)}
          >
            <div>
              <div className="text-sm font-medium text-gray-800">{course.name || '（未命名课程）'}</div>
              <div className="text-xs text-gray-500">{course.category} · {course.chapters.length} 章节</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">{editIdx === idx ? '▲ 收起' : '▼ 编辑'}</span>
              <button
                onClick={(e) => { e.stopPropagation(); remove(idx); }}
                className="text-red-400 hover:text-red-600 text-xs px-2 py-1 border border-red-200 rounded"
              >
                删除
              </button>
            </div>
          </div>

          {editIdx === idx && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              {/* Sub tabs */}
              <div className="flex mb-4 border-b border-gray-200">
                {[{ key: 'basic' as const, label: '基本信息' }, { key: 'chapters' as const, label: `章节管理 (${course.chapters.length})` }].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
                      activeTab === t.key ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    style={activeTab === t.key ? { borderColor: '#008c8c', color: '#008c8c' } : {}}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === 'basic' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="admin-label">课程 ID</label>
                    <input className="admin-input" value={course.id} onChange={(e) => update(idx, 'id', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">课程名称</label>
                    <input className="admin-input" value={course.name} onChange={(e) => update(idx, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">课程类别</label>
                    <input className="admin-input" value={course.category} onChange={(e) => update(idx, 'category', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">子类别</label>
                    <input className="admin-input" value={course.subcategory} onChange={(e) => update(idx, 'subcategory', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">主讲教师</label>
                    <select className="admin-input" value={course.teacherId} onChange={(e) => update(idx, 'teacherId', e.target.value)}>
                      <option value="">（请选择）</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} - {t.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">封面图片路径</label>
                    <input className="admin-input" value={course.coverImage} onChange={(e) => update(idx, 'coverImage', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="admin-label">课程简介</label>
                    <textarea className="admin-input h-24 resize-y" value={course.description} onChange={(e) => update(idx, 'description', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="admin-label">教学目标</label>
                    <textarea className="admin-input h-24 resize-y" value={course.objectives} onChange={(e) => update(idx, 'objectives', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">教学重点</label>
                    <textarea className="admin-input h-16 resize-y" value={course.keyPoints} onChange={(e) => update(idx, 'keyPoints', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">教学难点</label>
                    <textarea className="admin-input h-16 resize-y" value={course.difficulties} onChange={(e) => update(idx, 'difficulties', e.target.value)} />
                  </div>
                </div>
              )}

              {activeTab === 'chapters' && (
                <ChapterEditor
                  chapters={course.chapters}
                  onChange={(chs) => updateChapters(idx, chs)}
                />
              )}
            </div>
          )}
        </div>
      ))}

      {courses.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-200 rounded">
          暂无课程，点击"添加课程"开始
        </div>
      )}
    </div>
  );
}
