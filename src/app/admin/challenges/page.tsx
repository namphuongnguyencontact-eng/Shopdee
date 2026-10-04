"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Sparkles,
  Zap,
} from "lucide-react";
import { formatVND } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";

interface ChallengeItem {
  _id: string;
  code: string;
  title: string;
  description: string;
  category: "DAILY" | "WEEKLY" | "MILESTONE" | "SPECIAL";
  type: string;
  targetCount: number;
  xpReward: number;
  walletReward: number;
  isActive: boolean;
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    code: "",
    title: "",
    description: "",
    category: "DAILY" as const,
    type: "ORDER_COUNT",
    targetCount: 1,
    xpReward: 100,
    walletReward: 200000,
  });
  const { addToast } = useToastStore();

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/challenges");
      const json = await res.json();
      if (json.success) {
        setChallenges(json.data);
      }
    } catch (err) {
      console.error("Failed to load challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleToggleActive = async (ch: ChallengeItem) => {
    try {
      const res = await fetch("/api/admin/challenges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ch._id, isActive: !ch.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setChallenges((prev) =>
          prev.map((c) => (c._id === ch._id ? { ...c, isActive: !ch.isActive } : c))
        );
        addToast("success", `Đã ${!ch.isActive ? "bật" : "tắt"} nhiệm vụ ${ch.title}`);
      }
    } catch {
      addToast("error", "Lỗi cập nhật nhiệm vụ");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa nhiệm vụ "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/challenges?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setChallenges((prev) => prev.filter((c) => c._id !== id));
        addToast("success", "Đã xóa nhiệm vụ");
      }
    } catch {
      addToast("error", "Lỗi xóa nhiệm vụ");
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallenge.code || !newChallenge.title) {
      addToast("error", "Vui lòng nhập đủ mã và tiêu đề nhiệm vụ");
      return;
    }

    try {
      const res = await fetch("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChallenge),
      });
      const json = await res.json();
      if (json.success) {
        addToast("success", "Đã tạo nhiệm vụ mới");
        setIsModalOpen(false);
        loadChallenges();
      } else {
        addToast("error", json.error?.message || "Lỗi tạo nhiệm vụ");
      }
    } catch {
      addToast("error", "Lỗi kết nối máy chủ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Quản Lý Nhiệm Vụ & Điểm XP
            <Trophy className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Điều chỉnh hệ thống Gamification, phần thưởng kinh nghiệm và số dư thưởng nhiệm vụ
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-colors flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-pink-600/25"
        >
          <Plus className="w-4 h-4" />
          Tạo Nhiệm Vụ Mới
        </button>
      </div>

      {/* Challenges Table */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-800/80 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Mã Code</th>
                <th className="py-3.5 px-4">Nhiệm Vụ</th>
                <th className="py-3.5 px-4">Phân Loại</th>
                <th className="py-3.5 px-4">Chỉ Tiêu</th>
                <th className="py-3.5 px-4">Thưởng XP</th>
                <th className="py-3.5 px-4">Thưởng Ví</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Đang tải danh sách nhiệm vụ...
                  </td>
                </tr>
              ) : challenges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Chưa có nhiệm vụ nào được cấu hình.
                  </td>
                </tr>
              ) : (
                challenges.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-pink-400">
                      {item.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{item.title}</div>
                      <div className="text-[10px] text-neutral-400 max-w-xs truncate">{item.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-white/5">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-200">
                      {item.targetCount} lần
                    </td>
                    <td className="py-3 px-4 font-bold text-yellow-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      +{item.xpReward} XP
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      +{formatVND(item.walletReward)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.isActive
                            ? "bg-green-500/20 text-green-300 border-green-500/40"
                            : "bg-white/5 text-neutral-500 border-white/10 hover:text-neutral-300"
                        }`}
                        title={item.isActive ? "Tạm ngưng" : "Kích hoạt"}
                      >
                        {item.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Xóa nhiệm vụ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Challenge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-sm text-white">Tạo Nhiệm Vụ Gamification</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Mã Nhiệm Vụ *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SHARE_3"
                    value={newChallenge.code}
                    onChange={(e) => setNewChallenge({ ...newChallenge, code: e.target.value.toUpperCase() })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Chu Kỳ</label>
                  <select
                    value={newChallenge.category}
                    onChange={(e) => setNewChallenge({ ...newChallenge, category: e.target.value as any })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="DAILY">Hàng Ngày (Daily)</option>
                    <option value="WEEKLY">Hàng Tuần (Weekly)</option>
                    <option value="MILESTONE">Cột Mốc (Milestone)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Tiêu Đề Nhiệm Vụ *</label>
                <input
                  type="text"
                  required
                  placeholder="Khoe Đơn 3 lần lên Story"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Mô Tả</label>
                <input
                  type="text"
                  placeholder="Chia sẻ đơn hàng để nhận thưởng kinh nghiệm"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Chỉ Tiêu</label>
                  <input
                    type="number"
                    min={1}
                    value={newChallenge.targetCount}
                    onChange={(e) => setNewChallenge({ ...newChallenge, targetCount: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Thưởng XP</label>
                  <input
                    type="number"
                    min={10}
                    value={newChallenge.xpReward}
                    onChange={(e) => setNewChallenge({ ...newChallenge, xpReward: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Thưởng Ví (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={newChallenge.walletReward}
                    onChange={(e) => setNewChallenge({ ...newChallenge, walletReward: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold"
                >
                  Tạo Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
