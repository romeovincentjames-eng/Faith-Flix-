import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
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
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  Video,
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
  "Prayer Videos",
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
  "Prayer Room Content",
  "Answered Prayer Stories",
  "Faith Journey Videos",
].map((name, index) => ({ id: `cat-${index}`, name, hidden: false, custom: false }));

const MOCK_VIDEOS: VideoItem[] = [
  { id: "mock-v1", source: "admin", title: "Walking by Faith", description: "A powerful message on what it truly means to trust God in every season of life — even when you cannot see the path ahead.", scripture: "2 Corinthians 5:7", category: "Sermons", seriesId: "Faith Journey", episode: "1", duration: "12:34", creator: "Pastor James Rivers", tags: "faith, trust, walk", status: "Published", videoName: "walking-by-faith.mp4", videoUrl: "", thumbnailName: "sunrise.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-10" },
  { id: "mock-v2", source: "admin", title: "The Power of the Cross", description: "Discover the transforming power of the cross and what Jesus's sacrifice means for our lives today.", scripture: "1 Corinthians 1:18", category: "Gospel Messages", seriesId: "", episode: "", duration: "8:45", creator: "Faith Flix", tags: "cross, gospel, salvation", status: "Published", videoName: "power-of-cross.mp4", videoUrl: "", thumbnailName: "cross-sunset.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-12" },
  { id: "mock-v3", source: "admin", title: "Worship in Spirit and Truth", description: "A breathtaking worship experience that invites you into deeper connection with God through song, scripture, and stillness.", scripture: "John 4:24", category: "Worship Videos", seriesId: "", episode: "", duration: "18:20", creator: "Elevation Worship", tags: "worship, prayer, spirit", status: "Published", videoName: "worship-spirit.mp4", videoUrl: "", thumbnailName: "worship.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-14" },
  { id: "mock-v4", source: "admin", title: "In the Beginning", description: "An animated retelling of Genesis chapter 1 — from darkness to the first breath of creation. Perfect for all ages.", scripture: "Genesis 1:1", category: "Animated Bible Stories", seriesId: "Genesis Unlocked", episode: "1", duration: "6:15", creator: "BibleVision Studios", tags: "creation, genesis, animated", status: "Published", videoName: "in-the-beginning.mp4", videoUrl: "", thumbnailName: "creation.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-16" },
  { id: "mock-v5", source: "admin", title: "Still Small Voice", description: "When God speaks in a whisper — a devotional on hearing God's voice in the chaos and quieting your heart to listen.", scripture: "1 Kings 19:12", category: "Devotional Clips", seriesId: "Quiet Time", episode: "3", duration: "9:02", creator: "Daily Bread Ministries", tags: "devotional, prayer, stillness", status: "Published", videoName: "still-small-voice.mp4", videoUrl: "", thumbnailName: "forest-light.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-18" },
  { id: "mock-v6", source: "admin", title: "My Healing Testimony", description: "Sarah shares the miraculous story of how God healed her after years of chronic illness — a testimony of undeniable faith.", scripture: "Psalm 103:3", category: "Testimonies", seriesId: "", episode: "", duration: "15:50", creator: "Sarah M.", tags: "healing, testimony, miracle", status: "Published", videoName: "healing-testimony.mp4", videoUrl: "", thumbnailName: "praying-hands.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1510836217651-1a1b2f98d7de?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-20" },
  { id: "mock-v7", source: "admin", title: "Sermon on the Mount", description: "A visual Bible study through the Beatitudes — exploring what it means to live the Kingdom way.", scripture: "Matthew 5:3–12", category: "Bible Study Content", seriesId: "Red Letter Series", episode: "2", duration: "22:08", creator: "The Bible Project", tags: "sermon, beatitudes, jesus", status: "Published", videoName: "sermon-mount.mp4", videoUrl: "", thumbnailName: "bible-open.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-22" },
  { id: "mock-v8", source: "admin", title: "Grace Like Rain", description: "A cinematic worship visual experience set to original music — experience God's grace poured out in stunning imagery.", scripture: "Ephesians 2:8", category: "Faith Music Visuals", seriesId: "", episode: "", duration: "5:33", creator: "Hillsong Creative", tags: "grace, music, visual", status: "Published", videoName: "grace-like-rain.mp4", videoUrl: "", thumbnailName: "candles.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1511516412963-801b050c3434?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-24" },
  { id: "mock-v9", source: "admin", title: "The Prodigal Son", description: "A short cinematic film retelling the parable of the prodigal son in a modern-day setting. A story of redemption and love.", scripture: "Luke 15:11–32", category: "Christian Short Films", seriesId: "Parables of Jesus", episode: "1", duration: "28:14", creator: "RedemptionFilms", tags: "prodigal, film, parable", status: "Published", videoName: "prodigal-son.mp4", videoUrl: "", thumbnailName: "church-interior.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-26" },
  { id: "mock-v10", source: "admin", title: "Praying for Your Nation", description: "Join thousands of believers in a prayer movement for national revival — intercede with scripture, worship, and bold faith.", scripture: "2 Chronicles 7:14", category: "Prayer Videos", seriesId: "Faith Journey", episode: "4", duration: "11:47", creator: "Awakening Prayer Network", tags: "prayer, nation, revival", status: "Published", videoName: "national-prayer.mp4", videoUrl: "", thumbnailName: "prayer-nature.jpg", thumbnailUrl: "https://images.unsplash.com/photo-1499810631641-541e76d678a2?w=500&q=80", cropDimension: "9:16", cropRatio: "9 / 16", createdAt: "2024-01-28" },
];

