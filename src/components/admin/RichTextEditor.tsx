"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Eye,
  Edit3,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập mô tả chi tiết sản phẩm chuẩn SEO...",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    const newValue =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const handleHeading2 = () => insertTag("<h2>", "</h2>\n");
  const handleHeading3 = () => insertTag("<h3>", "</h3>\n");
  const handleBold = () => insertTag("<strong>", "</strong>");
  const handleItalic = () => insertTag("<em>", "</em>");
  const handleBulletList = () =>
    insertTag("<ul>\n  <li>", "</li>\n  <li>Mục 2</li>\n</ul>\n");
  const handleNumberedList = () =>
    insertTag("<ol>\n  <li>", "</li>\n  <li>Bước 2</li>\n</ol>\n");
  const handleQuote = () => insertTag("<blockquote>", "</blockquote>\n");
  const handleHr = () => insertTag("<hr />\n");
  const handleLink = () => {
    const url = prompt("Nhập link liên kết (URL):", "https://");
    if (url) {
      insertTag(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, "</a>");
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-subtle focus-within:border-blue-500 transition">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center flex-wrap gap-1">
          <button
            type="button"
            onClick={handleHeading2}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Tiêu đề H2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleHeading3}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Tiêu đề H3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={handleBold}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer font-bold"
            title="In đậm (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleItalic}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer italic"
            title="In nghiêng (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={handleBulletList}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Danh sách gạch đầu dòng"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNumberedList}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Danh sách đánh số"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleQuote}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Trích dẫn (Quote)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleHr}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Đường phân cách (HR)"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleLink}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Chèn liên kết"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-0.5 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
              activeTab === "edit" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Soạn thảo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
              activeTab === "preview" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Xem trước
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {activeTab === "edit" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className="w-full p-4 font-mono text-xs text-slate-800 leading-relaxed outline-none resize-y"
        />
      ) : (
        <div className="p-6 min-h-[280px] bg-white">
          {value.trim() ? (
            <div
              className="prose prose-sm max-w-none text-slate-700 leading-relaxed product-rich-description"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs italic">
              Chưa có nội dung mô tả để xem trước.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
