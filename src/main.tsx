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
type CommunityView = "feed" | "prayer" | "groups" | "discussions" | "friends" | "messages";
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

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fileInfo(file?: File | null) {
  if (!file) return { name: "", url: "" };
  return { name: file.name, url: URL.createObjectURL(file) };
}

async function uploadMediaFile(file: File | null, ownerId: string, folder: string) {
  if (!file) return { name: "", url: "" };
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filePath = ownerId + "/" + folder + "/" + Date.now() + "-" + safeName;
  const { error } = await supabase.storage.from(mediaBucket).upload(filePath, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(mediaBucket).getPublicUrl(filePath);
  return { name: file.name, url: data.publicUrl };
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
  const [selectedMessageUser, setSelectedMessageUser] = React.useState("");
  const [toast, setToast] = React.useState("");
  const [pullStartY, setPullStartY] = React.useState<number | null>(null);
  const [isPullRefreshing, setIsPullRefreshing] = React.useState(false);

  const [users, setUsers] = useStoredState<Profile[]>("faithflix-users", []);
  const [sessionId, setSessionId] = useStoredState<string>("faithflix-session", "");
  const [videos, setVideos] = useStoredState<VideoItem[]>("faithflix-videos", []);
  const [series, setSeries] = useStoredState<SeriesItem[]>("faithflix-series", []);
  const [categories, setCategories] = useStoredState<CategoryItem[]>("faithflix-categories", defaultCategories);
  const [uploads, setUploads] = useStoredState<UserUpload[]>("faithflix-user-uploads", []);
  const [saved, setSaved] = useStoredState<Record<string, string[]>>("faithflix-saved", {});
  const [likes, setLikes] = useStoredState<Record<string, string[]>>("faithflix-likes", {});
  const [comments, setComments] = useStoredState<CommentItem[]>("faithflix-comments", []);
  const [posts, setPosts] = useStoredState<CommunityPost[]>("faithflix-posts", []);
  const [prayers, setPrayers] = useStoredState<PrayerRequest[]>("faithflix-prayers", []);
  const [friendRequests, setFriendRequests] = useStoredState<FriendRequest[]>("faithflix-friends", []);
  const [messages, setMessages] = useStoredState<Message[]>("faithflix-messages", []);

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
      setVideos((data as DbVideo[]).map(videoFromDb));
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
    selectedMessageUser,
    setSelectedMessageUser,
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
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <header className="topbar">
          <button className="brand" onClick={() => go("home")} aria-label="Faith Flix home">
            <span className="brand-mark"><Sparkles size={18} /></span>
            <span>Faith Flix</span>
          </button>
          <div className="top-actions">
            <button className="icon-button" aria-label="Search" onClick={() => notify("Search is ready for connected content.")}><Search size={19} /></button>
            <button className="icon-button" aria-label="Notifications" onClick={() => notify("No notifications yet.")}><Bell size={19} /></button>
          </div>
        </header>

        <main className="main-stage">
          {page === "home" && <HomeScreen />}
          {page === "watch" && <WatchScreen />}
          {page === "series" && <SeriesScreen />}
          {page === "upload" && <UploadScreen />}
          {page === "community" && <CommunityScreen />}
          {page === "saved" && <SavedScreen />}
          {page === "profile" && <ProfileScreen />}
          {page === "admin-login" && <AdminLogin />}
          {page === "admin-studio" && <AdminStudio />}
          {page === "rules" && <ContentRules />}
        </main>

        <nav className="bottom-nav seven" aria-label="Primary navigation">
          <NavButton label="Home" icon={Home} active={page === "home"} onClick={() => go("home")} />
          <NavButton label="Watch" icon={Film} active={page === "watch"} onClick={() => go("watch")} />
          <NavButton label="Series" icon={Clapperboard} active={page === "series"} onClick={() => go("series")} />
          <NavButton label="Upload" icon={Upload} active={page === "upload" || (page === "admin-studio" && studioView === "upload")} onClick={() => isAdmin ? go("admin-studio", "upload") : go("upload")} />
          <NavButton label="Community" icon={MessagesSquare} active={page === "community"} onClick={() => go("community")} />
          <NavButton label="Saved" icon={Bookmark} active={page === "saved"} onClick={() => go("saved")} />
          <NavButton label="Profile" icon={User} active={page === "profile" || page === "admin-login" || page === "admin-studio"} onClick={() => go("profile")} />
        </nav>
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
    selectedMessageUser: string;
    setSelectedMessageUser: React.Dispatch<React.SetStateAction<string>>;
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
  const { isAdmin, publicVideos, publicSeries, visibleCategories, go, setSelectedVideoId } = useApp();
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

  return (
    <section className="screen">
      <div className="hero">
        <div className="hero-media"><div className="hero-image-frame"><img src="/faith-hero-cross.png" alt="Glowing cross in a forest" /></div></div>
        <div className="hero-copy">
          <p className="eyebrow">Premium faith media</p>
          <h1>Faith Flix</h1>
          <p>Vertical worship, testimony, teaching, and community spaces powered by local data and ready for Supabase later.</p>
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
      {publicSeries.length ? <div className="horizontal-series-row">{publicSeries.map((item) => <SeriesCard key={item.id} item={item} />)}</div> : <EmptyState icon={Clapperboard} title="No series created yet." body="Published series will appear here after the admin creates them." action="Open Series" onAction={() => go("series")} />}
    </section>
  );
}

function WatchScreen() {
  const { publicVideos, selectedVideoId, setSelectedVideoId, saved, setSaved, likes, setLikes, currentUser, go, notify, comments, setComments, setCommunityView } = useApp();
  const userPostVideos = publicVideos.filter((video) => video.source === "user");
  const selectedPublicVideo = publicVideos.find((video) => video.id === selectedVideoId);
  const feedVideos = selectedPublicVideo && selectedPublicVideo.source !== "user" ? publicVideos : userPostVideos;
  const selected = feedVideos.find((video) => video.id === selectedVideoId) ?? feedVideos[0];
  const [comment, setComment] = React.useState("");
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const actorId = currentUser?.id ?? "guest";

  if (!selected) {
    return <section className="screen"><SectionIntro eyebrow="Watch" title="User video feed" body="User-posted faith videos will play here." /><EmptyState icon={Video} title="No user videos yet" body="When members post faith videos, they will appear here in the swipe feed." action="Upload Video" onAction={() => go("upload")} /></section>;
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
      <SectionIntro eyebrow="Watch" title={selected.title} body={`User post • ${selected.creator || "Faith member"} • ${selected.category}`} />
      <div className="player-layout">
        <div
          className="video-placeholder with-media swipe-player"
          onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
          onTouchEnd={(event) => handleSwipeEnd(event.changedTouches[0].clientX)}
        >
          {selected.videoUrl ? <video className="feed-video" data-video-id={selected.id} playsInline autoPlay muted loop src={selected.videoUrl} poster={selected.thumbnailUrl} onClick={(event) => event.currentTarget.paused ? event.currentTarget.play() : event.currentTarget.pause()} /> : <><Video size={58} /><h2>{selected.videoName || "Video file saved locally"}</h2><p>Video playback is available in this session when a browser file URL exists.</p></>}
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
  const { isAdmin, publicSeries, publicVideos, go, setSelectedVideoId } = useApp();
  return (
    <section className="screen">
      <SectionIntro eyebrow="Series" title="Faith series" body="Swipe horizontally through each published series and its episodes." />
      {publicSeries.length ? (
        <div className="series-swipe-area" aria-label="Published series carousel">
          {publicSeries.map((item) => {
            const episodes = publicVideos.filter((video) => video.seriesId === item.title);
            return (
              <section className="series-lane" key={item.id}>
                <SeriesCard item={item} />
                <div className="episode-row">
                  {episodes.length ? episodes.map((video) => (
                    <VideoCard key={video.id} video={video} onOpen={() => { setSelectedVideoId(video.id); go("watch"); }} />
                  )) : <EmptyState icon={Film} title="No episodes yet." body="Episodes assigned to this series will appear here." action="Open Watch" onAction={() => go("watch")} />}
                </div>
              </section>
            );
          })}
        </div>
      ) : <EmptyState icon={Clapperboard} title="No series created yet." body="Published series will appear here after admin setup." action={isAdmin ? "Edit Series" : "Log In"} onAction={() => isAdmin ? go("admin-studio", "series") : go("profile")} />}
    </section>
  );
}

function UploadScreen() {
  const { currentUser, isAdmin, visibleCategories, setUploads, uploads, videos, setVideos, notify, go } = useApp();
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

  const submit = async () => {
    if (!currentUser) return go("profile");
    if (!form.title || !form.consent || !form.rules) return notify("Add a title and confirm consent and content rules.");
    if (!videoFile) return notify("Choose a video file first.");
    notify("Uploading video.");
    try {
      const video = await uploadMediaFile(videoFile, currentUser.id, "videos");
      const thumb = await uploadMediaFile(thumbFile, currentUser.id, "thumbnails");
      const uploadId = uid("upload");
      const publicVideo: Omit<VideoItem, "id" | "createdAt"> = { source: "user", title: form.title, description: form.description, scripture: form.scripture, category: form.category, seriesId: "", episode: "", duration: "", creator: currentUser.name, tags: form.tags, status: "Published", videoName: video.name, videoUrl: video.url, thumbnailName: thumb.name, thumbnailUrl: thumb.url, cropDimension: form.cropDimension, cropRatio: form.cropRatio };
      const { data, error } = await supabase.from("videos").insert(videoToDb(publicVideo, currentUser.id)).select("*").single();
      if (error) throw error;
      const savedVideo = videoFromDb(data as DbVideo);
      setUploads([...uploads, { id: uploadId, userId: currentUser.id, ...form, videoName: video.name, videoUrl: video.url, thumbnailName: thumb.name, thumbnailUrl: thumb.url, status: "Approved", adminNote: "Published instantly." }]);
      setVideos([...videos, savedVideo]);
      setForm({ ...form, title: "", description: "", scripture: "", tags: "", consent: false, rules: false });
      setVideoFile(null);
      setThumbFile(null);
      setThumbPreview("");
      notify("Posted.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Upload failed.");
    }
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

function CommunityScreen() {
  const { communityView, setCommunityView } = useApp();
  const tabs: { id: CommunityView; label: string; icon: React.ElementType }[] = [
    { id: "feed", label: "Faith Feed", icon: MessagesSquare },
    { id: "prayer", label: "Prayer Wall", icon: HeartHandshake },
    { id: "groups", label: "Bible Study Groups", icon: Users },
    { id: "discussions", label: "Series Discussions", icon: MessageCircle },
    { id: "friends", label: "Friends", icon: UserPlus },
    { id: "messages", label: "Messages", icon: Inbox },
  ];
  return (
    <section className="screen">
      <SectionIntro eyebrow="Community" title="Faith-centered connection" body="Post encouragement, pray together, discuss videos, manage friends, and message." />
      <div className="segmented-row">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={communityView === id ? "segment active" : "segment"} onClick={() => setCommunityView(id)}><Icon size={17} />{label}</button>)}</div>
      {communityView === "feed" && <FaithFeed />}
      {communityView === "prayer" && <PrayerWall />}
      {communityView === "groups" && <EmptyState icon={Users} title="No Bible study groups yet." body="Groups are ready for local data and future Supabase records." action="Create post instead" onAction={() => setCommunityView("feed")} />}
      {communityView === "discussions" && <DiscussionRooms />}
      {communityView === "friends" && <FriendsPanel />}
      {communityView === "messages" && <MessagesPanel />}
    </section>
  );
}

function FaithFeed() {
  const { currentUser, posts, setPosts, notify, comments } = useApp();
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

  return (
    <>
      <div className="form-card">
        <label>Encouragement<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Share faith-based encouragement" /></label>
        <Field label="Scripture reference" value={scripture} onChange={setScripture} />
        <FileField label="Optional image" onChange={setImage} />
        <button className="primary-button" onClick={create}>Share Post</button>
      </div>
      {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} comments={comments.filter((item) => item.targetId === post.id)} onToggle={togglePost} />) : <EmptyState icon={MessagesSquare} title="No community posts yet. Be the first to share encouragement." body="Faith Feed posts will appear here." action="Write encouragement" onAction={() => notify("Use the form above to share encouragement.")} />}
    </>
  );
}

