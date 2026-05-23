import Video from '../models/Video.js';

export const getVideos = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role === 'patient') {
      query.targetRole = { $in: ['patient', 'both'] };
    } else if (role === 'caregiver') {
      query.targetRole = { $in: ['caregiver', 'both'] };
    }

    const videos = await Video.find(query).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
};

export const createVideo = async (req, res) => {
  try {
    const { title, url, description, targetRole } = req.body;
    
    let finalUrl = '';
    
    if (req.file) {
      finalUrl = `/uploads/${req.file.filename}`;
    } else if (url) {
      let embedUrl = url;
      if (url.includes('youtube.com/watch?v=')) {
          const videoId = url.split('v=')[1].split('&')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
          const videoId = url.split('youtu.be/')[1].split('?')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      finalUrl = embedUrl;
    } else {
      return res.status(400).json({ message: 'Either video file or URL is required' });
    }

    const newVideo = new Video({
      title,
      url: finalUrl,
      description,
      targetRole,
      // uploadedBy: req.user?._id // if authentication middleware is used
    });

    const savedVideo = await newVideo.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating video', error: error.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVideo = await Video.findByIdAndDelete(id);
    if (!deletedVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting video', error: error.message });
  }
};
