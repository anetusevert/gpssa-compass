"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface BacklogItem {
  id: string;
  title: string;
  category: string;
  impact: string;
  effort: string;
  riceScore: number | null;
  wsjfScore: number | null;
  status: string;
  hasConceptSheet: boolean;
}

const impactVariant: Record<string, "green" | "gold" | "gray"> = {
  high: "green",
  medium: "gold",
  low: "gray",
};

function Row({
  item,
  rank,
  onOpenConcept,
}: {
  item: BacklogItem;
  rank: number;
  onOpenConcept: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto_auto] items-center gap-3 rounded-xl border border-border bg-navy-light/40 px-3 py-2.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-muted hover:text-cream active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <span className="w-5 text-center text-xs font-bold text-gold">{rank}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-cream">{item.title}</p>
        <p className="truncate text-xs text-gray-muted">{item.category}</p>
      </div>
      <Badge variant={impactVariant[item.impact] ?? "gray"} size="sm">
        I·{item.impact}
      </Badge>
      <Badge variant="gray" size="sm">
        E·{item.effort}
      </Badge>
      <span className="w-16 text-right text-sm font-semibold text-gpssa-green">
        {item.riceScore?.toLocaleString() ?? "—"}
      </span>
      <span className="w-14 text-right text-sm font-semibold text-teal-300">
        {item.wsjfScore ?? "—"}
      </span>
      <button
        onClick={() => onOpenConcept(item.id)}
        disabled={!item.hasConceptSheet}
        className={`rounded-lg p-1.5 transition-colors ${
          item.hasConceptSheet
            ? "text-gold hover:bg-white/5"
            : "cursor-not-allowed text-gray-muted/30"
        }`}
        title={item.hasConceptSheet ? "View concept sheet" : "No concept sheet"}
      >
        <FileText size={16} />
      </button>
    </div>
  );
}

interface BacklogTableProps {
  items: BacklogItem[];
  onReorder: (items: BacklogItem[]) => void;
  onOpenConcept: (id: string) => void;
}

export function BacklogTable({
  items,
  onReorder,
  onOpenConcept,
}: BacklogTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto_auto] gap-3 px-3 text-[10px] font-semibold uppercase tracking-wide text-gray-muted">
        <span className="w-4" />
        <span className="w-5 text-center">#</span>
        <span>Opportunity</span>
        <span>Impact</span>
        <span>Effort</span>
        <span className="w-16 text-right">RICE</span>
        <span className="w-14 text-right">WSJF</span>
        <span className="w-7" />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5">
            {items.map((item, idx) => (
              <Row
                key={item.id}
                item={item}
                rank={idx + 1}
                onOpenConcept={onOpenConcept}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
