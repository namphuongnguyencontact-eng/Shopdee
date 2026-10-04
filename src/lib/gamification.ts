import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { Badge, UserBadge } from "@/models/Badge";
import { Challenge, UserChallenge } from "@/models/Challenge";
import { getLevelInfo } from "@/lib/utils";

export interface AwardXPResult {
  previousXp: number;
  newXp: number;
  xpAwarded: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  levelTitle: string;
}

export async function awardXP(
  userId: string,
  amount: number,
  reason: string
): Promise<AwardXPResult | null> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return null;

  const previousXp = user.xp || 0;
  const previousLevel = user.level || 1;
  const newXp = previousXp + amount;
  const levelInfo = getLevelInfo(newXp);
  const newLevel = levelInfo.level;
  const leveledUp = newLevel > previousLevel;

  user.xp = newXp;
  user.level = newLevel;
  await user.save();

  // Create notification for XP
  await Notification.create({
    userId: user._id,
    title: leveledUp ? `🎉 LEVEL UP! Level ${newLevel}` : `✨ +${amount} XP Nhận được!`,
    message: leveledUp
      ? `Chúc mừng bạn đã đạt danh hiệu ${levelInfo.title}! Tiếp tục khám phá ShopDee nhé!`
      : `Bạn vừa nhận được ${amount} XP từ: ${reason}`,
    type: leveledUp ? "achievement" : "reward",
    link: "/profile",
  });

  return {
    previousXp,
    newXp,
    xpAwarded: amount,
    previousLevel,
    newLevel,
    leveledUp,
    levelTitle: levelInfo.title,
  };
}

export async function checkAndUnlockBadge(
  userId: string,
  badgeKey: string
): Promise<boolean> {
  await connectDB();
  const existing = await UserBadge.findOne({ userId, badgeKey });
  if (existing) return false;

  const badge = await Badge.findOne({ key: badgeKey });
  if (!badge) return false;

  await UserBadge.create({
    userId,
    badgeKey,
    unlockedAt: new Date(),
  });

  // Award XP from badge
  if (badge.xpReward > 0) {
    await awardXP(userId, badge.xpReward, `Mở khóa huy hiệu ${badge.name}`);
  }

  // Create notification
  await Notification.create({
    userId,
    title: `🏆 Huy hiệu mới: ${badge.name}`,
    message: `${badge.description} (+${badge.xpReward} XP)`,
    type: "achievement",
    link: "/profile",
  });

  return true;
}

export async function trackChallengeProgress(
  userId: string,
  challengeType: "VIEW_PRODUCTS" | "ADD_WISHLIST" | "ADD_CART" | "PLACE_ORDER" | "SHARE_ORDER" | "CLAIM_DAILY",
  increment: number = 1
): Promise<void> {
  await connectDB();

  const activeChallenges = await Challenge.find({
    type: challengeType,
    isActive: true,
  });

  for (const ch of activeChallenges) {
    let uc = await UserChallenge.findOne({ userId, challengeCode: ch.code });
    if (!uc) {
      uc = new UserChallenge({
        userId,
        challengeCode: ch.code,
        progress: 0,
        isCompleted: false,
        isClaimed: false,
      });
    }

    if (!uc.isCompleted) {
      uc.progress = (uc.progress || 0) + increment;
      if (uc.progress >= ch.targetCount) {
        uc.progress = ch.targetCount;
        uc.isCompleted = true;
        uc.completedAt = new Date();

        // Notification for completed challenge
        await Notification.create({
          userId,
          title: `🎯 Nhiệm vụ hoàn thành: ${ch.title}`,
          message: `Hãy vào mục Nhiệm vụ để nhận ${ch.xpReward} XP và ${ch.walletReward.toLocaleString("vi-VN")}₫!`,
          type: "achievement",
          link: "/challenges",
        });
      }
      await uc.save();
    }
  }
}