const MOCK_SERIES: SeriesItem[] = [
  { id: "mock-s1", title: "Faith Journey", description: "A 6-part series on the foundations of Christian faith — for believers at every stage of their walk.", posterName: "faith-journey.jpg", posterUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", scriptureTheme: "Hebrews 11:1", category: "Sermons", status: "Published" },
  { id: "mock-s2", title: "Genesis Unlocked", description: "Animated exploration of the book of Genesis — from creation to Joseph, brought to life in stunning detail.", posterName: "genesis.jpg", posterUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", scriptureTheme: "Genesis 1:1", category: "Animated Bible Stories", status: "Published" },
  { id: "mock-s3", title: "Red Letter Series", description: "Deep dives into the words of Jesus — exploring the Sermon on the Mount, parables, and teachings of Christ.", posterName: "red-letter.jpg", posterUrl: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=400&q=80", scriptureTheme: "Matthew 5–7", category: "Bible Study Content", status: "Published" },
];

const MOCK_POSTS: CommunityPost[] = [
  { id: "mock-p1", userId: "mock-user1", author: "Grace Walker", text: "God has been so faithful this week. After months of waiting, my prayers were answered in the most unexpected way. Never stop trusting Him! 🙌", scripture: "Psalm 27:14", imageName: "", imageUrl: "", likes: ["a", "b", "c", "d"], saves: ["a"], reports: [] },
  { id: "mock-p2", userId: "mock-user2", author: "David Chen", text: "Sharing this as a reminder to myself and to you: You are not defined by your past. In Christ, you are a new creation. Keep walking forward.", scripture: "2 Corinthians 5:17", imageName: "", imageUrl: "", likes: ["a", "b", "c", "d", "e"], saves: ["a", "b"], reports: [] },
  { id: "mock-p3", userId: "mock-user3", author: "Miriam Johnson", text: "Our church had the most beautiful sunrise prayer service this morning. God showed up in such a powerful way. This community on Faith Flix has been such a blessing to me.", scripture: "Lamentations 3:22–23", imageName: "", imageUrl: "", likes: ["a", "b", "c"], saves: [], reports: [] },
  { id: "mock-p4", userId: "mock-user4", author: "Pastor Samuel", text: "Quick word of encouragement: God is not surprised by what you're going through. He saw this season before you were born and He has already prepared a way through it.", scripture: "Jeremiah 29:11", imageName: "", imageUrl: "", likes: ["a", "b", "c", "d", "e", "f", "g"], saves: ["a", "b", "c"], reports: [] },
  { id: "mock-p5", userId: "mock-user5", author: "Ruth Adeyemi", text: "Just completed the 'Walking by Faith' series and WOW. My perspective on hardship has completely changed. Thank you Faith Flix for this platform. God bless you all. 🙏", scripture: "Romans 8:28", imageName: "", imageUrl: "", likes: ["a", "b", "c", "d"], saves: ["a"], reports: [] },
];

const MOCK_PRAYERS: PrayerRequest[] = [
  { id: "mock-pr1", userId: "mock-user1", title: "Healing for my mother", text: "My mother was diagnosed with cancer last month. I'm believing God for her complete healing. Please stand in agreement with me in prayer.", visibility: "Public", actions: { "I prayed": ["a", "b", "c"], "Amen": ["a", "b", "c", "d"], "Praying for you": ["a", "b"] } },
  { id: "mock-pr2", userId: "mock-user2", title: "Job breakthrough needed", text: "I've been unemployed for 6 months and my family is struggling. Trusting God's provision but could use prayer warriors standing with me.", visibility: "Public", actions: { "I prayed": ["a", "b"], "Amen": ["a", "b", "c"], "Praying for you": ["a", "b", "c"] } },
  { id: "mock-pr3", userId: "mock-user3", title: "Praise report — answered prayer!", text: "Six months ago I posted here asking for prayer about my marriage. Today I'm thrilled to share — we went to counseling, God restored our marriage, and we are closer than ever!", visibility: "Public", actions: { "Praise God": ["a", "b", "c", "d", "e"], "Answered": ["a", "b", "c"], "Amen": ["a", "b", "c", "d", "e", "f"] } },
  { id: "mock-pr4", userId: "mock-user4", title: "Peace for anxiety", text: "Going through a difficult season of anxiety and fear. I know God hasn't given me a spirit of fear, but I need prayer to walk in that truth daily.", visibility: "Public", actions: { "I prayed": ["a", "b", "c"], "Praying for you": ["a", "b", "c", "d"] } },
];

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

function App() {
  const [page, setPage] = React.useState<Page>("home");
  const [studioView, setStudioView] = React.useState<StudioView>("dashboard");
  const [communityView, setCommunityView] = React.useState<CommunityView>("feed");
  const [selectedVideoId, setSelectedVideoId] = React.useState("");
  const [selectedSeriesId, setSelectedSeriesId] = React.useState("");
  const [selectedMessageUser, setSelectedMessageUser] = React.useState("");
  const [toast, setToast] = React.useState("");
  const [uploadProgress, setUploadProgress] = React.useState<UploadProgress>({ active: false, value: 0, label: "" });
  const [pullStartY, setPullStartY] = React.useState<number | null>(null);
  const [isPullRefreshing, setIsPullRefreshing] = React.useState(false);

  const [users, setUsers] = useStoredState<Profile[]>("faithflix-users", []);
  const [sessionId, setSessionId] = useStoredState<string>("faithflix-session", "");
  const [videos, setVideos] = useStoredState<VideoItem[]>("faithflix-videos", MOCK_VIDEOS);
  const [series, setSeries] = useStoredState<SeriesItem[]>("faithflix-series", MOCK_SERIES);
  const [categories, setCategories] = useStoredState<CategoryItem[]>("faithflix-categories", defaultCategories);
  const [uploads, setUploads] = useStoredState<UserUpload[]>("faithflix-user-uploads", []);
  const [saved, setSaved] = useStoredState<Record<string, string[]>>("faithflix-saved", {});
  const [likes, setLikes] = useStoredState<Record<string, string[]>>("faithflix-likes", {});
  const [comments, setComments] = useStoredState<CommentItem[]>("faithflix-comments", []);
  const [posts, setPosts] = useStoredState<CommunityPost[]>("faithflix-posts", MOCK_POSTS);
  const [prayers, setPrayers] = useStoredState<PrayerRequest[]>("faithflix-prayers", MOCK_PRAYERS);
  const [friendRequests, setFriendRequests] = useStoredState<FriendRequest[]>("faithflix-friends", []);
  const [messages, setMessages] = useStoredState<Message[]>("faithflix-messages", []);
  const [mainSearchQuery, setMainSearchQuery] = React.useState("");
  const [commSearchQuery, setCommSearchQuery] = React.useState("");
  const [showMainSearch, setShowMainSearch] = React.useState(false);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const currentUser = users.find((user) => user.id === sessionId);
  const isAdmin = currentUser?.role === "admin";
  const visibleCategories = categories.filter((category) => !category.hidden);
  const publicVideos = videos.filter((video) => video.status === "Published");
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
      if (data.length > 0) setVideos((data as DbVideo[]).map(videoFromDb));
    };

    void loadSupabaseVideos();

    return () => {
      active = false;
    };
  }, [setVideos]);

  React.useEffect(() => {
    setVideos((current) => current.filter((video) => !starterVideoIds.includes(video.id)));
    setSeries((current) => current.filter((item) => !starterSeriesIds.includes(item.id) && item.title !== "Ai bible"));
  }, [setVideos, setSeries]);

  React.useEffect(() => {
    setVideos((current) => (current.length === 0 || current.every((v) => v.id.startsWith("starter-"))) ? MOCK_VIDEOS : current);
    setSeries((current) => current.length === 0 ? MOCK_SERIES : current);
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
    setPage("home");
    notify("Signed out.");
  };

  const finishPullRefresh = (y: number) => {
    if (pullStartY === null) return;
    const pulled = y - pullStartY;
    setPullStartY(null);
    if (window.scrollY <= 4 && pulled > 90) {
      setIsPullRefreshing(true);
      notify("Refreshing.");
      window.setTimeout(() => window.location.reload(), 450);
    }
  };

  const go = (nextPage: Page, nextStudioView?: StudioView) => {
    if (nextPage === "upload" && currentUser?.role !== "admin") {
      setCommunityView("upload");
      setPage("community");
      return;
    }
    if (nextStudioView) setStudioView(nextStudioView);
    setPage(nextPage);
  };

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
                placeholder="Search videos, series, categories…"
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
              <button className="brand" onClick={() => go("home")} aria-label="Faith Flix home">
                <span className="brand-mark"><Sparkles size={18} /></span>
                <span>Faith Flix</span>
              </button>
              <div className="top-actions">
                <button className="icon-button" aria-label="Search" onClick={() => setShowMainSearch(true)}><Search size={19} /></button>
                <button className="icon-button" aria-label="Notifications" onClick={() => notify("No notifications yet.")}><Bell size={19} /></button>
              </div>
            </>
          )}
        </header>

        <main className="main-stage">
          {page === "home" && <HomeScreen />}
          {page === "watch" && <WatchScreen />}
          {page === "series" && <SeriesScreen />}
          {(page === "upload") && <CommunityScreen />}
          {page === "community" && <CommunityScreen />}
          {page === "saved" && <SavedScreen />}
          {page === "profile" && <ProfileScreen />}
          {page === "admin-login" && <AdminLogin />}
          {page === "admin-studio" && <AdminStudio />}
          {page === "rules" && <ContentRules />}
        </main>

        {page !== "community" && page !== "upload" && (
          <nav className="bottom-nav six" aria-label="Primary navigation">
            <NavButton label="Home" icon={Home} active={page === "home"} onClick={() => go("home")} />
            <NavButton label="Watch" icon={Film} active={page === "watch"} onClick={() => go("watch")} />
            <NavButton label="Series" icon={Clapperboard} active={page === "series"} onClick={() => go("series")} />
            <NavButton label="Community" icon={MessagesSquare} active={false} onClick={() => go("community")} />
            <NavButton label="Saved" icon={Bookmark} active={page === "saved"} onClick={() => go("saved")} />
            <NavButton label="Profile" icon={User} active={page === "profile" || page === "admin-login" || page === "admin-studio"} onClick={() => go("profile")} />
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
  return {
    source: video.source,
    title: video.title,
    description: video.description,
    scripture_reference: video.scripture,
    episode_number: video.episode,
    duration: video.duration,
    creator_ministry_name: video.creator,
    tags: video.tags,
    video_url: video.videoUrl || null,
    thumbnail_url: video.thumbnailUrl || null,
    status: statusToDb(video.status),
    created_by: createdBy,
    app_category: video.category,
    app_series_title: video.seriesId,
    crop_dimension: video.cropDimension || "9:16",
    crop_ratio: video.cropRatio || "9 / 16",
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
  const { isAdmin, publicVideos, publicSeries, visibleCategories, go, setSelectedVideoId, setSelectedSeriesId, mainSearchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = React.useState(visibleCategories[0]?.name ?? "");
  const latest = publicVideos.slice(-10).reverse();
  const selectedCategoryVideos = publicVideos.filter((video) => video.category === selectedCategory);

  React.useEffect(() => {
    if (!selectedCategory && visibleCategories[0]) setSelectedCategory(visibleCategories[0].name);
  }, [selectedCategory, visibleCategories]);

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

  const chooseHomeCategory = (category: CategoryItem) => {
    setSelectedCategory(category.name);
    window.requestAnimationFrame(() => {
      document.getElementById(`home-category-button-${category.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  };

  const q = mainSearchQuery.trim().toLowerCase();
  if (q) {
    const matchVideos = publicVideos.filter((v) => [v.title, v.description, v.category, v.seriesId].join(" ").toLowerCase().includes(q));
    const matchSeries = publicSeries.filter((s) => [s.title, s.description, s.category, s.scriptureTheme].join(" ").toLowerCase().includes(q));
    return (
      <section className="screen search-results-screen">
        <div className="search-results-header">
          <Search size={16} />
          <span>Results for <strong>"{mainSearchQuery}"</strong></span>
        </div>
        {matchVideos.length === 0 && matchSeries.length === 0 && (
          <EmptyState icon={Search} title="No results found." body={`Nothing matches "${mainSearchQuery}". Try a different keyword.`} action="" onAction={() => {}} />
        )}
        {matchVideos.length > 0 && (
          <>
            <SectionHeader title="Videos" action={`${matchVideos.length} found`} />
            <div className="content-grid">{matchVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => openHomeVideo(video)} />)}</div>
          </>
        )}
        {matchSeries.length > 0 && (
          <>
            <SectionHeader title="Series" action={`${matchSeries.length} found`} />
            <div className="series-grid">{matchSeries.map((item) => <button key={item.id} className="series-grid-card" onClick={() => { setSelectedSeriesId(item.id); go("series"); }}>{item.posterUrl ? <img className="series-grid-poster" src={item.posterUrl} alt={item.title} /> : <div className="series-grid-poster series-grid-poster-empty"><Clapperboard size={36} /></div>}<div className="series-grid-info"><p className="eyebrow">{item.category || item.status}</p><h3 className="series-grid-title">{item.title}</h3>{item.scriptureTheme && <p className="series-grid-verse">✦ {item.scriptureTheme}</p>}</div><ChevronRight size={18} className="series-grid-arrow" /></button>)}</div>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="screen">
      <div className="hero">
        <div className="hero-media"><div className="hero-image-frame"><img src="/faith-hero-cross.png" alt="Glowing cross in a forest" /></div></div>
        <div className="hero-copy">
          <p className="eyebrow">Premium faith media</p>
          <h1>Faith Flix</h1>
          <p>Stream faith content, share testimonies, worship together, and connect with a community of believers.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => go("watch")}>Open Watch</button>
            <button className="secondary-button" onClick={() => go("upload")}>Submit Testimony</button>
          </div>
        </div>
      </div>

      <SectionHeader title="Faith categories" action={`${visibleCategories.length} visible`} />
      <div className="category-grid category-top-row">
        {visibleCategories.map((category) => (
          <button id={`home-category-button-${category.id}`} className={selectedCategory === category.name ? "category-pill active" : "category-pill"} key={category.id} onClick={() => chooseHomeCategory(category)}>{category.name}</button>
        ))}
      </div>

      <div className="content-panel category-drop-panel active">
        <SectionHeader title={selectedCategory || "Category"} action={`${selectedCategoryVideos.length} videos`} />
        {selectedCategoryVideos.length ? (
          <div className="horizontal-video-row centered-video-row">
            {selectedCategoryVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => openHomeVideo(video)} />)}
          </div>
        ) : <EmptyState icon={Film} title="No videos in this category yet." body="Videos added to this category will appear here." action="Open Upload" onAction={() => go("upload")} />}
      </div>

      <SectionHeader title="Published videos" action={`${publicVideos.length} live`} />
      {latest.length ? (
        <div className="horizontal-video-row published-row">
          {latest.map((video) => <VideoCard key={video.id} video={video} onOpen={() => openHomeVideo(video)} />)}
        </div>
      ) : <EmptyState icon={Film} title="No videos uploaded yet." body="Published admin and approved testimony videos will appear here." action={isAdmin ? "Add Platform Video" : "Log In"} onAction={() => isAdmin ? go("admin-studio", "upload") : go("profile")} />}

      <SectionHeader title="Published series" action={`${publicSeries.length} live`} />
      {publicSeries.length ? <div className="horizontal-series-row">{publicSeries.map((item) => <SeriesCard key={item.id} item={item} onClick={() => { setSelectedSeriesId(item.id); go("series"); }} />)}</div> : <EmptyState icon={Clapperboard} title="No series created yet." body="Published series will appear here after the admin creates them." action="Open Series" onAction={() => go("series")} />}
    </section>
  );
}

function WatchScreen() {
  const { publicVideos, selectedVideoId, setSelectedVideoId, saved, setSaved, likes, setLikes, currentUser, go, notify, comments, setComments, setCommunityView } = useApp();
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

  if (!selected) {
    return <section className="screen"><SectionIntro eyebrow="Watch" title="Faith video feed" body="Faith videos from the community will play here in swipe style." /><EmptyState icon={Video} title="No videos yet" body="Published admin videos and approved member videos will appear here." action="Upload Video" onAction={() => go("upload")} /></section>;
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

  const handleSwipeEnd = (x: number) => {
    if (touchStartX === null || feedVideos.length < 2) return;
    const distance = touchStartX - x;
    const threshold = 48;
    if (distance > threshold) openVideo(nextVideo.id, "Next video.");
    if (distance < -threshold) openVideo(previousVideo.id, "Previous video.");
    setTouchStartX(null);
  };

  const toggleList = (setter: typeof setSaved | typeof setLikes, store: Record<string, string[]>, id: string, label: string) => {
    const list = store[actorId] ?? [];
    setter({ ...store, [actorId]: list.includes(id) ? list.filter((item) => item !== id) : [...list, id] });
    notify(label);
  };

  return (
    <section className="screen watch-screen">
      <SectionIntro eyebrow="Watch" title={selected.title} body={`${selected.creator || "Faith member"} • ${selected.category}`} />
      <div className="player-layout">
        <div
          className="video-placeholder with-media swipe-player"
          onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
          onTouchEnd={(event) => handleSwipeEnd(event.changedTouches[0].clientX)}
        >
          {selected.videoUrl ? (isCloudflareStreamUrl(selected.videoUrl) ? <iframe className="feed-video feed-video-frame" data-video-id={selected.id} src={selected.videoUrl} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowFullScreen /> : <video className="feed-video" data-video-id={selected.id} playsInline autoPlay muted loop src={selected.videoUrl} poster={selected.thumbnailUrl} onClick={(event) => event.currentTarget.paused ? event.currentTarget.play() : event.currentTarget.pause()} />) : <><Video size={58} /><h2>{selected.videoName || "Video file saved locally"}</h2><p>Video playback is available in this session when a browser file URL exists.</p></>}
        </div>
        <div className="detail-panel">
          <p>{selected.description || "No description added."}</p>
          <InfoLine label="Scripture" value={selected.scripture || "Not provided"} />
          <InfoLine label="Category" value={selected.category} />
          <InfoLine label="Series" value={selected.seriesId || "Not assigned"} />
          <InfoLine label="Duration" value={selected.duration || "Not set"} />
          <div className="button-row">
            <button className="secondary-button" onClick={() => toggleList(setLikes, likes, selected.id, likedIds.includes(selected.id) ? "Like removed." : "Video liked.")}><Heart size={17} /> {likedIds.includes(selected.id) ? "Liked" : "Like"}</button>
            <button className="secondary-button" onClick={() => toggleList(setSaved, saved, selected.id, savedIds.includes(selected.id) ? "Removed from saved." : "Saved.")}><Bookmark size={17} /> {savedIds.includes(selected.id) ? "Saved" : "Save"}</button>
            <button className="secondary-button" onClick={() => { navigator.clipboard?.writeText(`faithflix://video/${selected.id}`); notify("Mock video link copied."); }}>Share</button>
            <button className="secondary-button" onClick={() => { setCommunityView("discussions"); go("community"); }}><MessageCircle size={17} /> Discuss</button>
            <button className="secondary-button" onClick={() => openVideo(previousVideo.id, "Previous video.")}>Previous</button>
            <button className="primary-button" onClick={() => openVideo(nextVideo.id, "Next video.")}>Next Video</button>
          </div>
          <CommentBox targetId={selected.id} comments={videoComments} value={comment} setValue={setComment} />
        </div>
      </div>
      <SectionHeader title="More user posts" action={`${userPostVideos.length} total`} />
      <div className="content-grid">{userPostVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => setSelectedVideoId(video.id)} />)}</div>
    </section>
  );
}

function SeriesScreen() {
  const { isAdmin, publicSeries, publicVideos, go, setSelectedVideoId, selectedSeriesId, setSelectedSeriesId } = useApp();
  const focusedSeries = selectedSeriesId ? publicSeries.find((s) => s.id === selectedSeriesId) : null;
  const focusedEpisodes = focusedSeries ? publicVideos.filter((v) => v.seriesId === focusedSeries.title) : [];

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
            {focusedSeries.scriptureTheme && <p className="series-detail-verse">✦ {focusedSeries.scriptureTheme}</p>}
            <p className="series-detail-count">{focusedEpisodes.length} episode{focusedEpisodes.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <h3 className="series-episodes-heading">Episodes</h3>
        {focusedEpisodes.length ? (
          <div className="content-grid">
            {focusedEpisodes.map((video, i) => (
              <div key={video.id} className="series-episode-item">
                <span className="episode-num">Ep {i + 1}</span>
                <VideoCard video={video} onOpen={() => { setSelectedVideoId(video.id); go("watch"); }} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Film} title="No episodes yet." body="Episodes assigned to this series will appear here once the admin adds them." action="Open Watch" onAction={() => go("watch")} />
        )}
      </section>
    );
  }

  return (
    <section className="screen">
      <SectionIntro eyebrow="Series" title="Faith series" body="Tap a series to see all its episodes." />
      {publicSeries.length ? (
        <div className="series-grid">
          {publicSeries.map((item) => {
            const count = publicVideos.filter((v) => v.seriesId === item.title).length;
            return (
              <button key={item.id} className="series-grid-card" onClick={() => setSelectedSeriesId(item.id)} aria-label={`Open ${item.title}`}>
                {item.posterUrl
                  ? <img className="series-grid-poster" src={item.posterUrl} alt={item.title} />
                  : <div className="series-grid-poster series-grid-poster-empty"><Clapperboard size={36} /></div>}
                <div className="series-grid-info">
                  <p className="eyebrow">{item.category || item.status}</p>
                  <h3 className="series-grid-title">{item.title}</h3>
                  {item.scriptureTheme && <p className="series-grid-verse">✦ {item.scriptureTheme}</p>}
                  <p className="series-grid-count">{count} episode{count !== 1 ? "s" : ""}</p>
                </div>
                <ChevronRight size={18} className="series-grid-arrow" />
              </button>
            );
          })}
        </div>
      ) : <EmptyState icon={Clapperboard} title="No series created yet." body="Published series will appear here after admin setup." action={isAdmin ? "Edit Series" : "Log In"} onAction={() => isAdmin ? go("admin-studio", "series") : go("profile")} />}
    </section>
  );
}

function UploadScreen() {
  const { currentUser, isAdmin, visibleCategories, setUploads, uploads, videos, setVideos, setSelectedVideoId, setUploadProgress, notify, go } = useApp();
  const [form, setForm] = React.useState({ title: "", description: "", scripture: "", category: visibleCategories[0]?.name ?? "", testimonyType: "Testimony", visibility: "Public", tags: "", consent: false, rules: false, cropDimension: "9:16", cropRatio: "9 / 16" });
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [thumbFile, setThumbFile] = React.useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = React.useState("");

  if (isAdmin) {
    return (
      <section className="screen">
        <SectionIntro eyebrow="Admin Upload" title="Add platform video" body="You are logged in as admin, so this upload page opens the platform video editor." />
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
        notify("Posted.");
        go("watch");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed.";
        progress.fail("Upload failed");
        notify(message);
      }
    })();
  };

  return (
    <section className="screen">
      <SectionIntro eyebrow="Upload" title="Share your faith" body="Post faith videos or testimonies instantly to the public app." />
      {!currentUser && <EmptyState icon={Lock} title="Create an account first" body="Sign up or log in before submitting content." action="Open Profile" onAction={() => go("profile")} />}
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
  const { currentUser, saved, videos, setSaved, go, notify } = useApp();
  const actorId = currentUser?.id ?? "guest";
  const savedVideos = videos.filter((video) => (saved[actorId] ?? []).includes(video.id));
  return (
    <section className="screen">
      <SectionIntro eyebrow="Saved" title="Your faith library" body="Videos you save appear here." />
      {savedVideos.length ? <div className="content-grid">{savedVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => go("watch")} extra={<button className="secondary-button" onClick={() => { setSaved({ ...saved, [actorId]: (saved[actorId] ?? []).filter((id) => id !== video.id) }); notify("Removed from saved."); }}>Remove</button>} />)}</div> : <EmptyState icon={Bookmark} title="No saved content yet." body="Save a published video from Watch to build your library." action="Open Watch" onAction={() => go("watch")} />}
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

function CommunityScreen() {
  const { communityView, setCommunityView, notify, go, commSearchQuery, setCommSearchQuery } = useApp();
  const [showCommSearch, setShowCommSearch] = React.useState(false);
  const tabs: { id: CommunityView; label: string; icon: React.ElementType }[] = [
    { id: "feed", label: "Feed", icon: MessagesSquare },
    { id: "prayer", label: "Prayer", icon: HeartHandshake },
    { id: "upload", label: "Share", icon: Upload },
    { id: "groups", label: "Groups", icon: Users },
    { id: "friends", label: "Friends", icon: UserPlus },
    { id: "messages", label: "DMs", icon: Inbox },
  ];

  const screenTitles: Record<CommunityView, string> = {
    feed: "Faith Feed",
    prayer: "Prayer Wall",
    upload: "Share Faith",
    groups: "Bible Study",
    friends: "Friends",
    messages: "Messages",
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
      <button className="comm-back-bar" onClick={() => go("home")} aria-label="Back to Faith Flix">
        <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
        <span>Back to Faith Flix</span>
      </button>
    </div>
  );
}

function FaithFeed() {
  const { currentUser, posts, setPosts, notify, comments, commSearchQuery } = useApp();
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
  const { currentUser, prayers, setPrayers, notify, commSearchQuery } = useApp();
  const [form, setForm] = React.useState({ title: "", text: "", visibility: "Public" });
  const actions = ["I prayed", "Praying for you", "Amen", "Praise God", "Answered"];
  const actor = currentUser?.id ?? "guest";

  const create = () => {
    if (!currentUser) return notify("Create an account before posting prayer requests.");
    if (!form.title || !form.text) return notify("Add a title and request.");
    setPrayers([{ id: uid("prayer"), userId: currentUser.id, ...form, actions: {} }, ...prayers]);
    setForm({ title: "", text: "", visibility: "Public" });
    notify("Prayer request posted.");
  };

  const tap = (id: string, action: string) => {
    setPrayers(prayers.map((prayer) => {
      if (prayer.id !== id) return prayer;
      const list = prayer.actions[action] ?? [];
      return { ...prayer, actions: { ...prayer.actions, [action]: list.includes(actor) ? list.filter((item) => item !== actor) : [...list, actor] } };
    }));
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
        if (filtered.length === 0) return <EmptyState icon={HeartHandshake} title="No prayer requests yet." body="Prayer requests will appear here after members post them." action="Use prayer form" onAction={() => notify("Use the prayer form above.")} />;
        return <>{filtered.map((prayer) => <article className="content-panel" key={prayer.id}><p className="eyebrow">{prayer.visibility}</p><h3>{prayer.title}</h3><p>{prayer.text}</p><div className="button-row">{actions.map((action) => <button className="secondary-button" key={action} onClick={() => tap(prayer.id, action)}>{action} {(prayer.actions[action] ?? []).length}</button>)}</div></article>)}</>;
      })()}
    </>
  );
}

function DiscussionRooms() {
  const { publicVideos, comments, setSelectedVideoId, go } = useApp();
  return publicVideos.length ? <div className="content-grid">{publicVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={() => { setSelectedVideoId(video.id); go("watch"); }} extra={<span className="meta">{comments.filter((item) => item.targetId === video.id).length} comments</span>} />)}</div> : <EmptyState icon={MessageCircle} title="No discussion rooms yet." body="Discussion rooms open when videos are published." action="Open Watch" onAction={() => go("watch")} />;
}

