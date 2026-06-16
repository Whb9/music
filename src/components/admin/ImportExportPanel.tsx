// src/components/admin/ImportExportPanel.tsx
import React, { useState, useRef } from 'react';
import type { SiteData } from '@/types';

interface ImportExportPanelProps {
  data: SiteData;
  onImportSuccess: () => void;
}

export default function ImportExportPanel({ data, onImportSuccess }: ImportExportPanelProps) {
  const [importType, setImportType] = useState<'teachers' | 'courses'>('teachers');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTeachersCsv = () => {
    const headers = ['id', 'name', 'title', 'rank', 'department', 'bio', 'contact', 'avatar'];
    const rows = data.teachers.map((t) =>
      headers.map((h) => `"${String(t[h as keyof typeof t] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCoursesJson = () => {
    const json = JSON.stringify(data.courses, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setStatus('');
    setError('');

    const form = new FormData();
    form.append('file', fileList[0]);
    form.append('type', importType);

    try {
      const res = await fetch('/api/import-data', { method: 'POST', body: form });
      const data = await res.json() as { success?: boolean; count?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? '导入失败');
      setStatus(`✓ 成功导入 ${data.count} 条记录`);
      onImportSuccess();
    } catch (err) {
      setError(String(err));
    }
  };

  const TEACHER_JSON_EXAMPLE = JSON.stringify([
    { id: "teacher-001", name: "张三", title: "主讲教师", rank: "副教授", department: "音乐与舞蹈学院", bio: "教师简介...", contact: "", avatar: "/images/teacher.jpg" }
  ], null, 2);

  const TEACHER_CSV_EXAMPLE = `id,name,title,rank,department,bio,contact,avatar\nteacher-001,张三,主讲教师,副教授,音乐与舞蹈学院,教师简介,,/images/teacher.jpg`;

  return (
    <div className="space-y-6">
      <div className="border-b pb-2" style={{ borderColor: '#008c8c' }}>
        <h2 className="text-base font-bold text-gray-800">导入 / 导出</h2>
        <p className="text-xs text-gray-500 mt-1">支持 JSON、CSV、Excel (.xlsx) 格式的批量导入</p>
      </div>

      {/* Export */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">数据导出</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportJson}
            className="admin-btn"
          >
            📦 导出完整备份 (JSON)
          </button>
          <button
            onClick={exportTeachersCsv}
            className="admin-btn"
          >
            👩‍🏫 导出教师列表 (CSV)
          </button>
          <button
            onClick={exportCoursesJson}
            className="admin-btn"
          >
            📚 导出课程列表 (JSON)
          </button>
        </div>
      </div>

      <hr />

      {/* Import */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">数据导入</h3>

        <div className="flex gap-3 mb-4">
          {(['teachers', 'courses'] as const).map((t) => (
            <label key={t} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="importType"
                value={t}
                checked={importType === t}
                onChange={() => setImportType(t)}
                className="text-teal-600"
              />
              <span className="text-sm text-gray-700">{t === 'teachers' ? '导入教师信息' : '导入课程信息'}</span>
            </label>
          ))}
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-teal-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => handleImport(e.target.files)}
          />
          <div className="text-3xl mb-2">📂</div>
          <div className="text-sm text-gray-600">点击选择文件（JSON / CSV / Excel）</div>
          <div className="text-xs text-gray-400 mt-1">导入将合并现有数据（按 ID 去重）</div>
        </div>

        {status && (
          <div className="mt-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
            {status}
          </div>
        )}
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
      </div>

      <hr />

      {/* Format examples */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">格式示例</h3>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">教师信息 JSON 格式：</div>
            <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded overflow-x-auto">{TEACHER_JSON_EXAMPLE}</pre>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">教师信息 CSV 格式：</div>
            <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded overflow-x-auto">{TEACHER_CSV_EXAMPLE}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
