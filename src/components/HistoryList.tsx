"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DealHistoryItem } from "@/utils/historyStore";
import { HistoryCard } from "./HistoryCard";

interface HistoryListProps {
  items: DealHistoryItem[];
  onView: (item: DealHistoryItem) => void;
  onDelete: (id: string) => void;
}

export function HistoryList({ items, onView, onDelete }: HistoryListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <HistoryCard
            key={item.id}
            item={item}
            onView={onView}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
