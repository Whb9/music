// src/components/admin/ChapterEditor.tsx
import React, { useState } from 'react';
import type { Chapter } from '@/types';

interface ChapterEditorProps {
  chapters: Chapter[];
  onChange: (chapters: Chapter[]) => void;
}

function emptyChapter(idx: number): Chapter {
  return {
    id: `chapter-${Date.now()}`,
    title: `第${idx + 1}章：新曲目`,
    requirements: '',
    background: '',
    appreciation: '',
    practice: '',
    images: [],
    videos: [],
  };
}

export default function ChapterEditor({ chapters, onChange }: ChapterEditorProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'requirements' | 'background' | 'appreciation' | 'practice'>('requirements');

  const add = () => {
    const updated = [...chapters, emptyChapter(chapters.length)];
    onChange(updated);
    setEditIdx(updated.length - 1);
  };

  const remove = (idx: number) => {
    onChange(chapters.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  const update = (idx: number, field: keyof Chapter, value: string | string[]) => {
    const updated = [...chapters];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...chapters];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onChange(arr);
    setEditIdx(idx - 1);
  };

  const moveDown = (idx: number) => {
    if (idx === chapters.length - 1) return;
    const arr = [...chapters];
    [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
    onChange(arr);
    setEditIdx(idx + 1);
  };

  const tabs = [
    { key: 'requirements' as const, label: '教学要求' },
    { key: 'background' as const, label: '曲目背景' },
    { key: 'appreciation' as const, label: '曲目赏析' },
    { key: 'practice' as const, label: '曲目练习' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-700">章节列表（共 {chapters.length} 章）</h3>
        <button onClick={add} className="admin-btn-sm">+ 添加章节</button>
      </div>

      {chapters.map((ch, idx) => (
        <div key={ch.id} className="border border-gray-200 rounded">
          <div
            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50"
            onClick={() => setEditIdx(editIdx === idx ? null : idx)}
          >
            <div className="text-sm text-gray-700 flex-1 truncate">{ch.title || '（未命名章节）'}</div>
            <div className="flex items-center space-x-1 ml-2">
              <button onClick={(e) => { e.stopPropagation(); moveUp(idx); }} className="text-gray-400 hover:text-gray-600 text-xs px-1" title="上移">↑</button>
              <button onClick={(e) => { e.stopPropagation(); moveDown(idx); }} className="text-gray-400 hover:text-gray-600 text-xs px-1" title="下移">↓</button>
              <span className="text-xs text-gray-400">{editIdx === idx ? '▲' : '▼'}</span>
              <button
                onClick={(e) => { e.stopPropagation(); remove(idx); }}
                className="text-red-400 hover:text-red-600 text-xs px-1.5 py-0.5 border border-red-200 rounded ml-1"
              >
                删除
              </button>
            </div>
          </div>

          {editIdx === idx && (
            <div className="border-t border-gray-100 p-3 bg-gray-50">
              <div className="mb-3">
                <label className="admin-label">章节标题</label>
                <input
                  className="admin-input"
                  value={ch.title}
                  onChange={(e) => update(idx, 'title', e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="admin-label">章节 ID</label>
                <input
                  className="admin-input"
                  value={ch.id}
                  onChange={(e) => update(idx, 'id', e.target.value)}
                />
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'text-white border-b-2 -mb-px'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={activeTab === tab.key ? { backgroundColor: '#008c8c', borderColor: '#008c8c' } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <textarea
                className="admin-input h-36 resize-y"
                value={ch[activeTab] as string}
                onChange={(e) => update(idx, activeTab, e.target.value)}
                placeholder={`请输入${tabs.find((t) => t.key === activeTab)?.label}内容...`}
              />

              {/* Images */}
              <div className="mt-3">
                <label className="admin-label">图片路径（每行一个）</label>
                <textarea
                  className="admin-input h-16 resize-none"
                  value={ch.images.join('\n')}
                  onChange={(e) =>
                    update(idx, 'images', e.target.value.split('\n').filter(Boolean))
                  }
                  placeholder="/uploads/image1.jpg"
                />
              </div>

              {/* Videos */}
              <div className="mt-3">
                <label className="admin-label">视频路径（每行一个）</label>
                <textarea
                  className="admin-input h-16 resize-none"
                  value={ch.videos.join('\n')}
                  onChange={(e) =>
                    update(idx, 'videos', e.target.value.split('\n').filter(Boolean))
                  }
                  placeholder="/uploads/video1.mp4"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {chapters.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-6 border-2 border-dashed border-gray-200 rounded">
          暂无章节，点击"添加章节"开始
        </div>
      )}
    </div>
  );
}
