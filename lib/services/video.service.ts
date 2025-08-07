import Video, { IVideo } from '@/lib/models/Video';
import dbConnect from '@/lib/dbConnect';

export class VideoService {
  // Get all videos (with optional filtering)
  static async getAllVideos(filters?: {
    isPublic?: boolean;
    isLiveEvent?: boolean;
    associatedEvent?: string;
  }) {
    await dbConnect();

    const query: any = {};

    if (filters?.isPublic !== undefined) {
      query.isPublic = filters.isPublic;
    }

    if (filters?.isLiveEvent !== undefined) {
      query.isLiveEvent = filters.isLiveEvent;
    }

    if (filters?.associatedEvent) {
      query.associatedEvent = filters.associatedEvent;
    }

    return await Video.find(query)
      .populate('associatedEvent')
      .sort({ createdAt: -1 });
  }

  // Get video by ID
  static async getVideoById(id: string): Promise<IVideo | null> {
    await dbConnect();

    try {
      return await Video.findById(id).populate('associatedEvent');
    } catch (error) {
      console.error('Error fetching video by ID:', error);
      return null;
    }
  }

  // Create new video
  static async createVideo(videoData: Partial<IVideo>): Promise<IVideo | null> {
    await dbConnect();

    try {
      const video = new Video(videoData);
      return await video.save();
    } catch (error) {
      console.error('Error creating video:', error);
      return null;
    }
  }

  // Update video
  static async updateVideo(
    id: string,
    updateData: Partial<IVideo>
  ): Promise<IVideo | null> {
    await dbConnect();

    try {
      return await Video.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('associatedEvent');
    } catch (error) {
      console.error('Error updating video:', error);
      return null;
    }
  }

  // Delete video
  static async deleteVideo(id: string): Promise<boolean> {
    await dbConnect();

    try {
      const result = await Video.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting video:', error);
      return false;
    }
  }

  // Get live events
  static async getLiveEvents(): Promise<IVideo[]> {
    await dbConnect();

    try {
      const now = new Date();
      return await Video.find({
        isLiveEvent: true,
        isPublic: true,
        scheduledStartTime: { $lte: now },
      }).populate('associatedEvent');
    } catch (error) {
      console.error('Error fetching live events:', error);
      return [];
    }
  }

  // Get upcoming live events
  static async getUpcomingLiveEvents(): Promise<IVideo[]> {
    await dbConnect();

    try {
      const now = new Date();
      return await Video.find({
        isLiveEvent: true,
        scheduledStartTime: { $gt: now },
        isPublic: true,
      })
        .populate('associatedEvent')
        .sort({ scheduledStartTime: 1 });
    } catch (error) {
      console.error('Error fetching upcoming live events:', error);
      return [];
    }
  }

  // Increment view count
  static async incrementViewCount(id: string): Promise<boolean> {
    await dbConnect();

    try {
      const video = await Video.findById(id);
      if (!video) {
        return false;
      }

      video.viewCount += 1;
      await video.save();
      return true;
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return false;
    }
  }

  // Get videos by event
  static async getVideosByEvent(eventId: string): Promise<IVideo[]> {
    await dbConnect();

    try {
      return await Video.find({ associatedEvent: eventId })
        .populate('associatedEvent')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching videos by event:', error);
      return [];
    }
  }

  // Get public videos
  static async getPublicVideos(): Promise<IVideo[]> {
    await dbConnect();

    try {
      return await Video.find({ isPublic: true })
        .populate('associatedEvent')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching public videos:', error);
      return [];
    }
  }
}
