import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const mockVideos = [
  {
    id: '1',
    title: 'Match vs. Lions',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    title: 'Training Session - Passing Drills',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '3',
    title: 'Match vs. Tigers',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '4',
    title: 'Training Session - Shooting Practice',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=400&q=80',
  },
];

const mockPerformance = [
  { player: 'Liam Carter', speed: 8.5, endurance: 9.0, technical: 8.0, rating: 8.7, passes: 45, goals: 2 },
  { player: 'Noah Bennett', speed: 7.8, endurance: 8.2, technical: 7.5, rating: 7.9, passes: 38, goals: 1 },
  { player: 'Ethan Parker', speed: 8.2, endurance: 8.8, technical: 8.5, rating: 8.5, passes: 50, goals: 1 },
  { player: 'Oliver Reed', speed: 7.5, endurance: 7.9, technical: 7.0, rating: 7.5, passes: 35, goals: 0 },
  { player: 'Lucas Hayes', speed: 8.0, endurance: 8.5, technical: 8.0, rating: 8.2, passes: 42, goals: 1 },
  { player: 'Mason Foster', speed: 7.7, endurance: 8.0, technical: 7.2, rating: 7.7, passes: 37, goals: 0 },
  { player: 'Logan Brooks', speed: 8.3, endurance: 8.9, technical: 8.7, rating: 8.6, passes: 52, goals: 2 },
  { player: 'Owen Hughes', speed: 7.6, endurance: 7.8, technical: 7.1, rating: 7.4, passes: 34, goals: 0 },
  { player: 'Caleb Morgan', speed: 8.1, endurance: 8.6, technical: 8.2, rating: 8.3, passes: 44, goals: 1 },
  { player: 'Jackson Cole', speed: 7.9, endurance: 8.3, technical: 7.7, rating: 8.0, passes: 40, goals: 1 },
];

const VideoAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const video = mockVideos.find(v => v.id === id) || mockVideos[0];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <button
        className="mb-4 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 rounded text-white font-semibold border border-purple-600 transition"
        onClick={() => navigate('/coach/matches')}
      >
        ← Back to Matches
      </button>
      <h1 className="text-3xl font-bold mb-6 text-white">Video Analysis</h1>
      <div className="mb-6">
        <label className="block font-semibold mb-2 text-white">Match Overview</label>
        <select className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-purple-500 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option>{video.title}</option>
        </select>
        <div className="flex justify-center mb-8">
          <video
            src={video.videoUrl}
            poster={video.thumbnail}
            controls
            className="rounded-lg shadow-xl border border-purple-600 w-full max-w-2xl h-80 object-cover"
          />
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-white">Player Performance</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gradient-to-br from-slate-800 to-purple-800 rounded-lg border border-purple-600">
          <thead>
            <tr className="bg-slate-900">
              <th className="px-4 py-2 text-left text-white">Player</th>
              <th className="px-4 py-2 text-left text-white">Speed</th>
              <th className="px-4 py-2 text-left text-white">Endurance</th>
              <th className="px-4 py-2 text-left text-white">Technical Skills</th>
              <th className="px-4 py-2 text-left text-white">Match Rating</th>
              <th className="px-4 py-2 text-left text-white">Passes</th>
              <th className="px-4 py-2 text-left text-white">Goals</th>
            </tr>
          </thead>
          <tbody>
            {mockPerformance.map((row, i) => (
              <tr key={i} className="border-t border-purple-700 hover:bg-slate-700 transition-colors">
                <td className="px-4 py-2 font-semibold text-white">{row.player}</td>
                <td className="px-4 py-2 text-purple-200">{row.speed}</td>
                <td className="px-4 py-2 text-purple-200">{row.endurance}</td>
                <td className="px-4 py-2 text-purple-200">{row.technical}</td>
                <td className="px-4 py-2 text-purple-200">{row.rating}</td>
                <td className="px-4 py-2 text-purple-200">{row.passes}</td>
                <td className="px-4 py-2 text-purple-200">{row.goals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VideoAnalysis; 