function PrayerWall() {
  const { currentUser, prayers, setPrayers, notify } = useApp();
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
      {prayers.length ? prayers.map((prayer) => <article className="content-panel" key={prayer.id}><p className="eyebrow">{prayer.visibility}</p><h3>{prayer.title}</h3><p>{prayer.text}</p><div className="button-row">{actions.map((action) => <button className="secondary-button" key={action} onClick={() => tap(prayer.id, action)}>{action} {(prayer.actions[action] ?? []).length}</button>)}</div></article>) : <EmptyState icon={HeartHandshake} title="No prayer requests yet." body="Prayer requests will appear here after members post them." action="Use prayer form" onAction={() => notify("Use the prayer form above.")} />}
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
  const { currentUser, isAdmin, videos, setVideos, visibleCategories, series, notify } = useApp();
  const [form, setForm] = React.useState({ title: "", description: "", scripture: "", category: visibleCategories[0]?.name ?? "", seriesId: "", episode: "", duration: "", creator: "", tags: "", status: "Published" as Status });
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [thumbFile, setThumbFile] = React.useState<File | null>(null);
  if (!isAdmin) return <EmptyState icon={ShieldCheck} title="Admin access required" body="Only admin accounts can upload platform videos." action="Log In" onAction={() => notify("Log in with the admin account from Profile.")} />;
  const save = async (status: Status) => {
    if (!currentUser) return notify("Log in as admin first.");
    if (!form.title) return notify("Add a title first.");
    if (!videoFile) return notify("Choose a video file first.");
    notify("Uploading video.");
    try {
      const video = await uploadMediaFile(videoFile, currentUser.id, "admin-videos");
      const thumb = await uploadMediaFile(thumbFile, currentUser.id, "admin-thumbnails");
      const platformVideo: Omit<VideoItem, "id" | "createdAt"> = { source: "admin", ...form, status, videoName: video.name, videoUrl: video.url, thumbnailName: thumb.name, thumbnailUrl: thumb.url, cropDimension: "9:16", cropRatio: "9 / 16" };
      const { data, error } = await supabase.from("videos").insert(videoToDb(platformVideo, currentUser.id)).select("*").single();
      if (error) throw error;
      setVideos([...videos, videoFromDb(data as DbVideo)]);
      setForm({ ...form, title: "", description: "", scripture: "", tags: "", status });
      setVideoFile(null);
      setThumbFile(null);
      notify(status === "Published" ? "Video published to the public app." : "Draft saved to manager.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Upload failed.");
    }
  };
  return <div className="form-card"><h2>Add platform video</h2><Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} /><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><Field label="Scripture reference" value={form.scripture} onChange={(scripture) => setForm({ ...form, scripture })} /><Select label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} options={visibleCategories.map((item) => item.name)} /><Select label="Series" value={form.seriesId} onChange={(seriesId) => setForm({ ...form, seriesId })} options={["", ...series.map((item) => item.title)]} /><Field label="Episode number" value={form.episode} onChange={(episode) => setForm({ ...form, episode })} /><Field label="Duration" value={form.duration} onChange={(duration) => setForm({ ...form, duration })} /><Field label="Creator / ministry name" value={form.creator} onChange={(creator) => setForm({ ...form, creator })} /><Field label="Tags" value={form.tags} onChange={(tags) => setForm({ ...form, tags })} /><Select label="Publish status" value={form.status} onChange={(status) => setForm({ ...form, status: status as Status })} options={["Draft", "Published", "Hidden"]} /><FileField label="Video file" onChange={setVideoFile} /><FileField label="Thumbnail" onChange={setThumbFile} /><div className="button-row"><button className="primary-button" onClick={() => save("Published")}>Publish Video</button><button className="secondary-button" onClick={() => save("Draft")}>Save as Draft</button></div></div>;
}

