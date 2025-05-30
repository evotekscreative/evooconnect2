import React from 'react';
import Sidebar from '../../../components/Admin/Sidebar/Sidebar';
import { FaFileAlt } from 'react-icons/fa';

const dummyReportBlog = [
  {
    id: 1,
    title: 'Blog tentang Politik',
    reporter: 'User123',
    reason: 'Mengandung ujaran kebencian',
    date: '2025-05-20'
  },
  {
    id: 2,
    title: 'Artikel Konspirasi',
    reporter: 'User456',
    reason: 'Berita tidak benar (hoax)',
    date: '2025-05-22'
  },
  // Tambahkan data lainnya jika perlu
];

const ReportBlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="hidden lg:block w-64">
        <Sidebar />
      </div>

      <main className="flex-1 p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaFileAlt /> Report Blog
        </h1>

        <div className="bg-white rounded-xl shadow p-4">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Judul Blog</th>
                <th className="px-4 py-2">Dilaporkan Oleh</th>
                <th className="px-4 py-2">Alasan</th>
                <th className="px-4 py-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {dummyReportBlog.map((report, index) => (
                <tr key={report.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{report.title}</td>
                  <td className="px-4 py-2">{report.reporter}</td>
                  <td className="px-4 py-2">{report.reason}</td>
                  <td className="px-4 py-2">{report.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ReportBlogPage;
