import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";

const ADI_NAME = "Adi";
const JISU_NAME = "Jisu";
const STATUS_TEXT = "luuuuuuuuuuuuuuuuuuuuuuuuhhhhh • made by adi • 2026";

const moods = [
  { label: "GOOD AS", emoji: "🥰" },
  { label: "okayski", emoji: "😊" },
  { label: "freakyski", emoji: "😏" },
  { label: "sleepyski", emoji: "😴" },
  { label: "sadski", emoji: "🥺" },
  { label: "stressedski", emoji: "😵‍💫" },
];

const BACKGROUND_HEARTS = [
  { left: "6%", top: "14%", size: "text-2xl", duration: 6, delay: 0.2, opacity: "opacity-40", emoji: "💗" },
  { left: "14%", top: "72%", size: "text-3xl", duration: 8, delay: 1.1, opacity: "opacity-30", emoji: "💖" },
  { left: "24%", top: "28%", size: "text-xl", duration: 7, delay: 0.5, opacity: "opacity-35", emoji: "💕" },
  { left: "32%", top: "82%", size: "text-2xl", duration: 9, delay: 1.6, opacity: "opacity-25", emoji: "💗" },
  { left: "68%", top: "18%", size: "text-2xl", duration: 7.5, delay: 0.8, opacity: "opacity-35", emoji: "💞" },
  { left: "78%", top: "76%", size: "text-3xl", duration: 8.5, delay: 1.9, opacity: "opacity-30", emoji: "💓" },
  { left: "88%", top: "34%", size: "text-xl", duration: 6.5, delay: 0.4, opacity: "opacity-40", emoji: "💗" },
  { left: "53%", top: "10%", size: "text-2xl", duration: 9.5, delay: 2.2, opacity: "opacity-20", emoji: "❤️" },
  { left: "50%", top: "88%", size: "text-xl", duration: 7.8, delay: 1.3, opacity: "opacity-25", emoji: "💘" },
];

const HER_LOVE_KEY = "love-app-her-meter";
const MY_LOVE_KEY = "love-app-my-meter";
const MOOD_KEY = "love-app-mood";
const LOVE_LOG_KEY = "love-app-daily-log";
const LAST_DECAY_KEY = "love-app-last-decay-at";

const DEFAULT_HER_LOVE = 35;
const DEFAULT_MY_LOVE = 40;
const LOVE_STEP = 10;
const DECAY_STEP = 1;
const DECAY_INTERVAL_MS = 864000;

