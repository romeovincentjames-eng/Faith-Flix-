import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { translate } from "./i18n";
import {
  Bell,
  Bookmark,
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
  MessageCircle,
  MessagesSquare,
  Play,
  Plus,
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
  | "saved"
  | "profile"
  | "forgot-password"
  | "admin-login"
  | "admin-studio"
  | "rules";
type CommunityView = "feed" | "prayer" | "upload" | "groups" | "friends" | "messages" | "shares";
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

const ALL_MOCK_SERIES = mergeById(MOCK_SERIES, CATEGORY_MOCK_SERIES);
const ALL_MOCK_VIDEOS = mergeById(mergeById(MOCK_VIDEOS, CATEGORY_MOCK_VIDEOS), CATEGORY_SERIES_MOCK_VIDEOS);

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
  const [mainSearchQuery, setMainSearchQuery] = React.useState("");
  const t = React.useCallback((key: string) => translate("en", key), []);
  const [commSearchQuery, setCommSearchQuery] = React.useState("");
  const [showMainSearch, setShowMainSearch] = React.useState(false);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  React.useEffect(() => {
    const demoVersion = "faithflix-demo-content-v5";
    if (localStorage.getItem(demoVersion)) return;
    setUsers((current) => mergeById(MOCK_USERS, current));
    setVideos((current) => mergeById(ALL_MOCK_VIDEOS, current));
    setSeries((current) => mergeById(ALL_MOCK_SERIES, current));
    setCategories((current) => uniqueCategoriesByName([...defaultCategories, ...current]));
    setUploads((current) => mergeById(MOCK_UPLOADS, current));
    setPosts((current) => mergeById(MOCK_POSTS, current));
    setPrayers((current) => mergeById(MOCK_PRAYERS, current));
    setComments((current) => mergeById(MOCK_COMMENTS, current));
    setFriendRequests((current) => mergeById(MOCK_FRIEND_REQUESTS, current));
    setMessages((current) => mergeById(MOCK_MESSAGES, current));
    setSaved((current) => mergeRecordLists(MOCK_SAVED, current));
    setSavedLists((current) => ({ ...MOCK_SAVED_LISTS, ...current }));
    setLikes((current) => mergeRecordLists(MOCK_LIKES, current));
    localStorage.setItem(demoVersion, "loaded");
  }, [setUsers, setVideos, setSeries, setCategories, setUploads, setPosts, setPrayers, setComments, setFriendRequests, setMessages, setSaved, setSavedLists, setLikes]);

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

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
      if (!active || !profile) return;

      const localUser = profileFromDb(profile as DbProfile, authUser.email || "");
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
      void supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data: profile }) => {
        if (!active || !profile) return;
        const localUser = profileFromDb(profile as DbProfile, session.user.email || "");
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

  React.useEffect(() => {
    if (isAdmin && page !== "admin-studio") setPage("admin-studio");
  }, [isAdmin, page]);

  const visiblePage = isAdmin ? "admin-studio" : page;

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
    selectedMessageUser,
    setSelectedMessageUser,
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
    notify,
    signOut,
    t,
  };

  return (
    <AppContext.Provider value={app}>
      <div className="app-shell" onTouchStart={(event) => { if (window.scrollY <= 4) setPullStartY(event.touches[0].clientY); }} onTouchEnd={(event) => finishPullRefresh(event.changedTouches[0].clientY)}>
        {isPullRefreshing && <div className="pull-refresh">Refreshing...</div>}
        {uploadProgress.active && <div className="upload-progress" role="status" aria-live="polite"><div><span>{uploadProgress.label}</span><strong>{uploadProgress.value}%</strong></div><progress value={uploadProgress.value} max={100} /></div>}
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <header className={`topbar${showMainSearch ? " topbar-search-open" : ""}`}>
          {showMainSearch ? (
            <div className="topbar-search-row">
              <Search size={17} className="topbar-search-icon" />
              <input
                className="topbar-search-input"
                placeholder={t("search.placeholder")}
                autoFocus
                value={mainSearchQuery}
                onChange={(e) => setMainSearchQuery(e.target.value)}
              />
              <button className="icon-button" aria-label="Close search" onClick={() => { setShowMainSearch(false); setMainSearchQuery(""); }}>
                <X size={19} />
              </button>
            </div>
          ) : (
            <>
              <button className="brand" onClick={() => go(isAdmin ? "admin-studio" : "home")} aria-label="Faith Flix home">
                <span className="brand-mark"><Sparkles size={18} /></span>
                <span>Faith Flix</span>
              </button>
              <div className="top-actions">
                <button className="icon-button" aria-label="Search" onClick={() => setShowMainSearch(true)}><Search size={19} /></button>
                <button className="icon-button" aria-label="Notifications" onClick={() => notify(t("toast.noNotifications"))}><Bell size={19} /></button>
              </div>
            </>
          )}
        </header>

        <main className="main-stage">
          {visiblePage === "home" && <HomeScreen />}
          {visiblePage === "watch" && <WatchScreen />}
          {visiblePage === "series" && <SeriesScreen />}
          {(visiblePage === "upload") && <CommunityScreen />}
          {visiblePage === "community" && <CommunityScreen />}
          {visiblePage === "saved" && <SavedScreen />}
          {visiblePage === "profile" && <ProfileScreen />}
          {visiblePage === "forgot-password" && <ForgotPasswordScreen />}
          {visiblePage === "admin-login" && <AdminLogin />}
          {visiblePage === "admin-studio" && <AdminStudio />}
          {visiblePage === "rules" && <ContentRules />}
        </main>

        {!isAdmin && visiblePage !== "community" && visiblePage !== "upload" && !(visiblePage === "profile" && !currentUser) && !(visiblePage === "forgot-password" && !currentUser) && (
          <nav className="bottom-nav six" aria-label="Primary navigation">
            <NavButton label={t("nav.home")} icon={Home} active={visiblePage === "home"} onClick={() => go("home")} />
            <NavButton label={t("nav.watch")} icon={Film} active={visiblePage === "watch"} onClick={() => go("watch")} />
            <NavButton label={t("nav.series")} icon={Clapperboard} active={visiblePage === "series"} onClick={() => go("series")} />
            <NavButton label={t("nav.community")} icon={MessagesSquare} active={false} onClick={() => go("community")} />
            <NavButton label={t("nav.saved")} icon={Bookmark} active={visiblePage === "saved"} onClick={() => go("saved")} />
            <NavButton label={t("nav.profile")} icon={User} active={visiblePage === "profile" || visiblePage === "admin-login" || visiblePage === "admin-studio"} onClick={() => go("profile")} />
          </nav>
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
    selectedMessageUser: string;
    setSelectedMessageUser: React.Dispatch<React.SetStateAction<string>>;
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
    notify: (message: string) => void;
    signOut: () => void;
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
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
}

function HomeScreen() {
  const { isAdmin, publicVideos, publicSeries, go, setSelectedVideoId, setSelectedSeriesId, mainSearchQuery, t } = useApp();
  const adminVideos = publicVideos.filter((v) => v.source === "admin");
  const latest = adminVideos.slice(-10).reverse();

  const openHomeVideo = (video: VideoItem) => {
    flushSync(() => {
      setSelectedVideoId(video.id);
      go("watch");
    });

    window.requestAnimationFrame(() => {
      const player = document.querySelector<HTMLVideoElement>(`.feed-video[data-video-id="${video.id}"]`);
      if (!player) return;
      void player.play();
      void player.requestFullscreen().catch(() => undefined);
    });
  };

  const q = mainSearchQuery.trim().toLowerCase();
  if (q) {
    const matchVideos = publicVideos.filter((v) => [v.title, v.description, v.category, v.seriesId].join(" ").toLowerCase().includes(q));
    const matchSeries = publicSeries.filter((seriesItem) => [seriesItem.title, seriesItem.description, seriesItem.category, seriesItem.scriptureTheme].join(" ").toLowerCase().includes(q));
    return (
      <section className="screen search-results-screen">
        <div className="search-results-header">
          <Search size={16} />
          <span>Results for <strong>"{mainSearchQuery}"</strong></span>
        </div>
        {matchVideos.length === 0 && matchSeries.length === 0 && (
          <EmptyState icon={Search} title={t("search.noResults")} body={`Nothing matches "${mainSearchQuery}". Try a different keyword.`} action="" onAction={() => {}} />
        )}
        {matchVideos.length > 0 && (
          <>
            <SectionHeader title={t("search.videos")} action={`${matchVideos.length} ${t("home.found")}`} />
            <div className="content-grid">{matchVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => openHomeVideo(video)} />)}</div>
          </>
        )}
        {matchSeries.length > 0 && (
          <>
            <SectionHeader title={t("search.series")} action={`${matchSeries.length} ${t("home.found")}`} />
            <div className="series-grid">{matchSeries.map((item) => <button key={item.id} className="series-grid-card" onClick={() => { setSelectedSeriesId(item.id); go("series"); }}>{item.posterUrl ? <img className="series-grid-poster" src={item.posterUrl} alt={item.title} /> : <div className="series-grid-poster series-grid-poster-empty"><Clapperboard size={36} /></div>}<div className="series-grid-info"><p className="eyebrow">{item.category || item.status}</p><h3 className="series-grid-title">{item.title}</h3>{item.scriptureTheme && <p className="series-grid-verse">&#10022; {item.scriptureTheme}</p>}</div><ChevronRight size={18} className="series-grid-arrow" /></button>)}</div>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="screen">
      <SectionHeader title={t("home.publishedVideos")} action={`${adminVideos.length} ${t("home.live")}`} />
      {latest.length ? (
        <div className="horizontal-video-row published-row home-stream-row">
          {latest.map((video) => <VideoCard key={video.id} video={video} onOpen={() => openHomeVideo(video)} />)}
        </div>
      ) : <EmptyState icon={Film} title="No videos uploaded yet." body="Published platform videos will appear here." action={isAdmin ? "Add Platform Video" : "Log In"} onAction={() => isAdmin ? go("admin-studio", "upload") : go("profile")} />}

      <SectionHeader title={t("home.publishedSeries")} action={`${publicSeries.length} ${t("home.live")}`} />
      {publicSeries.length ? <div className="horizontal-series-row home-series-row">{publicSeries.map((item) => <HomeSeriesCard key={item.id} item={item} episodeCount={publicVideos.filter((video) => video.seriesId === item.title).length} onOpen={() => { setSelectedSeriesId(item.id); go("series"); }} />)}</div> : <EmptyState icon={Clapperboard} title={t("series.noSeries")} body={t("series.noSeriesBodyHome")} action={t("nav.series")} onAction={() => go("series")} />}
    </section>
  );
}

function WatchScreen() {
  const { publicVideos, selectedVideoId, setSelectedVideoId, saved, setSaved, likes, setLikes, currentUser, go, notify, comments, setComments, setCommunityView, t } = useApp();
  const playerRef = React.useRef<HTMLDivElement>(null);
  const userPostVideos = publicVideos.filter((video) => video.source === "user");
  const selectedPublicVideo = publicVideos.find((video) => video.id === selectedVideoId);
  const feedVideos = selectedPublicVideo && selectedPublicVideo.source !== "user"
    ? publicVideos
    : userPostVideos.length > 0
      ? userPostVideos
      : publicVideos;
  const selected = feedVideos.find((video) => video.id === selectedVideoId) ?? feedVideos[0];
  const [comment, setComment] = React.useState("");
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const actorId = currentUser?.id ?? "guest";

  // Auto-fullscreen when selected video changes
  React.useEffect(() => {
    if (!selected?.id || !selected.videoUrl) return;
    const el = playerRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.requestFullscreen?.().catch(() => {});
    }, 150);
    return () => clearTimeout(t);
  }, [selected?.id]);

  if (!selected) {
    return <section className="screen"><SectionIntro eyebrow={t("watch.eyebrow")} title={t("watch.feedTitle")} body={t("watch.feedBody")} /><EmptyState icon={Video} title={t("watch.noVideos")} body={t("watch.noVideosBody")} action={t("btn.uploadVideo")} onAction={() => go("upload")} /></section>;
  }

  const savedIds = saved[actorId] ?? [];
  const likedIds = likes[actorId] ?? [];
  const videoComments = comments.filter((item) => item.targetId === selected.id);
  const selectedIndex = feedVideos.findIndex((video) => video.id === selected.id);
  const previousVideo = feedVideos[(selectedIndex - 1 + feedVideos.length) % feedVideos.length];
  const nextVideo = feedVideos[(selectedIndex + 1) % feedVideos.length];

  const openVideo = (videoId: string, message?: string) => {
    setSelectedVideoId(videoId);
    setComment("");
    if (message) notify(message);
  };

  const handleTouchStart = (x: number) => setTouchStartX(x);

  const handleTouchEnd = (x: number) => {
    if (touchStartX === null || feedVideos.length < 2) return;
    const distance = touchStartX - x;
    const threshold = 48;
    if (distance > threshold) openVideo(nextVideo.id, "Next video →");
    if (distance < -threshold) openVideo(previousVideo.id, "← Previous video");
    setTouchStartX(null);
  };

  const toggleList = (setter: typeof setSaved | typeof setLikes, store: Record<string, string[]>, id: string, label: string) => {
    const list = store[actorId] ?? [];
    setter({ ...store, [actorId]: list.includes(id) ? list.filter((item) => item !== id) : [...list, id] });
    notify(label);
  };

  return (
    <section className="screen watch-screen">
      <SectionIntro eyebrow={t("watch.eyebrow")} title={selected.title} body={`${selected.creator || t("watch.faithMember")} • ${selected.category}`} />
      <div className="player-layout">
        <div
          ref={playerRef}
          className="video-placeholder with-media swipe-player"
          onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
        >
          {selected.videoUrl ? (
            isCloudflareStreamUrl(selected.videoUrl) ? (
              <iframe
                className="feed-video feed-video-frame"
                data-video-id={selected.id}
                src={selected.videoUrl}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            ) : (
              <video
                key={selected.id}
                className="feed-video"
                data-video-id={selected.id}
                playsInline
                autoPlay
                src={selected.videoUrl}
                poster={selected.thumbnailUrl}
                onClick={(e) => e.currentTarget.paused ? e.currentTarget.play() : e.currentTarget.pause()}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e.touches[0].clientX); }}
                onTouchEnd={(e) => { e.stopPropagation(); handleTouchEnd(e.changedTouches[0].clientX); }}
              />
            )
          ) : (
            <><Video size={58} /><h2>{selected.videoName || "Video file saved locally"}</h2><p>Video playback is available in this session when a browser file URL exists.</p></>
          )}
          {/* Fullscreen swipe hint overlay */}
          <div className="fullscreen-swipe-hint">
            <span>← Swipe to change video →</span>
          </div>
        </div>
        <div className="detail-panel">
          <p>{selected.description || "No description added."}</p>
          <InfoLine label={t("info.scripture")} value={selected.scripture || t("info.notProvided")} />
          <InfoLine label={t("info.category")} value={selected.category} />
          <InfoLine label={t("info.series")} value={selected.seriesId || t("info.notAssigned")} />
          <InfoLine label={t("info.duration")} value={selected.duration || t("info.notSet")} />
          <div className="button-row">
            <button className="secondary-button" onClick={() => toggleList(setLikes, likes, selected.id, likedIds.includes(selected.id) ? "Like removed." : "Video liked.")}><Heart size={17} /> {likedIds.includes(selected.id) ? "Liked" : "Like"}</button>
            <button className="secondary-button" onClick={() => { if (!currentUser) { notify("Log in to save videos."); go("profile"); return; } toggleList(setSaved, saved, selected.id, savedIds.includes(selected.id) ? "Removed from saved." : "Saved to General."); }}><Bookmark size={17} /> {savedIds.includes(selected.id) ? "Saved" : "Save"}</button>
            <button className="secondary-button" onClick={() => { navigator.clipboard?.writeText(`faithflix://video/${selected.id}`); notify(t("toast.linkCopied")); }}>Share</button>
            <button className="secondary-button" onClick={() => { setCommunityView("feed"); go("community"); }}><MessageCircle size={17} /> Discuss</button>
            <button className="secondary-button" onClick={() => openVideo(previousVideo.id)}>← Prev</button>
            <button className="primary-button" onClick={() => openVideo(nextVideo.id)}>Next →</button>
          </div>
          <CommentBox targetId={selected.id} comments={videoComments} value={comment} setValue={setComment} />
        </div>
      </div>
    </section>
  );
}

function SeriesScreen() {
  const { publicSeries, publicVideos, visibleCategories, go, setSelectedVideoId, selectedSeriesId, setSelectedSeriesId, t } = useApp();
  const [selectedCategory, setSelectedCategory] = React.useState(visibleCategories[0]?.name ?? "");
  const [showCategoryGrid, setShowCategoryGrid] = React.useState(false);
  const focusedSeries = selectedSeriesId ? publicSeries.find((s) => s.id === selectedSeriesId) : null;
  const focusedEpisodes = focusedSeries ? publicVideos.filter((v) => v.seriesId === focusedSeries.title) : [];
  const selectedCategorySeries = publicSeries.filter((item) => item.category === selectedCategory);

  React.useEffect(() => {
    if (!selectedCategory && visibleCategories[0]) setSelectedCategory(visibleCategories[0].name);
  }, [selectedCategory, visibleCategories]);

  const chooseSeriesCategory = (category: CategoryItem) => {
    setSelectedCategory(category.name);
    setShowCategoryGrid(false);
    window.requestAnimationFrame(() => {
      document.getElementById(`series-category-button-${category.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  };

  if (focusedSeries) {
    return (
      <section className="screen series-detail-screen">
        <button className="series-back-btn" onClick={() => setSelectedSeriesId("")}>
          <ChevronRight size={18} style={{ transform: "rotate(180deg)" }} /> All Series
        </button>
        <div className="series-detail-hero">
          {focusedSeries.posterUrl
            ? <img className="series-detail-poster" src={focusedSeries.posterUrl} alt={focusedSeries.title} />
            : <div className="series-detail-poster series-detail-poster-empty"><Clapperboard size={48} /></div>}
          <div className="series-detail-meta">
            <p className="eyebrow">{focusedSeries.category || "Series"}</p>
            <h2 className="series-detail-title">{focusedSeries.title}</h2>
            {focusedSeries.description && <p className="series-detail-desc">{focusedSeries.description}</p>}
            {focusedSeries.scriptureTheme && <p className="series-detail-verse">&#10022; {focusedSeries.scriptureTheme}</p>}
            <p className="series-detail-count">{focusedEpisodes.length} episode{focusedEpisodes.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <h3 className="series-episodes-heading">Episodes</h3>
        {focusedEpisodes.length ? (
          <div className="episode-row series-detail-episode-row">
            {focusedEpisodes.map((video, i) => (
              <div key={video.id} className="series-episode-item">
                <span className="episode-num">Ep {i + 1}</span>
                <VideoCard video={video} onOpen={() => { setSelectedVideoId(video.id); go("watch"); }} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Film} title={t("series.noEpisodes")} body={t("series.noEpisodesBody")} action={t("nav.watch")} onAction={() => go("watch")} />
        )}
      </section>
    );
  }

  return (
    <section className="screen">
      <SectionIntro eyebrow={t("series.eyebrow")} title={t("series.title")} body={t("series.body")} />

      <SectionHeader title={t("home.categories")} action={`${visibleCategories.length} ${t("home.visible")}`} onAction={() => setShowCategoryGrid((open) => !open)} />
      {showCategoryGrid && (
        <div className="category-grid-expanded">
          {visibleCategories.map((category) => (
            <button className={selectedCategory === category.name ? "category-grid-option active" : "category-grid-option"} key={category.id} onClick={() => chooseSeriesCategory(category)}>{category.name}</button>
          ))}
        </div>
      )}
      {!showCategoryGrid && (
        <div className="category-grid category-top-row series-category-row">
          {visibleCategories.map((category) => (
            <button id={`series-category-button-${category.id}`} className={selectedCategory === category.name ? "category-pill active" : "category-pill"} key={category.id} onClick={() => chooseSeriesCategory(category)}>{category.name}</button>
          ))}
        </div>
      )}
      <div className="content-panel category-drop-panel active series-category-panel">
        <SectionHeader title={selectedCategory || "Category"} action={`${selectedCategorySeries.length} series`} />
        {selectedCategorySeries.length ? (
          <div className="series-grid category-series-grid">
            {selectedCategorySeries.map((item) => {
              const count = publicVideos.filter((video) => video.seriesId === item.title).length;
              return (
                <button key={item.id} className="series-grid-card" onClick={() => setSelectedSeriesId(item.id)} aria-label={`Open ${item.title}`}>
                  {item.posterUrl
                    ? <img className="series-grid-poster" src={item.posterUrl} alt={item.title} />
                    : <div className="series-grid-poster series-grid-poster-empty"><Clapperboard size={36} /></div>}
                  <div className="series-grid-info">
                    <p className="eyebrow">{item.category || item.status}</p>
                    <h3 className="series-grid-title">{item.title}</h3>
                    {item.scriptureTheme && <p className="series-grid-verse">&#10022; {item.scriptureTheme}</p>}
                    <p className="series-grid-count">{count} episode{count !== 1 ? "s" : ""}</p>
                  </div>
                  <ChevronRight size={18} className="series-grid-arrow" />
                </button>
              );
            })}
          </div>
        ) : <EmptyState icon={Clapperboard} title="No series in this category yet." body="Series assigned to this category will appear here." action="Choose Category" onAction={() => setShowCategoryGrid(true)} />}
      </div>
    </section>
  );
}

function UploadScreen() {
  const { currentUser, isAdmin, visibleCategories, setUploads, setVideos, setSelectedVideoId, setCommunityView, setUploadProgress, notify, go, t } = useApp();
  const [form, setForm] = React.useState({ title: "", description: "", scripture: "", category: visibleCategories[0]?.name ?? "", testimonyType: "Testimony", visibility: "Public", tags: "", consent: false, rules: false, cropDimension: "9:16", cropRatio: "9 / 16" });
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
        setCommunityView("shares");
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
        <Select label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} options={visibleCategories.map((item) => item.name)} />
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
      <MyUploads />
    </section>
  );
}

function SavedScreen() {
  const { currentUser, saved, savedLists, videos, setSaved, setSavedLists, setSelectedVideoId, go, notify, t } = useApp();
  const [listName, setListName] = React.useState("");

  if (!currentUser) {
    return (
      <section className="screen">
        <SectionIntro eyebrow={t("saved.eyebrow")} title={t("saved.title")} body="Log in to save videos and build your own lists." />
        <EmptyState icon={Bookmark} title="No saved videos for guests." body="Saved videos are only kept for logged-in accounts." action="Log In" onAction={() => go("profile")} />
      </section>
    );
  }

  const actorId = currentUser.id;
  const generalIds = saved[actorId] ?? [];
  const userLists = savedLists[actorId] ?? [];
  const generalVideos = videos.filter((video) => generalIds.includes(video.id));
  const openVideo = (id: string) => { setSelectedVideoId(id); go("watch"); };

  const createList = () => {
    const name = listName.trim();
    if (!name) return notify("Name your list first.");
    if (userLists.some((list) => list.name.toLowerCase() === name.toLowerCase())) return notify("That list already exists.");
    setSavedLists({ ...savedLists, [actorId]: [...userLists, { id: uid("saved-list"), name, videoIds: [] }] });
    setListName("");
    notify("List created.");
  };

  const addToList = (listId: string, videoId: string) => {
    setSavedLists({ ...savedLists, [actorId]: userLists.map((list) => list.id === listId ? { ...list, videoIds: Array.from(new Set([...list.videoIds, videoId])) } : list) });
    notify("Added to list.");
  };

  const removeFromGeneral = (videoId: string) => {
    setSaved({ ...saved, [actorId]: generalIds.filter((id) => id !== videoId) });
    notify("Removed from General.");
  };

  const removeFromList = (listId: string, videoId: string) => {
    setSavedLists({ ...savedLists, [actorId]: userLists.map((list) => list.id === listId ? { ...list, videoIds: list.videoIds.filter((id) => id !== videoId) } : list) });
    notify("Removed from list.");
  };

  const deleteList = (listId: string) => {
    setSavedLists({ ...savedLists, [actorId]: userLists.filter((list) => list.id !== listId) });
    notify("List deleted.");
  };

  return (
    <section className="screen saved-library-screen">
      <SectionIntro eyebrow={t("saved.eyebrow")} title={t("saved.title")} body="Saved videos go to General automatically. Create your own lists to organize them." />
      <div className="saved-list-create">
        <Field label="New list name" value={listName} onChange={setListName} />
        <button className="primary-button" onClick={createList}>Create List</button>
      </div>

      <SectionHeader title="General" action={generalVideos.length + " saved"} />
      {generalVideos.length ? (
        <div className="content-grid">
          {generalVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => openVideo(video.id)} extra={<div className="saved-card-actions"><button className="secondary-button" onClick={() => removeFromGeneral(video.id)}>Remove</button>{userLists.map((list) => <button className="secondary-button" key={list.id} onClick={() => addToList(list.id, video.id)}>Add to {list.name}</button>)}</div>} />)}
        </div>
      ) : <EmptyState icon={Bookmark} title="No saved videos yet." body="When you save a video, it will appear in General." action="Open Watch" onAction={() => go("watch")} />}

      {userLists.map((list) => {
        const listVideos = videos.filter((video) => list.videoIds.includes(video.id));
        return (
          <div className="saved-list-section" key={list.id}>
            <SectionHeader title={list.name} action={listVideos.length + " videos"} />
            {listVideos.length ? <div className="content-grid">{listVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => openVideo(video.id)} extra={<button className="secondary-button" onClick={() => removeFromList(list.id, video.id)}>Remove from {list.name}</button>} />)}</div> : <div className="content-panel"><p className="muted">Add videos from General to fill this list.</p><button className="secondary-button danger" onClick={() => deleteList(list.id)}>Delete List</button></div>}
          </div>
        );
      })}
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

function CommunitySharesScreen() {
  const { publicVideos, setSelectedVideoId, go, t } = useApp();
  const userVideos = publicVideos.filter((v) => v.source === "user");
  const openVideo = (id: string) => { setSelectedVideoId(id); go("watch"); };
  return (
    <div className="community-shares-screen">
      <div className="community-shares-intro">
        <Share2 size={28} className="community-shares-icon" />
        <div>
          <h3 className="community-shares-title">Community Shares</h3>
          <p className="community-shares-body">Testimonies and videos shared by members of the Faith Flix community. New videos can take a minute to finish processing.</p>
        </div>
      </div>
      {userVideos.length ? (
        <div className="content-grid community-shares-grid">
          {userVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => openVideo(video.id)} />)}
        </div>
      ) : (
        <EmptyState icon={Share2} title="No community shares yet" body="When members submit testimonies and videos they will appear here." action={t("hero.submitTestimony")} onAction={() => go("upload")} />
      )}
    </div>
  );
}

function CommunityScreen() {
  const { communityView, setCommunityView, notify, go, commSearchQuery, setCommSearchQuery, t } = useApp();
  const [showCommSearch, setShowCommSearch] = React.useState(false);
  const tabs: { id: CommunityView; label: string; icon: React.ElementType }[] = [
    { id: "feed", label: t("comm.tab.feed"), icon: MessagesSquare },
    { id: "prayer", label: t("comm.tab.prayer"), icon: HeartHandshake },
    { id: "shares", label: "Shares", icon: Share2 },
    { id: "upload", label: t("comm.tab.upload"), icon: Upload },
    { id: "groups", label: t("comm.tab.groups"), icon: Users },
    { id: "friends", label: t("comm.tab.friends"), icon: UserPlus },
    { id: "messages", label: t("comm.tab.messages"), icon: Inbox },
  ];

  const screenTitles: Record<CommunityView, string> = {
    feed: t("comm.title.feed"),
    prayer: t("comm.title.prayer"),
    shares: "Community Shares",
    upload: t("comm.title.upload"),
    groups: t("comm.title.groups"),
    friends: t("comm.title.friends"),
    messages: t("comm.title.messages"),
  };

  return (
    <div className="community-app">
      <div className="community-topbar">
        <div className="community-brand">
          <span className="community-brand-icon"><Cross size={15} /></span>
          <span className="community-brand-name">{screenTitles[communityView]}</span>
        </div>
        <div className="community-topbar-actions">
          <button className="community-icon-btn" aria-label={showCommSearch ? "Close search" : "Search"} onClick={() => { setShowCommSearch((v) => !v); if (showCommSearch) setCommSearchQuery(""); }}>{showCommSearch ? <X size={20} /> : <Search size={20} />}</button>
          <button className="community-icon-btn" aria-label="Write post" onClick={() => setCommunityView("feed")}><Edit3 size={20} /></button>
        </div>
      </div>
      {showCommSearch && (
        <div className="comm-search-row">
          <Search size={15} className="comm-search-icon" />
          <input
            className="comm-search-input"
            placeholder={communityView === "prayer" ? "Search prayers…" : communityView === "groups" ? "Search groups…" : "Search posts…"}
            autoFocus
            value={commSearchQuery}
            onChange={(e) => setCommSearchQuery(e.target.value)}
          />
          {commSearchQuery && <button className="community-icon-btn" onClick={() => setCommSearchQuery("")}><X size={15} /></button>}
        </div>
      )}

      {communityView === "feed" && (
        <div className="comm-story-row">
          <button className="comm-story-item" onClick={() => notify("Add your story — coming soon!")}>
            <div className="comm-story-avatar comm-story-add"><Plus size={22} /></div>
            <span className="comm-story-name">Your Story</span>
          </button>
          {COMM_STORIES.map((member) => (
            <button className="comm-story-item" key={member.name} onClick={() => notify(`${member.name}'s story — coming soon!`)}>
              <div className="comm-story-avatar comm-story-ring" style={{ "--story-color": member.color } as React.CSSProperties}>
                <span>{member.initials}</span>
              </div>
              <span className="comm-story-name">{member.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      )}

      <div className="community-body">
        {communityView === "feed" && <FaithFeed />}
        {communityView === "prayer" && <PrayerWall />}
        {communityView === "shares" && <CommunitySharesScreen />}
        {communityView === "upload" && <UploadScreen />}
        {communityView === "groups" && (
          <div className="comm-groups-grid">
            {[
              { name: "Morning Devotions", members: 24, verse: "Psalm 143:8", color: "#f6d27b" },
              { name: "Romans Study", members: 18, verse: "Romans 8:28", color: "#60a5fa" },
              { name: "Youth Ministry", members: 31, verse: "Proverbs 22:6", color: "#34d399" },
              { name: "Worship & Prayer", members: 42, verse: "Psalm 100:1", color: "#fb923c" },
              { name: "Apologetics", members: 11, verse: "1 Peter 3:15", color: "#c4b5fd" },
              { name: "Missionaries", members: 7, verse: "Matthew 28:19", color: "#f472b6" },
            ].map((group) => (
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
      </div>

      <nav className="community-inner-nav">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={communityView === id ? "comm-nav-btn active" : "comm-nav-btn"}
            onClick={() => setCommunityView(id)}
            aria-label={label}
          >
            <Icon size={id === "upload" ? 23 : 21} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <button className="comm-back-bar" onClick={() => go("home")} aria-label={t("comm.backToApp")}>
        Main Menu
      </button>
    </div>
  );
}

function FaithFeed() {
  const { currentUser, posts, setPosts, notify, comments, commSearchQuery, t } = useApp();
  const [text, setText] = React.useState("");
  const [scripture, setScripture] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);
  const actor = currentUser?.id ?? "guest";

  const create = () => {
    if (!currentUser) return notify("Create an account before posting.");
    if (!text.trim()) return notify("Write an encouragement first.");
    const info = fileInfo(image);
    setPosts([{ id: uid("post"), userId: currentUser.id, author: currentUser.name, text, scripture, imageName: info.name, imageUrl: info.url, likes: [], saves: [], reports: [] }, ...posts]);
    setText("");
    setScripture("");
    setImage(null);
    notify("Post shared.");
  };

  const togglePost = (id: string, field: "likes" | "saves" | "reports", message: string) => {
    setPosts(posts.map((post) => post.id === id ? { ...post, [field]: post[field].includes(actor) ? post[field].filter((item) => item !== actor) : [...post[field], actor] } : post));
    notify(message);
  };

  const filteredPosts = commSearchQuery
    ? posts.filter((p) => [p.text, p.author, p.scripture].join(" ").toLowerCase().includes(commSearchQuery.toLowerCase()))
    : posts;

  return (
    <>
      <div className="form-card">
        <label>Encouragement<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Share faith-based encouragement" /></label>
        <Field label="Scripture reference" value={scripture} onChange={setScripture} />
        <FileField label="Optional image" onChange={setImage} />
        <button className="primary-button" onClick={create}>Share Post</button>
      </div>
      {commSearchQuery && filteredPosts.length === 0 && <EmptyState icon={Search} title="No posts match your search." body={`Try a different keyword.`} action="" onAction={() => {}} />}
      {filteredPosts.map((post) => <PostCard key={post.id} post={post} comments={comments.filter((item) => item.targetId === post.id)} onToggle={togglePost} />)}
      {!commSearchQuery && filteredPosts.length === 0 && <EmptyState icon={MessagesSquare} title="No community posts yet. Be the first to share encouragement." body="Faith Feed posts will appear here." action="Write encouragement" onAction={() => notify("Use the form above to share encouragement.")} />}
    </>
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
  const { currentUser, users, friendRequests, setFriendRequests, notify, t } = useApp();
  if (!currentUser) return <EmptyState icon={UserPlus} title={t("comm.noFriends")} body={t("comm.noFriendsBody")} action={t("profile.eyebrow")} onAction={() => notify(t("profile.eyebrow"))} />;
  const others = users.filter((user) => user.id !== currentUser.id && user.role !== "admin");
  const incoming = friendRequests.filter((request) => request.toId === currentUser.id && request.status === "pending");
  const accepted = friendRequests.filter((request) => request.status === "accepted" && [request.fromId, request.toId].includes(currentUser.id));
  const requestFriend = (toId: string) => {
    if (friendRequests.some((request) => [request.fromId, request.toId].includes(currentUser.id) && [request.fromId, request.toId].includes(toId))) return notify(t("comm.friendExists"));
    setFriendRequests([...friendRequests, { id: uid("friend"), fromId: currentUser.id, toId, status: "pending" }]);
    notify(t("comm.friendRequestSent"));
  };
  return (
    <div className="panel-grid">
      <div className="content-panel"><h2>{t("comm.friends")}</h2>{accepted.length ? accepted.map((request) => <FriendRow key={request.id} request={request} />) : <p>{t("comm.noFriendsYet")}</p>}</div>
      <div className="content-panel"><h2>{t("comm.requests")}</h2>{incoming.length ? incoming.map((request) => <button className="secondary-button" key={request.id} onClick={() => { setFriendRequests(friendRequests.map((item) => item.id === request.id ? { ...item, status: "accepted" } : item)); notify("Friend request accepted."); }}>Accept {users.find((user) => user.id === request.fromId)?.name}</button>) : <p>{t("comm.noRequestsYet")}</p>}</div>
      <div className="content-panel"><h2>{t("comm.otherMembers")}</h2>{others.length ? others.map((user) => <button className="secondary-button" key={user.id} onClick={() => requestFriend(user.id)}>Add {user.name}</button>) : <p>{t("comm.noOtherUsers")}</p>}</div>
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
  const { currentUser, users, setUsers, setSessionId, isAdmin, signOut, go, notify, t } = useApp();
  const [mode, setMode] = React.useState<"signup" | "login">("login");

  if (!currentUser) {
    return (
      <section className="screen auth-screen">
        <div className="auth-card">
          <SectionIntro eyebrow="Faith Flix" title="Sign in" body="Log in to post, save, upload, and manage your Faith Flix account." />
          <div className="button-row"><button className={mode === "login" ? "primary-button" : "secondary-button"} onClick={() => setMode("login")}>{t("profile.login")}</button><button className={mode === "signup" ? "primary-button" : "secondary-button"} onClick={() => setMode("signup")}>{t("profile.signup")}</button></div>
          {mode === "signup" ? <SignupForm /> : <LoginForm />}
          <button className="text-button" onClick={() => go("home")}>Continue as guest</button>
        </div>
      </section>
    );
  }

  const update = (patch: Partial<Profile>) => {
    setUsers(users.map((user) => user.id === currentUser.id ? { ...user, ...patch } : user));
    void supabase
      .from("profiles")
      .update({
        name: patch.name,
        username: patch.username,
        bio: patch.bio,
        favorite_scripture: patch.favoriteScripture,
        church_ministry_name: patch.ministry,
        location: patch.location,
        profile_image_url: patch.image,
      })
      .eq("id", currentUser.id);
    notify(t("profile.profileUpdated"));
  };

  return (
    <section className="screen">
      <SectionIntro eyebrow={isAdmin ? t("profile.adminEyebrow") : t("profile.eyebrow")} title={currentUser.name} body={`@${currentUser.username || "faithmember"}`} />
      <div className="form-card">
        <Field label={t("profile.nameLabel")} value={currentUser.name} onChange={(name) => update({ name })} />
        <Field label={t("profile.usernameLabel")} value={currentUser.username} onChange={(username) => update({ username })} />
        <Field label={t("profile.bioLabel")} value={currentUser.bio ?? ""} onChange={(bio) => update({ bio })} />
        <Field label={t("profile.scriptureLabel")} value={currentUser.favoriteScripture ?? ""} onChange={(favoriteScripture) => update({ favoriteScripture })} />
        <Field label={t("profile.churchLabel")} value={currentUser.ministry ?? ""} onChange={(ministry) => update({ ministry })} />
        <Field label={t("profile.locationLabel")} value={currentUser.location ?? ""} onChange={(location) => update({ location })} />
        <FileField label={t("profile.imageLabel")} onChange={(file) => update({ image: fileInfo(file).name })} />
        <div className="button-row">
          {isAdmin && <button className="primary-button" onClick={() => go("admin-studio")}>{t("profile.openAdminStudio")}</button>}
          <button className="secondary-button" onClick={signOut}>{t("profile.signOut")}</button>
          <button className="secondary-button" onClick={() => { setSessionId(currentUser.id); notify(t("profile.profileSaved")); }}>{t("profile.saveProfile")}</button>
        </div>
      </div>
      {!isAdmin && <MyUploads />}
    </section>
  );
}

function SignupForm() {
  const { users, setUsers, setSessionId, notify, go, t } = useApp();
  const [form, setForm] = React.useState({ name: "", username: "", email: "", password: "", birthday: "", image: "" });
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.password) return notify("Name, email, and password are required.");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, username: form.username } },
    });
    if (error || !data.user) {
      setBusy(false);
      return notify(error?.message || "Signup failed.");
    }

    const profilePayload = {
      id: data.user.id,
      role: "user" as const,
      name: form.name,
      username: form.username || form.email.split("@")[0],
      birthday: form.birthday || null,
      profile_image_url: form.image || null,
    };
    const { error: profileError } = await supabase.from("profiles").upsert(profilePayload);
    const localUser: Profile = {
      id: data.user.id,
      role: "user",
      name: profilePayload.name,
      username: profilePayload.username,
      email: form.email,
      birthday: form.birthday,
      image: form.image,
    };
    setUsers(upsertLocalUser(users, localUser));
    if (data.session) {
      setSessionId(data.user.id);
      notify(profileError ? "Account created. Profile will sync after email confirmation." : "Account created.");
      go("home");
    } else {
      notify("Account created. Check your email to confirm before logging in.");
    }
    setBusy(false);
  };

  return <div className="form-card"><h2>Create account</h2><Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} /><Field label="Username" value={form.username} onChange={(username) => setForm({ ...form, username })} /><Field label={t("profile.emailLabel")} type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} /><Field label={t("profile.passwordLabel")} type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} /><Field label="Birthday" type="date" value={form.birthday} onChange={(birthday) => setForm({ ...form, birthday })} /><FileField label="Optional profile image" onChange={(file) => setForm({ ...form, image: fileInfo(file).name })} /><button className="primary-button" onClick={submit}>{busy ? "Creating..." : "Create Account"}</button></div>;
}

