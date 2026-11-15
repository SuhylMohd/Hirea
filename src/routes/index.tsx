import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export interface HireaAuthUser {
  id: string;
  name: string;
  email: string;
  accountType: "candidate" | "employer" | "investor";
  companyName?: string;
}

interface WebinarItem {
  id: string;
  title: string;
  speaker: string;
  role: string;
  schedule: string;
  attendees: number;
  xpReward: number;
  badgeName: string;
  registered: boolean;
}

const AUTH_STORAGE_KEY = "hirea_auth_user_v3";

const INITIAL_WEBINARS: WebinarItem[] = [
  {
    id: "web-1",
    title: "Cracking Live Coding & System Design Without AI Crutches",
    speaker: "Vikramaditya Menon (960 pts)",
    role: "Staff AI/ML Architect • Hirea In-House Squad",
    schedule: "Live Today • 7:30 PM IST",
    attendees: 342,
    xpReward: 50,
    badgeName: "System Design Insider",
    registered: false,
  },
  {
    id: "web-2",
    title: "From Virtual Company Pod to Seed Term Sheet: Pitching Proof-of-Work",
    speaker: "David Wilson & Rajeshwari Pai",
    role: "Managing Partners • Horizon Ventures & Malabar Syndicate",
    schedule: "Tomorrow • 6:00 PM IST",
    attendees: 518,
    xpReward: 60,
    badgeName: "Venture Ready Founder",
    registered: false,
  },
  {
    id: "web-3",
    title: "Zero-Downtime 95/5 Escrow & 18% GST Microservices in React + Python",
    speaker: "Rohan Dev (915 pts)",
    role: "Principal Cloud & K8s Architect",
    schedule: "This Saturday • 11:00 AM IST",
    attendees: 289,
    xpReward: 40,
    badgeName: "FinTech Ledger Pro",
    registered: false,
  },
];

const QUICK_MODULES = [
  { tab: "home", label: "Home & Role Wheel", badge: "Main", desc: "Dual-mode search, category carousel & snapshot" },
  { tab: "profile", label: "Executive User Dashboard", badge: "Profile", desc: "4 live metrics, GitHub/Figma PoW importer & CV" },
  { tab: "seeker", label: "Find Jobs (Seeker Marketplace)", badge: "Module 5", desc: "Search, filter & 1-click apply with Skill Score" },
  { tab: "talent", label: "Skilled Talent & Freelance Hub", badge: "Module 6", desc: "Book verified specialists with Platinum/Gold medals" },
  { tab: "resume", label: "Smart Resume & ATS Studio", badge: "Module 1", desc: "3 live CV templates, PDF print & Pro career boosts" },
  { tab: "tasks", label: "Skill Tasks & 900+ Leaderboard", badge: "Module 2", desc: "Complete challenges to qualify for 900+ In-House Squad" },
  { tab: "interview", label: "Live Code & Video Interview Studio", badge: "Module 3", desc: "Split-screen WebRTC call, 3 coding labs & unit tests" },
  { tab: "virtual", label: "Virtual Companies & 1-Click Pod Matchmaker", badge: "Module 4", desc: "Auto-assemble 3-person pods & cap-table split calculator" },
  { tab: "investor", label: "Startup & Investor Pitch Hub", badge: "Module 7", desc: "4-slide pitch decks, hybrid sprints & angel syndicate" },
  { tab: "employer", label: "Employer Studio & Sponsored Ads", badge: "Hire", desc: "Publish openings & boost with Rs. 2,499 Sponsored Ads" },
  { tab: "applications", label: "Application Review Pipeline", badge: "Workflow", desc: "Real-time Pending, Shortlisted & Accepted status" },
  { tab: "payments", label: "95/5 Escrow & 18% GST Ledger", badge: "FinTech", desc: "Milestone escrow calculator & instant tax invoicing" },
  { tab: "ai", label: "Dux — Hirea AI Copilot & JD Generator", badge: "AI v2.4", desc: "Semantic CV-to-job match radar & 1-click JD builder" },
  { tab: "hub", label: "Hirea Hub (Orbit Pro Accelerator)", badge: "Orbit", desc: "AI mock prep, Academy courses, 1-on-1 mentors & APIs" },
  { tab: "bites", label: "Hirea Bites Stream (Reels, Blogs & Posts)", badge: "Creator", desc: "Full-screen vertical video bites, top creators & +15 pts upload" },
];

