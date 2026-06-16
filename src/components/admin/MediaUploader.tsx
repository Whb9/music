// src/components/admin/MediaUploader.tsx
import React, { useState, useRef } from 'react';
import type { Course } from '@/types';

interface UploadedFile {
  name: string;
  path: string;
  type: 'image' | 'video';
  applied: boolean;
}

interface MediaUploaderProps {
  courses: Course[];
  onCoursesChange: (courses: Course[]) => void;
}

const SECTION_LABELS: Record<string, string> = {
  requirements: '教学要求',
  background: '曲目背景',
  appreciation: '曲目赏析',
  practice: '曲目练习',
};

export default function MediaUploader({ courses, onCoursesChange }: MediaUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [selections, setSelections] = useState<Record<string, {
    courseId: string;
    chapterId: string;
    section: string;
  }>>({});

  const isImage = (name: string) =>
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);

  const handleUpload = async (fileList: FileList) => {
    setUploading(true);
    setError('');

    try {
      const form = new FormData();
      Array.from(fileList).forEach((f) => form.append('file', f));

      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json() as { files?: string[]; error?: string };

      if (!res.ok) throw new Error(data.error ?? '上传失败');

      const newFiles: UploadedFile[] = (data.files ?? []).map((filePath) => ({
        name: filePath.split('/').pop() ?? filePath,
        path: filePath,
        type: isImage(filePath) ? 'image' : 'video',
        applied: false,
      }));

      setFiles((prev) => [...newFiles, ...prev]);

      const newSelections: Record<string, { courseId: string; chapterId: string; section: string }> = {};
      for (const f of newFiles) {
        const firstCourse = courses[0];
        newSelections[f.path] = {
          courseId: firstCourse?.id ?? '',
          chapterId: firstCourse?.chapters[0]?.id ?? '',
          section: 'requirements',
        };
      }
      setSelections((prev) => ({ ...newSelections, ...prev }));
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleSelectionChange = (filePath: string, field: string, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [filePath]: {
        ...prev[filePath],
        [field]: value,
      },
    }));
  };

  const applyToChapter = (filePath: string) => {
    const sel = selections[filePath];
    if (!sel || !sel.courseId || !sel.chapterId) return;

    const file = files.find((f) => f.path === filePath);
    if (!file) return;

    const updated = courses.map((course) => {
      if (course.id !== sel.courseId) return course;
      return {
        ...course,
        chapters: course.chapters.map((ch) => {
          if (ch.id !== sel.chapterId) return ch;
          if (file.type === 'image') {
            return { ...ch, images: [...ch.images, filePath] };
          } else {
            return { ...ch, videos: [...ch.videos, filePath] };
          }
        }),
      };
    });

    onCoursesChange(updated);

    setFiles((prev) =>
      prev.map((f) => (f.path === filePath ? { ...f, applied: true } : f))
    );

    const courseName = courses.find((c) => c.id === sel.courseId)?.name ?? '';
    const chapterTitle = courses
      .find((c) => c.id === sel.courseId)
      ?.chapters.find((ch) => ch.id === sel.chapterId)?.title ?? '';
    setSuccessMsg(`已添加到「${courseName}」→「${chapterTitle}」→「${SECTION_LABELS[sel.section]}」`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.name }));

  const getChapterOptions = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return (course?.chapters ?? []).map((ch) => ({ value: ch.id, label: ch.title }));
  };

  const sectionOptions = [
    { value: 'requirements', label: '教学要求' },
    { value: 'background', label: '曲目背景' },
    { value: 'appreciation', label: '曲目赏析' },
    { value: 'practice', label: '曲目练习' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b pb-3" style={{ borderColor: '#008c8c' }}>
        <h2 className="text-base font-bold text-gray-800">素材管理</h2>
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
          上传图片和视频素材，选择对应的课程章节后自动关联到章节中
        </p>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files); }}
        />
        <div className="text-3xl mb-2">📁</div>
        <div className="text-sm text-gray-600 font-medium">
          {uploading ? '上传中，请稍候...' : '点击选择文件 或 拖放文件到此处'}
        </div>
        <div className="text-xs text-gray-400 mt-1.5">
          支持 JPG / PNG / GIF / WebP / MP4 / AVI / MOV 格式
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2.5">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2.5 flex items-center gap-1.5">
          <span className="text-base">✓</span>
          {successMsg}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700">
            已上传文件
            <span className="text-xs text-gray-400 font-normal ml-2">（刷新页面后列表消失，请及时关联到章节并保存）</span>
          </h3>

          {files.map((file) => {
            const sel = selections[file.path];
            const chapterOptions = sel ? getChapterOptions(sel.courseId) : [];
            const validChapter = sel && chapterOptions.some((ch) => ch.value === sel.chapterId);

            return (
              <div key={file.path} className="border border-gray-200 rounded-lg p-4 bg-white">
                {/* Top row: preview + file info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0">
                    {file.type === 'image' ? (
                      <img src={file.path} alt={file.name} className="w-16 h-14 object-cover rounded border" />
                    ) : (
                      <div className="w-16 h-14 flex items-center justify-center bg-gray-100 rounded border text-xl">🎬</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-800 font-medium truncate">{file.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${file.type === 'image' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {file.type === 'image' ? '图片' : '视频'}
                      </span>
                      {file.applied && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 bg-green-50 text-green-600">已关联</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 font-mono truncate">{file.path}</div>
                  </div>
                </div>

                {/* Selectors row */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">选择课程</label>
                    <select
                      className="admin-input text-sm py-1.5"
                      value={sel?.courseId ?? ''}
                      onChange={(e) => {
                        const courseId = e.target.value;
                        handleSelectionChange(file.path, 'courseId', courseId);
                        const newChapters = getChapterOptions(courseId);
                        handleSelectionChange(file.path, 'chapterId', newChapters[0]?.value ?? '');
                      }}
                    >
                      <option value="" disabled>请选择课程</option>
                      {courseOptions.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">选择章节</label>
                    <select
                      className="admin-input text-sm py-1.5"
                      value={validChapter ? sel.chapterId : ''}
                      onChange={(e) => handleSelectionChange(file.path, 'chapterId', e.target.value)}
                    >
                      <option value="" disabled>请选择章节</option>
                      {chapterOptions.map((ch) => (
                        <option key={ch.value} value={ch.value}>{ch.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">选择模块</label>
                    <select
                      className="admin-input text-sm py-1.5"
                      value={sel?.section ?? 'requirements'}
                      onChange={(e) => handleSelectionChange(file.path, 'section', e.target.value)}
                    >
                      {sectionOptions.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action row */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => applyToChapter(file.path)}
                    disabled={file.applied || !sel?.courseId || !sel?.chapterId}
                    className={`text-xs px-4 py-1.5 rounded font-medium transition-colors ${
                      file.applied
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'text-white hover:opacity-90'
                    }`}
                    style={file.applied ? {} : { backgroundColor: '#008c8c' }}
                  >
                    {file.applied ? '已关联' : '关联到章节'}
                  </button>
                  {file.applied ? (
                    <span className="text-xs text-green-600">
                      已添加到 {SECTION_LABELS[sel?.section ?? 'requirements']} 模块
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      将添加到：{SECTION_LABELS[sel?.section ?? 'requirements']} 模块
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Usage guide */}
      {files.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-2">使用说明</div>
          <ol className="text-sm text-blue-700 space-y-1.5 ml-5" style={{ listStyleType: 'decimal' }}>
            <li>上传图片或视频文件</li>
            <li>选择目标课程、章节和模块（教学要求 / 曲目背景 / 曲目赏析 / 曲目练习）</li>
            <li>点击「关联到章节」将素材绑定到对应位置</li>
            <li>点击左侧「保存全部」按钮持久化修改</li>
          </ol>
        </div>
      )}
    </div>
  );
}
