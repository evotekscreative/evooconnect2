import React from 'react';
import Sidebar from '../../../components/Admin/Sidebar/Sidebar';
import { FaCommentDots } from 'react-icons/fa';

const dummyReportComment = [
  {
    id: 1,
    content: 'Komentar yang tidak sopan',
    reporter: 'User789',
    reason: 'Mengandung kata kasar',
    date: '2025-05-21'
  },
  {
    id: 2,
    content: 'Komentar spam promosi',
    reporter: 'User321',
    reason: 'Spam',
    date: '2025-05-23'
  },
  // Tambahkan data lainnya jika perlu
];

const ReportCommentPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="hidden lg:block w-64">
        <Sidebar />
      </div>

      <main className="flex-1 p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaCommentDots /> Report Comment
        </h1>

        <div className="bg-white rounded-xl shadow p-4">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Isi Komentar</th>
                <th className="px-4 py-2">Dilaporkan Oleh</th>
                <th className="px-4 py-2">Alasan</th>
                <th className="px-4 py-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {dummyReportComment.map((report, index) => (
                <tr key={report.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{report.content}</td>
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

export default ReportCommentPage;