function FriendsPanel() {
  const { currentUser, users, friendRequests, setFriendRequests, notify } = useApp();
  if (!currentUser) return <EmptyState icon={UserPlus} title="No friends yet." body="Create an account to send and accept friend requests." action="Open Profile" onAction={() => notify("Open Profile from the bottom navigation.")} />;
  const others = users.filter((user) => user.id !== currentUser.id && user.role !== "admin");
  const incoming = friendRequests.filter((request) => request.toId === currentUser.id && request.status === "pending");
  const accepted = friendRequests.filter((request) => request.status === "accepted" && [request.fromId, request.toId].includes(currentUser.id));
  const requestFriend = (toId: string) => {
    if (friendRequests.some((request) => [request.fromId, request.toId].includes(currentUser.id) && [request.fromId, request.toId].includes(toId))) return notify("Friend connection already exists.");
    setFriendRequests([...friendRequests, { id: uid("friend"), fromId: currentUser.id, toId, status: "pending" }]);
    notify("Friend request sent.");
  };
  return (
    <div className="panel-grid">
      <div className="content-panel"><h2>Friends</h2>{accepted.length ? accepted.map((request) => <FriendRow key={request.id} request={request} />) : <p>No friends yet.</p>}</div>
      <div className="content-panel"><h2>Requests</h2>{incoming.length ? incoming.map((request) => <button className="secondary-button" key={request.id} onClick={() => { setFriendRequests(friendRequests.map((item) => item.id === request.id ? { ...item, status: "accepted" } : item)); notify("Friend request accepted."); }}>Accept {users.find((user) => user.id === request.fromId)?.name}</button>) : <p>No friend requests yet.</p>}</div>
      <div className="content-panel"><h2>Other members</h2>{others.length ? others.map((user) => <button className="secondary-button" key={user.id} onClick={() => requestFriend(user.id)}>Add {user.name}</button>) : <p>No other users yet.</p>}</div>
    </div>
  );
}