function LoginForm() {
  const { users, setUsers, setSessionId, notify, go, t } = useApp();
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
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
    if (profileError || !profile) {
      setBusy(false);
      return notify("Login worked, but no profile exists yet.");
    }
    const localUser = profileFromDb(profile as DbProfile, data.user.email || email);
    setUsers(upsertLocalUser(users, localUser));
    setSessionId(localUser.id);
    notify("Logged in.");
    go(localUser.role === "admin" ? "admin-studio" : "home");
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
    if (!form.seriesId) return notify("Choose a series for this professional video.");

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
  const initials = post.author.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <article className="content-panel post-card">
      <div className="post-header">
        <div className="post-avatar">{initials}</div>
        <div className="post-author-info">
          <p className="post-author-name">{post.author}</p>
          {post.scripture && <p className="post-meta">{post.scripture}</p>}
        </div>
      </div>
      <p className="post-text">{post.text}</p>
      {post.imageUrl && <img className="poster" src={post.imageUrl} alt="" />}
      <div className="button-row">
        <button className="secondary-button" onClick={() => onToggle(post.id, "likes", "Post liked.")}><Heart size={15} /> {post.likes.length}</button>
        <button className="secondary-button" onClick={() => onToggle(post.id, "saves", "Post saved.")}><Bookmark size={15} /> {post.saves.length}</button>
        <button className="secondary-button" onClick={() => onToggle(post.id, "reports", "Post reported to admins.")}>Report</button>
      </div>
      <CommentBox targetId={post.id} comments={comments} value={comment} setValue={setComment} />
    </article>
  );
}

function VideoCard({ video, onOpen, extra }: { video: VideoItem; onOpen: () => void; extra?: React.ReactNode }) {
  const badgeText = video.seriesId?.trim() || video.category || "Faith Flix";
  const badgeClass = video.seriesId ? "source-badge source-badge-series" : "source-badge source-badge-category";
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
          <Clapperboard size={11} /> {badgeText}
        </span>
        <h3>{video.title}</h3>
        <p>{video.creator || "Faith Flix"}</p>
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
        <div className="home-series-overlay">
          <span className="thumb-play-btn"><Play size={18} /></span>
          <span className="home-series-episode-text">{episodeCount} episode{episodeCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div className="home-series-info">
        <span className="thumb-cat-tag">{item.category || "Series"}</span>
        <h3>{item.title}</h3>
        <p className="home-series-verse">{item.scriptureTheme ? <><span>&#10022;</span> {item.scriptureTheme}</> : `${episodeCount} episode${episodeCount !== 1 ? "s" : ""}`}</p>
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
