import React, { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import { Film, PlayCircle } from 'lucide-react';

const videoBaseUrl = (() => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiUrl) return apiUrl.replace(/\/api.*$/, '');
  return window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
})();

export default function VideosSection({ language, userRole }) {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, [userRole]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const data = await videoService.getVideos(userRole);
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const titleText = language === 'fr' ? 'Vidéos Éducatives' : language === 'ar' || language === 'tn' ? 'فيديوهات تعليمية' : 'Educational Videos';
  const subtitleText = language === 'fr' ? 'Conseils et instructions pour vous' : language === 'ar' || language === 'tn' ? 'نصائح وتعليمات لك' : 'Tips and instructions for you';

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-[3rem] p-8 sm:p-12 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 flex items-center gap-4">
            <Film className="w-10 h-10" />
            {titleText}
          </h2>
          <p className="text-teal-100 text-xl font-bold">{subtitleText}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold text-lg">Loading videos...</p>
        </div>
      ) : !videos || videos.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
          <Film className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <p className="text-2xl font-bold text-slate-400">No videos available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map(video => (
            <div key={video._id} className="bg-white rounded-[2.5rem] overflow-hidden border-4 border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col group">
              <div className="relative pt-[56.25%] bg-slate-900">
                {video.url ? (
                  video.url.includes('/uploads/') ? (
                    <video 
                      src={(!video.url.startsWith('http') ? videoBaseUrl : '') + video.url} 
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
                    <PlayCircle className="w-16 h-16 text-slate-600" />
                  </div>
                )}
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="font-black text-2xl text-slate-800 mb-3 group-hover:text-teal-700 transition-colors">{video.title}</h3>
                <p className="text-slate-500 font-medium text-lg flex-1">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