function FriendRow({ request }: { request: FriendRequest }) {
  const { currentUser, users, setFriendRequests, friendRequests, notify } = useApp();
  const otherId = request.fromId === currentUser?.id ? request.toId : request.fromId;
  const other = users.find((user) => user.id === otherId);
  return <div className="item-row"><span>{other?.name ?? "Member"}</span><button className="secondary-button" onClick={() => { setFriendRequests(friendRequests.filter((item) => item.id !== request.id)); notify("Friend removed."); }}>Remove</button></div>;
}

function MessagesPanel() {
  const { currentUser, users, friendRequests, selectedMessageUser, setSelectedMessageUser, messages, setMessages, notify } = useApp();
  const [text, setText] = React.useState("");
  if (!currentUser) return <EmptyState icon={Inbox} title="No messages yet." body="Create an account to message friends." action="Open Profile" onAction={() => notify("Open Profile from the bottom navigation.")} />;
  const friendIds = friendRequests.filter((request) => request.status === "accepted" && [request.fromId, request.toId].includes(currentUser.id)).map((request) => request.fromId === currentUser.id ? request.toId : request.fromId);
  const friend = users.find((user) => user.id === selectedMessageUser);
  const thread = messages.filter((message) => friend && [message.fromId, message.toId].includes(currentUser.id) && [message.fromId, message.toId].includes(friend.id));
  const sendMessage = () => {
    if (!friend) return notify("Choose a friend first.");
    if (!text.trim()) return notify("Write a message first.");
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
  const { currentUser, users, setUsers, setSessionId, isAdmin, signOut, go, notify } = useApp();
  const [mode, setMode] = React.useState<"signup" | "login">("signup");

  if (!currentUser) {
    return (
      <section className="screen">
        <SectionIntro eyebrow="Profile" title="Join Faith Flix" body="Sign up or log in. Admin accounts open Admin Studio automatically." />
        <div className="button-row"><button className={mode === "signup" ? "primary-button" : "secondary-button"} onClick={() => setMode("signup")}>Signup</button><button className={mode === "login" ? "primary-button" : "secondary-button"} onClick={() => setMode("login")}>Login</button></div>
        {mode === "signup" ? <SignupForm /> : <LoginForm />}
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
    notify("Profile updated.");
  };

  return (
    <section className="screen">
      <SectionIntro eyebrow={isAdmin ? "Admin profile" : "Profile"} title={currentUser.name} body={`@${currentUser.username || "faithmember"}`} />
      <div className="form-card">
        <Field label="Name" value={currentUser.name} onChange={(name) => update({ name })} />
        <Field label="Username" value={currentUser.username} onChange={(username) => update({ username })} />
        <Field label="Bio" value={currentUser.bio ?? ""} onChange={(bio) => update({ bio })} />
        <Field label="Favorite scripture" value={currentUser.favoriteScripture ?? ""} onChange={(favoriteScripture) => update({ favoriteScripture })} />
        <Field label="Church/ministry name" value={currentUser.ministry ?? ""} onChange={(ministry) => update({ ministry })} />
        <Field label="Location" value={currentUser.location ?? ""} onChange={(location) => update({ location })} />
        <FileField label="Profile image" onChange={(file) => update({ image: fileInfo(file).name })} />
        <div className="button-row">
          {isAdmin && <button className="primary-button" onClick={() => go("admin-studio")}>Open Admin Studio</button>}
          <button className="secondary-button" onClick={signOut}>Sign Out</button>
          <button className="secondary-button" onClick={() => { setSessionId(currentUser.id); notify("Profile saved locally."); }}>Save Profile</button>
        </div>
      </div>
      {!isAdmin && <MyUploads />}
    </section>
  );
}

function SignupForm() {
  const { users, setUsers, setSessionId, notify, go } = useApp();
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

  return <div className="form-card"><h2>Create account</h2><Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} /><Field label="Username" value={form.username} onChange={(username) => setForm({ ...form, username })} /><Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} /><Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} /><Field label="Birthday" type="date" value={form.birthday} onChange={(birthday) => setForm({ ...form, birthday })} /><FileField label="Optional profile image" onChange={(file) => setForm({ ...form, image: fileInfo(file).name })} /><button className="primary-button" onClick={submit}>{busy ? "Creating..." : "Create Account"}</button></div>;
}