function clampLove(value: number) {
  return Math.max(0, Math.min(100, value));
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthDays(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const days: Array<{ day: number; key: string } | null> = [];

  for (let i = 0; i < startPadding; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const fullDate = new Date(year, month, day);
    const key = `${fullDate.getFullYear()}-${String(fullDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    days.push({ day, key });
  }

  return days;
}

function getMonthLabel(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function Meter({ name, value }: { name: string; value: number }) {
  const percentage = clampLove(value);

  return (
    <div className="w-full rounded-[1.75rem] bg-white/80 backdrop-blur-md shadow-lg border border-white/70 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700">{name}</p>
        <div className="flex items-center gap-1 text-pink-500">
          <Heart className="w-4 h-4 fill-current" />
          <span className="text-sm font-semibold">{percentage}%</span>
        </div>
      </div>

      <div className="h-4 w-full rounded-full bg-pink-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-pink-400"
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>

      <p className="text-[11px] text-gray-500 mt-2">Drains by 1% every 864 seconds, even while the app is closed.</p>
    </div>
  );
}

type DayLog = {
  toHer: number;
  toMe: number;
};

type DailyLog = Record<string, DayLog>;

function CalendarCell({
  item,
  log,
  isToday,
}: {
  item: { day: number; key: string } | null;
  log: DailyLog;
  isToday: boolean;
}) {
  if (!item) {
    return <div className="aspect-square rounded-2xl bg-transparent" />;
  }

  const stats = log[item.key];
  const aSent = stats?.toHer ?? 0;
  const jSent = stats?.toMe ?? 0;
  const total = aSent + jSent;

  let winner = "";
  if (total > 0) {
    if (aSent > jSent) winner = `${ADI_NAME} won`;
    else if (jSent > aSent) winner = `${JISU_NAME} won`;
    else winner = "Tie";
  }

  return (
    <div
      className={`aspect-square rounded-2xl border p-2 flex flex-col justify-between transition ${
        isToday ? "bg-pink-100 border-pink-300 shadow-sm" : "bg-white/90 border-pink-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">{item.day}</span>
        {total > 0 ? <span className="text-[10px]">💖</span> : null}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] text-gray-500 leading-tight">A: {aSent} · J: {jSent}</p>
        <p className="text-[10px] font-medium text-pink-600 leading-tight">{winner}</p>
      </div>
    </div>
  );
}

export default function LoveMoodWebapp() {
  const [herMood, setHerMood] = useState(moods[1]);
  const [herLove, setHerLove] = useState(DEFAULT_HER_LOVE);
  const [myLove, setMyLove] = useState(DEFAULT_MY_LOVE);
  const [lastSent, setLastSent] = useState(STATUS_TEXT);
  const [dailyLog, setDailyLog] = useState<DailyLog>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedHerLove = Number(localStorage.getItem(HER_LOVE_KEY));
    const savedMyLove = Number(localStorage.getItem(MY_LOVE_KEY));
    const savedMood = localStorage.getItem(MOOD_KEY);
    const savedLog = localStorage.getItem(LOVE_LOG_KEY);
    const savedCheckpoint = Number(localStorage.getItem(LAST_DECAY_KEY));
    const now = Date.now();

    const startingHerLove = Number.isNaN(savedHerLove) ? DEFAULT_HER_LOVE : clampLove(savedHerLove);
    const startingMyLove = Number.isNaN(savedMyLove) ? DEFAULT_MY_LOVE : clampLove(savedMyLove);
    const checkpoint = !Number.isNaN(savedCheckpoint) && savedCheckpoint > 0 ? savedCheckpoint : now;
    const elapsed = now - checkpoint;
    const decaySteps = Math.floor(elapsed / DECAY_INTERVAL_MS);

    setHerLove(clampLove(startingHerLove - decaySteps * DECAY_STEP));
    setMyLove(clampLove(startingMyLove - decaySteps * DECAY_STEP));

    if (savedMood) {
      const foundMood = moods.find((mood) => mood.label === savedMood);
      if (foundMood) setHerMood(foundMood);
    }

    if (savedLog) {
      try {
        setDailyLog(JSON.parse(savedLog));
      } catch {
        setDailyLog({});
      }
    }

    localStorage.setItem(LAST_DECAY_KEY, String(checkpoint + decaySteps * DECAY_INTERVAL_MS));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(HER_LOVE_KEY, String(herLove));
  }, [herLove, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(MY_LOVE_KEY, String(myLove));
  }, [myLove, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(MOOD_KEY, herMood.label);
  }, [herMood, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(LOVE_LOG_KEY, JSON.stringify(dailyLog));
  }, [dailyLog, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const catchUpDecay = () => {
      const savedCheckpoint = Number(localStorage.getItem(LAST_DECAY_KEY));
      const now = Date.now();
      const checkpoint = !Number.isNaN(savedCheckpoint) && savedCheckpoint > 0 ? savedCheckpoint : now;
      const elapsed = now - checkpoint;
      const decaySteps = Math.floor(elapsed / DECAY_INTERVAL_MS);

      if (decaySteps <= 0) return;

      setHerLove((prev) => clampLove(prev - decaySteps * DECAY_STEP));
      setMyLove((prev) => clampLove(prev - decaySteps * DECAY_STEP));
      localStorage.setItem(LAST_DECAY_KEY, String(checkpoint + decaySteps * DECAY_INTERVAL_MS));
    };

    const interval = window.setInterval(catchUpDecay, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        catchUpDecay();
      } else {
        localStorage.setItem(LAST_DECAY_KEY, String(Date.now()));
      }
    };

    const handlePageHide = () => {
      localStorage.setItem(LAST_DECAY_KEY, String(Date.now()));
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [isLoaded]);

  const totalLove = useMemo(() => Math.round((herLove + myLove) / 2), [herLove, myLove]);
  const monthDays = useMemo(() => getMonthDays(new Date()), []);
  const monthLabel = useMemo(() => getMonthLabel(new Date()), []);
  const today = todayKey();
  const todayStats = dailyLog[today] ?? { toHer: 0, toMe: 0 };

  const updateLog = (type: keyof DayLog) => {
    const key = todayKey();
    setDailyLog((prev) => {
      const existing = prev[key] ?? { toHer: 0, toMe: 0 };
      return {
        ...prev,
        [key]: {
          ...existing,
          [type]: existing[type] + 1,
        },
      };
    });
  };

  const sendLoveToHer = () => {
    setHerLove((prev) => clampLove(prev + LOVE_STEP));
    setLastSent(STATUS_TEXT);
    updateLog("toHer");
  };

  const sendLoveToMe = () => {
    setMyLove((prev) => clampLove(prev + LOVE_STEP));
    setLastSent(STATUS_TEXT);
    updateLog("toMe");
  };

  const resetMeters = () => {
    setHerLove(DEFAULT_HER_LOVE);
    setMyLove(DEFAULT_MY_LOVE);
    localStorage.setItem(LAST_DECAY_KEY, String(Date.now()));
    setLastSent(STATUS_TEXT);
  };

  let todayLeader = "No love has been logged today yet.";
  if (todayStats.toHer > todayStats.toMe) todayLeader = `${ADI_NAME} sent more love today.`;
  else if (todayStats.toMe > todayStats.toHer) todayLeader = `${JISU_NAME} sent more love today.`;
  else if (todayStats.toHer > 0 || todayStats.toMe > 0) todayLeader = "It is a dead-even tie today.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 text-gray-800 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        {BACKGROUND_HEARTS.map((heart, index) => (
          <motion.div
            key={`${heart.left}-${heart.top}-${index}`}
            className={`absolute select-none ${heart.size} ${heart.opacity}`}
            style={{ left: heart.left, top: heart.top }}
            animate={{ y: [0, -14, 0], scale: [1, 1.08, 1], rotate: [-4, 4, -4] }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {heart.emoji}
          </motion.div>
        ))}

        <div className="absolute -top-20 left-8 h-56 w-56 rounded-full bg-pink-200/35 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-5xl space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Meter name={`${JISU_NAME}'s Heart`} value={herLove} />
            <Meter name={`${ADI_NAME}'s Heart`} value={myLove} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full rounded-[2rem] bg-white/78 backdrop-blur-xl shadow-2xl border border-white/70 p-8 md:p-10"
          >
            <div className="text-center mb-8">
              <p className="text-sm uppercase tracking-[0.25em] text-pink-500 font-semibold mb-3">
                daily loveski
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">오늘 기분은 어떠세요, 자기?</h1>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                நான் உன்னை நேசிக்கிறேன் (Nāṉ uṉṉai nēcikkiṟēṉ).
              </p>
            </div>

            <div className="grid lg:grid-cols-[1.2fr_0.9fr] gap-6">
              <div>
                <div className="mb-8">
                  <p className="text-lg font-semibold mb-4 text-center">How u feelin today ma naesalanggg</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {moods.map((mood) => {
                      const selected = herMood.label === mood.label;

                      return (
                        <button
                          key={mood.label}
                          onClick={() => setHerMood(mood)}
                          className={`rounded-2xl p-4 border transition-all text-left ${
                            selected
                              ? "bg-pink-100 border-pink-300 shadow-md scale-[1.02]"
                              : "bg-white border-gray-200 hover:border-pink-200 hover:shadow-sm"
                          }`}
                        >
                          <div className="text-2xl mb-2">{mood.emoji}</div>
                          <div className="font-medium">{mood.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-3xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 p-5 mb-8 text-center">
                  <p className="text-sm text-gray-500 mb-2">Current vibe</p>
                  <p className="text-3xl font-bold mb-1">
                    {herMood.emoji} {herMood.label}
                  </p>
                  <p className="text-sm text-gray-600">Shared love level: {totalLove}%</p>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mb-6">
                  <button
                    onClick={sendLoveToHer}
                    className="rounded-2xl px-5 py-4 bg-pink-500 text-white font-semibold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition"
                  >
                    send jisu luh 💗
                  </button>

                  <button
                    onClick={sendLoveToMe}
                    className="rounded-2xl px-5 py-4 bg-rose-500 text-white font-semibold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition"
                  >
                    send adi luh ❤️
                  </button>

                  <button
                    onClick={resetMeters}
                    className="rounded-2xl px-5 py-4 bg-white text-gray-700 font-semibold border border-gray-200 hover:bg-gray-50 transition"
                  >
                    Reset hearts
                  </button>
                </div>

                <div className="min-h-6 text-center text-sm text-gray-600 font-medium">{lastSent}</div>
              </div>

              <div className="rounded-3xl bg-white/88 border border-pink-100 p-5 shadow-sm">
                <div className="mb-4">
                  <p className="text-lg font-semibold">love calendarski</p>
                  <p className="text-sm text-gray-500">😼😼😼</p>
                </div>

                <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4 mb-4">
                  <p className="text-sm text-gray-500 mb-1">{monthLabel}</p>
                  <p className="font-semibold text-pink-600 mb-1">{todayLeader}</p>
                  <p className="text-sm text-gray-600">
                    Adi: {todayStats.toHer} · Jisu: {todayStats.toMe}
                  </p>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2 text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                  <div className="text-center">Sun</div>
                  <div className="text-center">Mon</div>
                  <div className="text-center">Tue</div>
                  <div className="text-center">Wed</div>
                  <div className="text-center">Thu</div>
                  <div className="text-center">Fri</div>
                  <div className="text-center">Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map((item, index) => (
                    <CalendarCell
                      key={item ? item.key : `blank-${index}`}
                      item={item}
                      log={dailyLog}
                      isToday={item?.key === today}
                    />
                  ))}
                </div>

                <div className="mt-4 text-[11px] text-gray-500 space-y-1">
                  <p>A = Adi sent love</p>
                  <p>J = Jisu sent love</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
