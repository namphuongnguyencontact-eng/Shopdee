import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { Badge, UserBadge } from "@/models/Badge";
import { Challenge, UserChallenge } from "@/models/Challenge";
import { getSessionFromRequest } from "@/lib/auth";
import { getLevelInfo } from "@/lib/utils";
import { awardXP } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    await connectDB();

    const [allBadges, allChallenges] = await Promise.all([
      Badge.find().sort({ order: 1 }).lean(),
      Challenge.find({ isActive: true }).lean(),
    ]);

    if (!session) {
      return NextResponse.json({
        success: true,
        data: {
          levelInfo: getLevelInfo(0),
          xp: 0,
          level: 1,
          badges: allBadges.map((b) => ({ ...b, unlocked: false })),
          challenges: allChallenges.map((c) => ({ ...c, progress: 0, isCompleted: false, isClaimed: false })),
        },
      });
    }

    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: "Không tìm thấy người dùng." } }, { status: 404 });
    }

    const [userBadges, userChallenges] = await Promise.all([
      UserBadge.find({ userId: user._id }).lean(),
      UserChallenge.find({ userId: user._id }).lean(),
    ]);

    const unlockedBadgeKeys = new Set(userBadges.map((ub) => ub.badgeKey));
    const challengeProgressMap = new Map(userChallenges.map((uc) => [uc.challengeCode, uc]));

    const mergedBadges = allBadges.map((b) => {
      const ub = userBadges.find((u) => u.badgeKey === b.key);
      return {
        ...b,
        unlocked: unlockedBadgeKeys.has(b.key),
        unlockedAt: ub?.unlockedAt || null,
      };
    });

    const mergedChallenges = allChallenges.map((c) => {
      const uc = challengeProgressMap.get(c.code);
      return {
        ...c,
        progress: uc?.progress || 0,
        isCompleted: uc?.isCompleted || false,
        isClaimed: uc?.isClaimed || false,
      };
    });

    const levelInfo = getLevelInfo(user.xp || 0);

    return NextResponse.json({
      success: true,
      data: {
        xp: user.xp || 0,
        level: levelInfo.level,
        levelInfo,
        walletBalance: user.walletBalance,
        badges: mergedBadges,
        challenges: mergedChallenges,
      },
    });
  } catch (err: unknown) {
    console.error("Gamification GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải gamification." } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Chưa đăng nhập." } }, { status: 401 });
    }

    await connectDB();
    const { challengeCode } = await req.json();

    if (!challengeCode) {
      return NextResponse.json({ success: false, error: { message: "Thiếu mã nhiệm vụ." } }, { status: 400 });
    }

    const challenge = await Challenge.findOne({ code: challengeCode, isActive: true });
    if (!challenge) {
      return NextResponse.json({ success: false, error: { message: "Nhiệm vụ không tồn tại." } }, { status: 404 });
    }

    const uc = await UserChallenge.findOne({ userId: session.userId, challengeCode });
    if (!uc || !uc.isCompleted) {
      return NextResponse.json({ success: false, error: { message: "Nhiệm vụ chưa hoàn thành." } }, { status: 400 });
    }

    if (uc.isClaimed) {
      return NextResponse.json({ success: false, error: { message: "Phần thưởng đã được nhận rồi." } }, { status: 400 });
    }

    uc.isClaimed = true;
    uc.claimedAt = new Date();
    await uc.save();

    // Award XP
    await awardXP(session.userId, challenge.xpReward, `Hoàn thành nhiệm vụ "${challenge.title}"`);

    // Award Virtual Money
    const user = await User.findById(session.userId);
    if (user && challenge.walletReward > 0) {
      user.walletBalance += challenge.walletReward;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Đã nhận +${challenge.xpReward} XP và +${challenge.walletReward.toLocaleString("vi-VN")}₫ vào ví!`,
        xpReward: challenge.xpReward,
        walletReward: challenge.walletReward,
        walletBalance: user?.walletBalance,
      },
    });
  } catch (err: unknown) {
    console.error("Claim challenge error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi nhận thưởng." } }, { status: 500 });
  }
}
