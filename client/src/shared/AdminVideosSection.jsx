import React, { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import { PlayCircle, Trash2, Plus, Film } from 'lucide-react';
import { translations } from './translations';
import { API_BASE } from '../services/api';

export default function AdminVideosSection({ language }) {
  const ta = (translations[language] || translations.fr).admin;
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [targetRole, setTargetRole] = useState('both');
  const [uploadType, setUploadType] = useState('url');
  const [videoFile, setVideoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const data = await videoService.getVideos('admin');
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!title) return;
    if (uploadType === 'url' && !url) return;
    if (uploadType === 'file' && !videoFile) return;

    try {
      let data;
      if (uploadType === 'file') {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('targetRole', targetRole);
        formData.append('videoFile', videoFile);
        data = formData;
      } else {
        data = { title, url, description, targetRole };
      }

      await videoService.createVideo(data);
      setTitle('');
      setUrl('');
      setVideoFile(null);
      setDescription('');
      setTargetRole('both');
      fetchVideos();
    } catch (err) {
      console.error(err);
      alert('Error adding video');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(ta.confirmDeleteVideo || 'Are you sure you want to delete this video?')) return;
    try {
      await videoService.deleteVideo(id);
      fetchVideos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
          <Film className="w-8 h-8 text-teal-600" />
          {ta.manageVideos || 'Manage Educational Videos'}
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6">{ta.addNewVideo || 'Add New Video'}</h3>
        <form onSubmit={handleAddVideo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{ta.videoTitle || 'Title'}</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder={ta.titlePlaceholder || "E.g., How to take Paracetamol"} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">{ta.videoSource || 'Video Source'}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={uploadType === 'url'} onChange={() => setUploadType('url')} className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-slate-700">{ta.youtubeUrl || 'YouTube URL'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={uploadType === 'file'} onChange={() => setUploadType('file')} className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-slate-700">{ta.uploadMp4 || 'Upload MP4 File'}</span>
                </label>
              </div>
            </div>
            {uploadType === 'url' ? (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{ta.youtubeUrl || 'YouTube URL'}</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{ta.selectMp4 || 'Select MP4 File'}</label>
                <input type="file" accept="video/mp4" onChange={(e) => setVideoFile(e.target.files[0])} required className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">{ta.videoDescription || 'Description'}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder={ta.descPlaceholder || "Brief description of the video..."} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{ta.targetAudience || 'Target Audience'}</label>
              <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="both">{ta.bothAudience || 'Both Patient & Caregiver'}</option>
                <option value="patient">{ta.patientsOnly || 'Patients Only'}</option>
                <option value="caregiver">{ta.caregiversOnly || 'Caregivers Only'}</option>
              </select>
            </div>
          </div>
          <button type="submit" className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-teal-700">
            <Plus className="w-5 h-5" /> {ta.addVideo || 'Add Video'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-slate-500 font-bold col-span-full">{ta.loadingVideos || 'Loading videos...'}</p>
        ) : !videos || videos.length === 0 ? (
          <p className="text-slate-500 font-bold col-span-full">{ta.noVideos || 'No videos uploaded yet.'}</p>
        ) : (
          videos.map(video => (
            <div key={video._id} className="bg-white rounded-3xl overflow-hidden border-2 border-slate-100 shadow-sm flex flex-col">
              <div className="relative pt-[56.25%] bg-slate-100">
                {video.url ? (
                  video.url.includes('/uploads/') ? (
                    <video 
                      src={(!video.url.startsWith('http') ? API_BASE : '') + video.url} 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      controls
                    ></video>
                  ) : (
                    <iframe 
                      src={video.url} 
                      className="absolute top-0 left-0 w-full h-full"
                      allowFullScreen
                      title={video.title}
                    ></iframe>
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h4 className="font-black text-lg text-slate-800 mb-2">{video.title}</h4>
                <p className="text-slate-500 text-sm mb-4 flex-1">{video.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full capitalize">
                    {video.targetRole === 'both' ? (ta.bothAudience || 'Both Patient & Caregiver') : 
                     video.targetRole === 'patient' ? (ta.patientsOnly || 'Patients Only') :
                     video.targetRole === 'caregiver' ? (ta.caregiversOnly || 'Caregivers Only') : 
                     video.targetRole}
                  </span>
                  <button onClick={() => handleDelete(video._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
