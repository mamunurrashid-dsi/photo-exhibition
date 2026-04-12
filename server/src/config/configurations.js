// ─── Resource Limits ────────────────────────────────────────────────────────
export const LIMITS = {
  // Max online exhibitions a single organizer can create
  MAX_ONLINE_EXHIBITIONS_PER_ORGANIZER: 5,

  // Max total photos across all submissions in one exhibition
  MAX_PHOTOS_PER_EXHIBITION: 100,

  // Max file size for submitted photos (in bytes)
  MAX_PHOTO_FILE_SIZE: 5 * 1024 * 1024, // 20MB

  // Max file size for exhibition cover images (in bytes)
  MAX_COVER_FILE_SIZE: 5 * 1024 * 1024, // 10MB

  // Max file size for user avatar images (in bytes)
  MAX_AVATAR_FILE_SIZE: 5 * 1024 * 1024, // 5MB
}

// ─── Feature Flags ───────────────────────────────────────────────────────────
export const FEATURES = {
  // When true: new exhibitions start as 'pending_approval' and admins receive
  // an email notification. Admins must approve before the exhibition becomes
  // active and visible to the public.
  // When false: exhibitions go live immediately upon creation.
  REQUIRE_EXHIBITION_APPROVAL: true,
}