function LoginForm() {
  const { users, setUsers, setSessionId, notify, go } = useApp();
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

  return <div className="form-card"><h2>Login</h2><Field label="Email" value={email} onChange={setEmail} /><Field label="Password" type="password" value={password} onChange={setPassword} /><button className="primary-button" onClick={login}>{busy ? "Logging in..." : "Log In"}</button></div>;
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
  const { isAdmin, go, studioView, setStudioView, videos, series, categories, uploads } = useApp();
  if (!isAdmin) return <section className="screen"><EmptyState icon={ShieldCheck} title="Admin access required" body="Log in with an admin account to manage content." action="Log In" onAction={() => go("profile")} /></section>;
  const tabs: { id: StudioView; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Add Platform Video", icon: Upload },
    { id: "videos", label: "Edit Platform Videos", icon: Video },
    { id: "series", label: "Edit Series", icon: Clapperboard },
    { id: "categories", label: "Edit Categories", icon: Film },
    { id: "reviews", label: "Manual Review Queue", icon: CheckCircle2 },
    { id: "takedown", label: "User Posts Monitor", icon: EyeOff },
    { id: "rules", label: "Content Rules", icon: ShieldCheck },
  ];
  return (
    <section className="screen">
      <SectionIntro eyebrow="Admin Studio" title="Content editor" body="Create and edit platform videos, series, categories, publishing status, and user review decisions." />
      <div className="segmented-row">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={studioView === id ? "segment active" : "segment"} onClick={() => setStudioView(id)}><Icon size={17} />{label}</button>)}</div>
      {studioView === "dashboard" && <div className="feature-grid"><StatCard label="Platform videos" value={videos.filter((item) => item.source === "admin").length} /><StatCard label="Series" value={series.length} /><StatCard label="Categories" value={categories.length} /><StatCard label="Uploads waiting" value={uploads.filter((item) => item.status === "Pending Review").length} /></div>}
      {studioView === "upload" && <AdminUpload />}
      {studioView === "videos" && <AdminVideos />}
      {studioView === "series" && <AdminSeries />}
      {studioView === "categories" && <AdminCategories />}
      {studioView === "reviews" && <AdminReviewQueue />}
      {studioView === "takedown" && <AdminTakeDown />}
      {studioView === "rules" && <ContentRules />}
    </section>
  );
}

