"use client";

import type { ImageData } from "@/lib/types";
import { CATEGORIES } from "@/lib/colorCategories";

interface PhotoCardProps {
  img: ImageData;
  hoverColor: string;
  onColorChange: (color: string) => void;
  onSave: (e: React.MouseEvent, img: ImageData) => void;
  onCancel: (e: React.MouseEvent) => void;
  onReset: (e: React.MouseEvent, img: ImageData) => void;
  onDelete: (e: React.MouseEvent, id: string, storagePath: string | null) => void;
  isSaving: string | null;
  isResetting: string | null;
  mobileEditId: string | null;
  onMobileEdit: (img: ImageData) => void;
}

const overlayDropdown = (
  img: ImageData,
  hoverColor: string,
  onColorChange: (color: string) => void,
  onSave: (e: React.MouseEvent, img: ImageData) => void,
  onCancel: (e: React.MouseEvent) => void,
  onReset: (e: React.MouseEvent, img: ImageData) => void,
  isSaving: string | null,
  isResetting: string | null
) => (
  <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg space-y-2">
    <select
      value={hoverColor}
      onChange={(e) => onColorChange(e.target.value)}
      className="w-full text-[10px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
    >
      {CATEGORIES.map((cat) => (
        <option key={cat.name} value={cat.name}>
          {cat.name}
        </option>
      ))}
    </select>
    <div className="flex gap-1.5">
      <button
        onClick={(e) => onSave(e, img)}
        disabled={isSaving === img.id}
        className="flex-1 text-[10px] px-2 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isSaving === img.id ? "…" : "Save"}
      </button>
      <button
        onClick={onCancel}
        className="flex-1 text-[10px] px-2 py-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Cancel
      </button>
      {img.manual_color_override && (
        <button
          onClick={(e) => onReset(e, img)}
          disabled={isResetting === img.id}
          className="text-[10px] px-2 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isResetting === img.id ? "…" : "Reset"}
        </button>
      )}
    </div>
  </div>
);

export default function PhotoCard({
  img,
  hoverColor,
  onColorChange,
  onSave,
  onCancel,
  onReset,
  onDelete,
  isSaving,
  isResetting,
  mobileEditId,
  onMobileEdit,
}: PhotoCardProps) {
  return (
    <a
      href={`/photo/${img.id}`}
      className="block group mb-8 sm:mb-8"
      style={{ breakInside: "avoid", position: "relative", zIndex: 5 }}
    >
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative w-full" style={{ aspectRatio: "auto" }}>
          <img
            src={img.image_url}
            alt={img.name}
            className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
            Image not found
          </div>

          {/* manual badge — top-left */}
          {img.manual_color_override && (
            <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-medium rounded bg-amber-400/80 text-white">
              manual
            </span>
          )}

          {/* Mobile Edit button — always visible on small screens */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMobileEdit(img);
            }}
            className="md:hidden absolute bottom-2 left-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-gray-700 hover:bg-white transition-colors shadow-sm"
            title="Edit color"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Delete button — top-right, visible on hover */}
          <button
            onClick={(e) => onDelete(e, img.id, img.storage_path)}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-auto"
            title="Delete"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>

          {/* Hover color edit overlay — Desktop: CSS group-hover (always in DOM) */}
          <div className="hidden md:flex absolute inset-0 z-[10] pointer-events-none flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {overlayDropdown(
              img,
              hoverColor,
              onColorChange,
              onSave,
              onCancel,
              onReset,
              isSaving,
              isResetting
            )}
          </div>

          {/* Hover color edit overlay — Mobile: state-controlled */}
          {mobileEditId === img.id && (
            <div className="flex md:hidden absolute inset-0 z-[10] pointer-events-none flex-col justify-end p-3">
              {overlayDropdown(
                img,
                hoverColor,
                onColorChange,
                onSave,
                onCancel,
                onReset,
                isSaving,
                isResetting
              )}
            </div>
          )}
        </div>
      </div>

      {/* Color indicator dot + name below the card */}
      <div className="mt-1.5 px-1 flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block ring-1 ring-gray-200/50"
          style={{ backgroundColor: img.color_hex || "#ccc" }}
        />
        <span className="text-[11px] text-gray-400 leading-none">
          {img.visual_color || img.color_tags?.[0] || img.color_name}
        </span>
      </div>
    </a>
  );
}