export default function HireaCompleteAppV3() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bootedRef = useRef(false);
  const [loading, setLoading] = useState(true);

  // Auth State
  const [user, setUser] = useState<HireaAuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [accountType, setAccountType] = useState<"candidate" | "employer" | "investor">("candidate");
  const [fullName, setFullName] = useState("Muhammed Suhail T.M");
  const [email, setEmail] = useState("suhail@hirea.in");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [authStatusMsg, setAuthStatusMsg] = useState("");

  // v3 Supercharged Modals: Command Palette (Ctrl+K), Live Webinars, Startup Fest Demo Mode
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [webinarOpen, setWebinarOpen] = useState(false);
  const [webinars, setWebinars] = useState<WebinarItem[]>(INITIAL_WEBINARS);
  const [festDemoOpen, setFestDemoOpen] = useState(false);
  // Slot inside the page header where the v3 action buttons are rendered (avoids overlapping it)
  const [topbarSlot, setTopbarSlot] = useState<HTMLElement | null>(null);

  // Keyboard shortcut Ctrl+K or Cmd+K to open 15-Module Command Palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function triggerHireaTab(tabId: string) {
    const btn =
      (document.getElementById(`tab-${tabId}`) as HTMLElement | null) ||
      (document.querySelector(`[data-goto-tab="${tabId}"]`) as HTMLElement | null);
    if (btn) {
      btn.click();
    }
    setCmdOpen(false);
    setFestDemoOpen(false);
  }

  function syncUserToHireaDOM(activeUser: HireaAuthUser | null) {
    if (!activeUser) return;
    try {
      const ecoRaw = localStorage.getItem("hirea_ecosystem_v3");
      const eco = ecoRaw ? JSON.parse(ecoRaw) : {};
      eco.resume = eco.resume || {};
      eco.resume.name = activeUser.name;
      eco.resume.contact = `${activeUser.email} | Pattambi / Kochi, Kerala`;
      localStorage.setItem("hirea_ecosystem_v3", JSON.stringify(eco));
    } catch {}

    ["home-user-name", "prof-header-name"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = activeUser.name;
    });
    const welcomeEl = document.getElementById("dash-welcome-heading");
    if (welcomeEl) {
      welcomeEl.textContent = `Welcome back, ${activeUser.name}! Here's what's happening with your projects.`;
    }
    const resNameInput = document.getElementById("res-name") as HTMLInputElement | null;
    if (resNameInput) {
      resNameInput.value = activeUser.name;
      resNameInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function handleJoinWebinar(webinar: WebinarItem) {
    if (webinar.registered) return;
    setWebinars((prev) =>
      prev.map((w) =>
        w.id === webinar.id ? { ...w, registered: true, attendees: w.attendees + 1 } : w
      )
    );

    // Boost user's Hirea Score by +xpReward and sync with DOM & localStorage
    try {
      const ecoRaw = localStorage.getItem("hirea_ecosystem_v3");
      const eco = ecoRaw ? JSON.parse(ecoRaw) : {};
      const nextScore = Number(eco.userScore || 820) + webinar.xpReward;
      eco.userScore = nextScore;
      localStorage.setItem("hirea_ecosystem_v3", JSON.stringify(eco));

      ["home-score-val", "prof-card-score", "task-banner-score", "float-ai-score"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = `${nextScore} pts`;
      });
      const navScore = document.getElementById("nav-tasks-score");
      if (navScore) navScore.textContent = String(nextScore);
      const toastEl = document.getElementById("toast");
      if (toastEl) {
        toastEl.textContent = `Registered for "${webinar.title}"! Earned +${webinar.xpReward} Hirea Score pts & "${webinar.badgeName}" Badge!`;
        toastEl.classList.remove("hidden");
        setTimeout(() => toastEl.classList.add("hidden"), 3400);
      }
    } catch {}
  }

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    async function bootHireaPlatform() {
      try {
        const res = await fetch("/hirea-complete.html");
        const rawHtml = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, "text/html");

        // Inject custom styles
        doc.querySelectorAll("style").forEach((styleNode) => {
          const clone = styleNode.cloneNode(true) as HTMLStyleElement;
          document.head.appendChild(clone);
        });

        // Add Print-to-PDF stylesheet for Resume Studio
        const printStyle = document.createElement("style");
        printStyle.textContent = `
          @media print {
            header, footer, nav, #floating-ai-widget, #hirea-v3-topbar { display: none !important; }
            #resume-preview-card { border: none !important; box-shadow: none !important; width: 100% !important; }
          }
        `;
        document.head.appendChild(printStyle);

        // Extract inline scripts
        const scripts: string[] = [];
        doc.body.querySelectorAll("script").forEach((scr) => {
          if (scr.textContent) scripts.push(scr.textContent);
          scr.remove();
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = doc.body.innerHTML;
        }

        // Put the v3 action buttons inside the header's right-hand group so they sit
        // beside the role label / theme toggle / role icon instead of on top of them.
        const headerRight = document.getElementById("header-right-actions");
        if (headerRight) {
          const slot = document.createElement("div");
          slot.id = "hirea-v3-topbar";
          slot.className = "flex items-center gap-1.5 shrink-0";
          headerRight.insertBefore(slot, headerRight.firstChild);
          setTopbarSlot(slot);
        }

        // Sync jobs from Supabase if configured
        if (isSupabaseConfigured && supabase) {
          try {
            const { data: dbJobs } = await supabase
              .from("jobs")
              .select("*")
              .eq("status", "published")
              .order("created_at", { ascending: false });

            if (dbJobs && dbJobs.length > 0) {
              const storageKey = "hirea_ecosystem_v3";
              const existingRaw = localStorage.getItem(storageKey);
              const parsed = existingRaw ? JSON.parse(existingRaw) : {};
              parsed.jobs = dbJobs.map((j: any) => ({
                id: j.id,
                title: j.title,
                company: j.company,
                category: j.category || "Engineering",
                mode: j.workplace || "Remote",
                type: j.employment_type || "Full-time",
                location: j.location || "Kochi / Remote",
                salary: j.salary || "Rs. 18L - 26L / yr",
                skills: Array.isArray(j.skills) && j.skills.length > 0 ? j.skills : ["React", "TypeScript", "Node.js"],
                desc: j.description || "",
                sponsored: Boolean(j.sponsored),
                postedAt: "Synced from Supabase",
              }));
              localStorage.setItem(storageKey, JSON.stringify(parsed));
            }
          } catch {}
        }

        // Execute the 63-function Hirea Ecosystem Engine
        scripts.forEach((code) => {
          const s = document.createElement("script");
          s.textContent = code;
          document.body.appendChild(s);
        });

        // Add "Download PDF Resume" button right next to "Copy Resume Text" in Resume Studio
        const copyResumeBtn = document.getElementById("btn-copy-resume");
        if (copyResumeBtn && copyResumeBtn.parentElement && !document.getElementById("btn-print-resume-pdf")) {
          const pdfBtn = document.createElement("button");
          pdfBtn.id = "btn-print-resume-pdf";
          pdfBtn.type = "button";
          pdfBtn.className =
            "py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer";
          pdfBtn.textContent = "Export PDF";
          pdfBtn.addEventListener("click", () => window.print());
          copyResumeBtn.parentElement.appendChild(pdfBtn);
        }

        // Bridge Employer Job Post form to Supabase when configured
        const postJobForm = document.getElementById("post-job-form") as HTMLFormElement | null;
        if (postJobForm && isSupabaseConfigured && supabase) {
          postJobForm.addEventListener("submit", async () => {
            const title = (document.getElementById("emp-title") as HTMLInputElement)?.value?.trim();
            const company = (document.getElementById("emp-company") as HTMLInputElement)?.value?.trim();
            const category = (document.getElementById("emp-category") as HTMLSelectElement)?.value;
            const workplace = (document.getElementById("emp-mode") as HTMLSelectElement)?.value;
            const employment_type = (document.getElementById("emp-type") as HTMLSelectElement)?.value;
            const location = (document.getElementById("emp-location") as HTMLInputElement)?.value?.trim();
            const salary = (document.getElementById("emp-salary") as HTMLInputElement)?.value?.trim();
            const description = (document.getElementById("emp-desc") as HTMLTextAreaElement)?.value?.trim();
            const skillsRaw = (document.getElementById("emp-skills") as HTMLInputElement)?.value || "";
            const skills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);
            if (title && company && supabase) {
              await supabase.from("jobs").insert({
                title,
                company,
                category,
                workplace,
                employment_type,
                location,
                salary,
                description,
                skills,
                status: "published",
              });
            }
          });
        }

        if (user) {
          setTimeout(() => syncUserToHireaDOM(user), 150);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to boot Hirea v3:", err);
        setLoading(false);
      }
    }

    void bootHireaPlatform();
  }, []);

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthStatusMsg("Signing in...");

    if (isSupabaseConfigured && supabase) {
      const res =
        authMode === "signup"
          ? await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: {
                data: {
                  full_name: fullName.trim(),
                  account_type: accountType,
                  company_name: companyName.trim(),
                },
              },
            })
          : await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            });

      if (res.error) {
        setAuthStatusMsg(res.error.message);
        return;
      }
    }

    const loggedInUser: HireaAuthUser = {
      id: "usr-" + Date.now(),
      name: authMode === "signup" ? fullName.trim() || "Muhammed Suhail T.M" : fullName.trim() || email.split("@")[0],
      email: email.trim(),
      accountType,
      companyName: companyName.trim(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    syncUserToHireaDOM(loggedInUser);
    setAuthStatusMsg("");
    setAuthModalOpen(false);
  }

  function handleSignOut() {
    if (isSupabaseConfigured && supabase) {
      void supabase.auth.signOut();
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }

  const filteredModules = QUICK_MODULES.filter((m) =>
    `${m.label} ${m.badge} ${m.desc}`.toLowerCase().includes(cmdQuery.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* v3 Supercharged Floating Action Bar (Ctrl+K Command Palette, Live Webinars, Startup Fest Pitch Mode & Auth) */}
      {topbarSlot &&
        createPortal(
          <>
        <button
          type="button"
          onClick={() => setCmdOpen(true)}
          title="Quick Jump to any of the 15 Modules (Ctrl+K)"
          className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 bg-slate-900/90 hover:bg-slate-800 text-white text-[11px] font-bold shadow-xs cursor-pointer transition-all"
        >
          <span>⚡ 15 Modules</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-mono">Ctrl+K</kbd>
        </button>

        <button
          type="button"
          onClick={() => setWebinarOpen(true)}
          title="Live Webinars & Masterclasses (+50 XP)"
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold shadow-2xs cursor-pointer transition-all"
        >
          <span>🎙️ Webinars</span>
        </button>

        <button
          type="button"
          onClick={() => setFestDemoOpen(true)}
          title="Startup Fest Golden-Thread Demo & Investor Pitch Mode"
          className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold shadow-2xs cursor-pointer transition-all"
        >
          <span>🚀 Fest Pitch</span>
        </button>

        {user ? (
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200 px-2.5 py-1 rounded-full shadow-xs">
            <span className="w-6 h-6 rounded-full bg-[#004aad] text-white text-[11px] font-bold flex items-center justify-center">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden md:inline text-xs font-bold text-slate-800 max-w-[105px] truncate">
              {user.name}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-[11px] font-semibold text-rose-600 hover:underline ml-1 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setAuthModalOpen(true);
              }}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setAuthModalOpen(true);
              }}
              className="hidden sm:inline-flex whitespace-nowrap px-3 py-1 rounded-full bg-[#004aad] hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Create account
            </button>
          </div>
        )}
          </>,
          topbarSlot
        )}

      {/* Complete 15-Module Hirea Mount Container */}
      <div ref={containerRef} className="min-h-screen flex flex-col" />

      {/* MODAL A: Ctrl+K 15-Module Command Palette & Instant Jumper */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-16 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCmdOpen(false);
          }}
        >
          <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#004aad] text-white">v3.0</span>
                <input
                  type="text"
                  autoFocus
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                  placeholder="Jump to a module (e.g. Coding, Pods, Investor)..."
                  className="w-full text-sm font-medium bg-transparent focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setCmdOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1"
              >
                ESC
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
              {filteredModules.map((item) => (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => triggerHireaTab(item.tab)}
                  className="w-full text-left p-2.5 rounded-2xl hover:bg-blue-50/80 border border-transparent hover:border-blue-200 flex items-center justify-between gap-3 transition-all cursor-pointer"
                >
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-[#004aad] shrink-0">
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL B: Live Webinars & Expert Masterclasses (+50 XP & Verified Badges) */}
      {webinarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setWebinarOpen(false);
          }}
        >
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                  Hirea Community & Gamification Engine
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  Live Webinars, Hiring Sprints & Founder Masterclasses
                </h2>
                <p className="text-xs text-slate-500">
                  Attend live sessions to earn Verified Skill Badges and climb the 900+ In-House Leaderboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWebinarOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              {webinars.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-[#004aad]">
                        {w.schedule}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        +{w.xpReward} Score Pts • Badge: {w.badgeName}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{w.title}</h3>
                    <p className="text-xs text-slate-600">
                      <strong>{w.speaker}</strong> — {w.role} ({w.attendees} builders attending)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJoinWebinar(w)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all ${
                      w.registered
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-[#004aad] hover:bg-blue-800 text-white shadow-xs"
                    }`}
                  >
                    {w.registered ? "Registered ✓ (+Pts Claimed)" : `RSVP & Claim +${w.xpReward} Pts`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL C: Startup Fest "Golden Thread" 3-Minute Live Demo & Pitch Mode */}
      {festDemoOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setFestDemoOpen(false);
          }}
        >
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-700 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Startup Fest Judge & Investor Presentation Mode
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Hirea — The 7-Module Career-to-Capital Flywheel
                </h2>
                <p className="text-xs text-slate-300">
                  Click any stage below during your live stall demo to jump directly to that working module.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFestDemoOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => triggerHireaTab("interview")}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-left space-y-1 cursor-pointer"
              >
                <span className="text-[10px] font-extrabold text-emerald-400">STEP 1 • 30 SEC DEMO</span>
                <p className="font-bold text-sm text-white">Live Coding + Video Interview Suite</p>
                <p className="text-slate-300">Show split-screen WebRTC call + 4-assertion test grading (+100 pts).</p>
              </button>

              <button
                type="button"
                onClick={() => triggerHireaTab("virtual")}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-sky-500/40 text-left space-y-1 cursor-pointer"
              >
                <span className="text-[10px] font-extrabold text-sky-400">STEP 2 • 60 SEC DEMO</span>
                <p className="font-bold text-sm text-white">Virtual Companies & 1-Click Pod Builder</p>
                <p className="text-slate-300">Assemble a 3-person pod with automated 95/5 escrow & 18% GST splits.</p>
              </button>

              <button
                type="button"
                onClick={() => triggerHireaTab("investor")}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-left space-y-1 cursor-pointer"
              >
                <span className="text-[10px] font-extrabold text-amber-400">STEP 3 • 60 SEC DEMO</span>
                <p className="font-bold text-sm text-white">Startup & Investor Hub (Hybrid Sprints)</p>
                <p className="text-slate-300">Inspect verified 4-slide pitch decks & 70% Cash / 30% Equity sprints.</p>
              </button>

              <button
                type="button"
                onClick={() => triggerHireaTab("bites")}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-pink-500/40 text-left space-y-1 cursor-pointer"
              >
                <span className="text-[10px] font-extrabold text-pink-400">STEP 4 • RETENTION MOAT</span>
                <p className="font-bold text-sm text-white">Hirea Bites & 900+ Leaderboard</p>
                <p className="text-slate-300">Daily habit loop with vertical video reels, blogs & Platinum medals.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL D: Full Login / Sign-Up Modal (Candidate, Employer, Investor) */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAuthModalOpen(false);
          }}
        >
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#004aad]">
                  Hirea Unified Auth v3
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {authMode === "signup" ? "Create your Hirea account" : "Welcome back to Hirea"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isSupabaseConfigured
                    ? "Connected to Supabase Cloud Auth"
                    : "Running in Instant Local Auth Mode (Zero Credits Required)"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {(["candidate", "employer", "investor"] as const).map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => setAccountType(roleOption)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    accountType === roleOption
                      ? "bg-[#004aad] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {roleOption}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammed Suhail T.M"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {accountType === "employer" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. FinEdge Payments India"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              )}

              {authStatusMsg && <p className="text-xs font-semibold text-[#004aad]">{authStatusMsg}</p>}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#004aad] hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                {authMode === "signup" ? "Create Account & Enter Hirea" : "Sign In to Hirea"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500">
              {authMode === "signup" ? "Already have an account?" : "New to Hirea?"}{" "}
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")}
                className="font-bold text-[#004aad] hover:underline cursor-pointer"
              >
                {authMode === "signup" ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white text-sm font-bold">
          Booting Hirea v3.0 (15 Modules + Webinars + Startup Fest Pitch Mode)...
        </div>
      )}
    </div>
  );
}