function AdminUpload() {
  const { currentUser, isAdmin, videos, setVideos, setSelectedVideoId, setStudioView, setUploadProgress, visibleCategories, series, notify, go } = useApp();
  const [form, setForm] = React.useState({ title: "", description: "", scripture: "", category: visibleCategories[0]?.name ?? "", seriesId: "", episode: "", duration: "", creator: "", tags: "", status: "Published" as Status });
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [thumbFile, setThumbFile] = React.useState<File | null>(null);
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
        if (status === "Published") go("watch");
        else setStudioView("videos");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed.";
        progress.fail("Upload failed");
        notify(message);
      }
    })();
  };
  return <div className="form-card"><h2>Add platform video</h2><Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} /><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><Field label="Scripture reference" value={form.scripture} onChange={(scripture) => setForm({ ...form, scripture })} /><Select label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} options={visibleCategories.map((item) => item.name)} /><Select label="Series" value={form.seriesId} onChange={(seriesId) => setForm({ ...form, seriesId })} options={["", ...series.map((item) => item.title)]} /><Field label="Episode number" value={form.episode} onChange={(episode) => setForm({ ...form, episode })} /><Field label="Duration" value={form.duration} onChange={(duration) => setForm({ ...form, duration })} /><Field label="Creator / ministry name" value={form.creator} onChange={(creator) => setForm({ ...form, creator })} /><Field label="Tags" value={form.tags} onChange={(tags) => setForm({ ...form, tags })} /><Select label="Publish status" value={form.status} onChange={(status) => setForm({ ...form, status: status as Status })} options={["Draft", "Published", "Hidden"]} /><FileField label="Video file" onChange={setVideoFile} /><FileField label="Thumbnail" onChange={setThumbFile} /><div className="button-row"><button className="primary-button" onClick={() => save("Published")}>Publish Video</button><button className="secondary-button" onClick={() => save("Draft")}>Save as Draft</button></div></div>;
}

