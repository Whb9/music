// src/components/TeacherCard.tsx
import React from 'react';
import Link from 'next/link';
import type { Teacher } from '@/types';

interface TeacherCardProps {
  teacher: Teacher;
  showLink?: boolean;
}

export default function TeacherCard({ teacher, showLink = true }: TeacherCardProps) {
  const card = (
    <div className="border border-gray-200 bg-white rounded overflow-hidden text-center p-4 w-52">
      <img
        src={teacher.avatar}
        alt={teacher.name}
        className="w-full h-48 object-cover rounded mb-3"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23888' font-size='14'%3E暂无头像%3C/text%3E%3C/svg%3E`;
        }}
      />
      <div className="text-sm font-bold text-gray-800">{teacher.title}：{teacher.name}</div>
      {teacher.rank && (
        <div className="text-xs text-gray-500 mt-1">{teacher.rank}</div>
      )}
    </div>
  );

  if (showLink) {
    return (
      <Link href={`/teachers/${teacher.id}`} className="hover:shadow-lg transition-shadow inline-block">
        {card}
      </Link>
    );
  }

  return card;
}
