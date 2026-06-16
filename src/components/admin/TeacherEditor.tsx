// src/components/admin/TeacherEditor.tsx
import React, { useState, useRef } from 'react';
import type { Teacher } from '@/types';

interface TeacherEditorProps {
  teachers: Teacher[];
  onChange: (teachers: Teacher[]) => void;
}

function emptyTeacher(): Teacher {
  return {
    id: `teacher-${Date.now()}`,
    name: '',
    title: '主讲教师',
    avatar: '/images/teacher.jpg',
    rank: '',
    department: '音乐与舞蹈学院',
    bio: '',
    contact: '',
  };
}

export default function TeacherEditor({ teachers, onChange }: TeacherEditorProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const add = () => {
    const updated = [...teachers, emptyTeacher()];
    onChange(updated);
    setEditIdx(updated.length - 1);
  };

  const remove = (idx: number) => {
    onChange(teachers.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  const update = (idx: number, field: keyof Teacher, value: string) => {
    const updated = [...teachers];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const handleAvatarUpload = async (idx: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setUploadError('');

    try {
      const form = new FormData();
      form.append('file', fileList[0]);

      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json() as { files?: string[]; error?: string };

      if (!res.ok) throw new Error(data.error ?? '上传失败');

      if (data.files && data.files.length > 0) {
        update(idx, 'avatar', data.files[0]);
      }
    } catch (err) {
      setUploadError(String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: '#008c8c' }}>
        <h2 className="text-base font-bold text-gray-800">教师管理</h2>
        <button onClick={add} className="admin-btn">+ 添加教师</button>
      </div>

      {uploadError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2.5">
          {uploadError}
        </div>
      )}

      {/* Teacher list */}
      <div className="space-y-2">
        {teachers.map((teacher, idx) => (
          <div key={teacher.id} className="border border-gray-200 rounded">
            {/* Teacher row */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => setEditIdx(editIdx === idx ? null : idx)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-10 h-10 rounded-full object-cover border"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/teacher.jpg'; }}
                />
                <div>
                  <div className="text-sm font-medium text-gray-800">{teacher.name || '（未命名）'}</div>
                  <div className="text-xs text-gray-500">{teacher.title} · {teacher.rank}</div>
                </div>
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

            {/* Edit form */}
            {editIdx === idx && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="admin-label">教师 ID（唯一标识）</label>
                    <input className="admin-input" value={teacher.id} onChange={(e) => update(idx, 'id', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">姓名</label>
                    <input className="admin-input" value={teacher.name} onChange={(e) => update(idx, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">职务称谓（如：主讲教师）</label>
                    <input className="admin-input" value={teacher.title} onChange={(e) => update(idx, 'title', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">职称（如：讲师、副教授）</label>
                    <input className="admin-input" value={teacher.rank} onChange={(e) => update(idx, 'rank', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">所在学院</label>
                    <input className="admin-input" value={teacher.department} onChange={(e) => update(idx, 'department', e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">头像上传</label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { handleAvatarUpload(idx, e.target.files); }}
                      />
                      <button
                        type="button"
                        disabled={uploading}
                        className={`text-xs px-3 py-2 rounded font-medium transition-colors ${
                          uploading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : 'text-white hover:opacity-90'
                        }`}
                        style={uploading ? {} : { backgroundColor: '#008c8c' }}
                        onClick={() => inputRefs.current[idx]?.click()}
                      >
                        {uploading ? '上传中...' : '选择照片上传'}
                      </button>
                      {teacher.avatar && (
                        <span className="text-xs text-gray-500 truncate max-w-[120px]" title={teacher.avatar}>
                          {teacher.avatar.split('/').pop()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="admin-label">头像图片路径（也可手动输入）</label>
                    <input className="admin-input" value={teacher.avatar} onChange={(e) => update(idx, 'avatar', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="admin-label">联系方式</label>
                    <input className="admin-input" value={teacher.contact} onChange={(e) => update(idx, 'contact', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="admin-label">教师简介</label>
                    <textarea
                      className="admin-input h-24 resize-y"
                      value={teacher.bio}
                      onChange={(e) => update(idx, 'bio', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {teachers.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-200 rounded">
          暂无教师，点击"添加教师"开始
        </div>
      )}
    </div>
  );
}