function AdminVideos() {
  const { videos, setVideos, notify, setStudioView } = useApp();
  const [editingId, setEditingId] = React.useState("");
  const platformVideos = videos.filter((video) => video.source === "admin");
  const update = (id: string, patch: Partial<VideoItem>) =>
    setVideos(videos.map((video) => video.id === id ? { ...video, ...patch } : video));

  const finishEditing = async () => {
    const video = videos.find((v) => v.id === editingId);
    setEditingId("");
    if (!video) { notify("Video edits saved."); return; }
    const { error } = await supabase.from("videos").update({
      title: video.title,
      description: video.description,
      scripture_reference: video.scripture,
      creator_ministry_name: video.creator,
      app_category: video.category,
      app_series_title: video.seriesId,
    }).eq("id", video.id);
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
  if (!platformVideos.length) return <EmptyState icon={Video} title="No platform videos uploaded yet." body="Only admin-created platform content is edited here. User videos and posts can be moderated in User Posts Monitor." action="Add Platform Video" onAction={() => setStudioView("upload")} />;
  return <div className="content-grid">{platformVideos.map((video) => {
    const isEditing = editingId === video.id;
    return <article className="content-panel" key={video.id}><MediaThumb item={video} /><h3>{video.title}</h3><p>{video.description || "No description."}</p><InfoLine label="Status" value={video.status} />{isEditing && <><Field label="Title" value={video.title} onChange={(title) => update(video.id, { title })} /><Field label="Creator" value={video.creator} onChange={(creator) => update(video.id, { creator })} /><label>Description<textarea value={video.description} onChange={(event) => update(video.id, { description: event.target.value })} /></label><Field label="Scripture reference" value={video.scripture} onChange={(scripture) => update(video.id, { scripture })} /><Field label="Series" value={video.seriesId} onChange={(seriesId) => update(video.id, { seriesId })} /></>}<div className="button-row">{isEditing ? <button className="primary-button" onClick={finishEditing}><CheckCircle2 size={16} /> Done</button> : <button className="secondary-button" onClick={() => setEditingId(video.id)}><Edit3 size={16} /> Edit</button>}<button className="secondary-button" onClick={() => notify(video.videoUrl ? "Preview is available in the video manager card." : "No playable file URL in this session.")}><Eye size={16} /> Preview</button><button className="secondary-button" onClick={() => updateStatus(video.id, video.status === "Published" ? "Draft" : "Published")}>{video.status === "Published" ? <EyeOff size={16} /> : <Eye size={16} />} {video.status === "Published" ? "Unpublish" : "Publish"}</button><SelectButton value={video.status} options={["Draft", "Published", "Hidden"]} onChange={(status) => updateStatus(video.id, status as Status)} /><button className="secondary-button danger" onClick={() => deleteVideoAdmin(video.id)}><Trash2 size={16} /> Delete</button></div>{video.videoUrl && (isCloudflareStreamUrl(video.videoUrl) ? <iframe className="inline-video inline-video-frame" src={video.videoUrl} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowFullScreen /> : <video className="inline-video" controls src={video.videoUrl} />)}</article>;
  })}</div>;
}

function AdminSeries() {
  const { series, setSeries, visibleCategories, notify } = useApp();
  const [form, setForm] = React.useState({ title: "", description: "", posterName: "", posterUrl: "", scriptureTheme: "", category: visibleCategories[0]?.name ?? "", status: "Published" as Status });
  const [editingId, setEditingId] = React.useState("");
  const save = () => {
    if (!form.title) return notify("Add a series title.");
    setSeries([...series, { id: uid("series"), ...form }]);
    setForm({ ...form, title: "", description: "", scriptureTheme: "" });
    notify("Series saved.");
  };
  const update = (id: string, patch: Partial<SeriesItem>) => setSeries(series.map((item) => item.id === id ? { ...item, ...patch } : item));
  return <><div className="form-card"><h2>Create series</h2><Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} /><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><FileField label="Poster image" onChange={(file) => setForm({ ...form, posterName: fileInfo(file).name, posterUrl: fileInfo(file).url })} /><Field label="Scripture theme" value={form.scriptureTheme} onChange={(scriptureTheme) => setForm({ ...form, scriptureTheme })} /><Select label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} options={visibleCategories.map((item) => item.name)} /><Select label="Status" value={form.status} onChange={(status) => setForm({ ...form, status: status as Status })} options={["Draft", "Published"]} /><button className="primary-button" onClick={save}>Create Series</button></div>{series.length ? <div className="content-grid">{series.map((item) => <article className="content-panel" key={item.id}><SeriesCard item={item} />{editingId === item.id && <><Field label="Title" value={item.title} onChange={(title) => update(item.id, { title })} /><Field label="Scripture theme" value={item.scriptureTheme} onChange={(scriptureTheme) => update(item.id, { scriptureTheme })} /></>}<div className="button-row"><button className="secondary-button" onClick={() => setEditingId(editingId === item.id ? "" : item.id)}>Edit</button><SelectButton value={item.status} options={["Draft", "Published", "Hidden"]} onChange={(status) => update(item.id, { status: status as Status })} /><button className="secondary-button danger" onClick={() => { setSeries(series.filter((seriesItem) => seriesItem.id !== item.id)); notify("Series deleted."); }}>Delete</button></div></article>)}</div> : <EmptyState icon={Clapperboard} title="No series created yet." body="Create a series above." action="Create series" onAction={() => notify("Use the form above.")} />}</>;
}

