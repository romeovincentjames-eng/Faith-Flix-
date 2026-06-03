import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { translate } from "./i18n";
import {
  Bell,
  BookOpen,
  Bookmark,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Cross,
  Crown,
  Edit3,
  Eye,
  EyeOff,
  Film,
  Heart,
  HeartHandshake,
  Home,
  Inbox,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageCircle,
  MessagesSquare,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./styles.css";

type Page =
  | "home"
  | "watch"
  | "series"
  | "upload"
  | "community"
  | "worship"
  | "saved"
  | "profile"
  | "forgot-password"
  | "admin-login"
  | "admin-studio"
  | "rules";
type CommunityView = "feed" | "prayer" | "upload" | "groups" | "friends" | "messages";
type StudioView = "dashboard" | "upload" | "videos" | "series" | "categories" | "reviews" | "takedown" | "rules";
type Status = "Draft" | "Published" | "Hidden";
type UploadStatus = "Pending Review" | "Approved" | "Rejected" | "Edits Requested";

type Profile = {
  id: string;
  role: "admin" | "user";
  name: string;
  username: string;
  email: string;
  password?: string;
  birthday?: string;
  image?: string;
  bio?: string;
  favoriteScripture?: string;
  ministry?: string;
  location?: string;
};

type VideoItem = {
  id: string;
  source: "admin" | "user";
  title: string;
  description: string;
  scripture: string;
  category: string;
  seriesId: string;
  episode: string;
  duration: string;
  creator: string;
  tags: string;
  status: Status;
  featured?: boolean;
  videoName: string;
  videoUrl?: string;
  thumbnailName: string;
  thumbnailUrl?: string;
  cropDimension?: string;
  cropRatio?: string;
  createdAt: string;
};

type SeriesItem = {
  id: string;
  title: string;
  description: string;
  posterName: string;
  posterUrl?: string;
  scriptureTheme: string;
  category: string;
  status: Status;
  featured?: boolean;
};

type CategoryItem = { id: string; name: string; hidden: boolean; custom: boolean };
type UserUpload = {
  id: string;
  userId: string;
  title: string;
  description: string;
  scripture: string;
  category: string;
  testimonyType: string;
  visibility: string;
  tags: string;
  videoName: string;
  videoUrl?: string;
  thumbnailName: string;
  thumbnailUrl?: string;
  cropDimension: string;
  cropRatio: string;
  status: UploadStatus;
  adminNote: string;
};
type CommentItem = { id: string; targetId: string; author: string; text: string; createdAt: string };
type CommunityPost = { id: string; userId: string; author: string; text: string; scripture: string; imageName: string; imageUrl?: string; likes: string[]; saves: string[]; reports: string[] };
type PrayerRequest = { id: string; userId: string; title: string; text: string; visibility: string; actions: Record<string, string[]> };
type FriendRequest = { id: string; fromId: string; toId: string; status: "pending" | "accepted" };
type Message = { id: string; fromId: string; toId: string; text: string; createdAt: string };
type SavedList = { id: string; name: string; videoIds: string[] };
type UploadProgress = { active: boolean; value: number; label: string };
type WorshipSong = { id: string; title: string; artist: string; description: string; category: string; duration: string; audioName: string; audioUrl?: string; coverName: string; coverUrl?: string; uploadedBy: string; createdAt: string };

const adminEmail = "romeovgalasso@gmail.com";
const adminPassword = "Rvjg123100";
const mediaBucket = "faithflix-media";

const starterVideoIds = ["starter-jael", "starter-moses", "starter-elijah"];
const starterSeriesIds = ["starter-ai-scripture-visuals"];

const defaultCategories = [
  "Bible Stories",
  "Sermons",
  "Worship Videos",
  "Testimonies",
  "Christian Short Films",
  "Faith Music Visuals",
  "Gospel Messages",
  "Christian Motivation",
  "Youth Faith Content",
  "Family Faith Content",
  "Vertical Faith Series",
  "Animated Bible Stories",
  "Church Clips",
  "Pastor Teachings",
  "Faith Trailers",
  "Scripture Reflections",
  "Devotional Clips",
  "Bible Study Content",
  "Christian Creator Videos",
  "Church Media",
  "Faith Journey Videos",
].map((name, index) => ({ id: `cat-${index}`, name, hidden: false, custom: false }));

const COMMUNITY_VIDEO_CATEGORIES = [
  "Testimonies",
  "Devotional Clips",
  "Church Clips",
  "Worship Videos",
  "Bible Stories",
];

const MOCK_VIDEOS: VideoItem[] = [
  { id: "mock-v1", source: "admin", title: "Walking by Faith", description: "A powerful message on what it truly means to trust God in every season of life, even when you cannot see the path ahead.", scripture: "2 Corinthians 5:7", category: "Sermons", seriesId: "Faith Journey", episode: "1", duration: "12:34", creator: "Pastor James Rivers", tags: "faith, trust, walk", status: "Published", featured: false, videoName: "walking-by-faith.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumbnailName: "sunrise.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-10" },
  { id: "mock-v2", source: "admin", title: "The Power of the Cross", description: "Discover the transforming power of the cross and what Jesus's sacrifice means for our lives today.", scripture: "1 Corinthians 1:18", category: "Gospel Messages", seriesId: "Gospel Messages Origins", episode: "1", duration: "8:45", creator: "Faith Flix", tags: "cross, gospel, salvation", status: "Published", featured: true, videoName: "power-of-cross.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", thumbnailName: "cross-sunset.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-12" },
  { id: "mock-v3", source: "admin", title: "Worship in Spirit and Truth", description: "A worship experience that invites deeper connection with God through song and scripture.", scripture: "John 4:24", category: "Worship Videos", seriesId: "Worship Videos Origins", episode: "1", duration: "18:20", creator: "Elevation Worship", tags: "worship, spirit", status: "Published", featured: true, videoName: "worship-spirit.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", thumbnailName: "worship.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-14" },
  { id: "mock-v4", source: "admin", title: "In the Beginning", description: "An animated retelling of Genesis chapter 1 from darkness to the first breath of creation.", scripture: "Genesis 1:1", category: "Animated Bible Stories", seriesId: "Genesis Unlocked", episode: "1", duration: "6:15", creator: "BibleVision Studios", tags: "creation, genesis", status: "Published", videoName: "in-the-beginning.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", thumbnailName: "creation.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-16" },
  { id: "mock-v5", source: "admin", title: "Still Small Voice", description: "A devotional on hearing God's voice in the chaos and quieting your heart to listen.", scripture: "1 Kings 19:12", category: "Devotional Clips", seriesId: "Quiet Time", episode: "3", duration: "9:02", creator: "Daily Bread Ministries", tags: "devotional, stillness", status: "Published", videoName: "still-small-voice.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", thumbnailName: "forest-light.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-18" },
  { id: "mock-v6", source: "admin", title: "My Healing Testimony", description: "Sarah shares the story of how God healed her after years of chronic illness.", scripture: "Psalm 103:3", category: "Testimonies", seriesId: "Testimonies Origins", episode: "1", duration: "15:50", creator: "Sarah M.", tags: "healing, testimony", status: "Published", videoName: "healing-testimony.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumbnailName: "praying-hands.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1510836217651-1a1b2f98d7de?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-20" },
  { id: "mock-v7", source: "admin", title: "Sermon on the Mount", description: "A visual Bible study through the Beatitudes and the Kingdom way.", scripture: "Matthew 5:3-12", category: "Bible Study Content", seriesId: "Red Letter Series", episode: "2", duration: "22:08", creator: "The Bible Project", tags: "sermon, beatitudes", status: "Published", videoName: "sermon-mount.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", thumbnailName: "bible-open.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-22" },
  { id: "mock-v8", source: "admin", title: "Grace Like Rain", description: "A cinematic worship visual experience set to original music about God's grace.", scripture: "Ephesians 2:8", category: "Faith Music Visuals", seriesId: "Faith Music Visuals Origins", episode: "1", duration: "5:33", creator: "Hillsong Creative", tags: "grace, music", status: "Published", featured: true, videoName: "grace-like-rain.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", thumbnailName: "candles.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1511516412963-801b050c3434?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-24" },
  { id: "mock-v9", source: "admin", title: "The Prodigal Son", description: "A short cinematic film retelling the parable of the prodigal son in a modern setting.", scripture: "Luke 15:11-32", category: "Christian Short Films", seriesId: "Parables of Jesus", episode: "1", duration: "28:14", creator: "RedemptionFilms", tags: "prodigal, film", status: "Published", videoName: "prodigal-son.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", thumbnailName: "church-interior.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-26" },
  { id: "mock-u1", source: "user", title: "God Helped Me Forgive", description: "A personal testimony about forgiveness after years of bitterness.", scripture: "Colossians 3:13", category: "Testimonies", seriesId: "", episode: "", duration: "2:12", creator: "Grace Walker", tags: "forgiveness, testimony", status: "Published", videoName: "forgiveness-testimony.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", thumbnailName: "forgiveness.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-02-05" },
  { id: "mock-u2", source: "user", title: "Morning Scripture Walk", description: "A short reflection recorded during a morning walk with Psalm 23.", scripture: "Psalm 23:1", category: "Devotional Clips", seriesId: "", episode: "", duration: "1:44", creator: "David Chen", tags: "devotional, psalm", status: "Published", videoName: "morning-scripture.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", thumbnailName: "morning-walk.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=500&q=80", cropDimension: "4:5", cropRatio: "4 / 5", createdAt: "2024-02-07" },
  { id: "mock-u3", source: "user", title: "Worship Clip From Church", description: "A community worship moment shared after Sunday service.", scripture: "Psalm 100:2", category: "Church Clips", seriesId: "", episode: "", duration: "0:58", creator: "Miriam Johnson", tags: "church, worship", status: "Published", videoName: "church-worship.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumbnailName: "church-clip.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=500&q=80", cropDimension: "1:1", cropRatio: "1 / 1", createdAt: "2024-02-09" },
];

const categoryMockImages = [
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80",
  "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=500&q=80",
  "https://images.unsplash.com/photo-1510836217651-1a1b2f98d7de?w=500&q=80",
  "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=500&q=80",
  "https://images.unsplash.com/photo-1511516412963-801b050c3434?w=500&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&q=80",
  "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=500&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=500&q=80",
];

const CATEGORY_MOCK_VIDEOS: VideoItem[] = defaultCategories.map((category, index) => ({
  id: `mock-cat-video-${index}`,
  source: "admin",
  title: `${category.name} Preview`,
  description: `Demo content for the ${category.name} category so you can see how this section looks with videos loaded.`,
  scripture: ["Psalm 119:105", "Romans 8:28", "Isaiah 41:10", "Matthew 5:16"][index % 4],
  category: category.name,
  seriesId: category.name + " Origins",
  episode: String((index % 6) + 1),
  duration: `${6 + (index % 12)}:${String(10 + index).padStart(2, "0")}`,
  creator: "Faith Flix Demo",
  tags: `demo, ${category.name.toLowerCase()}`,
  status: "Published",
  featured: index % 7 === 0,
  videoName: `${category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-demo.mp4`,
  videoUrl: [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  ][index % 3],
  thumbnailName: `${category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,
  thumbnailUrl: categoryMockImages[index % categoryMockImages.length],
  cropDimension: "9:16",
  cropRatio: "9 / 16",
  createdAt: `2024-03-${String(index + 1).padStart(2, "0")}`,
}));

const COMMUNITY_SHARE_MOCK_VIDEOS: VideoItem[] = COMMUNITY_VIDEO_CATEGORIES.map((categoryName, index) => {
  const category = { name: categoryName };
  return ({
  id: `mock-share-video-${index}`,
  source: "user",
  title: `${category.name} Community Share`,
  description: `Mock community share for ${category.name} so the Shares filter has content in this category.`,
  scripture: ["Psalm 34:8", "Philippians 4:13", "John 3:16", "Proverbs 3:5"][index % 4],
  category: category.name,
  seriesId: "",
  episode: "",
  duration: `${1 + (index % 4)}:${String(20 + index).padStart(2, "0")}`,
  creator: ["Grace Walker", "David Chen", "Miriam Johnson", "Pastor Samuel", "Ruth Adeyemi"][index % 5],
  tags: `community, share, ${category.name.toLowerCase()}`,
  status: "Published",
  featured: false,
  videoName: `${category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-community-share.mp4`,
  videoUrl: [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  ][index % 3],
  thumbnailName: `${category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-community.jpg`,
  thumbnailUrl: categoryMockImages[(index + 3) % categoryMockImages.length],
  cropDimension: ["9:16", "4:5", "1:1"][index % 3],
  cropRatio: ["9 / 16", "4 / 5", "1 / 1"][index % 3],
  createdAt: `2024-05-${String((index % 25) + 1).padStart(2, "0")}`,
});
});

const MOCK_SERIES: SeriesItem[] = [
  { id: "mock-s1", title: "Faith Journey", description: "A 6-part series on the foundations of Christian faith for believers at every stage of their walk.", posterName: "faith-journey.jpg", posterUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", scriptureTheme: "Hebrews 11:1", category: "Sermons", status: "Published", featured: true },
  { id: "mock-s2", title: "Genesis Unlocked", description: "Animated exploration of Genesis from creation to Joseph, brought to life in stunning detail.", posterName: "genesis.jpg", posterUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", scriptureTheme: "Genesis 1:1", category: "Animated Bible Stories", status: "Published", featured: false },
  { id: "mock-s3", title: "Red Letter Series", description: "Deep dives into the words of Jesus, parables, and teachings of Christ.", posterName: "red-letter.jpg", posterUrl: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=400&q=80", scriptureTheme: "Matthew 5-7", category: "Bible Study Content", status: "Published", featured: true },
  { id: "mock-s4", title: "Heroes of Faith", description: "Bible stories about courage, obedience, and trusting God when it matters most.", posterName: "heroes-faith.jpg", posterUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80", scriptureTheme: "Hebrews 11", category: "Bible Stories", status: "Published", featured: true },
  { id: "mock-s5", title: "Faith at Home", description: "Short teachings for families who want to grow closer to God together.", posterName: "faith-home.jpg", posterUrl: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&q=80", scriptureTheme: "Joshua 24:15", category: "Family Faith Content", status: "Published", featured: false },
  { id: "mock-s6", title: "Next Gen Faith", description: "Youth-focused messages, recaps, and encouragement for students following Jesus.", posterName: "next-gen.jpg", posterUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80", scriptureTheme: "1 Timothy 4:12", category: "Youth Faith Content", status: "Published", featured: false },
  { id: "mock-s7", title: "Parables of Jesus", description: "Cinematic shorts based on the stories Jesus told.", posterName: "parables.jpg", posterUrl: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=400&q=80", scriptureTheme: "Luke 15", category: "Christian Short Films", status: "Published", featured: true },
];

const seriesMockImages = [
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80",
  "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=500&q=80",
  "https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=500&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=500&q=80",
];

const CATEGORY_MOCK_SERIES: SeriesItem[] = defaultCategories.flatMap((category, categoryIndex) =>
  ["Origins", "Deep Dive", "Visual Guide"].map((label, seriesIndex) => ({
    id: "mock-cat-series-" + categoryIndex + "-" + seriesIndex,
    title: category.name + " " + label,
    description: "Demo series for " + category.name + " so you can preview a full category list with multiple options.",
    posterName: category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + seriesIndex + ".jpg",
    posterUrl: seriesMockImages[(categoryIndex + seriesIndex) % seriesMockImages.length],
    scriptureTheme: ["John 15:5", "Psalm 119:105", "Romans 8:28"][seriesIndex],
    category: category.name,
    status: "Published" as Status,
    featured: seriesIndex === 0,
  }))
);

const CATEGORY_SERIES_MOCK_VIDEOS: VideoItem[] = CATEGORY_MOCK_SERIES.flatMap((series, index) =>
  [1, 2].map((episodeNumber) => ({
    id: "mock-cat-series-video-" + index + "-" + episodeNumber,
    source: "admin" as const,
    title: series.title + " Ep " + episodeNumber,
    description: "Preview episode " + episodeNumber + " for " + series.title + ".",
    scripture: series.scriptureTheme,
    category: series.category,
    seriesId: series.title,
    episode: String(episodeNumber),
    duration: String(8 + (index % 7)) + ":" + String(episodeNumber * 11).padStart(2, "0"),
    creator: "Faith Flix Demo",
    tags: "demo, " + series.category.toLowerCase(),
    status: "Published" as Status,
    featured: false,
    videoName: series.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + episodeNumber + ".mp4",
    videoUrl: [
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    ][episodeNumber - 1],
    thumbnailName: series.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + episodeNumber + ".jpg",
    thumbnailUrl: series.posterUrl,
    cropDimension: "9:16",
    cropRatio: "9 / 16",
    createdAt: "2024-04-" + String((index % 25) + 1).padStart(2, "0"),
  }))
);

const USER_SERIES_MOCK: SeriesItem[] = defaultCategories.map((category, index) => ({
  id: `mock-user-series-${index}`,
  title: `${category.name} Community Series`,
  description: `Mock user-created series for ${category.name}.`,
  posterName: `${category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-community-series.jpg`,
  posterUrl: seriesMockImages[index % seriesMockImages.length],
  scriptureTheme: ["Psalm 96:1", "Romans 12:2", "Matthew 28:19"][index % 3],
  category: category.name,
  status: "Published" as Status,
  featured: index % 5 === 0,
}));

const USER_SERIES_MOCK_VIDEOS: VideoItem[] = USER_SERIES_MOCK.flatMap((series, index) =>
  [1, 2].map((episodeNumber) => ({
    id: `mock-user-series-video-${index}-${episodeNumber}`,
    source: "user" as const,
    title: `${series.title} Episode ${episodeNumber}`,
    description: `Community-made episode ${episodeNumber} for ${series.title}.`,
    scripture: series.scriptureTheme,
    category: series.category,
    seriesId: series.title,
    episode: String(episodeNumber),
    duration: `${3 + (index % 6)}:${String(episodeNumber * 13).padStart(2, "0")}`,
    creator: ["Grace Walker", "David Chen", "Miriam Johnson", "Pastor Samuel", "Ruth Adeyemi"][index % 5],
    tags: `community series, ${series.category.toLowerCase()}`,
    status: "Published" as Status,
    featured: false,
    videoName: `${series.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${episodeNumber}.mp4`,
    videoUrl: [
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    ][episodeNumber - 1],
    thumbnailName: `${series.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${episodeNumber}.jpg`,
    thumbnailUrl: series.posterUrl,
    cropDimension: "9:16",
    cropRatio: "9 / 16",
    createdAt: `2024-06-${String((index % 25) + 1).padStart(2, "0")}`,
  }))
);

const MOCK_WORSHIP_SONGS: WorshipSong[] = [
  {
    id: "song-all-my-life",
    title: "All My Life",
    artist: "Romeo Galasso",
    description: "Original worship song uploaded for Faith Flix.",
    category: "Worship",
    duration: "",
    audioName: "all-my-life.mp3",
    audioUrl: "/worship/all-my-life.mp3",
    coverName: "faith-cross-background.png",
    coverUrl: "/faith-cross-background.png",
    uploadedBy: "Romeo Galasso",
    createdAt: "2026-06-02",
  },
  {
    id: "song-hear-the-father-say",
    title: "Hear the Father Say",
    artist: "Romeo Galasso",
    description: "Original worship song uploaded for Faith Flix.",
    category: "Worship",
    duration: "",
    audioName: "hear-the-father-say.mp3",
    audioUrl: "/worship/hear-the-father-say.mp3",
    coverName: "faith-cross-background.png",
    coverUrl: "/faith-cross-background.png",
    uploadedBy: "Romeo Galasso",
    createdAt: "2026-06-02",
  },
];

const ALL_MOCK_SERIES = mergeById(mergeById(MOCK_SERIES, CATEGORY_MOCK_SERIES), USER_SERIES_MOCK);
const ALL_MOCK_VIDEOS = mergeById(mergeById(mergeById(mergeById(MOCK_VIDEOS, CATEGORY_MOCK_VIDEOS), CATEGORY_SERIES_MOCK_VIDEOS), COMMUNITY_SHARE_MOCK_VIDEOS), USER_SERIES_MOCK_VIDEOS);

const MOCK_POSTS: CommunityPost[] = [
  { id: "mock-p1", userId: "mock-user1", author: "Grace Walker", text: "God has been so faithful this week. After months of waiting, my prayers were answered in the most unexpected way. Never stop trusting Him!", scripture: "Psalm 27:14", imageName: "sunrise-testimony.jpg", imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80", likes: ["a", "b", "c", "d"], saves: ["a"], reports: [] },
  { id: "mock-p2", userId: "mock-user2", author: "David Chen", text: "Reminder: You are not defined by your past. In Christ, you are a new creation. Keep walking forward.", scripture: "2 Corinthians 5:17", imageName: "open-bible.jpg", imageUrl: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=800&q=80", likes: ["a", "b", "c", "d", "e"], saves: ["a", "b"], reports: [] },
  { id: "mock-p3", userId: "mock-user3", author: "Miriam Johnson", text: "Our church had the most beautiful sunrise prayer service this morning. God showed up in such a powerful way.", scripture: "Lamentations 3:22-23", imageName: "church-morning.jpg", imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80", likes: ["a", "b", "c"], saves: [], reports: [] },
  { id: "mock-p4", userId: "mock-user4", author: "Pastor Samuel", text: "Quick word of encouragement: God is not surprised by what you're going through. He has already prepared a way through it.", scripture: "Jeremiah 29:11", imageName: "", imageUrl: "", likes: ["a", "b", "c", "d", "e", "f", "g"], saves: ["a", "b", "c"], reports: ["mock-report"] },
  { id: "mock-p5", userId: "mock-user5", author: "Ruth Adeyemi", text: "Just completed the Faith Journey series and wow. My perspective on hardship has completely changed.", scripture: "Romans 8:28", imageName: "", imageUrl: "", likes: ["a", "b", "c", "d"], saves: ["a"], reports: [] },
];

const MOCK_PRAYERS: PrayerRequest[] = [
  { id: "mock-pr1", userId: "mock-user1", title: "Healing for my mother", text: "My mother was diagnosed with cancer last month. I am believing God for her complete healing.", visibility: "Public", actions: { prayed: ["mock-user2", "mock-user3"] } },
  { id: "mock-pr2", userId: "mock-user2", title: "Job breakthrough needed", text: "I have been unemployed for 6 months and my family is struggling. Trusting God's provision.", visibility: "Public", actions: { prayed: ["mock-user1"] } },
  { id: "mock-pr3", userId: "mock-user3", title: "Praise report - answered prayer!", text: "Six months ago I asked for prayer about my marriage. God restored our marriage, and we are closer than ever.", visibility: "Public", actions: {} },
  { id: "mock-pr4", userId: "mock-user4", title: "Peace for anxiety", text: "Going through a difficult season of anxiety and fear. I need prayer to walk in God's truth daily.", visibility: "Public", actions: {} },
];

const MOCK_USERS: Profile[] = [
  { id: "mock-user1", role: "user", name: "Grace Walker", username: "gracewalks", email: "grace@faithflix.demo", bio: "Sharing testimonies and daily encouragement.", favoriteScripture: "Psalm 27:14", ministry: "Faith Flix Community", location: "Nashville, TN" },
  { id: "mock-user2", role: "user", name: "David Chen", username: "davidchen", email: "david@faithflix.demo", bio: "Bible study leader and worship volunteer.", favoriteScripture: "Romans 8:28", ministry: "Hope City Church", location: "Austin, TX" },
  { id: "mock-user3", role: "user", name: "Miriam Johnson", username: "miriamj", email: "miriam@faithflix.demo", bio: "Loves worship, prayer nights, and scripture journaling.", favoriteScripture: "Lamentations 3:22-23", ministry: "Awakening Prayer Network", location: "Charlotte, NC" },
  { id: "mock-user4", role: "user", name: "Pastor Samuel", username: "pastorsamuel", email: "samuel@faithflix.demo", bio: "Pastor sharing short teachings for everyday discipleship.", favoriteScripture: "Jeremiah 29:11", ministry: "Grace Chapel", location: "Phoenix, AZ" },
  { id: "mock-user5", role: "user", name: "Ruth Adeyemi", username: "ruthfaith", email: "ruth@faithflix.demo", bio: "Encouraging women to walk boldly with Christ.", favoriteScripture: "Proverbs 3:5-6", ministry: "Daughters of Grace", location: "Atlanta, GA" },
];

const MOCK_UPLOADS: UserUpload[] = [
  { id: "mock-upload-1", userId: "mock-user1", title: "God Helped Me Forgive", description: "A testimony about forgiveness and freedom.", scripture: "Colossians 3:13", category: "Testimonies", testimonyType: "Testimony", visibility: "Public", tags: "forgiveness,testimony", videoName: "forgiveness-testimony.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", thumbnailName: "forgiveness.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", status: "Approved", adminNote: "Demo published user content" },
  { id: "mock-upload-2", userId: "mock-user2", title: "Morning Scripture Walk", description: "Psalm 23 reflection during a morning walk.", scripture: "Psalm 23:1", category: "Devotional Clips", testimonyType: "Devotional", visibility: "Public", tags: "psalm,devotional", videoName: "morning-scripture.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", thumbnailName: "morning-walk.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=500&q=80", cropDimension: "4:5", cropRatio: "4 / 5", status: "Approved", adminNote: "Demo published user content" },
  { id: "mock-upload-3", userId: "mock-user3", title: "Church Worship Clip", description: "Short worship moment from Sunday service.", scripture: "Psalm 100:2", category: "Church Clips", testimonyType: "Worship", visibility: "Public", tags: "worship,church", videoName: "church-worship.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumbnailName: "church-clip.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=500&q=80", cropDimension: "1:1", cropRatio: "1 / 1", status: "Approved", adminNote: "Demo published user content" },
];

const MOCK_COMMENTS: CommentItem[] = [
  { id: "mock-c1", targetId: "mock-v1", author: "Grace Walker", text: "This message met me exactly where I am.", createdAt: "Jan 11" },
  { id: "mock-c2", targetId: "mock-v2", author: "David Chen", text: "The cross changes everything. Amen.", createdAt: "Jan 12" },
  { id: "mock-c3", targetId: "mock-u1", author: "Ruth Adeyemi", text: "Thank you for being brave enough to share this.", createdAt: "Feb 6" },
  { id: "mock-c4", targetId: "mock-p1", author: "Pastor Samuel", text: "Standing with you in faith.", createdAt: "Feb 6" },
  { id: "mock-c5", targetId: "mock-p4", author: "Miriam Johnson", text: "Needed this encouragement today.", createdAt: "Feb 8" },
];

const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  { id: "mock-f1", fromId: "mock-user1", toId: "mock-user2", status: "accepted" },
  { id: "mock-f2", fromId: "mock-user3", toId: "mock-user1", status: "accepted" },
  { id: "mock-f3", fromId: "mock-user4", toId: "mock-user5", status: "pending" },
];

const MOCK_MESSAGES: Message[] = [
  { id: "mock-m1", fromId: "mock-user1", toId: "mock-user2", text: "That Romans study was so helpful this week.", createdAt: "Feb 10" },
  { id: "mock-m2", fromId: "mock-user2", toId: "mock-user1", text: "Amen. I saved the Faith Journey episode too.", createdAt: "Feb 10" },
  { id: "mock-m3", fromId: "mock-user3", toId: "mock-user1", text: "Praying for your family today.", createdAt: "Feb 11" },
];

const MOCK_SAVED: Record<string, string[]> = {
  "mock-user1": ["mock-v1", "mock-v2", "mock-u1"],
};

const MOCK_SAVED_LISTS: Record<string, SavedList[]> = {
  "mock-user1": [
    { id: "mock-list-worship", name: "Worship", videoIds: ["mock-v3", "mock-v8"] },
    { id: "mock-list-study", name: "Bible Study", videoIds: ["mock-v7", "mock-v4"] },
  ],
};

const MOCK_LIKES: Record<string, string[]> = {
  guest: ["mock-v1", "mock-v2", "mock-u1", "mock-u2"],
  "mock-user1": ["mock-v3", "mock-v8", "mock-u3"],
};

function mergeById<T extends { id: string }>(base: T[], incoming: T[]) {
  const map = new Map<string, T>();
  [...base, ...incoming].forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function mergeRecordLists(base: Record<string, string[]>, incoming: Record<string, string[]>) {
  const merged: Record<string, string[]> = { ...base, ...incoming };
  Object.entries(base).forEach(([key, values]) => {
    merged[key] = Array.from(new Set([...(values ?? []), ...(incoming[key] ?? [])]));
  });
  return merged;
}

function uniqueCategoriesByName(items: CategoryItem[]) {
  const map = new Map<string, CategoryItem>();
  items.forEach((item) => {
    const key = item.name.trim().toLowerCase();
    if (!key) return;
    const existing = map.get(key);
    map.set(key, existing ? { ...existing, ...item, id: existing.id, name: existing.name } : item);
  });
  return Array.from(map.values());
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fileInfo(file?: File | null) {
  if (!file) return { name: "", url: "" };
  return { name: file.name, url: URL.createObjectURL(file) };
}

type UploadedMedia = { name: string; url: string; thumbnailUrl?: string };

async function createCloudflareUpload() {
  const response = await fetch("/api/cloudflare-upload", { method: "POST" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Could not start Cloudflare upload.");
  return payload as { uploadURL: string; uid: string; iframeUrl: string; thumbnailUrl: string };
}

function uploadFileWithProgress(uploadURL: string, file: File, onProgress?: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", uploadURL);
    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("Cloudflare upload failed: " + (request.responseText || request.statusText)));
    };
    request.onerror = () => reject(new Error("Cloudflare upload failed. Check your connection and try again."));
    request.send(formData);
  });
}

async function uploadCloudflareVideo(file: File, onProgress?: (percent: number) => void): Promise<UploadedMedia> {
  const upload = await createCloudflareUpload();
  await uploadFileWithProgress(upload.uploadURL, file, onProgress);
  return { name: file.name, url: upload.iframeUrl, thumbnailUrl: upload.thumbnailUrl };
}

async function uploadMediaFile(file: File | null, ownerId: string, folder: string, onProgress?: (percent: number) => void): Promise<UploadedMedia> {
  if (!file) return { name: "", url: "" };
  if (file.type.startsWith("video/")) return uploadCloudflareVideo(file, onProgress);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filePath = ownerId + "/" + folder + "/" + Date.now() + "-" + safeName;
  const { error } = await supabase.storage.from(mediaBucket).upload(filePath, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
  if (error) throw new Error("Storage upload failed: " + error.message);
  const { data } = supabase.storage.from(mediaBucket).getPublicUrl(filePath);
  return { name: file.name, url: data.publicUrl };
}

async function getActiveAuthUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const authUser = data.session?.user;
  if (!authUser) throw new Error("Please log out and log back in before uploading.");
  return authUser;
}

function startUploadProgress(setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgress>>, label: string) {
  let value = 2;
  let currentLabel = label;
  setUploadProgress({ active: true, value, label });
  const timer = window.setInterval(() => {
    value = Math.min(96, value + 1);
    setUploadProgress({ active: true, value, label: currentLabel });
  }, 1400);

  return {
    step(nextLabel: string, nextValue: number) {
      currentLabel = nextLabel;
      value = Math.max(value, nextValue);
      setUploadProgress({ active: true, value, label: nextLabel });
    },
    percent(nextLabel: string, percent: number) {
      currentLabel = nextLabel;
      value = Math.max(value, Math.min(92, Math.round(percent)));
      setUploadProgress({ active: true, value, label: nextLabel });
    },
    done(doneLabel: string) {
      window.clearInterval(timer);
      setUploadProgress({ active: true, value: 100, label: doneLabel });
      window.setTimeout(() => setUploadProgress({ active: false, value: 0, label: "" }), 1200);
    },
    fail(failLabel: string) {
      window.clearInterval(timer);
      setUploadProgress({ active: true, value: 100, label: failLabel });
      window.setTimeout(() => setUploadProgress({ active: false, value: 0, label: "" }), 3600);
    },
  };
}

function isCloudflareStreamUrl(url?: string) {
  return Boolean(url?.includes("iframe.videodelivery.net"));
}

function useStoredState<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initialValue;
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function professionalSeriesTitle(video: Pick<VideoItem, "seriesId" | "category">) {
  return video.seriesId?.trim() || (video.category ? video.category + " Origins" : "Faith Journey");
}

function alignProfessionalVideoWithSeries<T extends Pick<VideoItem, "source" | "seriesId" | "category">>(video: T): T {
  return video.source === "admin" ? { ...video, seriesId: professionalSeriesTitle(video) } : video;
}

function App() {
  const [page, setPage] = React.useState<Page>(() => {
    const savedPage = sessionStorage.getItem("faithflix-refresh-page") as Page | null;
    sessionStorage.removeItem("faithflix-refresh-page");
    return savedPage || "profile";
  });
  const [studioView, setStudioView] = React.useState<StudioView>(() => {
    const savedStudioView = sessionStorage.getItem("faithflix-refresh-studio") as StudioView | null;
    sessionStorage.removeItem("faithflix-refresh-studio");
    return savedStudioView || "dashboard";
  });
  const [communityView, setCommunityView] = React.useState<CommunityView>(() => {
    const savedCommunityView = sessionStorage.getItem("faithflix-refresh-community") as CommunityView | null;
    sessionStorage.removeItem("faithflix-refresh-community");
    return savedCommunityView || "feed";
  });
  const [selectedVideoId, setSelectedVideoId] = React.useState("");
  const [selectedSeriesId, setSelectedSeriesId] = React.useState("");
  const [selectedMessageUser, setSelectedMessageUser] = React.useState("");
  const [selectedCommunityUser, setSelectedCommunityUser] = React.useState("");
  const [toast, setToast] = React.useState("");
  const [uploadProgress, setUploadProgress] = React.useState<UploadProgress>({ active: false, value: 0, label: "" });
  const [pullStartY, setPullStartY] = React.useState<number | null>(null);
  const [isPullRefreshing, setIsPullRefreshing] = React.useState(false);

  const [users, setUsers] = useStoredState<Profile[]>("faithflix-users", []);
  const [sessionId, setSessionId] = useStoredState<string>("faithflix-session", "");
  const [videos, setVideos] = useStoredState<VideoItem[]>("faithflix-videos", ALL_MOCK_VIDEOS);
  const [series, setSeries] = useStoredState<SeriesItem[]>("faithflix-series", ALL_MOCK_SERIES);
  const [categories, setCategories] = useStoredState<CategoryItem[]>("faithflix-categories", defaultCategories);
  const [uploads, setUploads] = useStoredState<UserUpload[]>("faithflix-user-uploads", MOCK_UPLOADS);
  const [saved, setSaved] = useStoredState<Record<string, string[]>>("faithflix-saved", MOCK_SAVED);
  const [savedLists, setSavedLists] = useStoredState<Record<string, SavedList[]>>("faithflix-saved-lists", MOCK_SAVED_LISTS);
  const [likes, setLikes] = useStoredState<Record<string, string[]>>("faithflix-likes", MOCK_LIKES);
  const [comments, setComments] = useStoredState<CommentItem[]>("faithflix-comments", MOCK_COMMENTS);
  const [posts, setPosts] = useStoredState<CommunityPost[]>("faithflix-posts", MOCK_POSTS);
  const [prayers, setPrayers] = useStoredState<PrayerRequest[]>("faithflix-prayers", MOCK_PRAYERS);
  const [friendRequests, setFriendRequests] = useStoredState<FriendRequest[]>("faithflix-friends", MOCK_FRIEND_REQUESTS);
  const [messages, setMessages] = useStoredState<Message[]>("faithflix-messages", MOCK_MESSAGES);
  const [worshipSongs, setWorshipSongs] = useStoredState<WorshipSong[]>("faithflix-worship-songs", MOCK_WORSHIP_SONGS);
  const [mainSearchQuery, setMainSearchQuery] = React.useState("");
  const t = React.useCallback((key: string) => translate("en", key), []);
  const [commSearchQuery, setCommSearchQuery] = React.useState("");
  const [worshipSearchQuery, setWorshipSearchQuery] = React.useState("");
  const [showMainSearch, setShowMainSearch] = React.useState(false);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  React.useEffect(() => {
    const demoVersion = "faithflix-demo-content-v9";
    if (localStorage.getItem(demoVersion)) return;
    setUsers((current) => mergeById(MOCK_USERS, current));
    setVideos((current) => mergeById(ALL_MOCK_VIDEOS, current.filter((video) => !video.id.startsWith("mock-share-video-") || COMMUNITY_VIDEO_CATEGORIES.includes(video.category))));
    setSeries((current) => mergeById(ALL_MOCK_SERIES, current));
    setCategories((current) => uniqueCategoriesByName([...defaultCategories, ...current]));
    setUploads((current) => mergeById(MOCK_UPLOADS, current));
    setPosts((current) => mergeById(MOCK_POSTS, current));
    setPrayers((current) => mergeById(MOCK_PRAYERS, current));
    setComments((current) => mergeById(MOCK_COMMENTS, current));
    setFriendRequests((current) => mergeById(MOCK_FRIEND_REQUESTS, current));
    setMessages((current) => mergeById(MOCK_MESSAGES, current));
    setWorshipSongs((current) => mergeById(MOCK_WORSHIP_SONGS, current.filter((song) => !song.id.startsWith("mock-song-"))));
    setSaved((current) => mergeRecordLists(MOCK_SAVED, current));
    setSavedLists((current) => ({ ...MOCK_SAVED_LISTS, ...current }));
    setLikes((current) => mergeRecordLists(MOCK_LIKES, current));
    localStorage.setItem(demoVersion, "loaded");
  }, [setUsers, setVideos, setSeries, setCategories, setUploads, setPosts, setPrayers, setComments, setFriendRequests, setMessages, setWorshipSongs, setSaved, setSavedLists, setLikes]);

  const currentUser = users.find((user) => user.id === sessionId);
  const isAdmin = currentUser?.role === "admin";
  const visibleCategories = uniqueCategoriesByName(categories).filter((category) => !category.hidden && !isPrayerCategoryName(category.name));
  const publicVideos = videos.filter((video) => video.status === "Published" && !isPrayerVideo(video)).map(alignProfessionalVideoWithSeries);
  const publicSeries = series.filter((item) => item.status === "Published");

  React.useEffect(() => {
    let active = true;

    const loadSupabaseProfile = async () => {
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;
      if (!authUser) return;

      const localUser = await getOrCreateUserProfile(authUser);
      if (!active) return;
      setUsers((current) => upsertLocalUser(current, localUser));
      setSessionId(localUser.id);
      if (localUser.role === "admin") {
        setPage("admin-studio");
        setStudioView("dashboard");
      }
    };

    void loadSupabaseProfile();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setSessionId("");
        return;
      }
      void getOrCreateUserProfile(session.user).then((localUser) => {
        if (!active) return;
        setUsers((current) => upsertLocalUser(current, localUser));
        setSessionId(localUser.id);
      });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [setSessionId, setUsers]);

  React.useEffect(() => {
    let active = true;

    const loadSupabaseVideos = async () => {
      const { data, error } = await supabase.from("videos").select("*").order("created_at", { ascending: true });
      if (!active || error || !data) return;
      if (data.length > 0) setVideos(mergeById(ALL_MOCK_VIDEOS, (data as DbVideo[]).map(videoFromDb)));
    };

    const loadSupabaseSeries = async () => {
      const { data, error } = await supabase.from("series").select("*").order("created_at", { ascending: true });
      if (!active || error || !data) return;
      if (data.length > 0) setSeries(mergeById(ALL_MOCK_SERIES, (data as DbSeries[]).map(seriesFromDb)));
    };

    const loadSupabaseCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: true });
      if (!active || error || !data) return;
      if (data.length > 0) setCategories(uniqueCategoriesByName([...defaultCategories, ...(data as DbCategory[]).map(categoryFromDb)]));
    };

    void loadSupabaseVideos();
    void loadSupabaseSeries();
    void loadSupabaseCategories();

    return () => {
      active = false;
    };
  }, [setVideos]);

  React.useEffect(() => {
    setVideos((current) => current.filter((video) => !starterVideoIds.includes(video.id)));
    setSeries((current) => current.filter((item) => !starterSeriesIds.includes(item.id) && item.title !== "Ai bible"));
  }, [setVideos, setSeries]);

  React.useEffect(() => {
    setVideos((current) => (current.length === 0 || current.every((v) => v.id.startsWith("starter-"))) ? ALL_MOCK_VIDEOS : current);
    setSeries((current) => current.length === 0 ? ALL_MOCK_SERIES : current);
    setPosts((current) => current.length === 0 ? MOCK_POSTS : current);
    setPrayers((current) => current.length === 0 ? MOCK_PRAYERS : current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (selectedVideoId && !publicVideos.some((video) => video.id === selectedVideoId)) {
      setSelectedVideoId(publicVideos[0]?.id ?? "");
    }
  }, [publicVideos, selectedVideoId]);

  const signOut = () => {
    void supabase.auth.signOut();
    setSessionId("");
    setPage("profile");
    notify(t("profile.signedOut"));
  };

  const finishPullRefresh = (y: number) => {
    if (pullStartY === null) return;
    const pulled = y - pullStartY;
    setPullStartY(null);
    if (window.scrollY <= 4 && pulled > 90) {
      setIsPullRefreshing(true);
      notify(t("toast.refreshing"));
      sessionStorage.setItem("faithflix-refresh-page", page);
      sessionStorage.setItem("faithflix-refresh-studio", studioView);
      sessionStorage.setItem("faithflix-refresh-community", communityView);
      window.setTimeout(() => window.location.reload(), 450);
    }
  };

  const go = (nextPage: Page, nextStudioView?: StudioView) => {
    if (currentUser?.role === "admin") {
      if (nextStudioView) setStudioView(nextStudioView);
      setPage("admin-studio");
      return;
    }
    if (nextPage === "upload") {
      setCommunityView("upload");
      setPage("community");
      return;
    }
    if (nextStudioView) setStudioView(nextStudioView);
    setPage(nextPage);
  };

  const [showSplash, setShowSplash] = React.useState(false);
  const triggerSplash = () => {
    setShowSplash(true);
    window.setTimeout(() => { setShowSplash(false); setPage("home"); }, 2700);
  };

  React.useEffect(() => {
    if (isAdmin && page !== "admin-studio") setPage("admin-studio");
  }, [isAdmin, page]);

  const visiblePage = isAdmin ? "admin-studio" : page;
  const isSignInPage = visiblePage === "profile" && !currentUser;
  const isCommunityShell = visiblePage === "community" || visiblePage === "upload";
  const isWorshipShell = visiblePage === "worship";
  const topSearchValue = isCommunityShell ? commSearchQuery : isWorshipShell ? worshipSearchQuery : mainSearchQuery;
  const setTopSearchValue = isCommunityShell ? setCommSearchQuery : isWorshipShell ? setWorshipSearchQuery : setMainSearchQuery;
  const topSearchPlaceholder = isCommunityShell ? "Search community..." : isWorshipShell ? "Search worship music..." : t("search.placeholder");

  const app = {
    page,
    go,
    studioView,
    setStudioView,
    communityView,
    setCommunityView,
    selectedVideoId,
    setSelectedVideoId,
    selectedSeriesId,
    setSelectedSeriesId,
    mainSearchQuery,
    setMainSearchQuery,
    commSearchQuery,
    setCommSearchQuery,
    worshipSearchQuery,
    setWorshipSearchQuery,
    selectedMessageUser,
    setSelectedMessageUser,
    selectedCommunityUser,
    setSelectedCommunityUser,
    uploadProgress,
    setUploadProgress,
    users,
    setUsers,
    sessionId,
    setSessionId,
    currentUser,
    isAdmin,
    videos,
    setVideos,
    publicVideos,
    series,
    setSeries,
    publicSeries,
    categories,
    setCategories,
    visibleCategories,
    uploads,
    setUploads,
    saved,
    setSaved,
    savedLists,
    setSavedLists,
    likes,
    setLikes,
    comments,
    setComments,
    posts,
    setPosts,
    prayers,
    setPrayers,
    friendRequests,
    setFriendRequests,
    messages,
    setMessages,
    worshipSongs,
    setWorshipSongs,
    notify,
    signOut,
    triggerSplash,
    t,
  };

  return (
    <AppContext.Provider value={app}>
      <div className="app-shell" onTouchStart={(event) => { if (window.scrollY <= 4) setPullStartY(event.touches[0].clientY); }} onTouchEnd={(event) => finishPullRefresh(event.changedTouches[0].clientY)}>
        {isPullRefreshing && <div className="pull-refresh">Refreshing...</div>}
        {uploadProgress.active && <div className="upload-progress" role="status" aria-live="polite"><div><span>{uploadProgress.label}</span><strong>{uploadProgress.value}%</strong></div><progress value={uploadProgress.value} max={100} /></div>}
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        {!isSignInPage && (
          <header className={`topbar${showMainSearch ? " topbar-search-open" : ""}`}>
            {showMainSearch ? (
              <div className="topbar-search-row">
                <Search size={17} className="topbar-search-icon" />
                <input
                  className="topbar-search-input"
                  placeholder={topSearchPlaceholder}
                  autoFocus
                  value={topSearchValue}
                  onChange={(e) => setTopSearchValue(e.target.value)}
                />
                <button className="icon-button" aria-label="Close search" onClick={() => { setShowMainSearch(false); setTopSearchValue(""); }}>
                  <X size={19} />
                </button>
              </div>
            ) : (
              <>
                <button className="brand" onClick={() => go(isAdmin ? "admin-studio" : "home")} aria-label="Faith Flix home">
                  <span className="brand-mark brand-mark-img-wrap"><img src="/brand-icon.png" alt="Faith Flix" className="brand-mark-img" /></span>
                  <span>Faith Flix</span>
                </button>
                <div className="top-actions">
                  <button className="icon-button topbar-search-btn" aria-label="Search" onClick={() => setShowMainSearch(true)}><Search size={19} /></button>
                  <button className="icon-button topbar-notif-btn" aria-label="Notifications" onClick={() => notify(t("toast.noNotifications"))}>
                    <Bell size={19} />
                    <span className="notif-dot" aria-hidden="true" />
                  </button>
                </div>
              </>
            )}
          </header>
        )}

        <main className={`main-stage${visiblePage === "home" ? " home-page" : ""}${visiblePage === "watch" ? " watch-page" : ""}`}>
          {visiblePage === "home" && <HomeScreen />}
          {visiblePage === "watch" && <WatchScreen />}
          {visiblePage === "series" && <SeriesScreen />}
          {(visiblePage === "upload") && <CommunityScreen />}
          {visiblePage === "community" && <CommunityScreen />}
          {visiblePage === "worship" && <WorshipScreen />}
          {visiblePage === "saved" && <SavedScreen />}
          {visiblePage === "profile" && <ProfileScreen />}
          {visiblePage === "forgot-password" && <ForgotPasswordScreen />}
          {visiblePage === "admin-login" && <AdminLogin />}
          {visiblePage === "admin-studio" && <AdminStudio />}
          {visiblePage === "rules" && <ContentRules />}
        </main>

        {!isAdmin && !(visiblePage === "profile" && !currentUser) && !(visiblePage === "forgot-password" && !currentUser) && (
          <nav className="bottom-nav" aria-label="Primary navigation">
            <NavButton label={t("nav.home")} icon={Home} active={visiblePage === "home"} onClick={() => go("home")} />
            <NavButton label={t("nav.watch")} icon={Film} active={visiblePage === "watch"} onClick={() => go("watch")} />
            <NavButton label={t("nav.series")} icon={Clapperboard} active={visiblePage === "series"} onClick={() => go("series")} />
            <NavButton label={t("nav.community")} icon={MessagesSquare} active={visiblePage === "community" || visiblePage === "upload"} onClick={() => go("community")} />
            <NavButton label="Worship" icon={Music2} active={visiblePage === "worship"} onClick={() => go("worship")} />
            <NavButton label={t("nav.saved")} icon={Bookmark} active={visiblePage === "saved"} onClick={() => go("saved")} />
            <NavButton label={t("nav.profile")} icon={User} active={visiblePage === "profile" || visiblePage === "admin-login" || visiblePage === "admin-studio"} onClick={() => go("profile")} />
          </nav>
        )}
        {showSplash && (
          <div className="login-splash">
            <div className="login-splash-logo">Faith<span className="login-splash-flix">Flix</span></div>
            <p className="login-splash-tagline">Watch. Believe. Share.</p>
          </div>
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </AppContext.Provider>
  );
}

type AppState = ReturnType<typeof buildContextShape>;
function buildContextShape() {
  return {} as {
    page: Page;
    go: (page: Page, studioView?: StudioView) => void;
    studioView: StudioView;
    setStudioView: React.Dispatch<React.SetStateAction<StudioView>>;
    communityView: CommunityView;
    setCommunityView: React.Dispatch<React.SetStateAction<CommunityView>>;
    selectedVideoId: string;
    setSelectedVideoId: React.Dispatch<React.SetStateAction<string>>;
    selectedSeriesId: string;
    setSelectedSeriesId: React.Dispatch<React.SetStateAction<string>>;
    mainSearchQuery: string;
    setMainSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    commSearchQuery: string;
    setCommSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    worshipSearchQuery: string;
    setWorshipSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    selectedMessageUser: string;
    setSelectedMessageUser: React.Dispatch<React.SetStateAction<string>>;
    selectedCommunityUser: string;
    setSelectedCommunityUser: React.Dispatch<React.SetStateAction<string>>;
    uploadProgress: UploadProgress;
    setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgress>>;
    users: Profile[];
    setUsers: React.Dispatch<React.SetStateAction<Profile[]>>;
    sessionId: string;
    setSessionId: React.Dispatch<React.SetStateAction<string>>;
    currentUser?: Profile;
    isAdmin: boolean;
    videos: VideoItem[];
    setVideos: React.Dispatch<React.SetStateAction<VideoItem[]>>;
    publicVideos: VideoItem[];
    series: SeriesItem[];
    setSeries: React.Dispatch<React.SetStateAction<SeriesItem[]>>;
    publicSeries: SeriesItem[];
    categories: CategoryItem[];
    setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
    visibleCategories: CategoryItem[];
    uploads: UserUpload[];
    setUploads: React.Dispatch<React.SetStateAction<UserUpload[]>>;
    saved: Record<string, string[]>;
    setSaved: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    savedLists: Record<string, SavedList[]>;
    setSavedLists: React.Dispatch<React.SetStateAction<Record<string, SavedList[]>>>;
    likes: Record<string, string[]>;
    setLikes: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    comments: CommentItem[];
    setComments: React.Dispatch<React.SetStateAction<CommentItem[]>>;
    posts: CommunityPost[];
    setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
    prayers: PrayerRequest[];
    setPrayers: React.Dispatch<React.SetStateAction<PrayerRequest[]>>;
    friendRequests: FriendRequest[];
    setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    worshipSongs: WorshipSong[];
    setWorshipSongs: React.Dispatch<React.SetStateAction<WorshipSong[]>>;
    notify: (message: string) => void;
    signOut: () => void;
    triggerSplash: () => void;
    t: (key: string) => string;
  };
}
const AppContext = React.createContext<AppState | null>(null);
function useApp() {
  const app = React.useContext(AppContext);
  if (!app) throw new Error("Faith Flix context missing");
  return app;
}



type DbVideo = {
  id: string;
  source: "admin" | "user" | string;
  title: string;
  description: string | null;
  scripture_reference: string | null;
  episode_number: string | null;
  duration: string | null;
  creator_ministry_name: string | null;
  tags: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  status: "draft" | "published" | "hidden" | string;
  created_at: string | null;
  app_category?: string | null;
  app_series_title?: string | null;
  crop_dimension?: string | null;
  crop_ratio?: string | null;
  featured?: boolean | null;
};

type DbSeries = {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  scripture_theme: string | null;
  status: "draft" | "published" | "hidden" | string;
  app_category?: string | null;
  featured?: boolean | null;
  created_at?: string | null;
};

type DbCategory = {
  id: string;
  name: string;
  hidden: boolean | null;
  custom: boolean | null;
};

type DbProfile = {
  id: string;
  role: "admin" | "user";
  name: string | null;
  username: string | null;
  birthday: string | null;
  bio: string | null;
  favorite_scripture: string | null;
  profile_image_url: string | null;
  church_ministry_name: string | null;
  location: string | null;
};

type AuthProfileUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function profileFromDb(profile: DbProfile, email: string): Profile {
  const fallback = email.split("@")[0];
  return {
    id: profile.id,
    role: profile.role,
    name: profile.name || fallback,
    username: profile.username || fallback,
    email,
    birthday: profile.birthday || "",
    image: profile.profile_image_url || "",
    bio: profile.bio || "",
    favoriteScripture: profile.favorite_scripture || "",
    ministry: profile.church_ministry_name || "",
    location: profile.location || "",
  };
}

function profilePayloadFromAuth(authUser: AuthProfileUser) {
  const email = authUser.email || "";
  const fallback = email.split("@")[0] || "faithmember";
  const name = typeof authUser.user_metadata?.name === "string" ? authUser.user_metadata.name : fallback;
  const username = typeof authUser.user_metadata?.username === "string" && authUser.user_metadata.username.trim()
    ? authUser.user_metadata.username.trim()
    : fallback;

  return {
    id: authUser.id,
    role: "user" as const,
    name,
    username,
  };
}

async function getOrCreateUserProfile(authUser: AuthProfileUser) {
  const email = authUser.email || "";
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
  if (profile) return profileFromDb(profile as DbProfile, email);

  const fallback = profilePayloadFromAuth(authUser);
  const { data: created, error } = await supabase
    .from("profiles")
    .upsert(fallback)
    .select("*")
    .maybeSingle();

  if (created) return profileFromDb(created as DbProfile, email);

  if (error) {
    const { data: retry } = await supabase
      .from("profiles")
      .upsert({ ...fallback, username: `${fallback.username}-${authUser.id.slice(0, 6)}` })
      .select("*")
      .maybeSingle();
    if (retry) return profileFromDb(retry as DbProfile, email);
  }

  return {
    id: authUser.id,
    role: "user" as const,
    name: fallback.name,
    username: fallback.username,
    email,
  };
}

function upsertLocalUser(users: Profile[], user: Profile) {
  return users.some((item) => item.id === user.id)
    ? users.map((item) => (item.id === user.id ? user : item))
    : [...users, user];
}

function statusFromDb(status: string): Status {
  if (status === "published") return "Published";
  if (status === "hidden") return "Hidden";
  return "Draft";
}

function statusToDb(status: Status) {
  return status.toLowerCase() as "draft" | "published" | "hidden";
}

function isPrayerCategoryName(name: string) {
  return name.toLowerCase().includes("prayer");
}

function isPrayerVideo(video: VideoItem) {
  return [video.category, video.title, video.tags].some((value) => value.toLowerCase().includes("prayer"));
}

function videoFromDb(video: DbVideo): VideoItem {
  return {
    id: video.id,
    source: video.source === "user" ? "user" : "admin",
    title: video.title,
    description: video.description || "",
    scripture: video.scripture_reference || "",
    category: video.app_category || "Bible Stories",
    seriesId: video.app_series_title || "",
    episode: video.episode_number || "",
    duration: video.duration || "",
    creator: video.creator_ministry_name || "Faith Flix",
    tags: video.tags || "",
    status: statusFromDb(video.status),
    featured: !!video.featured,
    videoName: video.video_url ? video.video_url.split("/").pop() || "Video" : "",
    videoUrl: video.video_url || "",
    thumbnailName: video.thumbnail_url ? video.thumbnail_url.split("/").pop() || "Thumbnail" : "",
    thumbnailUrl: video.thumbnail_url || "",
    cropDimension: video.crop_dimension || "9:16",
    cropRatio: video.crop_ratio || "9 / 16",
    createdAt: video.created_at ? new Date(video.created_at).toLocaleString() : "",
  };
}

function videoToDb(video: Omit<VideoItem, "id" | "createdAt">, createdBy: string) {
  const alignedVideo = alignProfessionalVideoWithSeries(video);
  return {
    source: video.source,
    title: video.title,
    description: alignedVideo.description,
    scripture_reference: alignedVideo.scripture,
    episode_number: alignedVideo.episode,
    duration: alignedVideo.duration,
    creator_ministry_name: alignedVideo.creator,
    tags: alignedVideo.tags,
    video_url: video.videoUrl || null,
    thumbnail_url: video.thumbnailUrl || null,
    status: statusToDb(video.status),
    created_by: createdBy,
    app_category: alignedVideo.category,
    app_series_title: alignedVideo.seriesId,
    crop_dimension: video.cropDimension || "9:16",
    crop_ratio: video.cropRatio || "9 / 16",
    featured: alignedVideo.featured ?? false,
  };
}

function seriesFromDb(item: DbSeries): SeriesItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    posterName: item.poster_url ? item.poster_url.split("/").pop() || "Poster" : "",
    posterUrl: item.poster_url || "",
    scriptureTheme: item.scripture_theme || "",
    category: item.app_category || "Bible Stories",
    status: statusFromDb(item.status),
    featured: !!item.featured,
  };
}

function seriesToDb(item: Omit<SeriesItem, "id">, createdBy?: string) {
  return {
    title: item.title,
    description: item.description,
    poster_url: item.posterUrl || null,
    scripture_theme: item.scriptureTheme,
    status: statusToDb(item.status),
    app_category: item.category,
    featured: item.featured ?? false,
    ...(createdBy ? { created_by: createdBy } : {}),
  };
}

function categoryFromDb(item: DbCategory): CategoryItem {
  return {
    id: item.id,
    name: item.name,
    hidden: !!item.hidden,
    custom: item.custom ?? true,
  };
}

function NavButton({ label, icon: Icon, active, onClick }: { label: string; icon: React.ElementType; active: boolean; onClick: () => void }) {
  return (
    <button className={`nav-button${active ? " active" : ""}`} onClick={onClick}>
      <span className="nav-icon"><Icon size={21} /></span>
      <span className="nav-label">{label}</span>
    </button>
  );
}

function WatchFeedCard({ video }: { video: VideoItem }) {
  const { likes, setLikes, saved, setSaved, currentUser, notify, comments, go, setCommunityView } = useApp();
  const actorId = currentUser?.id ?? "guest";
  const likedIds = likes[actorId] ?? [];
  const savedIds = saved[actorId] ?? [];
  const isLiked = likedIds.includes(video.id);
  const isSaved = savedIds.includes(video.id);
  const likeCount = Object.values(likes).flat().filter((id) => id === video.id).length;
  const commentCount = comments.filter((c) => c.targetId === video.id).length;
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [muted, setMuted] = React.useState(true);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setPaused(false);
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.65 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const tapVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPaused(false); }
    else { v.pause(); setPaused(true); }
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes({ ...likes, [actorId]: isLiked ? likedIds.filter((id) => id !== video.id) : [...likedIds, video.id] });
    notify(isLiked ? "Like removed." : "Liked! ✦");
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) { notify("Log in to save videos."); return; }
    setSaved({ ...saved, [actorId]: isSaved ? savedIds.filter((id) => id !== video.id) : [...savedIds, video.id] });
    notify(isSaved ? "Removed." : "Saved! ✦");
  };

  const share = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(`faithflix://video/${video.id}`);
    notify("Link copied!");
  };

  const isCloudflare = isCloudflareStreamUrl(video.videoUrl || "");

  return (
    <div ref={cardRef} className="watch-feed-card">
      {video.videoUrl ? (
        isCloudflare ? (
          <iframe
            className="watch-feed-video"
            src={video.videoUrl}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            className="watch-feed-video"
            playsInline
            loop
            muted={muted}
            poster={video.thumbnailUrl || undefined}
            src={video.videoUrl}
            onClick={tapVideo}
          />
        )
      ) : video.thumbnailUrl ? (
        <img className="watch-feed-video" src={video.thumbnailUrl} alt={video.title} style={{ objectFit: "cover" }} onClick={tapVideo} />
      ) : (
        <div className="watch-feed-video watch-feed-empty" onClick={tapVideo} />
      )}

      <div className="watch-feed-gradient" />

      {paused && !isCloudflare && (
        <div className="watch-feed-paused-icon" onClick={tapVideo}>
          <Play size={52} fill="currentColor" />
        </div>
      )}

      <div className="watch-feed-footer">
        <span className={`feed-card-badge${video.source === "user" ? " feed-card-badge-community" : ""}`}>
          {video.source === "admin" ? "✦ Official" : "Community"}
        </span>
        <h3 className="watch-feed-title">{video.title}</h3>
        {video.creator && <p className="watch-feed-creator">@{video.creator}</p>}
        {video.scripture && <p className="watch-feed-scripture">"{video.scripture}"</p>}
        <div className="feed-card-meta">
          {video.duration && <span className="feed-card-duration">{video.duration}</span>}
          <span className="feed-card-category">{video.category}</span>
        </div>
      </div>

      <div className="watch-feed-actions">
        <button className={`feed-action-btn${isLiked ? " active" : ""}`} onClick={toggleLike}>
          <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
          <span>{likeCount > 0 ? likeCount : "Like"}</span>
        </button>
        <button className={`feed-action-btn${isSaved ? " active" : ""}`} onClick={toggleSave}>
          <Bookmark size={28} fill={isSaved ? "currentColor" : "none"} />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
        <button className="feed-action-btn" onClick={(e) => { e.stopPropagation(); setCommunityView("feed"); go("community"); }}>
          <MessageCircle size={26} />
          <span>{commentCount > 0 ? commentCount : "Chat"}</span>
        </button>
        <button className="feed-action-btn" onClick={share}>
          <Share2 size={24} />
          <span>Share</span>
        </button>
        <button className="feed-action-btn" onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}>
          {muted ? <Volume2 size={22} /> : <VolumeX size={22} />}
          <span>{muted ? "Unmute" : "Mute"}</span>
        </button>
      </div>
    </div>
  );
}

function HomePosterCard({ video, onOpen }: { video: VideoItem; onOpen: () => void }) {
  return (
    <button className="home-poster-card" onClick={onOpen} aria-label={`Play ${video.title}`}>
      {video.thumbnailUrl
        ? <img className="home-poster-img" src={video.thumbnailUrl} alt={video.title} />
        : <div className="home-poster-img home-poster-empty"><Play size={28} fill="currentColor" /></div>}
      <div className="home-poster-gradient" />
      <div className="home-poster-badge-wrap">
        <span className={`feed-card-badge${video.source === "user" ? " feed-card-badge-community" : ""}`}>
          {video.source === "admin" ? "✦" : "•"}
        </span>
      </div>
      <div className="home-poster-footer">
        <p className="home-poster-title">{video.title}</p>
        {video.duration && <span className="feed-card-duration">{video.duration}</span>}
      </div>
    </button>
  );
}

function HomeScreen() {
  const { publicVideos, publicSeries, go, setSelectedVideoId, setSelectedSeriesId, mainSearchQuery, t } = useApp();

  const openVideo = (video: VideoItem) => {
    flushSync(() => {
      setSelectedVideoId(video.id);
      go("watch");
    });
  };

  const openSeries = (item: SeriesItem) => {
    setSelectedSeriesId(item.id);
    go("series");
  };

  const q = mainSearchQuery.trim().toLowerCase();
  if (q) {
    const matchVideos = publicVideos.filter((v) => [v.title, v.description, v.category, v.seriesId].join(" ").toLowerCase().includes(q));
    const matchSeries = publicSeries.filter((s) => [s.title, s.description, s.category, s.scriptureTheme].join(" ").toLowerCase().includes(q));
    return (
      <section className="screen home-search-screen">
        <div className="search-results-header">
          <Search size={16} />
          <span>Results for <strong>"{mainSearchQuery}"</strong></span>
        </div>
        {matchVideos.length === 0 && matchSeries.length === 0 && (
          <EmptyState icon={Search} title={t("search.noResults")} body={`Nothing matches "${mainSearchQuery}".`} action="" onAction={() => {}} />
        )}
        {matchVideos.length > 0 && (
          <>
            <SectionHeader title={t("search.videos")} action={`${matchVideos.length} ${t("home.found")}`} />
            <div className="home-poster-row">
              {matchVideos.map((video) => (
                <HomePosterCard key={video.id} video={video} onOpen={() => openVideo(video)} />
              ))}
            </div>
          </>
        )}
        {matchSeries.length > 0 && (
          <>
            <SectionHeader title={t("search.series")} action={`${matchSeries.length} ${t("home.found")}`} />
            <div className="home-series-shelf">
              {matchSeries.map((item) => {
                const epCount = publicVideos.filter((v) => v.seriesId === item.title && v.status === "Published").length;
                return (
                  <button key={item.id} className="home-series-card" onClick={() => { setSelectedSeriesId(item.id); go("series"); }}>
                    {item.posterUrl ? <img className="home-series-poster" src={item.posterUrl} alt={item.title} /> : <div className="home-series-poster home-series-poster-empty"><Clapperboard size={28} /></div>}
                    <div className="home-series-info">
                      <p className="home-series-title">{item.title}</p>
                      <p className="home-series-meta">{epCount} episode{epCount !== 1 ? "s" : ""} • {item.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>
    );
  }

  const publishedVideos = publicVideos.filter((v) => v.status === "Published");
  const featuredVideos = publishedVideos.filter((v) => v.featured || v.source === "admin");
  const allFeatured = featuredVideos.length >= 3 ? featuredVideos : publishedVideos;
  const recentVideos = [...publishedVideos].reverse().slice(0, 12);
  const seriesList = publicSeries.filter((s) => s.status === "Published").slice(0, 12);

  return (
    <section className="screen home-featured-screen">
      {allFeatured.length > 0 && (
        <div className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">Featured</h2>
            <button className="home-section-link" onClick={() => go("watch")}>Watch all →</button>
          </div>
          <div className="home-poster-row">
            {allFeatured.slice(0, 10).map((video) => (
              <HomePosterCard key={video.id} video={video} onOpen={() => openVideo(video)} />
            ))}
          </div>
        </div>
      )}

      {seriesList.length > 0 && (
        <div className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">Series</h2>
            <button className="home-section-link" onClick={() => go("series")}>Browse →</button>
          </div>
          <div className="home-series-shelf">
            {seriesList.map((item) => {
              const epCount = publishedVideos.filter((v) => v.seriesId === item.title).length;
              return (
                <button key={item.id} className="home-series-card" onClick={() => openSeries(item)}>
                  {item.posterUrl
                    ? <img className="home-series-poster" src={item.posterUrl} alt={item.title} />
                    : <div className="home-series-poster home-series-poster-empty"><Clapperboard size={28} /></div>}
                  <div className="home-series-info">
                    <p className="home-series-title">{item.title}</p>
                    <p className="home-series-meta">{epCount} episode{epCount !== 1 ? "s" : ""} • {item.category}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {recentVideos.length > 0 && (
        <div className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">Recently Added</h2>
            <button className="home-section-link" onClick={() => go("watch")}>See all →</button>
          </div>
          <div className="home-poster-row">
            {recentVideos.map((video) => (
              <HomePosterCard key={video.id} video={video} onOpen={() => openVideo(video)} />
            ))}
          </div>
        </div>
      )}

      {publishedVideos.length === 0 && seriesList.length === 0 && (
        <EmptyState icon={Film} title="No content yet." body="Check back soon for faith-based videos and series." action="Browse Series" onAction={() => go("series")} />
      )}
    </section>
  );
}

function WatchScreen() {
  const { publicVideos, selectedVideoId } = useApp();
  const feedRef = React.useRef<HTMLDivElement>(null);
  const feedVideos = publicVideos.filter((v) => v.status === "Published");

  React.useEffect(() => {
    if (!selectedVideoId || !feedRef.current) return;
    const idx = feedVideos.findIndex((v) => v.id === selectedVideoId);
    if (idx < 1) return;
    const card = feedRef.current.children[idx] as HTMLElement;
    card?.scrollIntoView({ behavior: "instant" });
  }, []);

  if (!feedVideos.length) {
    return (
      <section className="screen">
        <EmptyState icon={Video} title="No videos yet." body="Videos will appear once published." action="" onAction={() => {}} />
      </section>
    );
  }

  return (
    <div ref={feedRef} className="watch-feed-screen">
      {feedVideos.map((video) => (
        <WatchFeedCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function SeriesDetailView({ series, episodes, onBack }: { series: SeriesItem; episodes: VideoItem[]; onBack: () => void }) {
  const { setSelectedVideoId, go } = useApp();

  const playEpisode = (video: VideoItem) => {
    setSelectedVideoId(video.id);
    go("watch");
  };

  return (
    <section className="screen netflix-detail-screen">
      <div className="netflix-detail-hero">
        {series.posterUrl
          ? <img className="netflix-detail-bg" src={series.posterUrl} alt="" />
          : <div className="netflix-detail-bg netflix-detail-bg-empty" />}
        <div className="netflix-detail-gradient" />
        <button className="netflix-back-btn" onClick={onBack}>
          <ChevronRight size={20} style={{ transform: "rotate(180deg)" }} /> Series
        </button>
        <div className="netflix-detail-content">
          {series.category && <span className="netflix-badge">{series.category}</span>}
          <h1 className="netflix-detail-title">{series.title}</h1>
          {series.scriptureTheme && <p className="netflix-detail-verse">✦ {series.scriptureTheme}</p>}
          {series.description && <p className="netflix-detail-desc">{series.description}</p>}
          <p className="netflix-detail-count">{episodes.length} episode{episodes.length !== 1 ? "s" : ""}</p>
          <div className="netflix-detail-actions">
            <button
              className="netflix-play-btn"
              disabled={!episodes.length}
              onClick={() => episodes.length && playEpisode(episodes[0])}
            >
              <Play size={16} fill="currentColor" /> Play Episode 1
            </button>
          </div>
        </div>
      </div>

      <div className="netflix-episodes-section">
        <h2 className="netflix-episodes-heading">
          Episodes <span className="netflix-episodes-count">{episodes.length}</span>
        </h2>
        {episodes.length ? (
          <div className="netflix-episodes-list">
            {episodes.map((video, i) => (
              <button key={video.id} className="netflix-ep-row" onClick={() => playEpisode(video)}>
                <span className="netflix-ep-num">{i + 1}</span>
                <div className="netflix-ep-thumb">
                  {video.thumbnailUrl
                    ? <img src={video.thumbnailUrl} alt={video.title} />
                    : <div className="netflix-ep-thumb-empty"><Play size={16} fill="currentColor" /></div>}
                  <div className="netflix-ep-play-overlay"><Play size={18} fill="currentColor" /></div>
                </div>
                <div className="netflix-ep-info">
                  <p className="netflix-ep-title">{video.title}</p>
                  <div className="netflix-ep-meta">
                    {video.duration && <span className="netflix-ep-duration">{video.duration}</span>}
                    {video.category && <span className="netflix-ep-cat">{video.category}</span>}
                  </div>
                  {video.scripture && <p className="netflix-ep-scripture">✦ {video.scripture}</p>}
                  {video.description && <p className="netflix-ep-desc">{video.description}</p>}
                </div>
                <ChevronRight size={16} className="netflix-ep-arrow" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={Film} title="No episodes yet." body="Episodes will appear here once added." action="" onAction={() => {}} />
        )}
      </div>
    </section>
  );
}

function SeriesScreen() {
  const { publicSeries, publicVideos, go, setSelectedVideoId, selectedSeriesId, setSelectedSeriesId } = useApp();

  const focusedSeries = selectedSeriesId ? publicSeries.find((s) => s.id === selectedSeriesId) : null;
  const focusedEpisodes = focusedSeries
    ? publicVideos.filter((v) => v.seriesId === focusedSeries.title && v.status === "Published")
    : [];

  if (focusedSeries) {
    return <SeriesDetailView series={focusedSeries} episodes={focusedEpisodes} onBack={() => setSelectedSeriesId("")} />;
  }

  const publishedSeries = publicSeries.filter((s) => s.status === "Published");
  const featuredSeries = publishedSeries.find((s) => s.featured) ?? publishedSeries[0];
  const categories = Array.from(new Set(publishedSeries.map((s) => s.category).filter(Boolean)));

  const playFirstEpisode = (item: SeriesItem) => {
    const firstEp = publicVideos.find((v) => v.seriesId === item.title && v.status === "Published");
    if (firstEp) { setSelectedVideoId(firstEp.id); go("watch"); }
    else setSelectedSeriesId(item.id);
  };

  return (
    <section className="screen netflix-series-screen">
      {featuredSeries && (
        <div className="netflix-hero" onClick={() => setSelectedSeriesId(featuredSeries.id)}>
          {featuredSeries.posterUrl
            ? <img className="netflix-hero-bg" src={featuredSeries.posterUrl} alt="" />
            : <div className="netflix-hero-bg netflix-hero-bg-empty" />}
          <div className="netflix-hero-gradient" />
          <div className="netflix-hero-content">
            {featuredSeries.category && <span className="netflix-badge">{featuredSeries.category}</span>}
            <h1 className="netflix-hero-title">{featuredSeries.title}</h1>
            {featuredSeries.scriptureTheme && <p className="netflix-hero-verse">✦ {featuredSeries.scriptureTheme}</p>}
            {featuredSeries.description && <p className="netflix-hero-desc">{featuredSeries.description}</p>}
            <div className="netflix-hero-actions">
              <button className="netflix-play-btn" onClick={(e) => { e.stopPropagation(); playFirstEpisode(featuredSeries); }}>
                <Play size={15} fill="currentColor" /> Play Now
              </button>
              <button className="netflix-info-btn" onClick={(e) => { e.stopPropagation(); setSelectedSeriesId(featuredSeries.id); }}>
                <ChevronRight size={15} /> More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {categories.length > 0 ? categories.map((category) => {
        const catSeries = publishedSeries.filter((s) => s.category === category);
        return (
          <div key={category} className="netflix-row">
            <h2 className="netflix-row-title">{category}</h2>
            <div className="netflix-row-scroll">
              {catSeries.map((item) => {
                const epCount = publicVideos.filter((v) => v.seriesId === item.title && v.status === "Published").length;
                return (
                  <button key={item.id} className="netflix-series-card" onClick={() => setSelectedSeriesId(item.id)}>
                    {item.posterUrl
                      ? <img className="netflix-card-img" src={item.posterUrl} alt={item.title} />
                      : <div className="netflix-card-img netflix-card-empty"><Clapperboard size={26} /></div>}
                    <div className="netflix-card-gradient" />
                    <div className="netflix-card-info">
                      <p className="netflix-card-title">{item.title}</p>
                      <p className="netflix-card-meta">{epCount} ep{epCount !== 1 ? "s" : ""}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }) : (
        publishedSeries.length > 0 ? (
          <div className="netflix-row">
            <h2 className="netflix-row-title">All Series</h2>
            <div className="netflix-row-scroll">
              {publishedSeries.map((item) => {
                const epCount = publicVideos.filter((v) => v.seriesId === item.title && v.status === "Published").length;
                return (
                  <button key={item.id} className="netflix-series-card" onClick={() => setSelectedSeriesId(item.id)}>
                    {item.posterUrl
                      ? <img className="netflix-card-img" src={item.posterUrl} alt={item.title} />
                      : <div className="netflix-card-img netflix-card-empty"><Clapperboard size={26} /></div>}
                    <div className="netflix-card-gradient" />
                    <div className="netflix-card-info">
                      <p className="netflix-card-title">{item.title}</p>
                      <p className="netflix-card-meta">{epCount} ep{epCount !== 1 ? "s" : ""}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState icon={Clapperboard} title="No series yet." body="Series will appear here once published." action="" onAction={() => {}} />
        )
      )}
    </section>
  );
}

function UploadScreen() {
  const { currentUser, isAdmin, setUploads, setVideos, setSelectedVideoId, setCommunityView, setUploadProgress, notify, go, t } = useApp();
  const [form, setForm] = React.useState({ title: "", description: "", scripture: "", category: COMMUNITY_VIDEO_CATEGORIES[0], testimonyType: "Testimony", visibility: "Public", tags: "", consent: false, rules: false, cropDimension: "9:16", cropRatio: "9 / 16" });
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [thumbFile, setThumbFile] = React.useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = React.useState("");

  if (isAdmin) {
    return (
      <section className="screen">
        <SectionIntro eyebrow={t("upload.adminEyebrow")} title={t("upload.adminTitle")} body={t("upload.adminBody")} />
        <AdminUpload />
      </section>
    );
  }

  const submit = () => {
    if (!currentUser) return go("profile");
    if (!form.title || !form.consent || !form.rules) return notify("Add a title and confirm consent and content rules.");
    if (!videoFile) return notify("Choose a video file first.");

    const uploadUser = currentUser;
    const uploadForm = { ...form };
    const uploadVideoFile = videoFile;
    const uploadThumbFile = thumbFile;
    const progress = startUploadProgress(setUploadProgress, "Uploading in background");

    setForm({ ...form, title: "", description: "", scripture: "", tags: "", consent: false, rules: false });
    setVideoFile(null);
    setThumbFile(null);
    setThumbPreview("");
    notify("Uploading in background. Keep the app open.");

    void (async () => {
      try {
        progress.step("Checking login", 20);
        const authUser = await getActiveAuthUser();
        progress.step("Starting Cloudflare upload", 8);
        const video = await uploadMediaFile(uploadVideoFile, authUser.id, "videos", (percent) => progress.percent("Uploading video", percent));
        progress.step(uploadThumbFile ? "Uploading thumbnail" : "Saving post", 94);
        const thumb = uploadThumbFile ? await uploadMediaFile(uploadThumbFile, authUser.id, "thumbnails") : { name: "Cloudflare thumbnail", url: video.thumbnailUrl || "" };
        progress.step("Publishing post", 92);
        const uploadId = uid("upload");
        const publicVideo: Omit<VideoItem, "id" | "createdAt"> = { source: "user", title: uploadForm.title, description: uploadForm.description, scripture: uploadForm.scripture, category: uploadForm.category, seriesId: "", episode: "", duration: "", creator: uploadUser.name, tags: uploadForm.tags, status: "Published", videoName: video.name, videoUrl: video.url, thumbnailName: thumb.name, thumbnailUrl: thumb.url, cropDimension: uploadForm.cropDimension, cropRatio: uploadForm.cropRatio };
        const { data, error } = await supabase.from("videos").insert(videoToDb(publicVideo, authUser.id)).select("*").single();
        if (error) throw error;
        const savedVideo = videoFromDb(data as DbVideo);
        setUploads((current) => [...current, { id: uploadId, userId: uploadUser.id, ...uploadForm, videoName: video.name, videoUrl: video.url, thumbnailName: thumb.name, thumbnailUrl: thumb.url, status: "Approved", adminNote: "Published instantly." }]);
        setVideos((current) => [...current.filter((item) => item.id !== savedVideo.id), savedVideo]);
        setSelectedVideoId(savedVideo.id);
        progress.done("Posted");
        notify("Posted. Video may take a minute to process.");
        setCommunityView("feed");
        go("community");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed.";
        progress.fail("Upload failed");
        notify(message);
      }
    })();
  };

  return (
    <section className="screen">
      <SectionIntro eyebrow={t("upload.eyebrow")} title={t("upload.title")} body={t("upload.body")} />
      {!currentUser && <EmptyState icon={Lock} title={t("upload.needAccount")} body={t("upload.needAccountBody")} action={t("profile.eyebrow")} onAction={() => go("profile")} />}
      <form className="form-card">
        <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <Field label="Scripture reference" value={form.scripture} onChange={(scripture) => setForm({ ...form, scripture })} />
        <Select label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} options={COMMUNITY_VIDEO_CATEGORIES} />
        <Select label="Testimony type" value={form.testimonyType} onChange={(testimonyType) => setForm({ ...form, testimonyType })} options={["Testimony", "Answered prayer", "Devotional", "Church clip", "Worship"]} />
        <Select label="Visibility" value={form.visibility} onChange={(visibility) => setForm({ ...form, visibility })} options={["Public", "Friends", "Private"]} />
        <Field label="Tags" value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
        <CropDimensionPicker value={form.cropDimension} onChange={(option) => setForm({ ...form, cropDimension: option.label, cropRatio: option.ratio })} />
        <FileField label="Video file" onChange={setVideoFile} />
        <PhotoCropChooser label="Thumbnail / cover photo" value={thumbPreview} cropLabel={form.cropDimension} cropRatio={form.cropRatio} onChange={(file, previewUrl) => { setThumbFile(file); setThumbPreview(previewUrl); }} />
        <Check label="I have permission to share this content." checked={form.consent} onChange={(consent) => setForm({ ...form, consent })} />
        <Check label="This submission follows the content rules." checked={form.rules} onChange={(rules) => setForm({ ...form, rules })} />
        <button className="primary-button" type="button" onClick={submit}>Post Now</button>
      </form>
      <UserSeriesBuilder />
      <MyUploads />
    </section>
  );
}

function UserSeriesBuilder() {
  const { currentUser, visibleCategories, series, setSeries, setVideos, notify, go } = useApp();
  const [seriesForm, setSeriesForm] = React.useState({ title: "", description: "", scriptureTheme: "", category: visibleCategories[0]?.name ?? "" });
  const [episodeForm, setEpisodeForm] = React.useState({ seriesId: "", title: "", description: "", scripture: "", episode: "1", duration: "" });
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const userSeries = series.filter((item) => item.title.includes("Community") || item.title === seriesForm.title);

  const createSeries = () => {
    if (!currentUser) return go("profile");
    if (!seriesForm.title.trim()) return notify("Name your series first.");
    if (series.some((item) => item.title.toLowerCase() === seriesForm.title.trim().toLowerCase())) return notify("That series already exists.");
    const cover = fileInfo(coverFile);
    const nextSeries: SeriesItem = {
      id: uid("user-series"),
      title: seriesForm.title.trim(),
      description: seriesForm.description,
      posterName: cover.name,
      posterUrl: cover.url,
      scriptureTheme: seriesForm.scriptureTheme,
      category: seriesForm.category,
      status: "Published",
      featured: false,
    };
    setSeries((current) => [...current, nextSeries]);
    setEpisodeForm((current) => ({ ...current, seriesId: nextSeries.title, scripture: nextSeries.scriptureTheme }));
    setSeriesForm({ ...seriesForm, title: "", description: "", scriptureTheme: "" });
    setCoverFile(null);
    notify("Series created. Add an episode next.");
  };

  const createEpisode = () => {
    if (!currentUser) return go("profile");
    if (!episodeForm.seriesId || !episodeForm.title.trim()) return notify("Choose a series and title your episode.");
    if (!videoFile) return notify("Choose an episode video file.");
    const video = fileInfo(videoFile);
    const chosenSeries = series.find((item) => item.title === episodeForm.seriesId);
    const nextVideo: VideoItem = {
      id: uid("user-episode"),
      source: "user",
      title: episodeForm.title.trim(),
      description: episodeForm.description,
      scripture: episodeForm.scripture || chosenSeries?.scriptureTheme || "",
      category: chosenSeries?.category || seriesForm.category,
      seriesId: episodeForm.seriesId,
      episode: episodeForm.episode,
      duration: episodeForm.duration,
      creator: currentUser.name,
      tags: "user series, episode",
      status: "Published",
      videoName: video.name,
      videoUrl: video.url,
      thumbnailName: chosenSeries?.posterName || "",
      thumbnailUrl: chosenSeries?.posterUrl || "",
      cropDimension: "9:16",
      cropRatio: "9 / 16",
      createdAt: new Date().toLocaleString(),
    };
    setVideos((current) => [nextVideo, ...current]);
    setEpisodeForm({ seriesId: episodeForm.seriesId, title: "", description: "", scripture: "", episode: String(Number(episodeForm.episode || "1") + 1), duration: "" });
    setVideoFile(null);
    notify("Episode added to your series.");
  };

  return (
    <div className="user-series-builder">
      <SectionHeader title="Create a series" action="User content" />
      <div className="form-card">
        <Field label="Series title" value={seriesForm.title} onChange={(title) => setSeriesForm({ ...seriesForm, title })} />
        <label>Description<textarea value={seriesForm.description} onChange={(event) => setSeriesForm({ ...seriesForm, description: event.target.value })} /></label>
        <Field label="Scripture theme" value={seriesForm.scriptureTheme} onChange={(scriptureTheme) => setSeriesForm({ ...seriesForm, scriptureTheme })} />
        <Select label="Category" value={seriesForm.category} onChange={(category) => setSeriesForm({ ...seriesForm, category })} options={visibleCategories.map((item) => item.name)} />
        <FileField label="Series cover" onChange={setCoverFile} />
        <button className="primary-button" type="button" onClick={createSeries}>Create Series</button>
      </div>
      <div className="form-card">
        <h2>Add episode</h2>
        <Select label="Series" value={episodeForm.seriesId} onChange={(seriesId) => setEpisodeForm({ ...episodeForm, seriesId })} options={["", ...series.map((item) => item.title)]} />
        <Field label="Episode title" value={episodeForm.title} onChange={(title) => setEpisodeForm({ ...episodeForm, title })} />
        <label>Description<textarea value={episodeForm.description} onChange={(event) => setEpisodeForm({ ...episodeForm, description: event.target.value })} /></label>
        <Field label="Scripture reference" value={episodeForm.scripture} onChange={(scripture) => setEpisodeForm({ ...episodeForm, scripture })} />
        <Field label="Episode number" value={episodeForm.episode} onChange={(episode) => setEpisodeForm({ ...episodeForm, episode })} />
        <Field label="Duration" value={episodeForm.duration} onChange={(duration) => setEpisodeForm({ ...episodeForm, duration })} />
        <FileField label="Episode video" onChange={setVideoFile} />
        <button className="primary-button" type="button" onClick={createEpisode}>Add Episode</button>
      </div>
      <div className="horizontal-series-row home-series-row">
        {userSeries.slice(0, 10).map((item) => <HomeSeriesCard key={item.id} item={item} episodeCount={0} onOpen={() => notify(item.title)} />)}
      </div>
    </div>
  );
}

function WorshipScreen() {
  const { worshipSongs, worshipSearchQuery } = useApp();
  const [currentSongId, setCurrentSongId] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [audioDuration, setAudioDuration] = React.useState(0);
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [showUploadSheet, setShowUploadSheet] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const songQuery = worshipSearchQuery.trim().toLowerCase();
  const filteredSongs = (songQuery
    ? worshipSongs.filter((s) => [s.title, s.artist, s.description, s.uploadedBy].join(" ").toLowerCase().includes(songQuery))
    : worshipSongs
  ).filter((s) => activeCategory === "All" || s.category === activeCategory);

  const currentSong = worshipSongs.find((s) => s.id === currentSongId) ?? null;
  const currentIndex = filteredSongs.findIndex((s) => s.id === currentSongId);
  const categories = ["All", ...Array.from(new Set(worshipSongs.map((s) => s.category).filter(Boolean)))];
  const featuredSong = currentSong ?? filteredSongs[0] ?? null;

  const playSong = React.useCallback((song: WorshipSong) => {
    if (currentSongId === song.id) {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
      else { void audioRef.current?.play(); setIsPlaying(true); }
      return;
    }
    setCurrentSongId(song.id);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = song.audioUrl ?? "";
      void audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentSongId, isPlaying]);

  const prevSong = () => { if (currentIndex > 0) playSong(filteredSongs[currentIndex - 1]); };
  const nextSong = React.useCallback(() => { if (currentIndex < filteredSongs.length - 1) playSong(filteredSongs[currentIndex + 1]); }, [currentIndex, filteredSongs, playSong]);

  const togglePlay = () => {
    if (!currentSong && filteredSongs.length) { playSong(filteredSongs[0]); return; }
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
    else { void audioRef.current?.play(); setIsPlaying(true); }
  };

  const seek = (pct: number) => {
    if (audioRef.current && audioDuration) {
      audioRef.current.currentTime = (pct / 100) * audioDuration;
      setProgress(pct);
    }
  };

  return (
    <section className={`screen worship-screen sp-screen${currentSong ? " has-now-playing" : ""}`}>
      <audio
        ref={audioRef}
        onTimeUpdate={() => { const a = audioRef.current; if (a?.duration) setProgress((a.currentTime / a.duration) * 100); }}
        onDurationChange={() => setAudioDuration(audioRef.current?.duration ?? 0)}
        onEnded={nextSong}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Hero banner */}
      <div className="sp-hero">
        <div className="sp-hero-art">
          {featuredSong?.coverUrl
            ? <img src={featuredSong.coverUrl} alt={featuredSong.title} />
            : <div className="sp-hero-art-empty"><Music2 size={52} /></div>}
        </div>
        <div className="sp-hero-info">
          <p className="eyebrow" style={{ marginBottom: 6 }}>Worship Center</p>
          <h1 className="sp-hero-title">{featuredSong?.title ?? "Worship Music"}</h1>
          <p className="sp-hero-artist">{featuredSong ? `${featuredSong.artist} • ${featuredSong.category}` : "Faith Flix"}</p>
          <p className="sp-hero-desc">{featuredSong?.description || "Stream original worship songs and praise music curated for your faith journey."}</p>
          <div className="sp-hero-actions">
            <button className="sp-play-btn" onClick={() => featuredSong && playSong(featuredSong)}>
              {isPlaying && currentSongId === featuredSong?.id ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying && currentSongId === featuredSong?.id ? "Pause" : "Play"}
            </button>
            <button className="sp-shuffle-btn" onClick={() => { const r = filteredSongs[Math.floor(Math.random() * filteredSongs.length)]; if (r) playSong(r); }}>Shuffle</button>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="sp-pills">
        {categories.map((cat) => (
          <button key={cat} className={`sp-pill${activeCategory === cat ? " active" : ""}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>

      {/* Track list */}
      <div className="sp-list-header">
        <span className="sp-col-num">#</span>
        <span className="sp-col-title">Title</span>
        <span className="sp-col-dur">Time</span>
      </div>
      <div className="sp-tracklist">
        {filteredSongs.length === 0 && <EmptyState icon={Music2} title="No songs found" body="Try a different search or category." action="" onAction={() => {}} />}
        {filteredSongs.map((song, idx) => (
          <WorshipTrackRow
            key={song.id}
            song={song}
            index={idx}
            isActive={currentSongId === song.id}
            isPlaying={isPlaying && currentSongId === song.id}
            onPlay={() => playSong(song)}
          />
        ))}
      </div>

      {/* Upload FAB */}
      <button className="comm-fab" aria-label="Upload worship song" onClick={() => setShowUploadSheet(true)}>
        <Plus size={24} />
      </button>

      {showUploadSheet && <WorshipUploadSheet onClose={() => setShowUploadSheet(false)} />}

      {/* Now Playing Bar */}
      {currentSong && (
        <NowPlayingBar
          song={currentSong}
          isPlaying={isPlaying}
          progress={progress}
          hasPrev={currentIndex > 0}
          hasNext={currentIndex < filteredSongs.length - 1}
          onPrev={prevSong}
          onNext={nextSong}
          onTogglePlay={togglePlay}
          onSeek={seek}
        />
      )}
    </section>
  );
}

function WorshipTrackRow({ song, index, isActive, isPlaying, onPlay }: { song: WorshipSong; index: number; isActive: boolean; isPlaying: boolean; onPlay: () => void }) {
  return (
    <button className={`sp-track-row${isActive ? " active" : ""}`} onClick={onPlay}>
      <div className="sp-col-num">
        {isPlaying
          ? <span className="sp-eq" aria-label="Now playing"><span /><span /><span /></span>
          : isActive
            ? <Play size={13} style={{ color: "var(--gold)" }} />
            : <span className="sp-track-num">{index + 1}</span>}
      </div>
      <div className="sp-track-art">
        {song.coverUrl ? <img src={song.coverUrl} alt="" /> : <div className="sp-track-art-empty"><Music2 size={15} /></div>}
      </div>
      <div className="sp-track-info">
        <span className="sp-track-title">{song.title}</span>
        <span className="sp-track-artist">{song.artist}</span>
      </div>
      <div className="sp-col-dur">{song.duration || "—"}</div>
    </button>
  );
}

function NowPlayingBar({ song, isPlaying, progress, hasPrev, hasNext, onPrev, onNext, onTogglePlay, onSeek }: {
  song: WorshipSong; isPlaying: boolean; progress: number;
  hasPrev: boolean; hasNext: boolean;
  onPrev: () => void; onNext: () => void; onTogglePlay: () => void; onSeek: (pct: number) => void;
}) {
  return (
    <div className="now-playing-bar">
      <div className="np-left">
        <div className="np-art">
          {song.coverUrl ? <img src={song.coverUrl} alt="" /> : <div className="np-art-empty"><Music2 size={15} /></div>}
        </div>
        <div className="np-info">
          <span className="np-title">{song.title}</span>
          <span className="np-artist">{song.artist}</span>
        </div>
      </div>
      <div className="np-center">
        <button className="np-ctrl" onClick={onPrev} disabled={!hasPrev} aria-label="Previous"><SkipBack size={17} /></button>
        <button className="np-play" onClick={onTogglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={19} /> : <Play size={19} />}
        </button>
        <button className="np-ctrl" onClick={onNext} disabled={!hasNext} aria-label="Next"><SkipForward size={17} /></button>
      </div>
      <div className="np-right">
        <input className="np-progress" type="range" min={0} max={100} value={Math.round(progress)} onChange={(e) => onSeek(Number(e.target.value))} aria-label="Seek" />
      </div>
    </div>
  );
}

function WorshipUploadSheet({ onClose }: { onClose: () => void }) {
  const { currentUser, worshipSongs, setWorshipSongs, notify, go } = useApp();
  const [form, setForm] = React.useState({ title: "", artist: "", description: "", category: "Worship", duration: "" });
  const [audioFile, setAudioFile] = React.useState<File | null>(null);
  const [coverFile, setCoverFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const uploadSong = () => {
    if (!currentUser) return go("profile");
    if (!form.title.trim() || !form.artist.trim()) return notify("Add a song title and artist name.");
    if (!audioFile) return notify("Choose an audio file first.");
    const audio = fileInfo(audioFile);
    const cover = fileInfo(coverFile);
    const song: WorshipSong = { id: uid("song"), title: form.title.trim(), artist: form.artist.trim(), description: form.description, category: form.category, duration: form.duration, audioName: audio.name, audioUrl: audio.url, coverName: cover.name, coverUrl: cover.url, uploadedBy: currentUser.name, createdAt: new Date().toLocaleString() };
    setWorshipSongs([song, ...worshipSongs]);
    notify("Worship song uploaded.");
    onClose();
  };

  return (
    <>
      <div className="post-sheet-overlay" onClick={onClose} />
      <div className="post-sheet">
        <div className="post-sheet-drag-bar" />
        <div className="post-sheet-header">
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#f7fbff" }}>Upload Worship Song</span>
          <button className="icon-button" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="post-sheet-body">
          {!currentUser ? (
            <div className="post-sheet-signin">
              <Music2 size={34} style={{ color: "var(--gold)", marginBottom: 8 }} />
              <p>Sign in to upload worship music</p>
              <button className="primary-button" onClick={() => { go("profile"); onClose(); }}>Sign In</button>
            </div>
          ) : (
            <>
              <Field label="Song title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
              <Field label="Artist / worship team" value={form.artist} onChange={(artist) => setForm({ ...form, artist })} />
              <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <Field label="Duration (e.g. 3:45)" value={form.duration} onChange={(duration) => setForm({ ...form, duration })} />
              <FileField label="Audio file (MP3, WAV)" onChange={setAudioFile} />
              <FileField label="Cover image (optional)" onChange={setCoverFile} />
              <button className="primary-button" type="button" onClick={uploadSong}>Upload Song</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function SavedScreen() {
  const { currentUser, saved, savedLists, videos, setSaved, setSavedLists, setSelectedVideoId, go, notify } = useApp();
  const [activeFilter, setActiveFilter] = React.useState<"all" | "videos" | "lists">("all");
  const [showNewList, setShowNewList] = React.useState(false);
  const [listName, setListName] = React.useState("");

  if (!currentUser) {
    return (
      <section className="screen">
        <EmptyState icon={Bookmark} title="Sign in to see your saved videos" body="Your saved videos and collections will appear here." action="Sign In" onAction={() => go("profile")} />
      </section>
    );
  }

  const actorId = currentUser.id;
  const generalIds = saved[actorId] ?? [];
  const userLists = savedLists[actorId] ?? [];
  const generalVideos = videos.filter((v) => generalIds.includes(v.id));
  const openVideo = (id: string) => { setSelectedVideoId(id); go("watch"); };

  const createList = () => {
    const name = listName.trim();
    if (!name) return notify("Name your collection first.");
    if (userLists.some((l) => l.name.toLowerCase() === name.toLowerCase())) return notify("Collection already exists.");
    setSavedLists({ ...savedLists, [actorId]: [...userLists, { id: uid("saved-list"), name, videoIds: [] }] });
    setListName(""); setShowNewList(false); notify("Collection created.");
  };

  const removeFromGeneral = (videoId: string) => { setSaved({ ...saved, [actorId]: generalIds.filter((id) => id !== videoId) }); notify("Removed."); };
  const deleteList = (listId: string) => { setSavedLists({ ...savedLists, [actorId]: userLists.filter((l) => l.id !== listId) }); notify("Collection deleted."); };

  return (
    <section className="screen tt-saved-screen">
      <div className="tt-saved-header">
        <h1 className="tt-saved-title">Saved</h1>
        <p className="tt-saved-meta">{generalIds.length} video{generalIds.length !== 1 ? "s" : ""} · {userLists.length} collection{userLists.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="tt-saved-tabs">
        {(["all", "videos", "lists"] as const).map((f) => (
          <button key={f} className={`tt-saved-tab${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>
            {f === "all" ? "All" : f === "videos" ? "Videos" : "Collections"}
          </button>
        ))}
      </div>

      {(activeFilter === "all" || activeFilter === "videos") && (
        generalVideos.length > 0 ? (
          <div className="tt-saved-grid">
            {generalVideos.map((video) => (
              <button key={video.id} className="tt-saved-cell" onClick={() => openVideo(video.id)}>
                {video.thumbnailUrl
                  ? <img src={video.thumbnailUrl} alt={video.title} />
                  : <div className="tt-saved-cell-empty"><Film size={22} /></div>}
                <div className="tt-saved-cell-overlay">
                  <Play size={14} fill="white" strokeWidth={0} />
                  {video.duration && <span>{video.duration}</span>}
                </div>
                <button className="tt-saved-remove" aria-label="Remove" onClick={(e) => { e.stopPropagation(); removeFromGeneral(video.id); }}>
                  <X size={12} />
                </button>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={Bookmark} title="Nothing saved yet" body="Tap the bookmark on any video to save it here." action="Watch Videos" onAction={() => go("watch")} />
        )
      )}

      {(activeFilter === "all" || activeFilter === "lists") && (
        <div className="tt-collections">
          {activeFilter === "all" && generalVideos.length > 0 && userLists.length > 0 && (
            <p className="tt-collections-label">Collections</p>
          )}
          {userLists.map((list) => {
            const listVideos = videos.filter((v) => list.videoIds.includes(v.id));
            const previews = listVideos.slice(0, 3);
            return (
              <div key={list.id} className="tt-collection-card">
                <div className="tt-collection-thumbnails">
                  {previews.length > 0
                    ? previews.map((v) => v.thumbnailUrl
                        ? <img key={v.id} src={v.thumbnailUrl} alt="" />
                        : <div key={v.id} className="tt-coll-thumb-empty"><Film size={13} /></div>)
                    : <div className="tt-coll-thumb-empty tt-coll-thumb-full"><Bookmark size={18} /></div>}
                </div>
                <div className="tt-collection-info">
                  <p className="tt-collection-name">{list.name}</p>
                  <p className="tt-collection-count">{listVideos.length} video{listVideos.length !== 1 ? "s" : ""}</p>
                </div>
                <button className="tt-collection-delete" onClick={() => deleteList(list.id)} aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            );
          })}
          {activeFilter === "lists" && userLists.length === 0 && (
            <EmptyState icon={Bookmark} title="No collections yet" body="Tap + to create your first collection." action="" onAction={() => {}} />
          )}
        </div>
      )}

      {showNewList && (
        <div className="tt-new-list-bar">
          <input className="tt-new-list-input" placeholder="Collection name…" value={listName} autoFocus onChange={(e) => setListName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createList()} />
          <div className="tt-new-list-btns">
            <button className="secondary-button" onClick={() => { setShowNewList(false); setListName(""); }}>Cancel</button>
            <button className="primary-button" onClick={createList}>Create</button>
          </div>
        </div>
      )}

      {!showNewList && (
        <button className="comm-fab" aria-label="New collection" onClick={() => setShowNewList(true)}>
          <Plus size={24} />
        </button>
      )}
    </section>
  );
}

const COMM_STORIES = [
  { name: "Sarah M.", initials: "SM", color: "#f6d27b" },
  { name: "Pastor James", initials: "PJ", color: "#60a5fa" },
  { name: "Grace H.", initials: "GH", color: "#f472b6" },
  { name: "David K.", initials: "DK", color: "#34d399" },
  { name: "Maria L.", initials: "ML", color: "#fb923c" },
  { name: "Thomas R.", initials: "TR", color: "#c4b5fd" },
];

const COMMUNITY_GROUPS = [
  { name: "Morning Devotions", members: 24, verse: "Psalm 143:8", color: "#f6d27b" },
  { name: "Romans Study", members: 18, verse: "Romans 8:28", color: "#60a5fa" },
  { name: "Youth Ministry", members: 31, verse: "Proverbs 22:6", color: "#34d399" },
  { name: "Worship & Prayer", members: 42, verse: "Psalm 100:1", color: "#fb923c" },
  { name: "Apologetics", members: 11, verse: "1 Peter 3:15", color: "#c4b5fd" },
  { name: "Missionaries", members: 7, verse: "Matthew 28:19", color: "#f472b6" },
];

function playVideoFullscreen(video: VideoItem, notify: (message: string) => void) {
  if (!video.videoUrl) {
    notify("This video is still processing.");
    return;
  }

  const player = document.createElement("video") as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
  player.src = video.videoUrl;
  player.controls = true;
  player.autoplay = true;
  player.playsInline = false;
  player.style.position = "fixed";
  player.style.inset = "0";
  player.style.width = "100vw";
  player.style.height = "100vh";
  player.style.objectFit = "contain";
  player.style.background = "#000";
  player.style.zIndex = "9999";
  document.body.appendChild(player);

  const removePlayer = () => {
    player.pause();
    player.remove();
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    player.removeEventListener("webkitendfullscreen", removePlayer as EventListener);
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) removePlayer();
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  player.addEventListener("webkitendfullscreen", removePlayer as EventListener);

  void player.play().catch(() => undefined);
  if (player.webkitEnterFullscreen) {
    player.webkitEnterFullscreen();
    return;
  }
  void player.requestFullscreen?.().catch(() => undefined);
}

function CommunitySharesScreen({ compact = false }: { compact?: boolean }) {
  const { publicVideos, notify, go, t } = useApp();
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const userVideos = publicVideos.filter((v) => v.source === "user" && !v.seriesId);
  const filteredVideos = selectedCategory === "All" ? userVideos : userVideos.filter((video) => video.category === selectedCategory);
  const openVideo = (video: VideoItem) => playVideoFullscreen(video, notify);
  return (
    <div className="community-shares-screen">
      {!compact && <div className="community-shares-intro">
        <Share2 size={28} className="community-shares-icon" />
        <div>
          <h3 className="community-shares-title">Community Shares</h3>
          <p className="community-shares-body">Testimonies and videos shared by members of the Faith Flix community. New videos can take a minute to finish processing.</p>
        </div>
      </div>}
      {compact && <SectionHeader title="Shared videos" action={userVideos.length + " live"} />}
      {userVideos.length > 0 && (
        <div className="community-share-filter" aria-label="Filter community shares by category">
          <button className={selectedCategory === "All" ? "community-share-pill active" : "community-share-pill"} onClick={() => setSelectedCategory("All")}>All</button>
          {COMMUNITY_VIDEO_CATEGORIES.map((category) => (
            <button className={selectedCategory === category ? "community-share-pill active" : "community-share-pill"} key={category} onClick={() => setSelectedCategory(category)}>{category}</button>
          ))}
        </div>
      )}
      {userVideos.length ? (
        <div className="content-grid community-shares-grid">
          {filteredVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => openVideo(video)} />)}
        </div>
      ) : (
        <EmptyState icon={Share2} title="No community shares yet" body="When members submit testimonies and videos they will appear here." action={t("hero.submitTestimony")} onAction={() => go("upload")} />
      )}
    </div>
  );
}

function CommunityScreen() {
  const { communityView, setCommunityView, notify, commSearchQuery, t } = useApp();
  const [showPostSheet, setShowPostSheet] = React.useState(communityView === "upload");
  const [sheetTab, setSheetTab] = React.useState<"post" | "video">(communityView === "upload" ? "video" : "post");

  React.useEffect(() => {
    if (communityView === "upload") {
      setSheetTab("video");
      setShowPostSheet(true);
      setCommunityView("feed");
    }
  }, [communityView]);

  const tabs: { id: CommunityView; label: string; icon: React.ElementType }[] = [
    { id: "feed", label: t("comm.tab.feed"), icon: MessagesSquare },
    { id: "prayer", label: t("comm.tab.prayer"), icon: HeartHandshake },
    { id: "groups", label: t("comm.tab.groups"), icon: Users },
    { id: "friends", label: t("comm.tab.friends"), icon: UserPlus },
    { id: "messages", label: t("comm.tab.messages"), icon: Inbox },
  ];

  return (
    <section className="screen">
      <SectionIntro eyebrow="Community" title="Faith-centered connection" body="Post encouragement, share your faith, pray together, and connect with believers." />
      <div className="segmented-row">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} className={communityView === id ? "segment active" : "segment"} onClick={() => setCommunityView(id)}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>
      {commSearchQuery.trim() ? <CommunitySearchResults /> : <>
        {(communityView === "feed" || communityView === "upload") && <FaithFeed />}
        {communityView === "prayer" && <PrayerWall />}
        {communityView === "groups" && (
          <div className="comm-groups-grid">
            {COMMUNITY_GROUPS.map((group) => (
              <button key={group.name} className="comm-group-card" onClick={() => notify(`${group.name} — joining coming soon!`)}>
                <div className="comm-group-icon" style={{ background: group.color + "22", borderColor: group.color + "44" }}>
                  <Users size={22} style={{ color: group.color }} />
                </div>
                <p className="comm-group-name">{group.name}</p>
                <p className="comm-group-meta">{group.members} members</p>
                <p className="comm-group-verse">{group.verse}</p>
              </button>
            ))}
          </div>
        )}
        {communityView === "friends" && <FriendsPanel />}
        {communityView === "messages" && <MessagesPanel />}
      </>}

      <button className="comm-fab" aria-label="Create post" onClick={() => { setSheetTab("post"); setShowPostSheet(true); }}>
        <Plus size={24} />
      </button>

      {showPostSheet && (
        <PostComposerSheet
          defaultTab={sheetTab}
          onClose={() => setShowPostSheet(false)}
        />
      )}
    </section>
  );
}


function CommunityUpload({ onDone }: { onDone?: () => void } = {}) {
  const { currentUser, setUploads, setVideos, setSelectedVideoId, setCommunityView, setUploadProgress, notify, go } = useApp();
  const [form, setForm] = React.useState({ title: "", description: "", scripture: "", category: COMMUNITY_VIDEO_CATEGORIES[0], testimonyType: "Testimony", tags: "", consent: false, rules: false, cropDimension: "9:16", cropRatio: "9 / 16" });
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [thumbFile, setThumbFile] = React.useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = React.useState("");

  if (!currentUser) {
    return <EmptyState icon={Lock} title="Sign in to share" body="Create an account or log in to upload faith videos and testimonies." action="Open Profile" onAction={() => go("profile")} />;
  }

  const submit = () => {
    if (!form.title || !form.consent || !form.rules) return notify("Add a title and confirm both checkboxes.");
    if (!videoFile) return notify("Choose a video file first.");

    const uploadUser = currentUser;
    const uploadForm = { ...form };
    const uploadVideoFile = videoFile;
    const uploadThumbFile = thumbFile;
    const progress = startUploadProgress(setUploadProgress, "Uploading in background");

    setForm({ ...form, title: "", description: "", scripture: "", tags: "", consent: false, rules: false });
    setVideoFile(null);
    setThumbFile(null);
    setThumbPreview("");
    notify("Uploading in background. Keep the app open.");

    void (async () => {
      try {
        progress.step("Checking login", 20);
        const authUser = await getActiveAuthUser();
        progress.step("Uploading video", 8);
        const video = await uploadMediaFile(uploadVideoFile, authUser.id, "videos", (percent) => progress.percent("Uploading video", percent));
        progress.step(uploadThumbFile ? "Uploading thumbnail" : "Saving post", 94);
        const thumb = uploadThumbFile ? await uploadMediaFile(uploadThumbFile, authUser.id, "thumbnails") : { name: "Cloudflare thumbnail", url: video.thumbnailUrl || "" };
        progress.step("Publishing", 92);
        const uploadId = uid("upload");
        const publicVideo: Omit<VideoItem, "id" | "createdAt"> = { source: "user", title: uploadForm.title, description: uploadForm.description, scripture: uploadForm.scripture, category: uploadForm.category, seriesId: "", episode: "", duration: "", creator: uploadUser.name, tags: uploadForm.tags, status: "Published", videoName: video.name, videoUrl: video.url, thumbnailName: thumb.name, thumbnailUrl: thumb.url, cropDimension: uploadForm.cropDimension, cropRatio: uploadForm.cropRatio };
        const { data, error } = await supabase.from("videos").insert(videoToDb(publicVideo, authUser.id)).select("*").single();
        if (error) throw error;
        const savedVideo = videoFromDb(data as DbVideo);
        setUploads((current) => [...current, { id: uploadId, userId: uploadUser.id, ...uploadForm, visibility: "Public", videoName: video.name, videoUrl: video.url, thumbnailName: thumb.name, thumbnailUrl: thumb.url, status: "Approved", adminNote: "Published instantly." }]);
        setVideos((current) => [...current.filter((item) => item.id !== savedVideo.id), savedVideo]);
        setSelectedVideoId(savedVideo.id);
        progress.done("Posted");
        notify("Posted! Video may take a minute to process.");
        if (onDone) onDone(); else setCommunityView("feed");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed.";
        progress.fail("Upload failed");
        notify(message);
      }
    })();
  };

  return (
    <>
      <div className="form-card">
        <h2>Share your faith</h2>
        <p className="comm-upload-hint">Upload a testimony, devotional, worship clip, or faith video to share with the community.</p>
        <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <Field label="Scripture reference" value={form.scripture} onChange={(scripture) => setForm({ ...form, scripture })} />
        <Select label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} options={COMMUNITY_VIDEO_CATEGORIES} />
        <Select label="Type" value={form.testimonyType} onChange={(testimonyType) => setForm({ ...form, testimonyType })} options={["Testimony", "Answered prayer", "Devotional", "Church clip", "Worship"]} />
        <Field label="Tags (optional)" value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
        <div className="comm-format-notice">
          <span className="comm-format-badge">9:16 Vertical</span>
          <span className="comm-format-text">Videos must be vertical to appear in the Watch feed.</span>
        </div>
        <FileField label="Video file" onChange={setVideoFile} />
        <PhotoCropChooser label="Thumbnail (optional)" value={thumbPreview} cropLabel="9:16" cropRatio="9 / 16" onChange={(file, previewUrl) => { setThumbFile(file); setThumbPreview(previewUrl); }} />
        <Check label="I have permission to share this content." checked={form.consent} onChange={(consent) => setForm({ ...form, consent })} />
        <Check label="This submission follows the Faith Flix content rules." checked={form.rules} onChange={(rules) => setForm({ ...form, rules })} />
        <button className="primary-button" type="button" onClick={submit}>Post Now</button>
      </div>
      <MyUploads />
    </>
  );
}

function PostComposerSheet({ defaultTab, onClose }: { defaultTab: "post" | "video" | "prayer"; onClose: () => void }) {
  const { currentUser, posts, setPosts, prayers, setPrayers, notify, go } = useApp();
  const [tab, setTab] = React.useState<"post" | "video" | "prayer">(defaultTab);
  const [text, setText] = React.useState("");
  const [scripture, setScripture] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState("");
  const [prayerTitle, setPrayerTitle] = React.useState("");
  const [prayerText, setPrayerText] = React.useState("");
  const [prayerVisibility, setPrayerVisibility] = React.useState<"Public" | "Private">("Public");

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const sharePost = () => {
    if (!currentUser) return notify("Sign in to post.");
    if (!text.trim()) return notify("Write something first.");
    const info = fileInfo(image);
    setPosts((current) => [{ id: uid("post"), userId: currentUser.id, author: currentUser.name, text, scripture, imageName: info.name, imageUrl: info.url, likes: [], saves: [], reports: [] }, ...current]);
    setText(""); setScripture(""); setImage(null); setImagePreview("");
    notify("Post shared!");
    onClose();
  };

  const sharePrayer = () => {
    if (!currentUser) return notify("Sign in to post a prayer request.");
    if (!prayerTitle.trim()) return notify("Add a prayer title.");
    if (!prayerText.trim()) return notify("Write your prayer request.");
    setPrayers((current) => [{ id: uid("prayer"), userId: currentUser.id, title: prayerTitle.trim(), text: prayerText.trim(), visibility: prayerVisibility, actions: {} }, ...current]);
    setPrayerTitle(""); setPrayerText(""); setPrayerVisibility("Public");
    notify("Prayer request posted 🙏");
    onClose();
  };

  return (
    <>
      <div className="post-sheet-overlay" onClick={onClose} />
      <div className="post-sheet">
        <div className="post-sheet-drag-bar" />
        <div className="post-sheet-header">
          <div className="post-sheet-tabs">
            <button className={`post-sheet-tab${tab === "post" ? " active" : ""}`} onClick={() => setTab("post")}>Post</button>
            <button className={`post-sheet-tab${tab === "prayer" ? " active" : ""}`} onClick={() => setTab("prayer")}>🙏 Prayer</button>
            <button className={`post-sheet-tab${tab === "video" ? " active" : ""}`} onClick={() => setTab("video")}>Video</button>
          </div>
          <button className="icon-button post-sheet-close" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>

        {tab === "post" && (
          <div className="post-sheet-body">
            {!currentUser ? (
              <div className="post-sheet-signin">
                <Lock size={34} style={{ color: "var(--gold)", marginBottom: 8 }} />
                <p>Sign in to post in the community</p>
                <button className="primary-button" onClick={() => { go("profile"); onClose(); }}>Sign In</button>
              </div>
            ) : (
              <>
                <div className="post-sheet-composer">
                  <div className="post-avatar post-avatar-lg">{currentUser.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}</div>
                  <textarea
                    className="post-sheet-textarea"
                    placeholder="Share encouragement, a testimony, or what God put on your heart…"
                    value={text}
                    autoFocus
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                  />
                </div>
                {imagePreview && <img className="post-sheet-preview" src={imagePreview} alt="Preview" />}
                <div className="post-sheet-meta-row">
                  <input className="post-sheet-scripture-input" placeholder="Scripture reference (optional)" value={scripture} onChange={(e) => setScripture(e.target.value)} />
                </div>
                <div className="post-sheet-bottom-bar">
                  <label className="post-sheet-photo-btn" aria-label="Add photo">
                    <Camera size={20} />
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0] ?? null; setImage(f); setImagePreview(f ? URL.createObjectURL(f) : ""); }} />
                  </label>
                  <span className="post-sheet-char">{text.length > 0 ? `${text.length} chars` : ""}</span>
                  <button className="comm-post-btn" onClick={sharePost} disabled={!text.trim()}>Share</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "prayer" && (
          <div className="post-sheet-body">
            {!currentUser ? (
              <div className="post-sheet-signin">
                <HeartHandshake size={34} style={{ color: "var(--gold)", marginBottom: 8 }} />
                <p>Sign in to post a prayer request</p>
                <button className="primary-button" onClick={() => { go("profile"); onClose(); }}>Sign In</button>
              </div>
            ) : (
              <>
                <div className="prayer-sheet-intro">
                  <HeartHandshake size={22} style={{ color: "var(--gold)", flexShrink: 0 }} />
                  <p>Share a prayer request with the Faith Flix community.</p>
                </div>
                <div className="prayer-sheet-form">
                  <input
                    className="post-sheet-scripture-input prayer-title-input"
                    placeholder="Prayer title (e.g. Healing for my family)"
                    value={prayerTitle}
                    autoFocus
                    onChange={(e) => setPrayerTitle(e.target.value)}
                  />
                  <textarea
                    className="prayer-body-textarea"
                    placeholder="Share your prayer request… Be as specific or general as you'd like."
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    rows={5}
                  />
                  <div className="prayer-visibility-row">
                    <span className="prayer-visibility-label">Visibility</span>
                    <div className="prayer-visibility-toggle">
                      <button className={`prayer-vis-btn${prayerVisibility === "Public" ? " active" : ""}`} onClick={() => setPrayerVisibility("Public")}>🌐 Public</button>
                      <button className={`prayer-vis-btn${prayerVisibility === "Private" ? " active" : ""}`} onClick={() => setPrayerVisibility("Private")}>🔒 Private</button>
                    </div>
                  </div>
                </div>
                <div className="post-sheet-bottom-bar">
                  <span className="post-sheet-char">{prayerText.length > 0 ? `${prayerText.length} chars` : ""}</span>
                  <button className="comm-post-btn prayer-post-btn" onClick={sharePrayer} disabled={!prayerTitle.trim() || !prayerText.trim()}>Post Prayer</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "video" && (
          <div className="post-sheet-body post-sheet-video-body">
            <CommunityUpload onDone={onClose} />
          </div>
        )}
      </div>
    </>
  );
}

function CommunitySearchResults() {
  const { commSearchQuery, setCommSearchQuery, posts, prayers, publicVideos, users, messages, currentUser, setSelectedVideoId, setCommunityView, setSelectedCommunityUser, setSelectedMessageUser, go, notify } = useApp();
  const q = commSearchQuery.trim().toLowerCase();
  const openVideo = (id: string) => { setSelectedVideoId(id); go("watch"); };
  const postMatches = posts.filter((post) => [post.author, post.text, post.scripture].join(" ").toLowerCase().includes(q));
  const prayerMatches = prayers.filter((prayer) => [prayer.title, prayer.text, prayer.visibility].join(" ").toLowerCase().includes(q));
  const shareMatches = publicVideos.filter((video) => video.source === "user" && [video.title, video.description, video.category, video.creator, video.scripture, video.tags].join(" ").toLowerCase().includes(q));
  const groupMatches = COMMUNITY_GROUPS.filter((group) => [group.name, group.verse, String(group.members)].join(" ").toLowerCase().includes(q));
  const memberMatches = users.filter((user) => user.role !== "admin" && [user.name, user.username, user.bio, user.favoriteScripture, user.ministry, user.location].join(" ").toLowerCase().includes(q));
  const messageMatches = currentUser
    ? messages.filter((message) => [message.text, users.find((user) => user.id === (message.fromId === currentUser.id ? message.toId : message.fromId))?.name].join(" ").toLowerCase().includes(q) && [message.fromId, message.toId].includes(currentUser.id))
    : [];
  const total = postMatches.length + prayerMatches.length + shareMatches.length + groupMatches.length + memberMatches.length + messageMatches.length;

  if (!total) return <EmptyState icon={Search} title="No community results found." body="Try searching posts, prayers, groups, members, shared videos, or messages." action="" onAction={() => {}} />;

  return (
    <div className="community-search-results">
      <SectionHeader title="Community results" action={total + " found"} />
      {postMatches.length > 0 && <section className="community-search-section"><SectionHeader title="Faith Feed" action={postMatches.length + " posts"} />{postMatches.map((post) => <article className="content-panel" key={post.id}><p className="eyebrow">{post.author}</p><h3>{post.scripture || "Community post"}</h3><p>{post.text}</p></article>)}</section>}
      {prayerMatches.length > 0 && <section className="community-search-section"><SectionHeader title="Prayer Wall" action={prayerMatches.length + " prayers"} />{prayerMatches.map((prayer) => <article className="content-panel prayer-card" key={prayer.id}><p className="eyebrow">{prayer.visibility}</p><h3>{prayer.title}</h3><p>{prayer.text}</p></article>)}</section>}
      {shareMatches.length > 0 && <section className="community-search-section"><SectionHeader title="Community Shares" action={shareMatches.length + " videos"} /><div className="content-grid">{shareMatches.map((video) => <VideoCard key={video.id} video={video} onOpen={() => openVideo(video.id)} />)}</div></section>}
      {groupMatches.length > 0 && <section className="community-search-section"><SectionHeader title="Groups" action={groupMatches.length + " groups"} /><div className="comm-groups-grid">{groupMatches.map((group) => <button key={group.name} className="comm-group-card" onClick={() => notify(group.name + " — joining coming soon!")}><div className="comm-group-icon" style={{ background: group.color + "22", borderColor: group.color + "44" }}><Users size={22} style={{ color: group.color }} /></div><p className="comm-group-name">{group.name}</p><p className="comm-group-meta">{group.members} members</p><p className="comm-group-verse">{group.verse}</p></button>)}</div></section>}
      {memberMatches.length > 0 && <section className="community-search-section"><SectionHeader title="Members" action={memberMatches.length + " people"} />{memberMatches.map((member) => <button className="content-panel community-member-result" key={member.id} onClick={() => { setSelectedCommunityUser(member.id); setCommSearchQuery(""); setCommunityView("friends"); }}><p className="eyebrow">@{member.username || "faithmember"}</p><h3>{member.name}</h3>{member.bio && <p>{member.bio}</p>}</button>)}</section>}
      {messageMatches.length > 0 && <section className="community-search-section"><SectionHeader title="DMs" action={messageMatches.length + " messages"} />{messageMatches.map((message) => { const otherId = message.fromId === currentUser?.id ? message.toId : message.fromId; const other = users.find((user) => user.id === otherId); return <button className="content-panel community-member-result" key={message.id} onClick={() => { setSelectedMessageUser(otherId); setCommunityView("messages"); }}><p className="eyebrow">{other?.name || "Message"}</p><h3>{message.text}</h3><p>{message.createdAt}</p></button>; })}</section>}
    </div>
  );
}

function FaithFeed() {
  const { currentUser, posts, setPosts, notify, comments, commSearchQuery } = useApp();
  const [feedMode, setFeedMode] = React.useState<"posts" | "videos">("posts");
  const actor = currentUser?.id ?? "guest";

  const togglePost = (id: string, field: "likes" | "saves" | "reports", message: string) => {
    setPosts(posts.map((post) => post.id === id ? { ...post, [field]: post[field].includes(actor) ? post[field].filter((item) => item !== actor) : [...post[field], actor] } : post));
    notify(message);
  };

  const filteredPosts = commSearchQuery
    ? posts.filter((p) => [p.text, p.author, p.scripture].join(" ").toLowerCase().includes(commSearchQuery.toLowerCase()))
    : posts;

  return (
    <>
      <div className="feed-mode-switch" role="tablist" aria-label="Feed content type">
        <button className={feedMode === "posts" ? "feed-mode-pill active" : "feed-mode-pill"} onClick={() => setFeedMode("posts")} type="button">Posts</button>
        <button className={feedMode === "videos" ? "feed-mode-pill active" : "feed-mode-pill"} onClick={() => setFeedMode("videos")} type="button">Videos</button>
      </div>

      {feedMode === "posts" ? (
        <>
          {commSearchQuery && filteredPosts.length === 0 && <EmptyState icon={Search} title="No posts match your search." body="Try a different keyword." action="" onAction={() => {}} />}
          {filteredPosts.map((post) => <PostCard key={post.id} post={post} comments={comments.filter((item) => item.targetId === post.id)} onToggle={togglePost} />)}
          {!commSearchQuery && filteredPosts.length === 0 && <EmptyState icon={MessagesSquare} title="No posts yet — be first!" body="Tap the gold + button below to share encouragement, a testimony, or what God put on your heart." action="" onAction={() => {}} />}
        </>
      ) : (
        <>
          <CommunityVideoComposer />
          <CommunitySharesScreen compact />
          <CommunitySeriesShelf />
        </>
      )}
    </>
  );
}

function CommunityVideoComposer() {
  const { currentUser, setVideos, setSelectedVideoId, notify } = useApp();
  const [form, setForm] = React.useState({ title: "", description: "", scripture: "", category: COMMUNITY_VIDEO_CATEGORIES[0], tags: "" });
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [thumbFile, setThumbFile] = React.useState<File | null>(null);

  const postVideo = () => {
    if (!currentUser) return notify("Create an account before posting a video.");
    if (!form.title.trim()) return notify("Add a video title.");
    if (!videoFile) return notify("Choose a video file first.");
    const videoInfo = fileInfo(videoFile);
    const thumbInfo = fileInfo(thumbFile);
    const nextVideo: VideoItem = {
      id: uid("feed-video"),
      source: "user",
      title: form.title.trim(),
      description: form.description,
      scripture: form.scripture,
      category: form.category,
      seriesId: "",
      episode: "",
      duration: "",
      creator: currentUser.name,
      tags: form.tags,
      status: "Published",
      featured: false,
      videoName: videoInfo.name,
      videoUrl: videoInfo.url,
      thumbnailName: thumbInfo.name,
      thumbnailUrl: thumbInfo.url,
      cropDimension: "9:16",
      cropRatio: "9 / 16",
      createdAt: new Date().toLocaleString(),
    };
    setVideos((current) => [nextVideo, ...current]);
    setSelectedVideoId(nextVideo.id);
    setForm({ title: "", description: "", scripture: "", category: COMMUNITY_VIDEO_CATEGORIES[0], tags: "" });
    setVideoFile(null);
    setThumbFile(null);
    notify("Video posted to the feed.");
  };

  return (
    <div className="form-card community-video-composer">
      <SectionHeader title="Post a video" action="Community" />
      <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
      <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <Field label="Scripture reference" value={form.scripture} onChange={(scripture) => setForm({ ...form, scripture })} />
      <Select label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} options={COMMUNITY_VIDEO_CATEGORIES} />
      <Field label="Tags" value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
      <FileField label="Video file" onChange={setVideoFile} />
      <FileField label="Thumbnail image" onChange={setThumbFile} />
      <button className="primary-button" type="button" onClick={postVideo}>Post Video</button>
    </div>
  );
}

function CommunitySeriesShelf() {
  const { publicSeries, publicVideos, setSelectedSeriesId, go } = useApp();
  const communitySeries = publicSeries.filter((item) => item.id.startsWith("user-series") || item.id.startsWith("mock-user-series") || item.title.toLowerCase().includes("community series"));

  if (!communitySeries.length) {
    return <EmptyState icon={Clapperboard} title="No community series yet" body="Series uploaded from the Upload section will appear here." action="Create Series" onAction={() => go("upload")} />;
  }

  return (
    <section className="community-series-section">
      <SectionHeader title="Community series" action={`${communitySeries.length} series`} />
      <div className="horizontal-series-row home-series-row community-series-row">
        {communitySeries.map((item) => {
          const count = publicVideos.filter((video) => video.seriesId === item.title).length;
          return <HomeSeriesCard key={item.id} item={item} episodeCount={count} onOpen={() => { setSelectedSeriesId(item.id); go("series"); }} />;
        })}
      </div>
    </section>
  );
}

function PrayerWall() {
  const { currentUser, prayers, setPrayers, notify, commSearchQuery, t } = useApp();
  const [form, setForm] = React.useState({ title: "", text: "", visibility: "Public" });
  const create = () => {
    if (!currentUser) return notify("Create an account before posting prayer requests.");
    if (!form.title || !form.text) return notify("Add a title and request.");
    setPrayers([{ id: uid("prayer"), userId: currentUser.id, ...form, actions: {} }, ...prayers]);
    setForm({ title: "", text: "", visibility: "Public" });
    notify("Prayer request posted.");
  };

  return (
    <>
      <div className="form-card">
        <Field label="Request title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <label>Request text<textarea value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} /></label>
        <Select label="Visibility" value={form.visibility} onChange={(visibility) => setForm({ ...form, visibility })} options={["Public", "Private"]} />
        <button className="primary-button" onClick={create}>Post Prayer Request</button>
      </div>
      {(() => {
        const filtered = commSearchQuery
          ? prayers.filter((p) => [p.title, p.text].join(" ").toLowerCase().includes(commSearchQuery.toLowerCase()))
          : prayers;
        if (commSearchQuery && filtered.length === 0) return <EmptyState icon={Search} title="No prayers match your search." body="Try a different keyword." action="" onAction={() => {}} />;
        if (filtered.length === 0) return <EmptyState icon={HeartHandshake} title={t("comm.noPrayer")} body={t("comm.noPrayerBody")} action={t("comm.usePrayerForm")} onAction={() => notify(t("comm.usePrayerForm"))} />;
        return <>{filtered.map((prayer) => <article className="content-panel prayer-card" key={prayer.id}><p className="eyebrow">{prayer.visibility}</p><h3>{prayer.title}</h3><p>{prayer.text}</p></article>)}</>;
      })()}
    </>
  );
}

function DiscussionRooms() {
  const { publicVideos, comments, setSelectedVideoId, go, t } = useApp();
  return publicVideos.length ? <div className="content-grid">{publicVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => { setSelectedVideoId(video.id); go("watch"); }} extra={<span className="meta">{comments.filter((item) => item.targetId === video.id).length} comments</span>} />)}</div> : <EmptyState icon={MessageCircle} title={t("comm.noDiscussions")} body={t("comm.noDiscussionsBody")} action={t("nav.watch")} onAction={() => go("watch")} />;
}

function FriendsPanel() {
  const { currentUser, users, friendRequests, setFriendRequests, selectedCommunityUser, setSelectedCommunityUser, setSelectedMessageUser, setCommunityView, notify, t } = useApp();
  if (!currentUser) return <EmptyState icon={UserPlus} title={t("comm.noFriends")} body={t("comm.noFriendsBody")} action={t("profile.eyebrow")} onAction={() => notify(t("profile.eyebrow"))} />;
  const others = users.filter((user) => user.id !== currentUser.id && user.role !== "admin");
  const incoming = friendRequests.filter((request) => request.toId === currentUser.id && request.status === "pending");
  const accepted = friendRequests.filter((request) => request.status === "accepted" && [request.fromId, request.toId].includes(currentUser.id));
  const requestFriend = (toId: string) => {
    if (friendRequests.some((request) => [request.fromId, request.toId].includes(currentUser.id) && [request.fromId, request.toId].includes(toId))) return notify(t("comm.friendExists"));
    setFriendRequests([...friendRequests, { id: uid("friend"), fromId: currentUser.id, toId, status: "pending" }]);
    notify(t("comm.friendRequestSent"));
  };
  const selectedMember = users.find((user) => user.id === selectedCommunityUser && user.role !== "admin");
  if (selectedMember) {
    const friendship = friendRequests.find((request) => [request.fromId, request.toId].includes(currentUser.id) && [request.fromId, request.toId].includes(selectedMember.id));
    const canMessage = friendship?.status === "accepted";
    const actionLabel = friendship?.status === "accepted" ? "Friends" : friendship?.status === "pending" ? "Request Sent" : "Add Friend";
    return (
      <div className="content-panel community-profile-card">
        <button className="text-button inline-text-button" onClick={() => setSelectedCommunityUser("")}>← Back to members</button>
        <div className="community-profile-head">
          <div className="community-profile-avatar">{selectedMember.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
          <div>
            <p className="eyebrow">@{selectedMember.username || "faithmember"}</p>
            <h2>{selectedMember.name}</h2>
            {selectedMember.location && <p>{selectedMember.location}</p>}
          </div>
        </div>
        {selectedMember.bio && <p>{selectedMember.bio}</p>}
        <div className="profile-info-grid">
          {selectedMember.favoriteScripture && <InfoLine label="Favorite scripture" value={selectedMember.favoriteScripture} />}
          {selectedMember.ministry && <InfoLine label="Ministry" value={selectedMember.ministry} />}
        </div>
        <div className="button-row">
          <button className={friendship ? "secondary-button" : "primary-button"} disabled={Boolean(friendship)} onClick={() => requestFriend(selectedMember.id)}><UserPlus size={17} /> {actionLabel}</button>
          {canMessage && <button className="secondary-button" onClick={() => { setSelectedMessageUser(selectedMember.id); setCommunityView("messages"); }}><Inbox size={17} /> Message</button>}
        </div>
      </div>
    );
  }
  return (
    <div className="panel-grid">
      <div className="content-panel"><h2>{t("comm.friends")}</h2>{accepted.length ? accepted.map((request) => <FriendRow key={request.id} request={request} />) : <p>{t("comm.noFriendsYet")}</p>}</div>
      <div className="content-panel"><h2>{t("comm.requests")}</h2>{incoming.length ? incoming.map((request) => <button className="secondary-button" key={request.id} onClick={() => { setFriendRequests(friendRequests.map((item) => item.id === request.id ? { ...item, status: "accepted" } : item)); notify("Friend request accepted."); }}>Accept {users.find((user) => user.id === request.fromId)?.name}</button>) : <p>{t("comm.noRequestsYet")}</p>}</div>
      <div className="content-panel"><h2>{t("comm.otherMembers")}</h2>{others.length ? others.map((user) => <button className="secondary-button" key={user.id} onClick={() => setSelectedCommunityUser(user.id)}>Open {user.name}</button>) : <p>{t("comm.noOtherUsers")}</p>}</div>
    </div>
  );
}

function FriendRow({ request }: { request: FriendRequest }) {
  const { currentUser, users, setFriendRequests, friendRequests, notify, t } = useApp();
  const otherId = request.fromId === currentUser?.id ? request.toId : request.fromId;
  const other = users.find((user) => user.id === otherId);
  return <div className="item-row"><span>{other?.name ?? "Member"}</span><button className="secondary-button" onClick={() => { setFriendRequests(friendRequests.filter((item) => item.id !== request.id)); notify(t("comm.friendRemoved")); }}>{t("comm.remove")}</button></div>;
}

function MessagesPanel() {
  const { currentUser, users, friendRequests, selectedMessageUser, setSelectedMessageUser, messages, setMessages, notify, t } = useApp();
  const [text, setText] = React.useState("");
  if (!currentUser) return <EmptyState icon={Inbox} title={t("comm.noMessages")} body={t("comm.noMessagesBody")} action={t("profile.eyebrow")} onAction={() => notify(t("profile.eyebrow"))} />;
  const friendIds = friendRequests.filter((request) => request.status === "accepted" && [request.fromId, request.toId].includes(currentUser.id)).map((request) => request.fromId === currentUser.id ? request.toId : request.fromId);
  const friend = users.find((user) => user.id === selectedMessageUser);
  const thread = messages.filter((message) => friend && [message.fromId, message.toId].includes(currentUser.id) && [message.fromId, message.toId].includes(friend.id));
  const sendMessage = () => {
    if (!friend) return notify(t("comm.chooseAFriend"));
    if (!text.trim()) return notify(t("comm.writeAMessage"));
    setMessages([...messages, { id: uid("msg"), fromId: currentUser.id, toId: friend.id, text, createdAt: new Date().toLocaleString() }]);
    setText("");
  };
  return (
    <div className="message-layout">
      <div className="content-panel"><h2>Conversations</h2>{friendIds.length ? friendIds.map((id) => <button className="secondary-button" key={id} onClick={() => setSelectedMessageUser(id)}>{users.find((user) => user.id === id)?.name}</button>) : <p>No messages yet.</p>}</div>
      <div className="content-panel chat-panel"><h2>{friend ? friend.name : "No messages yet."}</h2><div className="chat-list">{thread.map((message) => <div className={message.fromId === currentUser.id ? "bubble mine" : "bubble"} key={message.id}>{message.text}</div>)}</div><div className="message-compose"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message" /><button className="primary-button" onClick={sendMessage}><Send size={17} /></button></div></div>
    </div>
  );
}

function ProfileScreen() {
  const { currentUser, users, setUsers, setSessionId, isAdmin, uploads, posts, signOut, go, notify, t } = useApp();
  const [mode, setMode] = React.useState<"signup" | "login">("login");
  const [editOpen, setEditOpen] = React.useState(false);
  const [profileTab, setProfileTab] = React.useState<"posts" | "uploads">("posts");

  if (!currentUser) {
    return (
      <section className="screen auth-screen">
        <div className="auth-card">
          <SectionIntro eyebrow="Faith Flix" title="Sign in" body="Log in to post, save, upload, and manage your Faith Flix account." />
          <div className="button-row">
            <button className={mode === "login" ? "primary-button" : "secondary-button"} onClick={() => setMode("login")}>{t("profile.login")}</button>
            <button className={mode === "signup" ? "primary-button" : "secondary-button"} onClick={() => setMode("signup")}>{t("profile.signup")}</button>
          </div>
          {mode === "signup" ? <SignupForm /> : <LoginForm />}
          <button className="text-button" onClick={() => go("home")}>Continue as guest</button>
        </div>
      </section>
    );
  }

  const update = (patch: Partial<Profile>) => {
    setUsers(users.map((u) => u.id === currentUser.id ? { ...u, ...patch } : u));
    void supabase.from("profiles").update({ name: patch.name, username: patch.username, birthday: patch.birthday, bio: patch.bio, favorite_scripture: patch.favoriteScripture, church_ministry_name: patch.ministry, location: patch.location, profile_image_url: patch.image }).eq("id", currentUser.id);
    notify(t("profile.profileUpdated"));
  };

  const initials = currentUser.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const myPosts = posts.filter((p) => p.userId === currentUser.id);
  const myUploads = uploads.filter((u) => u.userId === currentUser.id);

  return (
    <section className="screen ig-profile-screen">
      {/* ── Header row: avatar + stats ── */}
      <div className="ig-profile-header">
        <div className="ig-profile-avatar-wrap">
          {currentUser.image
            ? <img src={currentUser.image} alt={currentUser.name} className="ig-profile-avatar-img" />
            : <div className="ig-profile-avatar-initials">{initials}</div>}
        </div>
        <div className="ig-profile-stats">
          <div className="ig-stat"><span className="ig-stat-num">{myPosts.length}</span><span className="ig-stat-label">Posts</span></div>
          <div className="ig-stat"><span className="ig-stat-num">128</span><span className="ig-stat-label">Followers</span></div>
          <div className="ig-stat"><span className="ig-stat-num">47</span><span className="ig-stat-label">Following</span></div>
        </div>
      </div>

      {/* ── Bio block ── */}
      <div className="ig-profile-bio-block">
        <p className="ig-profile-name">{currentUser.name}</p>
        {currentUser.username && <p className="ig-profile-username">@{currentUser.username}</p>}
        {currentUser.bio && <p className="ig-profile-bio-text">{currentUser.bio}</p>}
        {currentUser.favoriteScripture && <p className="ig-profile-detail">📖 {currentUser.favoriteScripture}</p>}
        {currentUser.location && <p className="ig-profile-detail">📍 {currentUser.location}</p>}
        {currentUser.ministry && <p className="ig-profile-detail">⛪ {currentUser.ministry}</p>}
        {isAdmin && <span className="ig-admin-badge">Admin</span>}
      </div>

      {/* ── Action buttons ── */}
      <div className="ig-profile-actions">
        <button className="ig-profile-btn" onClick={() => setEditOpen((v) => !v)}>{editOpen ? "Done Editing" : "Edit Profile"}</button>
        {isAdmin && <button className="ig-profile-btn" onClick={() => go("admin-studio")}>Studio</button>}
        <button className="ig-profile-btn ig-profile-btn-sq" onClick={signOut} aria-label="Sign out"><LogOut size={17} /></button>
      </div>

      {/* ── Edit panel (collapsible) ── */}
      {editOpen && (
        <div className="ig-profile-edit-panel">
          <Field label={t("profile.nameLabel")} value={currentUser.name} onChange={(name) => update({ name })} />
          <Field label={t("profile.usernameLabel")} value={currentUser.username} onChange={(username) => update({ username })} />
          <Field label={t("profile.bioLabel")} value={currentUser.bio ?? ""} onChange={(bio) => update({ bio })} />
          <Field label={t("profile.scriptureLabel")} value={currentUser.favoriteScripture ?? ""} onChange={(favoriteScripture) => update({ favoriteScripture })} />
          <Field label={t("profile.churchLabel")} value={currentUser.ministry ?? ""} onChange={(ministry) => update({ ministry })} />
          <Field label="Birthday" type="date" value={currentUser.birthday ?? ""} onChange={(birthday) => update({ birthday })} />
          <Field label={t("profile.locationLabel")} value={currentUser.location ?? ""} onChange={(location) => update({ location })} />
          <FileField label="Profile photo" onChange={(file) => update({ image: fileInfo(file).name })} />
          <button className="primary-button" onClick={() => { setSessionId(currentUser.id); notify(t("profile.profileSaved")); setEditOpen(false); }}>Save Changes</button>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="ig-profile-tabs">
        <button className={`ig-profile-tab${profileTab === "posts" ? " active" : ""}`} onClick={() => setProfileTab("posts")} aria-label="Posts">
          <LayoutDashboard size={20} />
        </button>
        <button className={`ig-profile-tab${profileTab === "uploads" ? " active" : ""}`} onClick={() => setProfileTab("uploads")} aria-label="Uploads">
          <Film size={20} />
        </button>
      </div>

      {/* ── Posts grid ── */}
      {profileTab === "posts" && (
        myPosts.length > 0 ? (
          <div className="ig-profile-grid">
            {myPosts.map((post) => (
              <div key={post.id} className="ig-profile-grid-cell">
                {post.imageUrl
                  ? <img src={post.imageUrl} alt="" />
                  : <div className="ig-profile-grid-placeholder"><span>{post.text.slice(0, 55)}{post.text.length > 55 ? "…" : ""}</span></div>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Camera} title="No posts yet" body="Share in the Community to see your posts here." action="Go to Community" onAction={() => go("community")} />
        )
      )}

      {/* ── Uploads grid ── */}
      {profileTab === "uploads" && (
        myUploads.length > 0 ? (
          <div className="ig-profile-grid">
            {myUploads.map((upload) => (
              <div key={upload.id} className="ig-profile-grid-cell ig-profile-grid-video-cell">
                {upload.thumbnailUrl
                  ? <img src={upload.thumbnailUrl} alt={upload.title} />
                  : <div className="ig-profile-grid-placeholder"><Film size={22} style={{ opacity: 0.5 }} /></div>}
                <span className={`ig-upload-status-badge${upload.status === "Approved" ? " approved" : upload.status === "Rejected" ? " rejected" : ""}`}>{upload.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Film} title="No uploads yet" body="Upload a video to share your faith." action="Upload" onAction={() => go("community")} />
        )
      )}
    </section>
  );
}

function SignupForm() {
  const { users, setUsers, setSessionId, notify, go, triggerSplash, t } = useApp();
  const [form, setForm] = React.useState({ name: "", username: "", email: "", password: "", confirmPassword: "" });
  const [busy, setBusy] = React.useState(false);
  const [confirmationEmail, setConfirmationEmail] = React.useState("");

  const submit = async () => {
    if (busy) return;
    const email = form.email.trim();
    const username = form.username.trim();
    if (!form.name.trim() || !email || !form.password || !form.confirmPassword) return notify("Name, email, password, and confirm password are required.");
    if (form.password.length < 6) return notify("Password needs at least 6 characters.");
    if (form.password !== form.confirmPassword) return notify("Passwords do not match.");

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: { name: form.name.trim(), username },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error || !data.user) {
      setBusy(false);
      return notify(error?.message || "Signup failed.");
    }

    if (data.session) {
      const localUser = await getOrCreateUserProfile(data.user);
      setUsers(upsertLocalUser(users, localUser));
      setSessionId(localUser.id);
      notify("Welcome to Faith Flix!");
      triggerSplash();
    } else {
      setConfirmationEmail(email);
      notify("Account created. Check your email to confirm before logging in.");
    }
    setBusy(false);
  };

  const resendConfirmation = async () => {
    const email = confirmationEmail || form.email.trim();
    if (!email) return notify("Enter your email first.");
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) return notify(error.message);
    setConfirmationEmail(email);
    notify("Confirmation email sent again.");
  };

  return <div className="form-card"><h2>Create account</h2><Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} /><Field label="Username" value={form.username} onChange={(username) => setForm({ ...form, username })} /><Field label={t("profile.emailLabel")} type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} /><Field label={t("profile.passwordLabel")} type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} /><Field label="Confirm password" type="password" value={form.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} /><button className="primary-button" onClick={submit} disabled={busy}>{busy ? "Creating..." : "Create Account"}</button>{confirmationEmail && <button className="secondary-button" onClick={resendConfirmation} disabled={busy}>Resend confirmation email</button>}</div>;
}

function LoginForm() {
  const { users, setUsers, setSessionId, notify, go, triggerSplash, t } = useApp();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const login = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setBusy(false);
      return notify(error?.message || "Login failed.");
    }
    const localUser = await getOrCreateUserProfile(data.user);
    setUsers(upsertLocalUser(users, localUser));
    setSessionId(localUser.id);
    notify("Logged in.");
    if (localUser.role === "admin") go("admin-studio"); else triggerSplash();
    setBusy(false);
  };

  return <div className="form-card"><h2>Login</h2><Field label="Email" value={email} onChange={setEmail} /><Field label="Password" type="password" value={password} onChange={setPassword} /><button className="text-button inline-text-button" onClick={() => go("forgot-password")}>Forgot password?</button><button className="primary-button" onClick={login}>{busy ? "Logging in..." : "Log In"}</button></div>;
}

function ForgotPasswordScreen() {
  const { go, notify } = useApp();
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const sendReset = async () => {
    if (!email.trim()) return notify("Enter your email first.");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    setBusy(false);
    if (error) return notify(error.message);
    notify("Password reset email sent.");
  };

  return (
    <section className="screen auth-screen">
      <div className="auth-card">
        <SectionIntro eyebrow="Account help" title="Reset password" body="Enter your email and Faith Flix will send a password reset link." />
        <div className="form-card">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <button className="primary-button" onClick={sendReset}>{busy ? "Sending..." : "Send Reset Link"}</button>
          <button className="secondary-button" onClick={() => go("profile")}>Back to Sign In</button>
        </div>
      </div>
    </section>
  );
}

function AdminLogin() {
  return (
    <section className="screen">
      <SectionIntro eyebrow="Login" title="Faith Flix login" body="Use the same login for regular and admin accounts. Admin accounts open Admin Studio automatically." />
      <LoginForm />
    </section>
  );
}

function AdminStudio() {
  const { isAdmin, go, studioView, setStudioView, videos, setVideos, series, categories, uploads, posts, setPosts, prayers, setPrayers, signOut, notify, t } = useApp();
  const [adminQuery, setAdminQuery] = React.useState("");
  if (!isAdmin) return <section className="screen"><EmptyState icon={ShieldCheck} title="Admin access required" body="Log in with an admin account to manage content." action="Log In" onAction={() => go("profile")} /></section>;
  const tabs: { id: StudioView; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Add Platform Video", icon: Upload },
    { id: "videos", label: "Edit Platform Videos", icon: Video },
    { id: "series", label: "Edit Series", icon: Clapperboard },
    { id: "categories", label: "Edit Categories", icon: Film },
    { id: "takedown", label: "Public Content Monitor", icon: EyeOff },
  ];
  const q = adminQuery.trim().toLowerCase();
  type AdminSearchResult = { id: string; type: string; title: string; detail: string; action: string; onOpen: () => void; onRemove?: () => void | Promise<void> };
  const matches: AdminSearchResult[] = q ? [
    ...videos.filter((item) => [item.title, item.description, item.category, item.seriesId, item.creator, item.scripture, item.tags, item.status, item.source].join(" ").toLowerCase().includes(q)).map((item) => ({ id: item.id, type: item.source === "user" ? "User video" : "Platform video", title: item.title, detail: [item.category, item.creator, item.status].filter(Boolean).join(" • "), action: item.source === "admin" ? "Edit video" : "Take down", onOpen: () => item.source === "admin" ? setStudioView("videos") : setStudioView("takedown"), onRemove: item.source === "user" ? async () => { setVideos(videos.map((video) => video.id === item.id ? { ...video, status: "Hidden" } : video)); await supabase.from("videos").update({ status: "hidden" }).eq("id", item.id); notify("User video taken down."); } : undefined })),
    ...series.filter((item) => [item.title, item.description, item.category, item.scriptureTheme, item.status].join(" ").toLowerCase().includes(q)).map((item) => ({ id: item.id, type: "Series", title: item.title, detail: [item.category, item.status].filter(Boolean).join(" • "), action: "Edit series", onOpen: () => setStudioView("series") })),
    ...categories.filter((item) => [item.name, item.hidden ? "hidden" : "visible"].join(" ").toLowerCase().includes(q)).map((item) => ({ id: item.id, type: "Category", title: item.name, detail: item.hidden ? "Hidden" : "Visible", action: "Edit category", onOpen: () => setStudioView("categories") })),
    ...uploads.filter((item) => [item.title, item.description, item.category, item.scripture, item.tags, item.status].join(" ").toLowerCase().includes(q)).map((item) => ({ id: item.id, type: "User upload", title: item.title, detail: [item.category, item.status].filter(Boolean).join(" • "), action: "Review upload", onOpen: () => setStudioView("takedown") })),
    ...posts.filter((item) => [item.author, item.text, item.scripture, item.reports.length ? "reported" : ""].join(" ").toLowerCase().includes(q)).map((item) => ({ id: item.id, type: "User post", title: item.author, detail: item.text, action: "Monitor post", onOpen: () => setStudioView("takedown"), onRemove: () => { setPosts(posts.filter((post) => post.id !== item.id)); notify("User post removed."); } })),
    ...prayers.filter((item) => [item.title, item.text, item.visibility].join(" ").toLowerCase().includes(q)).map((item) => ({ id: item.id, type: "Prayer", title: item.title, detail: item.text, action: "Monitor prayer", onOpen: () => setStudioView("takedown"), onRemove: () => { setPrayers(prayers.filter((prayer) => prayer.id !== item.id)); notify("Prayer request removed."); } })),
  ].slice(0, 24) : [];
  return (
    <section className="screen">
      <SectionIntro eyebrow="Admin Studio" title="Content editor" body="Post and edit platform videos, manage series and categories, and take down public content when needed." />
      <div className="button-row"><button className="secondary-button" onClick={signOut}>Sign Out</button></div>
      <div className="admin-search-panel">
        <Search size={18} />
        <input value={adminQuery} onChange={(event) => setAdminQuery(event.target.value)} placeholder="Search videos, user posts, prayers, series, categories..." />
        {adminQuery && <button className="icon-button" aria-label="Clear admin search" onClick={() => setAdminQuery("")}><X size={16} /></button>}
      </div>
      {q && (
        <div className="admin-search-results">
          <SectionHeader title="Search results" action={matches.length + " found"} />
          {matches.length ? matches.map((item) => (
            <article className="admin-search-result" key={item.type + "-" + item.id}>
              <div>
                <p className="eyebrow">{item.type}</p>
                <h3>{item.title}</h3>
                {item.detail && <p>{item.detail}</p>}
              </div>
              <div className="button-row">
                <button className="secondary-button" onClick={item.onOpen}>{item.action}</button>
                {item.onRemove && <button className="secondary-button danger" onClick={item.onRemove}><Trash2 size={15} /> Remove</button>}
              </div>
            </article>
          )) : <EmptyState icon={Search} title="No admin results found." body="Try a title, category, creator, scripture, user name, or status." action="Clear Search" onAction={() => setAdminQuery("")} />}
        </div>
      )}
      <div className="segmented-row">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={studioView === id ? "segment active" : "segment"} onClick={() => setStudioView(id)}><Icon size={17} />{label}</button>)}</div>
      {studioView === "dashboard" && <div className="feature-grid"><StatCard label="Platform videos" value={videos.filter((item) => item.source === "admin").length} /><StatCard label="Series" value={series.length} /><StatCard label="Categories" value={categories.length} /><StatCard label="Uploads waiting" value={uploads.filter((item) => item.status === "Pending Review").length} /></div>}
      {studioView === "upload" && <AdminUpload />}
      {studioView === "videos" && <AdminVideos />}
      {studioView === "series" && <AdminSeries />}
      {studioView === "categories" && <AdminCategories />}
      {studioView === "takedown" && <AdminTakeDown />}
    </section>
  );
}

function AdminUpload() {
  const { currentUser, isAdmin, videos, setVideos, setSelectedVideoId, setStudioView, setUploadProgress, visibleCategories, series, notify, go, t } = useApp();
  const [form, setForm] = React.useState({ title: "", description: "", scripture: "", category: visibleCategories[0]?.name ?? "", seriesId: series.find((item) => item.category === (visibleCategories[0]?.name ?? ""))?.title ?? series[0]?.title ?? "", episode: "", duration: "", creator: "", tags: "", status: "Published" as Status });
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [thumbFile, setThumbFile] = React.useState<File | null>(null);
  const categorySeries = series.filter((item) => item.category === form.category);
  const seriesOptions = categorySeries.length ? categorySeries.map((item) => item.title) : series.map((item) => item.title);
  React.useEffect(() => {
    if (!seriesOptions.length || seriesOptions.includes(form.seriesId)) return;
    setForm((current) => ({ ...current, seriesId: seriesOptions[0] }));
  }, [form.category, form.seriesId, seriesOptions.join("|")]);
  if (!isAdmin) return <EmptyState icon={ShieldCheck} title="Admin access required" body="Only admin accounts can upload platform videos." action="Log In" onAction={() => notify("Log in with the admin account from Profile.")} />;
  const save = (status: Status) => {
    if (!currentUser) return notify("Log in as admin first.");
    if (!form.title) return notify("Add a title first.");
    if (!videoFile) return notify("Choose a video file first.");

    const uploadUser = currentUser;
    const uploadForm = { ...form };
    const uploadVideoFile = videoFile;
    const uploadThumbFile = thumbFile;
    const progress = startUploadProgress(setUploadProgress, "Uploading in background");

    setForm({ ...form, title: "", description: "", scripture: "", tags: "", status });
    setVideoFile(null);
    setThumbFile(null);
    notify("Uploading in background. Keep the app open.");

    void (async () => {
      try {
        progress.step("Checking login", 20);
        const authUser = await getActiveAuthUser();
        progress.step("Starting Cloudflare upload", 8);
        const video = await uploadMediaFile(uploadVideoFile, authUser.id, "admin-videos", (percent) => progress.percent("Uploading video", percent));
        progress.step(uploadThumbFile ? "Uploading thumbnail" : "Saving video", 94);
        const thumb = uploadThumbFile ? await uploadMediaFile(uploadThumbFile, authUser.id, "admin-thumbnails") : { name: "Cloudflare thumbnail", url: video.thumbnailUrl || "" };
        progress.step("Publishing video", 92);
        const platformVideo: Omit<VideoItem, "id" | "createdAt"> = { source: "admin", ...uploadForm, status, videoName: video.name, videoUrl: video.url, thumbnailName: thumb.name, thumbnailUrl: thumb.url, cropDimension: "9:16", cropRatio: "9 / 16" };
        const { data, error } = await supabase.from("videos").insert(videoToDb(platformVideo, authUser.id)).select("*").single();
        if (error) throw error;
        const savedVideo = videoFromDb(data as DbVideo);
        setVideos((current) => [...current.filter((item) => item.id !== savedVideo.id), savedVideo]);
        setSelectedVideoId(savedVideo.id);
        progress.done(status === "Published" ? "Published" : "Draft saved");
        notify(status === "Published" ? "Video published to the public app." : "Draft saved to manager.");
        setStudioView("videos");
        go("admin-studio", "videos");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed.";
        progress.fail("Upload failed");
        notify(message);
      }
    })();
  };
  return <div className="form-card"><h2>Add platform video</h2><Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} /><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><Field label="Scripture reference" value={form.scripture} onChange={(scripture) => setForm({ ...form, scripture })} /><Select label="Category" value={form.category} onChange={(category) => { const nextSeries = series.find((item) => item.category === category)?.title ?? series[0]?.title ?? ""; setForm({ ...form, category, seriesId: nextSeries }); }} options={visibleCategories.map((item) => item.name)} /><Select label="Series" value={form.seriesId} onChange={(seriesId) => setForm({ ...form, seriesId })} options={seriesOptions} /><Field label="Episode number" value={form.episode} onChange={(episode) => setForm({ ...form, episode })} /><Field label="Duration" value={form.duration} onChange={(duration) => setForm({ ...form, duration })} /><Field label="Creator / ministry name" value={form.creator} onChange={(creator) => setForm({ ...form, creator })} /><Field label="Tags" value={form.tags} onChange={(tags) => setForm({ ...form, tags })} /><Select label="Publish status" value={form.status} onChange={(status) => setForm({ ...form, status: status as Status })} options={["Draft", "Published", "Hidden"]} /><FileField label="Video file" onChange={setVideoFile} /><FileField label="Thumbnail" onChange={setThumbFile} /><div className="button-row"><button className="primary-button" onClick={() => save("Published")}>Publish Video</button><button className="secondary-button" onClick={() => save("Draft")}>Save as Draft</button></div></div>;
}

function AdminVideos() {
  const { videos, setVideos, visibleCategories, series, notify, setStudioView, t } = useApp();
  const [editingId, setEditingId] = React.useState("");
  const platformVideos = videos.filter((video) => video.source === "admin").map(alignProfessionalVideoWithSeries);
  const update = (id: string, patch: Partial<VideoItem>) =>
    setVideos(videos.map((video) => video.id === id ? { ...video, ...patch } : video));

  const finishEditing = async () => {
    const video = videos.find((v) => v.id === editingId);
    setEditingId("");
    if (!video) { notify("Video edits saved."); return; }
    const alignedVideo = alignProfessionalVideoWithSeries(video);
    setVideos((current) => current.map((item) => item.id === alignedVideo.id ? alignedVideo : item));
    const { error } = await supabase.from("videos").update({
      title: alignedVideo.title,
      description: alignedVideo.description,
      scripture_reference: alignedVideo.scripture,
      creator_ministry_name: alignedVideo.creator,
      app_category: alignedVideo.category,
      app_series_title: alignedVideo.seriesId,
      episode_number: alignedVideo.episode,
      duration: alignedVideo.duration,
      tags: alignedVideo.tags,
      featured: alignedVideo.featured ?? false,
    }).eq("id", alignedVideo.id);
    notify(error ? "Edits saved locally. DB sync failed: " + error.message : "Video edits saved.");
  };

  const updateStatus = async (id: string, status: Status) => {
    update(id, { status });
    const { error } = await supabase.from("videos").update({ status: statusToDb(status) }).eq("id", id);
    if (error) notify("Status update failed: " + error.message);
  };

  const deleteVideoAdmin = async (id: string) => {
    setVideos(videos.filter((item) => item.id !== id));
    const { error } = await supabase.from("videos").delete().eq("id", id);
    notify(error ? "Deleted locally. DB sync failed: " + error.message : "Video deleted.");
  };
  if (!platformVideos.length) return <EmptyState icon={Video} title={t("admin.noVideos")} body={t("admin.noVideosBody")} action="Add Platform Video" onAction={() => setStudioView("upload")} />;
  return (
    <div className="content-grid">
      {platformVideos.map((video) => {
        const isEditing = editingId === video.id;
        const editSeriesOptions = series.filter((item) => item.category === video.category).map((item) => item.title);
        const availableSeriesOptions = editSeriesOptions.length ? editSeriesOptions : series.map((item) => item.title);
        return (
          <article className="content-panel admin-video-card" key={video.id}>
            <MediaThumb item={video} />
            <div className="admin-card-meta">
              <h3>{video.title}</h3>
              <div className="admin-meta-row">
                <span className={`status-badge status-${video.status.toLowerCase()}`}>{video.status}</span>
                {video.featured && <span className="featured-badge-sm">&#10022; Featured</span>}
                {video.creator && <span className="meta-chip">{video.creator}</span>}
                {video.duration && <span className="meta-chip">&#9201; {video.duration}</span>}
                {video.category && <span className="meta-chip">{video.category}</span>}
                {video.seriesId && <span className="meta-chip">Series: {video.seriesId}</span>}
              </div>
              {video.description && <p className="admin-card-desc">{video.description}</p>}
            </div>
            {isEditing && (
              <div className="admin-edit-form">
                <Field label="Title" value={video.title} onChange={(title) => update(video.id, { title })} />
                <Field label="Creator / Ministry" value={video.creator} onChange={(creator) => update(video.id, { creator })} />
                <label>Description<textarea value={video.description} onChange={(e) => update(video.id, { description: e.target.value })} /></label>
                <Field label="Scripture reference" value={video.scripture} onChange={(scripture) => update(video.id, { scripture })} />
                <Select label="Category" value={video.category} onChange={(category) => { const nextSeries = series.find((item) => item.category === category)?.title ?? video.seriesId; update(video.id, { category, seriesId: nextSeries }); }} options={visibleCategories.map((item) => item.name)} />
                <Select label="Series" value={video.seriesId || availableSeriesOptions[0] || ""} onChange={(seriesId) => update(video.id, { seriesId })} options={availableSeriesOptions} />
                <Field label="Episode number" value={video.episode} onChange={(episode) => update(video.id, { episode })} />
                <Field label="Duration (e.g. 12:34)" value={video.duration} onChange={(duration) => update(video.id, { duration })} />
                <Field label="Tags (comma separated)" value={video.tags} onChange={(tags) => update(video.id, { tags })} />
                <label className="admin-toggle-row">
                  <input type="checkbox" checked={!!video.featured} onChange={(e) => update(video.id, { featured: e.target.checked })} />
                  <span>&#10022; Featured &mdash; spotlight on home page</span>
                </label>
                <div className="admin-danger-zone">
                  <h3>Delete video</h3>
                  <p>This removes the video from the app. Use this only when the content should be permanently removed.</p>
                  <button className="secondary-button danger" onClick={() => deleteVideoAdmin(video.id)}><Trash2 size={16} /> Delete Video</button>
                </div>
              </div>
            )}
            <div className="button-row">
              {isEditing
                ? <button className="primary-button" onClick={finishEditing}><CheckCircle2 size={16} /> Save Changes</button>
                : <button className="secondary-button" onClick={() => setEditingId(video.id)}><Edit3 size={16} /> Edit All Details</button>}
              {video.status !== "Hidden"
                ? <button className="secondary-button danger" onClick={() => updateStatus(video.id, "Hidden")}><EyeOff size={15} /> Take Down</button>
                : <button className="primary-button" onClick={() => updateStatus(video.id, "Published")}><CheckCircle2 size={15} /> Restore</button>}
              <SelectButton value={video.status} options={["Draft", "Published", "Hidden"]} onChange={(s) => updateStatus(video.id, s as Status)} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function AdminSeries() {
  const { currentUser, series, setSeries, visibleCategories, notify, t } = useApp();
  const [form, setForm] = React.useState({ title: "", description: "", posterName: "", posterUrl: "", scriptureTheme: "", category: visibleCategories[0]?.name ?? "", status: "Published" as Status, featured: false });
  const [posterFile, setPosterFile] = React.useState<File | null>(null);
  const [editingId, setEditingId] = React.useState("");
  const [pendingPosterFiles, setPendingPosterFiles] = React.useState<Record<string, File | null>>({});

  const save = async () => {
    if (!form.title) return notify("Add a series title.");
    const authUser = await getActiveAuthUser().catch(() => null);
    if (!authUser) return notify("Please log in as admin first.");
    try {
      const poster = posterFile ? await uploadMediaFile(posterFile, authUser.id, "series-posters") : { name: form.posterName, url: form.posterUrl };
      const seriesItem: Omit<SeriesItem, "id"> = { ...form, posterName: poster.name, posterUrl: poster.url };
      const { data, error } = await supabase.from("series").insert(seriesToDb(seriesItem, currentUser?.id || authUser.id)).select("*").single();
      if (error) throw error;
      const savedSeries = seriesFromDb(data as DbSeries);
      setSeries((current) => [...current.filter((item) => item.id !== savedSeries.id), savedSeries]);
      setPosterFile(null);
      setForm({ ...form, title: "", description: "", posterName: "", posterUrl: "", scriptureTheme: "", featured: false });
      notify("Series saved online.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Series could not be saved.");
    }
  };

  const update = (id: string, patch: Partial<SeriesItem>) => setSeries((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));

  const saveSeriesEdit = async (id: string) => {
    const item = series.find((seriesItem) => seriesItem.id === id);
    if (!item) return;
    try {
      const authUser = await getActiveAuthUser();
      const poster = pendingPosterFiles[id] ? await uploadMediaFile(pendingPosterFiles[id], authUser.id, "series-posters") : { name: item.posterName, url: item.posterUrl || "" };
      const nextItem = { ...item, posterName: poster.name || item.posterName, posterUrl: poster.url || item.posterUrl };
      const { data, error } = await supabase.from("series").update(seriesToDb(nextItem)).eq("id", id).select("*").single();
      if (error) throw error;
      const savedSeries = seriesFromDb(data as DbSeries);
      setSeries((current) => current.map((seriesItem) => seriesItem.id === id ? savedSeries : seriesItem));
      setPendingPosterFiles((current) => ({ ...current, [id]: null }));
      setEditingId("");
      notify("Series changes saved online.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Series changes could not be saved.");
    }
  };

  const changeStatus = async (id: string, status: Status) => {
    update(id, { status });
    const { error } = await supabase.from("series").update({ status: statusToDb(status) }).eq("id", id);
    notify(error ? "Series status could not be saved." : "Series status saved online.");
  };

  const deleteSeries = async (id: string) => {
    const { error } = await supabase.from("series").delete().eq("id", id);
    if (error) return notify("Series could not be deleted online.");
    setSeries((current) => current.filter((item) => item.id !== id));
    notify("Series deleted online.");
  };

  return (
    <>
      <div className="form-card">
        <h2>Create series</h2>
        <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <FileField label="Poster image" onChange={(file) => { setPosterFile(file); setForm({ ...form, posterName: fileInfo(file).name, posterUrl: file ? URL.createObjectURL(file) : "" }); }} />
        <Field label="Scripture theme" value={form.scriptureTheme} onChange={(scriptureTheme) => setForm({ ...form, scriptureTheme })} />
        <Select label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} options={visibleCategories.map((item) => item.name)} />
        <Select label="Status" value={form.status} onChange={(status) => setForm({ ...form, status: status as Status })} options={["Draft", "Published"]} />
        <label className="admin-toggle-row">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          <span>&#10022; Featured &mdash; spotlight on home page</span>
        </label>
        <button className="primary-button" onClick={save}>Create Series</button>
      </div>
      {series.length ? (
        <div className="content-grid">
          {series.map((item) => (
            <article className="content-panel admin-video-card" key={item.id}>
              <SeriesCard item={item} />
              <div className="admin-card-meta">
                <div className="admin-meta-row">
                  <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
                  {item.featured && <span className="featured-badge-sm">&#10022; Featured</span>}
                  {item.category && <span className="meta-chip">{item.category}</span>}
                  {item.scriptureTheme && <span className="meta-chip">{item.scriptureTheme}</span>}
                </div>
                {item.description && <p className="admin-card-desc">{item.description}</p>}
              </div>
              {editingId === item.id && (
                <div className="admin-edit-form">
                  <Field label="Title" value={item.title} onChange={(title) => update(item.id, { title })} />
                  <label>Description<textarea value={item.description} onChange={(e) => update(item.id, { description: e.target.value })} /></label>
                  <FileField label="Poster image" onChange={(file) => { setPendingPosterFiles((current) => ({ ...current, [item.id]: file })); update(item.id, { posterName: fileInfo(file).name, posterUrl: file ? URL.createObjectURL(file) : item.posterUrl }); }} />
                  <Field label="Scripture theme" value={item.scriptureTheme} onChange={(scriptureTheme) => update(item.id, { scriptureTheme })} />
                  <Select label="Category" value={item.category} onChange={(category) => update(item.id, { category })} options={visibleCategories.map((c) => c.name)} />
                  <Select label="Status" value={item.status} onChange={(status) => update(item.id, { status: status as Status })} options={["Draft", "Published", "Hidden"]} />
                  <label className="admin-toggle-row">
                    <input type="checkbox" checked={!!item.featured} onChange={(e) => update(item.id, { featured: e.target.checked })} />
                    <span>&#10022; Featured &mdash; spotlight on home page</span>
                  </label>
                </div>
              )}
              <div className="button-row">
                {editingId === item.id ? (
                  <button className="primary-button" onClick={() => saveSeriesEdit(item.id)}><CheckCircle2 size={15} /> Done</button>
                ) : (
                  <button className="secondary-button" onClick={() => setEditingId(item.id)}><Edit3 size={15} /> Edit All Details</button>
                )}
                <SelectButton value={item.status} options={["Draft", "Published", "Hidden"]} onChange={(status) => changeStatus(item.id, status as Status)} />
                <button className="secondary-button danger" onClick={() => deleteSeries(item.id)}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState icon={Clapperboard} title="No series created yet." body="Create a series above." action="Create series" onAction={() => notify("Use the form above.")} />}
    </>
  );
}

function AdminCategories() {
  const { categories, setCategories, notify, t } = useApp();
  const [name, setName] = React.useState("");

  const add = async () => {
    if (!name.trim()) return notify("Add a category name.");
    const { data, error } = await supabase.from("categories").insert({ name: name.trim(), hidden: false, custom: true }).select("*").single();
    if (error) return notify("Category could not be saved online.");
    const savedCategory = categoryFromDb(data as DbCategory);
    setCategories((current) => [...current.filter((cat) => cat.id !== savedCategory.id), savedCategory]);
    setName("");
    notify("Category added online.");
  };

  const update = async (id: string, patch: Partial<CategoryItem>) => {
    setCategories((current) => current.map((cat) => cat.id === id ? { ...cat, ...patch } : cat));
    const dbPatch: Record<string, string | boolean> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.hidden !== undefined) dbPatch.hidden = patch.hidden;
    if (patch.custom !== undefined) dbPatch.custom = patch.custom;
    if (!Object.keys(dbPatch).length) return;
    const { error } = await supabase.from("categories").update(dbPatch).eq("id", id);
    if (error) notify("Category change could not be saved online.");
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return notify("Category could not be deleted online.");
    setCategories((current) => current.filter((cat) => cat.id !== id));
    notify("Custom category deleted online.");
  };

  return <><div className="form-card"><h2>Add category</h2><Field label="Category name" value={name} onChange={setName} /><button className="primary-button" onClick={add}>Add Category</button></div><div className="content-grid">{categories.map((category) => <article className="content-panel" key={category.id}><Field label="Name" value={category.name} onChange={(catName) => update(category.id, { name: catName })} /><div className="button-row"><button className="secondary-button" onClick={() => update(category.id, { hidden: !category.hidden })}>{category.hidden ? "Show" : "Hide"}</button>{category.custom && <button className="secondary-button danger" onClick={() => deleteCategory(category.id)}>Delete</button>}</div></article>)}</div></>;
}

function AdminReviewQueue() {
  const { uploads, setUploads, videos, setVideos, users, notify, t } = useApp();
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const decide = (upload: UserUpload, status: UploadStatus) => {
    setUploads(uploads.map((item) => item.id === upload.id ? { ...item, status, adminNote: notes[upload.id] ?? item.adminNote } : item));
    if (status === "Approved") {
      const author = users.find((user) => user.id === upload.userId);
      setVideos([...videos, { id: uid("video"), source: "user", title: upload.title, description: upload.description, scripture: upload.scripture, category: upload.category, seriesId: "", episode: "", duration: "", creator: author?.name ?? "Faith member", tags: upload.tags, status: "Published", videoName: upload.videoName, videoUrl: upload.videoUrl, thumbnailName: upload.thumbnailName, thumbnailUrl: upload.thumbnailUrl, cropDimension: upload.cropDimension, cropRatio: upload.cropRatio, createdAt: new Date().toLocaleString() }]);
    }
    notify(`Upload marked ${status}.`);
  };
  return uploads.length ? (
    <div className="content-grid">
      {uploads.map((upload) => (
        <article className="content-panel admin-video-card" key={upload.id}>
          <MediaThumb item={upload} />
          <div className="admin-card-meta">
            <span className={`status-badge status-${upload.status.toLowerCase().replace(/ /g, "-")}`}>{upload.status}</span>
            <h3>{upload.title}</h3>
            <div className="admin-meta-row">
              {upload.category && <span className="meta-chip">{upload.category}</span>}
              {upload.testimonyType && <span className="meta-chip">{upload.testimonyType}</span>}
              {upload.visibility && <span className="meta-chip">{upload.visibility}</span>}
            </div>
            {upload.description && <p className="admin-card-desc">{upload.description}</p>}
            {upload.scripture && <p className="featured-verse">&#10022; {upload.scripture}</p>}
          </div>
          <div className="admin-edit-form">
            <Field label="Title" value={notes[upload.id + "-title"] ?? upload.title} onChange={(v) => setNotes({ ...notes, [upload.id + "-title"]: v })} />
            <label>Description<textarea value={notes[upload.id + "-desc"] ?? upload.description} onChange={(e) => setNotes({ ...notes, [upload.id + "-desc"]: e.target.value })} /></label>
            <Field label="Scripture reference" value={notes[upload.id + "-scripture"] ?? upload.scripture} onChange={(v) => setNotes({ ...notes, [upload.id + "-scripture"]: v })} />
            <Field label="Category" value={notes[upload.id + "-category"] ?? upload.category} onChange={(v) => setNotes({ ...notes, [upload.id + "-category"]: v })} />
            <Field label="Tags" value={notes[upload.id + "-tags"] ?? upload.tags} onChange={(v) => setNotes({ ...notes, [upload.id + "-tags"]: v })} />
            <label>Admin note<textarea placeholder="Notes for the user (optional)" value={notes[upload.id] ?? upload.adminNote} onChange={(e) => setNotes({ ...notes, [upload.id]: e.target.value })} /></label>
          </div>
          <div className="button-row">
            <button className="primary-button" onClick={() => decide({
              ...upload,
              title: notes[upload.id + "-title"] ?? upload.title,
              description: notes[upload.id + "-desc"] ?? upload.description,
              scripture: notes[upload.id + "-scripture"] ?? upload.scripture,
              category: notes[upload.id + "-category"] ?? upload.category,
              tags: notes[upload.id + "-tags"] ?? upload.tags,
            }, "Approved")}>Approve</button>
            <button className="secondary-button" onClick={() => decide(upload, "Rejected")}>Reject</button>
            <button className="secondary-button" onClick={() => decide(upload, "Edits Requested")}>Request Edits</button>
          </div>
          {upload.videoUrl && <video className="inline-video" controls src={upload.videoUrl} />}
        </article>
      ))}
    </div>
  ) : <EmptyState icon={CheckCircle2} title={t("admin.noReview")} body={t("admin.noReviewBody")} action="Open Dashboard" onAction={() => notify("No pending review items.")} />;
}

function AdminTakeDown() {
  const { videos, setVideos, posts, setPosts, prayers, setPrayers, comments, notify, t } = useApp();
  const userVideos = videos.filter((video) => video.source === "user" && video.status === "Published");
  const platformVideos = videos.filter((video) => video.source === "admin" && video.status === "Published");
  const hiddenVideos = videos.filter((video) => video.status === "Hidden");
  const reportedPosts = posts.filter((post) => post.reports.length > 0);
  const hasContent = userVideos.length || platformVideos.length || posts.length || prayers.length || hiddenVideos.length;

  const hideVideo = async (id: string) => {
    setVideos(videos.map((video) => video.id === id ? { ...video, status: "Hidden" } : video));
    await supabase.from("videos").update({ status: "hidden" }).eq("id", id);
    notify("Content taken down.");
  };

  const restoreVideo = async (id: string) => {
    setVideos(videos.map((video) => video.id === id ? { ...video, status: "Published" } : video));
    await supabase.from("videos").update({ status: "published" }).eq("id", id);
    notify("Content restored.");
  };

  const deleteVideo = async (id: string) => {
    setVideos(videos.filter((video) => video.id !== id));
    await supabase.from("videos").delete().eq("id", id);
    notify("Content deleted.");
  };

  const removePost = (id: string) => {
    setPosts(posts.filter((post) => post.id !== id));
    notify("User post removed.");
  };

  if (!hasContent) {
    return <EmptyState icon={EyeOff} title="No user content to monitor." body="User posts, user videos, prayer requests, and reported posts will appear here for admin review." action="Open Dashboard" onAction={() => notify("No user content needs review.")} />;
  }

  return (
    <div className="screen">
      <SectionIntro eyebrow="Admin Moderation" title="User posts monitor" body="Monitor user posts, reports, user videos, and prayer requests. Remove posts or take down videos when needed." />
      <div className="feature-grid">
        <StatCard label="User posts" value={posts.length} />
        <StatCard label="Reported posts" value={reportedPosts.length} />
        <StatCard label="User videos" value={userVideos.length} />
        <StatCard label="Prayer requests" value={prayers.length} />
      </div>

      <SectionHeader title="Reported posts" action={`${reportedPosts.length} reports`} />
      {reportedPosts.length ? <div className="content-grid">{reportedPosts.map((post) => <article className="content-panel" key={post.id}><p className="eyebrow">{post.author} • {post.reports.length} reports</p><p>{post.text}</p>{post.scripture && <InfoLine label={t("info.scripture")} value={post.scripture} />}<InfoLine label="Comments" value={String(comments.filter((item) => item.targetId === post.id).length)} /><div className="button-row"><button className="secondary-button" onClick={() => { setPosts(posts.map((item) => item.id === post.id ? { ...item, reports: [] } : item)); notify("Report cleared."); }}>Clear Report</button><button className="secondary-button danger" onClick={() => removePost(post.id)}><Trash2 size={16} /> Remove Post</button></div></article>)}</div> : <p className="muted">No reported posts.</p>}

      <SectionHeader title="All user posts" action={`${posts.length} posts`} />
      {posts.length ? <div className="content-grid">{posts.map((post) => <article className="content-panel" key={post.id}><p className="eyebrow">{post.author}</p><p>{post.text}</p>{post.scripture && <InfoLine label={t("info.scripture")} value={post.scripture} />}<div className="monitor-meta"><span>Likes {post.likes.length}</span><span>Saves {post.saves.length}</span><span>Reports {post.reports.length}</span><span>Comments {comments.filter((item) => item.targetId === post.id).length}</span></div><div className="button-row"><button className="secondary-button danger" onClick={() => removePost(post.id)}><Trash2 size={16} /> Remove Post</button></div></article>)}</div> : <EmptyState icon={MessagesSquare} title="No user posts yet." body="Faith Feed posts will appear here when users share content." action="Open Community" onAction={() => notify("No posts yet.")} />}

      <SectionHeader title="User videos" action={`${userVideos.length} live`} />
      {userVideos.length ? <div className="content-grid">{userVideos.map((video) => <article className="content-panel" key={video.id}><MediaThumb item={video} /><p className="eyebrow">User upload</p><h3>{video.title}</h3><p>{video.description || "No description."}</p><div className="button-row"><button className="secondary-button" onClick={() => hideVideo(video.id)}><EyeOff size={16} /> Take Down</button><button className="secondary-button danger" onClick={() => deleteVideo(video.id)}><Trash2 size={16} /> Delete</button></div></article>)}</div> : <p className="muted">No live user videos.</p>}

      <SectionHeader title="Platform videos" action={`${platformVideos.length} live`} />
      {platformVideos.length ? <div className="content-grid">{platformVideos.map((video) => <article className="content-panel" key={video.id}><MediaThumb item={video} /><p className="eyebrow">Platform video</p><h3>{video.title}</h3><div className="button-row"><button className="secondary-button" onClick={() => hideVideo(video.id)}><EyeOff size={16} /> Take Down</button></div></article>)}</div> : <p className="muted">No live platform videos.</p>}

      <SectionHeader title="Hidden videos" action={`${hiddenVideos.length} hidden`} />
      {hiddenVideos.length ? <div className="content-grid">{hiddenVideos.map((video) => <article className="content-panel" key={video.id}><MediaThumb item={video} /><p className="eyebrow">Hidden</p><h3>{video.title}</h3><div className="button-row"><button className="primary-button" onClick={() => restoreVideo(video.id)}>Restore</button><button className="secondary-button danger" onClick={() => deleteVideo(video.id)}><Trash2 size={16} /> Delete</button></div></article>)}</div> : <p className="muted">No hidden videos.</p>}

      <SectionHeader title="Prayer requests" action={`${prayers.length} requests`} />
      {prayers.length ? <div className="content-grid">{prayers.map((prayer) => <article className="content-panel" key={prayer.id}><p className="eyebrow">{prayer.visibility}</p><h3>{prayer.title}</h3><p>{prayer.text}</p><div className="button-row"><button className="secondary-button danger" onClick={() => { setPrayers(prayers.filter((item) => item.id !== prayer.id)); notify("Prayer request removed."); }}><Trash2 size={16} /> Remove Request</button></div></article>)}</div> : <p className="muted">No prayer requests.</p>}
    </div>
  );
}

function ContentRules() {
  const { go, t } = useApp();
  return <section className="screen"><SectionIntro eyebrow="Content Rules" title="Faith Flix content rules" body="Submissions should be faith-centered, respectful, lawful, and appropriate for a Christian community." /><div className="content-panel"><ul className="rules-list"><li>Share only content you own or have permission to upload.</li><li>Keep all posts centered on faith, scripture, worship, testimony, prayer, or ministry.</li><li>Do not upload hateful, harassing, graphic, or unsafe material.</li><li>Prayer and testimony content should protect private information.</li></ul><button className="primary-button" onClick={() => go("upload")}>Share Your Faith</button></div></section>;
}

function MyUploads() {
  const { currentUser, uploads, t } = useApp();
  if (!currentUser) return null;
  const mine = uploads.filter((upload) => upload.userId === currentUser.id);
  return <div className="content-panel"><SectionHeader title="My Uploads" action={`${mine.length} submitted`} />{mine.length ? mine.map((upload) => <div className="item-row" key={upload.id}><span>{upload.title}</span><span className="status-pill">{upload.status}</span>{upload.adminNote && <small>{upload.adminNote}</small>}</div>) : <p>No uploads submitted yet.</p>}</div>;
}

function CommentBox({ targetId, comments, value, setValue }: { targetId: string; comments: CommentItem[]; value: string; setValue: (value: string) => void }) {
  const { currentUser, setComments, comments: allComments, notify, t } = useApp();
  const submit = () => {
    if (!value.trim()) return notify("Write a comment first.");
    setComments([...allComments, { id: uid("comment"), targetId, author: currentUser?.name ?? "Guest", text: value, createdAt: new Date().toLocaleString() }]);
    setValue("");
  };
  return <div className="comments"><h3>Comments</h3>{comments.length ? comments.map((comment) => <p className="comment" key={comment.id}><strong>{comment.author}</strong> {comment.text}</p>) : <p>No comments yet.</p>}<div className="message-compose"><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Add a comment" /><button className="primary-button" onClick={submit}>Comment</button></div></div>;
}

function PostCard({ post, comments, onToggle }: { post: CommunityPost; comments: CommentItem[]; onToggle: (id: string, field: "likes" | "saves" | "reports", message: string) => void }) {
  const [comment, setComment] = React.useState("");
  const { currentUser, notify } = useApp();
  const actor = currentUser?.id ?? "guest";
  const initials = post.author.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const isLiked = post.likes.includes(actor);
  const isSaved = post.saves.includes(actor);

  return (
    <article className="ig-post">
      <div className="ig-post-header">
        <div className="ig-avatar-ring">
          <div className="post-avatar">{initials}</div>
        </div>
        <div className="ig-post-user">
          <span className="ig-post-name">{post.author}</span>
          {post.scripture && <span className="ig-post-location">{post.scripture}</span>}
        </div>
        <button className="icon-button" aria-label="Post options" onClick={() => onToggle(post.id, "reports", "Post reported to admins.")}><MoreHorizontal size={20} /></button>
      </div>

      {post.imageUrl && <img className="ig-post-image" src={post.imageUrl} alt="" />}

      <div className="ig-post-actions">
        <div className="ig-post-actions-left">
          <button className={`ig-action-btn${isLiked ? " liked" : ""}`} aria-label="Like" onClick={() => onToggle(post.id, "likes", isLiked ? "Like removed." : "Post liked.")}>
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} />
          </button>
          <button className="ig-action-btn" aria-label="Comment"><MessageCircle size={24} /></button>
          <button className="ig-action-btn" aria-label="Share" onClick={() => notify("Share coming soon.")}><Send size={22} /></button>
        </div>
        <button className={`ig-action-btn${isSaved ? " saved" : ""}`} aria-label="Save" onClick={() => onToggle(post.id, "saves", isSaved ? "Removed from saved." : "Post saved.")}>
          <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2} />
        </button>
      </div>

      {post.likes.length > 0 && <p className="ig-post-likes">{post.likes.length} like{post.likes.length !== 1 ? "s" : ""}</p>}
      <p className="ig-post-caption"><strong>{post.author}</strong> {post.text}</p>
      <CommentBox targetId={post.id} comments={comments} value={comment} setValue={setComment} />
    </article>
  );
}

function VideoCard({ video, onOpen, onTitleOpen, extra }: { video: VideoItem; onOpen: () => void; onTitleOpen?: () => void; extra?: React.ReactNode }) {
  const badgeText = video.scripture?.trim() || "Scripture not added";
  const seriesText = video.seriesId?.trim() || video.category || "Faith Flix";
  const badgeClass = "source-badge source-badge-scripture";
  return (
    <article className="content-panel video-card">
      <button className="media-button" onClick={onOpen} aria-label={`Play ${video.title}`}>
        <div className="thumb-wrap">
          <MediaThumb item={video} />
          <div className="thumb-overlay">
            <div className="thumb-play-btn"><Play size={22} /></div>
            <div className="thumb-info-row">
              <span className="thumb-cat-tag">{video.category}</span>
              {video.duration && <span className="thumb-dur">{video.duration}</span>}
            </div>
          </div>
        </div>
      </button>
      <div className="video-card-body">
        <span className={badgeClass} title={badgeText}>
          <BookOpen size={11} /> {badgeText}
        </span>
        <button className="video-title-button" onClick={onTitleOpen ?? onOpen}>{video.title}</button>
        <p>{seriesText}</p>
      </div>
      {extra && <div className="button-row">{extra}</div>}
    </article>
  );
}

function HomeSeriesCard({ item, episodeCount, onOpen }: { item: SeriesItem; episodeCount: number; onOpen: () => void }) {
  return (
    <button className="home-series-card" onClick={onOpen} aria-label={`Open ${item.title}`}>
      <div className="home-series-thumb">
        {item.posterUrl
          ? <img src={item.posterUrl} alt={item.title} />
          : <div className="home-series-empty"><Clapperboard size={34} /></div>}
        <div className="home-series-overlay" aria-hidden="true">
          <span className="thumb-play-btn"><Play size={18} /></span>
        </div>
      </div>
      <div className="home-series-info">
        <span className="thumb-cat-tag">{item.category || "Series"}</span>
        <h3>{item.title}</h3>
        <p className="home-series-verse">{episodeCount} episode{episodeCount !== 1 ? "s" : ""}</p>
      </div>
    </button>
  );
}

function SeriesCard({ item, onClick }: { item: SeriesItem; onClick?: () => void }) {
  const inner = <>{item.posterUrl ? <img className="poster" src={item.posterUrl} alt="" /> : <div className="poster empty"><Clapperboard size={32} /></div>}<div><p className="eyebrow">{item.status}</p><h3>{item.title}</h3><p>{item.description || item.scriptureTheme || item.category}</p></div></>;
  if (onClick) return <button className="series-mini series-mini-btn" onClick={onClick} aria-label={`Open ${item.title}`}>{inner}</button>;
  return <article className="series-mini">{inner}</article>;
}

function MediaThumb({ item }: { item: { thumbnailUrl?: string; thumbnailName?: string; title: string; cropRatio?: string } }) {
  const style = { aspectRatio: item.cropRatio || "9 / 13" };
  return item.thumbnailUrl ? <img className="poster" style={style} src={item.thumbnailUrl} alt="" /> : <div className="poster empty" style={style}><Film size={32} /><span>{item.thumbnailName || item.title}</span></div>;
}

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <div className="section-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{body}</p></div>;
}

function SectionHeader({ title, action, onAction }: { title: string; action: string; onAction?: () => void }) {
  return <div className="section-header"><h2>{title}</h2>{onAction ? <button className="section-header-action" onClick={onAction}>{action}</button> : <span>{action}</span>}</div>;
}

function EmptyState({ icon: Icon, title, body, action, onAction }: { icon: React.ElementType; title: string; body: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={30} /></div><h2>{title}</h2><p>{body}</p><button className="secondary-button" onClick={onAction}>{action}</button></div>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return <article className="launch-card"><div className="card-icon"><Crown size={20} /></div><div><h3>{label}</h3><p>{value}</p></div><ChevronRight className="card-arrow" size={18} /></article>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <p className="info-line"><strong>{label}:</strong> {value}</p>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option || "None"}</option>)}</select></label>;
}

function SelectButton({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return <select className="select-button" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select>;
}

const cropOptions = [
  { label: "9:16", ratio: "9 / 16", detail: "Full vertical" },
  { label: "4:5", ratio: "4 / 5", detail: "Tall portrait" },
  { label: "3:4", ratio: "3 / 4", detail: "Classic portrait" },
  { label: "2:3", ratio: "2 / 3", detail: "Poster crop" },
];

function CropDimensionPicker({ value, onChange }: { value: string; onChange: (option: { label: string; ratio: string; detail: string }) => void }) {
  return (
    <div className="crop-picker">
      <div>
        <span className="file-label">Vertical crop size</span>
        <p className="muted">User content can choose a vertical crop. Admin content stays 9:16.</p>
      </div>
      <div className="crop-options">
        {cropOptions.map((option) => (
          <button className={value === option.label ? "crop-option active" : "crop-option"} type="button" key={option.label} onClick={() => onChange(option)}>
            <span className="crop-shape" style={{ aspectRatio: option.ratio }} />
            <strong>{option.label}</strong>
            <small>{option.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function PhotoCropChooser({ label, value, cropLabel, cropRatio, onChange }: { label: string; value: string; cropLabel: string; cropRatio: string; onChange: (file: File | null, previewUrl: string) => void }) {
  const inputId = React.useId();

  const chooseFile = (file: File | null) => {
    onChange(file, file ? URL.createObjectURL(file) : "");
  };

  return (
    <div className="photo-crop-tool">
      <span className="file-label">{label}</span>
      <div className="photo-crop-layout">
        <label className={value ? "file-drop selected" : "file-drop"} htmlFor={inputId}>
          <span className="file-icon"><Upload size={24} /></span>
          <span className="file-copy">
            <strong>{value ? "Photo selected" : "Open photos"}</strong>
            <small>{value ? "Choose another photo" : "Choose a cover photo to preview the crop"}</small>
          </span>
          <span className="file-action">{value ? "Change" : "Browse"}</span>
          <input id={inputId} type="file" accept="image/*" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
        </label>
        <div className="crop-preview-card">
          <div className="crop-preview" style={{ aspectRatio: cropRatio }}>
            {value ? <img src={value} alt="Selected crop preview" /> : <div><Upload size={26} /><span>Preview</span></div>}
          </div>
          <p>{cropLabel} crop preview</p>
        </div>
      </div>
    </div>
  );
}

function FileField({ label, onChange }: { label: string; onChange: (file: File | null) => void }) {
  const inputId = React.useId();
  const [fileName, setFileName] = React.useState("");
  const isVideo = label.toLowerCase().includes("video");

  const chooseFile = (file: File | null) => {
    setFileName(file?.name ?? "");
    onChange(file);
  };

  return (
    <div className="file-field">
      <span className="file-label">{label}</span>
      <label className={fileName ? "file-drop selected" : "file-drop"} htmlFor={inputId}>
        <span className="file-icon">{isVideo ? <Video size={24} /> : <Upload size={24} />}</span>
        <span className="file-copy">
          <strong>{fileName || (isVideo ? "Choose a video file" : "Choose an image file")}</strong>
          <small>{fileName ? "Tap to replace" : "Drag, drop, or browse from your device"}</small>
        </span>
        <span className="file-action">{fileName ? "Change" : "Browse"}</span>
        <input id={inputId} type="file" accept={isVideo ? "video/*" : "image/*"} onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="check-row"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