function AdminVideos() {
  const { videos, setVideos, notify, setStudioView } = useApp();
  const [editingId, setEditingId] = React.useState("");
  const platformVideos = videos.filter((video) => video.source === "admin");
  const update = (id: string, patch: Partial<VideoItem>) => setVideos(videos.map((video) => video.id === id ? { ...video, ...patch } : video));
  const finishEditing = () => {
    setEditingId("");
    notify("Video edits saved.");
  };
  if (!platformVideos.length) return <EmptyState icon={Video} title="No platform videos uploaded yet." body="Only admin-created platform content is edited here. User videos and posts can be moderated in User Posts Monitor." action="Add Platform Video" onAction={() => setStudioView("upload")} />;
  return <div className="content-grid">{platformVideos.map((video) => {
    const isEditing = editingId === video.id;
    return <article className="content-panel" key={video.id}><MediaThumb item={video} /><h3>{video.title}</h3><p>{video.description || "No description."}</p><InfoLine label="Status" value={video.status} />{isEditing && <><Field label="Title" value={video.title} onChange={(title) => update(video.id, { title })} /><Field label="Creator" value={video.creator} onChange={(creator) => update(video.id, { creator })} /><label>Description<textarea value={video.description} onChange={(event) => update(video.id, { description: event.target.value })} /></label><Field label="Scripture reference" value={video.scripture} onChange={(scripture) => update(video.id, { scripture })} /><Field label="Series" value={video.seriesId} onChange={(seriesId) => update(video.id, { seriesId })} /></>}<div className="button-row">{isEditing ? <button className="primary-button" onClick={finishEditing}><CheckCircle2 size={16} /> Done</button> : <button className="secondary-button" onClick={() => setEditingId(video.id)}><Edit3 size={16} /> Edit</button>}<button className="secondary-button" onClick={() => notify(video.videoUrl ? "Preview is available in the video manager card." : "No playable file URL in this session.")}><Eye size={16} /> Preview</button><button className="secondary-button" onClick={() => update(video.id, { status: video.status === "Published" ? "Draft" : "Published" })}>{video.status === "Published" ? <EyeOff size={16} /> : <Eye size={16} />} {video.status === "Published" ? "Unpublish" : "Publish"}</button><SelectButton value={video.status} options={["Draft", "Published", "Hidden"]} onChange={(status) => update(video.id, { status: status as Status })} /><button className="secondary-button danger" onClick={() => { setVideos(videos.filter((item) => item.id !== video.id)); notify("Video deleted."); }}><Trash2 size={16} /> Delete</button></div>{video.videoUrl && <video className="inline-video" controls src={video.videoUrl} />}</article>;
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

  const hideVideo = (id: string) => {
    setVideos(videos.map((video) => video.id === id ? { ...video, status: "Hidden" } : video));
    notify("Content taken down.");
  };

  const restoreVideo = (id: string) => {
    setVideos(videos.map((video) => video.id === id ? { ...video, status: "Published" } : video));
    notify("Content restored.");
  };

  const deleteVideo = (id: string) => {
    setVideos(videos.filter((video) => video.id !== id));
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
  return <article className="content-panel"><p className="eyebrow">{post.author}</p><p>{post.text}</p>{post.scripture && <InfoLine label="Scripture" value={post.scripture} />}{post.imageUrl && <img className="poster" src={post.imageUrl} alt="" />}<div className="button-row"><button className="secondary-button" onClick={() => onToggle(post.id, "likes", "Post liked.")}>Like {post.likes.length}</button><button className="secondary-button" onClick={() => onToggle(post.id, "saves", "Post saved.")}>Save {post.saves.length}</button><button className="secondary-button" onClick={() => onToggle(post.id, "reports", "Post reported to admins.")}>Report {post.reports.length}</button></div><CommentBox targetId={post.id} comments={comments} value={comment} setValue={setComment} /></article>;
}

function VideoCard({ video, onOpen, extra }: { video: VideoItem; onOpen: () => void; extra?: React.ReactNode }) {
  return <article className="content-panel video-card"><button className="media-button" onClick={onOpen} aria-label={`Play ${video.title}`}><MediaThumb item={video} /><span className="thumb-play"><Video size={18} /> Play</span></button><p className="eyebrow">{video.status}</p><h3>{video.title}</h3><p>{video.creator || "Faith Flix"} • {video.category}</p>{extra && <div className="button-row">{extra}</div>}</article>;
}

function SeriesCard({ item }: { item: SeriesItem }) {
  return <article className="series-mini">{item.posterUrl ? <img className="poster" src={item.posterUrl} alt="" /> : <div className="poster empty"><Clapperboard size={32} /></div>}<div><p className="eyebrow">{item.status}</p><h3>{item.title}</h3><p>{item.description || item.scriptureTheme || item.category}</p></div></article>;
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
