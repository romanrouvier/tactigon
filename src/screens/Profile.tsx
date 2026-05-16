import { useState, useRef, useEffect } from 'react';
import { factions } from '../data/factions';
import SharedBottomNav from '../components/SharedBottomNav';
import styles from './Profile.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  nickname: string;
  email: string;
  avatarDataUrl: string | null;
  title: string;
  joinedAt: string;
  stats: {
    wins: number;
    losses: number;
    gamesPlayed: number;
    favoriteFactionId: number | null;
    totalPlaytimeSec: number;
  };
  achievements: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tactigon_profile';

const DEFAULT_PROFILE: UserProfile = {
  nickname: 'Oraizi',
  email: 'oraizi@tactigon.gg',
  avatarDataUrl: null,
  title: 'Éclaireur des Ombres',
  joinedAt: new Date().toISOString(),
  stats: {
    wins: 7,
    losses: 3,
    gamesPlayed: 10,
    favoriteFactionId: 2,
    totalPlaytimeSec: 4320,
  },
  achievements: ['first_blood', 'strategist', 'time_master'],
};

const ACHIEVEMENTS = [
  { id: 'first_blood',  icon: '⚔️',  label: 'Premier Sang',   desc: 'Première victoire'          },
  { id: 'warrior',      icon: '🏆',  label: 'Guerrier',        desc: '5 victoires'                },
  { id: 'legend',       icon: '👑',  label: 'Légende',         desc: '10 victoires'               },
  { id: 'strategist',   icon: '🧠',  label: 'Stratège',        desc: '10 parties jouées'          },
  { id: 'flawless',     icon: '🛡️',  label: 'Intouchable',     desc: 'Gagner sans perdre de pièce'},
  { id: 'on_fire',      icon: '🔥',  label: 'En Feu',          desc: '3 victoires consécutives'   },
  { id: 'all_factions', icon: '🌟',  label: 'Caméléon',        desc: 'Jouer les 4 factions'       },
  { id: 'time_master',  icon: '⏱️',  label: 'Maître du Temps', desc: 'Gagner en mode 3 min'       },
  { id: 'conqueror',    icon: '🗺️',  label: 'Conquérant',      desc: 'Gagner une partie à 4'      },
  { id: 'phantom',      icon: '👻',  label: 'Fantôme',         desc: 'Capturer le roi en 5 coups' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_PROFILE;
}

function formatPlaytime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatJoinDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

// ── Top Header ────────────────────────────────────────────────────────────────

function TopHeader() {
  return (
    <header className={styles.topHeader}>
      <button className={styles.headerIcon} aria-label="Paramètres">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      <div className={styles.headerCenter}>
        <div className={styles.headerAvatarSmall}>P</div>
        <span className={styles.headerUsername}>Profil</span>
      </div>
      <button className={styles.headerIcon} aria-label="Équipe">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </button>
    </header>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [editField, setEditField] = useState<'nickname' | 'email' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [playOpen, setPlayOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editField && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editField]);

  function saveProfile(updated: UserProfile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfile(updated);
  }

  function startEdit(field: 'nickname' | 'email') {
    setEditField(field);
    setEditValue(profile[field]);
  }

  function commitEdit() {
    if (!editField) return;
    const trimmed = editValue.trim();
    if (trimmed) {
      saveProfile({ ...profile, [editField]: trimmed });
    }
    setEditField(null);
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditField(null);
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      saveProfile({ ...profile, avatarDataUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const { wins, losses, gamesPlayed, favoriteFactionId, totalPlaytimeSec } = profile.stats;
  const winRate = Math.round((wins / Math.max(gamesPlayed, 1)) * 100);

  // Faction affinity bars: favorite = 100%, others decrease
  const factionAffinities = factions.map((f) => {
    if (f.id === favoriteFactionId) return { faction: f, pct: 100 };
    return { faction: f, pct: 0 }; // filled below
  });
  const nonFavoriteValues = [65, 40, 20];
  let nfIdx = 0;
  const affinities = factions.map((f) => {
    if (f.id === favoriteFactionId) return { faction: f, pct: 100 };
    const pct = nonFavoriteValues[nfIdx] ?? 10;
    nfIdx++;
    return { faction: f, pct };
  });
  void factionAffinities; // silence unused var warning

  return (
    <div className={styles.root}>
      <TopHeader />

      <div className={styles.scroll}>

        {/* ── Hero card ──────────────────────────────────────────── */}
        <div className={styles.heroCard}>

          {/* Avatar */}
          <div className={styles.avatarWrap} onClick={handleAvatarClick} role="button"
               tabIndex={0} aria-label="Changer l'avatar"
               onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}>
            <div className={styles.avatar}>
              {profile.avatarDataUrl
                ? <img src={profile.avatarDataUrl} alt="Avatar" className={styles.avatarImg} />
                : <div className={styles.avatarInitial}>
                    {profile.nickname.charAt(0).toUpperCase()}
                  </div>
              }
            </div>
            <div className={styles.avatarOverlay} aria-hidden>
              <span className={styles.cameraIcon}>📷</span>
              <span className={styles.cameraLabel}>Changer</span>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Hero info */}
          <div className={styles.heroInfo}>
            <div className={styles.heroNameRow}>
              {editField === 'nickname'
                ? <input
                    ref={editInputRef}
                    className={styles.heroNameInput}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleEditKeyDown}
                    aria-label="Modifier le pseudo"
                  />
                : <span className={styles.heroName}>{profile.nickname}</span>
              }
              {editField !== 'nickname' && (
                <button className={styles.pencilBtn} onClick={() => startEdit('nickname')}
                        aria-label="Modifier le pseudo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                       strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
            </div>
            <p className={styles.heroTitle}>{profile.title}</p>
            <span className={styles.levelBadge}>Niv. 4</span>
            <p className={styles.joinDate}>
              Membre depuis {formatJoinDate(profile.joinedAt)}
            </p>
          </div>
        </div>

        {/* ── Stats grid ─────────────────────────────────────────── */}
        <div>
          <p className={styles.sectionTitle}>Statistiques</p>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{wins}</span>
              <span className={styles.statLabel}>Victoires</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{losses}</span>
              <span className={styles.statLabel}>Défaites</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{winRate}%</span>
              <span className={styles.statLabel}>Win Rate</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{formatPlaytime(totalPlaytimeSec)}</span>
              <span className={styles.statLabel}>Temps de jeu</span>
            </div>
          </div>
        </div>

        {/* ── Faction affinity ───────────────────────────────────── */}
        <div>
          <p className={styles.sectionTitle}>Affinité de faction</p>
          <div className={styles.factionSection}>
            {affinities.map(({ faction, pct }) => {
              const shortName = faction.name.split('—')[1]?.trim() ?? faction.name;
              return (
                <div key={faction.id} className={styles.factionRow}>
                  <div className={styles.factionDot} style={{ background: faction.color }} />
                  <span className={styles.factionName}>{shortName}</span>
                  <div className={styles.factionBarTrack}>
                    <div
                      className={styles.factionBarFill}
                      style={{ width: `${pct}%`, background: faction.color }}
                    />
                  </div>
                  <span className={styles.factionPct}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Achievements ───────────────────────────────────────── */}
        <div>
          <p className={styles.sectionTitle}>Succès</p>
          <div className={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((a) => {
              const unlocked = profile.achievements.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`${styles.achievement} ${unlocked ? styles.achievementUnlocked : styles.achievementLocked}`}
                >
                  {!unlocked && <span className={styles.lockOverlay} aria-hidden>🔒</span>}
                  <span
                    className={styles.achievementIcon}
                    role="img"
                    aria-label={a.label}
                  >
                    {a.icon}
                  </span>
                  <span className={styles.achievementLabel}>{a.label}</span>
                  <span className={styles.achievementDesc}>{a.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Account section ────────────────────────────────────── */}
        <div>
          <p className={styles.sectionTitle}>Mon Compte</p>
          <div className={styles.accountCard}>

            {/* Pseudo row */}
            <div className={styles.accountRow} onClick={() => editField !== 'nickname' && startEdit('nickname')}>
              <div className={styles.accountIcon} aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                     strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <div className={styles.accountInfo}>
                <span className={styles.accountLabel}>Pseudo</span>
                {editField === 'nickname'
                  ? <input
                      ref={editInputRef}
                      className={styles.accountValueInput}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleEditKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Modifier le pseudo"
                    />
                  : <p className={styles.accountValue}>{profile.nickname}</p>
                }
              </div>
              {editField !== 'nickname' && (
                <svg className={styles.editIcon} viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round" width="16" height="16" aria-hidden>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              )}
            </div>

            {/* Email row */}
            <div className={`${styles.accountRow} ${styles.accountRowLast}`}
                 onClick={() => editField !== 'email' && startEdit('email')}>
              <div className={styles.accountIcon} aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                     strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className={styles.accountInfo}>
                <span className={styles.accountLabel}>Email</span>
                {editField === 'email'
                  ? <input
                      ref={editField === 'email' ? editInputRef : undefined}
                      className={styles.accountValueInput}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleEditKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      type="email"
                      aria-label="Modifier l'email"
                    />
                  : <p className={styles.accountValue}>{profile.email}</p>
                }
              </div>
              {editField !== 'email' && (
                <svg className={styles.editIcon} viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round" width="16" height="16" aria-hidden>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              )}
            </div>

          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ height: '0.5rem' }} />

      </div>

      <SharedBottomNav
        activeTab="profil"
        playOpen={playOpen}
        onTogglePlay={() => setPlayOpen(v => !v)}
      />
    </div>
  );
}