function AdminCategories() {
  const { categories, setCategories, notify } = useApp();
  const [name, setName] = React.useState("");
  const add = () => {
    if (!name.trim()) return notify("Add a category name.");
    setCategories([...categories, { id: uid("cat"), name, hidden: false, custom: true }]);
    setName("");
    notify("Category added.");
  };
  const update = (id: string, patch: Partial<CategoryItem>) => setCategories(categories.map((cat) => cat.id === id ? { ...cat, ...patch } : cat));
  return <><div className="form-card"><h2>Add category</h2><Field label="Category name" value={name} onChange={setName} /><button className="primary-button" onClick={add}>Add Category</button></div><div className="content-grid">{categories.map((category) => <article className="content-panel" key={category.id}><Field label="Name" value={category.name} onChange={(catName) => update(category.id, { name: catName })} /><div className="button-row"><button className="secondary-button" onClick={() => update(category.id, { hidden: !category.hidden })}>{category.hidden ? "Show" : "Hide"}</button>{category.custom && <button className="secondary-button danger" onClick={() => { setCategories(categories.filter((cat) => cat.id !== category.id)); notify("Custom category deleted."); }}>Delete</button>}</div></article>)}</div></>;
}

function AdminReviewQueue() {
  const { uploads, setUploads, videos, setVideos, users, notify } = useApp();
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const decide = (upload: UserUpload, status: UploadStatus) => {
    setUploads(uploads.map((item) => item.id === upload.id ? { ...item, status, adminNote: notes[upload.id] ?? item.adminNote } : item));
    if (status === "Approved") {
      const author = users.find((user) => user.id === upload.userId);
      setVideos([...videos, { id: uid("video"), source: "user", title: upload.title, description: upload.description, scripture: upload.scripture, category: upload.category, seriesId: "", episode: "", duration: "", creator: author?.name ?? "Faith member", tags: upload.tags, status: "Published", videoName: upload.videoName, videoUrl: upload.videoUrl, thumbnailName: upload.thumbnailName, thumbnailUrl: upload.thumbnailUrl, cropDimension: upload.cropDimension, cropRatio: upload.cropRatio, createdAt: new Date().toLocaleString() }]);
    }
    notify(`Upload marked ${status}.`);
  };
  return uploads.length ? <div className="content-grid">{uploads.map((upload) => <article className="content-panel" key={upload.id}><MediaThumb item={upload} /><p className="eyebrow">{upload.status}</p><h3>{upload.title}</h3><p>{upload.description}</p><textarea placeholder="Admin note" value={notes[upload.id] ?? upload.adminNote} onChange={(event) => setNotes({ ...notes, [upload.id]: event.target.value })} /><div className="button-row"><button className="primary-button" onClick={() => decide(upload, "Approved")}>Approve</button><button className="secondary-button" onClick={() => decide(upload, "Rejected")}>Reject</button><button className="secondary-button" onClick={() => decide(upload, "Edits Requested")}>Request Edits</button><button className="secondary-button" onClick={() => notify(upload.videoUrl ? "Preview available in this card." : "No playable file URL in this session.")}>Preview</button></div>{upload.videoUrl && <video className="inline-video" controls src={upload.videoUrl} />}</article>)}</div> : <EmptyState icon={CheckCircle2} title="No uploads waiting for manual review." body="User submissions will appear here." action="Open Dashboard" onAction={() => notify("No pending review items.")} />;
}

function AdminTakeDown() {
  const { videos, setVideos, posts, setPosts, prayers, setPrayers, comments, notify } = useApp();
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
      {reportedPosts.length ? <div className="content-grid">{reportedPosts.map((post) => <article className="content-panel" key={post.id}><p className="eyebrow">{post.author} • {post.reports.length} reports</p><p>{post.text}</p>{post.scripture && <InfoLine label="Scripture" value={post.scripture} />}<InfoLine label="Comments" value={String(comments.filter((item) => item.targetId === post.id).length)} /><div className="button-row"><button className="secondary-button" onClick={() => { setPosts(posts.map((item) => item.id === post.id ? { ...item, reports: [] } : item)); notify("Report cleared."); }}>Clear Report</button><button className="secondary-button danger" onClick={() => removePost(post.id)}><Trash2 size={16} /> Remove Post</button></div></article>)}</div> : <p className="muted">No reported posts.</p>}

      <SectionHeader title="All user posts" action={`${posts.length} posts`} />
      {posts.length ? <div className="content-grid">{posts.map((post) => <article className="content-panel" key={post.id}><p className="eyebrow">{post.author}</p><p>{post.text}</p>{post.scripture && <InfoLine label="Scripture" value={post.scripture} />}<div className="monitor-meta"><span>Likes {post.likes.length}</span><span>Saves {post.saves.length}</span><span>Reports {post.reports.length}</span><span>Comments {comments.filter((item) => item.targetId === post.id).length}</span></div><div className="button-row"><button className="secondary-button danger" onClick={() => removePost(post.id)}><Trash2 size={16} /> Remove Post</button></div></article>)}</div> : <EmptyState icon={MessagesSquare} title="No user posts yet." body="Faith Feed posts will appear here when users share content." action="Open Community" onAction={() => notify("No posts yet.")} />}

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
  const { go } = useApp();
  return <section className="screen"><SectionIntro eyebrow="Content Rules" title="Faith Flix content rules" body="Submissions should be faith-centered, respectful, lawful, and appropriate for a Christian community." /><div className="content-panel"><ul className="rules-list"><li>Share only content you own or have permission to upload.</li><li>Keep all posts centered on faith, scripture, worship, testimony, prayer, or ministry.</li><li>Do not upload hateful, harassing, graphic, or unsafe material.</li><li>Prayer and testimony content should protect private information.</li></ul><button className="primary-button" onClick={() => go("upload")}>Share Your Faith</button></div></section>;
}

function MyUploads() {
  const { currentUser, uploads } = useApp();
  if (!currentUser) return null;
  const mine = uploads.filter((upload) => upload.userId === currentUser.id);
  return <div className="content-panel"><SectionHeader title="My Uploads" action={`${mine.length} submitted`} />{mine.length ? mine.map((upload) => <div className="item-row" key={upload.id}><span>{upload.title}</span><span className="status-pill">{upload.status}</span>{upload.adminNote && <small>{upload.adminNote}</small>}</div>) : <p>No uploads submitted yet.</p>}</div>;
}

function CommentBox({ targetId, comments, value, setValue }: { targetId: string; comments: CommentItem[]; value: string; setValue: (value: string) => void }) {
  const { currentUser, setComments, comments: allComments, notify } = useApp();
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
        <h3>{video.title}</h3>
        <p>{video.creator || "Faith Flix"}</p>
      </div>
      {extra && <div className="button-row">{extra}</div>}
    </article>
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

function SectionHeader({ title, action }: { title: string; action: string }) {
  return <div className="section-header"><h2>{title}</h2><span>{action}</span></div>;
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
