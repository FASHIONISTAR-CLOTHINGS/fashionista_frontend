"use client";

/**
 * @file VendorFollowButton.tsx
 * @description Follow/unfollow button for vendor storefronts.
 *
 * Psychological triggers:
 *   - Commitment: Following a vendor creates a relationship
 *   - Reciprocity: Vendor "gains" a follower, user gets updates
 *   - Social Proof: Follower count displayed on button
 *
 * Behavior:
 *   - Authenticated: Toggles follow via API
 *   - Anonymous: Redirects to sign-in with returnUrl
 *   - Optimistic update on click
 */

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiAsync } from "@/core/api/client.async";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { toast } from "sonner";

interface VendorFollowButtonProps {
  vendorSlug: string;
  vendorName: string;
  initialFollowerCount?: number;
}

export function VendorFollowButton({
  vendorSlug,
  vendorName,
  initialFollowerCount = 0,
}: VendorFollowButtonProps) {
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    const checkFollowStatus = async () => {
      try {
        const res = await apiAsync
          .get(`vendor/public/${vendorSlug}/follow-status/`)
          .json<{ following: boolean; follower_count: number }>();
        if (active) {
          setFollowing(res.following);
          setFollowerCount(res.follower_count);
        }
      } catch {
        // Silent fail — default to not following
      }
    };
    void checkFollowStatus();
    return () => { active = false; };
  }, [vendorSlug, accessToken]);

  const handleToggleFollow = async () => {
    if (!accessToken) {
      router.push(`/auth/sign-in?returnUrl=/vendors/${vendorSlug}`);
      return;
    }

    setLoading(true);
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setFollowerCount((prev) => prev + (wasFollowing ? -1 : 1));

    try {
      await apiAsync.post(`vendor/public/${vendorSlug}/toggle-follow/`, {
        json: {},
      });
      toast.success(
        wasFollowing
          ? `Unfollowed ${vendorName}`
          : `Now following ${vendorName}! ✓`
      );
    } catch {
      setFollowing(wasFollowing);
      setFollowerCount((prev) => prev + (wasFollowing ? 1 : -1));
      toast.error("Could not update follow status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3" data-testid="vendor-follow-button">
      <button
        type="button"
        onClick={handleToggleFollow}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
          following
            ? "border border-[#01454A]/20 bg-white text-[#01454A] hover:bg-[#01454A]/5"
            : "bg-[#01454A] text-white hover:bg-[#01454A]/90"
        }`}
        aria-pressed={following}
        aria-label={following ? `Unfollow ${vendorName}` : `Follow ${vendorName}`}
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : following ? (
          <UserCheck size={15} />
        ) : (
          <UserPlus size={15} />
        )}
        {following ? "Following" : "Follow"}
      </button>

      {followerCount > 0 && (
        <span className="text-xs text-muted-foreground font-medium">
          {followerCount.toLocaleString()} follower{followerCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
