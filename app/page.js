"use client";

import { useState, useRef } from "react";

// Les 5 colonnes du tableau, dans l'ordre (elles sont fixes)
// Design neutre : seule la petite pastille (dot) est colorée
const COLUMNS = [
  { id: "todo", label: "Todo", dot: "bg-[#6B7280]" },
  { id: "pending", label: "Pending", dot: "bg-[#EA580C]" },
  { id: "review", label: "In review", dot: "bg-[#2563EB]" },
  { id: "done", label: "Done", dot: "bg-[#16A34A]" },
  { id: "archived", label: "Archived", dot: "bg-[#9CA3AF]" },
];

// Toutes les étiquettes sont grises
const TAG_STYLE = "bg-[#F3F4F6] text-[#4B5563]";

const INITIAL_TASKS = [
  { id: 1, title: "Maquetter la page d'accueil", tag: "Design", status: "todo" },
  { id: 2, title: "Rédiger les specs de l'API", tag: "Backend", status: "todo" },
  { id: 3, title: "Configurer l'authentification", tag: "Backend", status: "pending" },
  { id: 4, title: "Intégrer le formulaire de contact", tag: "Frontend", status: "pending" },
  { id: 5, title: "Revoir les composants de boutons", tag: "Design", status: "review" },
  { id: 6, title: "Mettre en place la CI", tag: "DevOps", status: "done" },
  { id: 7, title: "Initialiser le dépôt", tag: "DevOps", status: "done" },
  { id: 8, title: "Ancienne maquette v1", tag: "Design", status: "archived" },
];

// ---------- Petites icônes (pas besoin d'installer quoi que ce soit) ----------
function Icon({ children, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);
const PlusIcon = () => (
  <Icon>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
const LeftIcon = () => (
  <Icon>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);
const RightIcon = () => (
  <Icon>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);
const TrashIcon = () => (
  <Icon>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
  </Icon>
);

export default function Page() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");

  // Drag and drop
  const [draggedId, setDraggedId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  // Tâche en attente de confirmation de suppression
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Modification du nom d'une tâche
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const cancelled = useRef(false);

  // ---------- Actions ----------
  function addTask() {
    const title = newTitle.trim();
    if (!title) return;
    setTasks([...tasks, { id: Date.now(), title, tag: "Général", status: "todo" }]);
    setNewTitle("");
  }

  function moveTask(id, newStatus) {
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  }

  // Flèches : décaler d'une colonne vers la gauche (-1) ou la droite (+1)
  function shiftTask(task, direction) {
    const index = COLUMNS.findIndex((c) => c.id === task.status);
    const target = COLUMNS[index + direction];
    if (target) moveTask(task.id, target.id);
  }

  function startEdit(task) {
    cancelled.current = false;
    setEditingId(task.id);
    setEditText(task.title);
  }

  function saveEdit() {
    if (cancelled.current) return;
    const title = editText.trim();
    // Si le champ est vide, on garde l'ancien nom
    if (title) {
      setTasks((current) =>
        current.map((t) => (t.id === editingId ? { ...t, title } : t))
      );
    }
    setEditingId(null);
  }

  function cancelEdit() {
    cancelled.current = true;
    setEditingId(null);
  }

  function confirmDelete() {
    setTasks((current) => current.filter((t) => t.id !== taskToDelete.id));
    setTaskToDelete(null);
  }

  function handleDrop(columnId) {
    if (draggedId !== null) moveTask(draggedId, columnId);
    setDraggedId(null);
    setOverColumn(null);
  }

  // Recherche : on filtre par titre
  const visibleTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Bouton d'action d'une carte (flèches, crayon, corbeille)
  const actionBtn =
    "rounded-lg p-1 text-[#4B5563] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#111827]">
      {/* ---------- En-tête ---------- */}
      <header className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] text-sm font-bold text-white">
            T
          </div>
          <span className="font-semibold">Tableau</span>
          <span className="text-[#D1D5DB]">/</span>
          <span className="text-sm text-[#6B7280]">Mes tâches</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs text-[#6B7280]">
            {tasks.length} tâche{tasks.length > 1 ? "s" : ""}
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB] text-xs font-medium text-[#4B5563]">
            ID
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* ---------- Recherche + nouvelle tâche ---------- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-[28rem]">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-3 text-sm outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] focus:ring-4 focus:ring-[#E2E8F0]"
            />
          </div>

          <div className="flex w-full gap-3 sm:w-auto">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Nouvelle tâche..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] focus:ring-4 focus:ring-[#E2E8F0] sm:w-[28rem]"
            />
            <button
              onClick={addTask}
              disabled={!newTitle.trim()}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#64748B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#475569] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
            >
              <PlusIcon /> Ajouter
            </button>
          </div>
        </div>

        {/* ---------- Résumé par statut ---------- */}
        <div className="mt-5 flex flex-wrap gap-1.5 rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] p-1.5">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className="flex min-w-[8rem] flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2 text-sm text-[#374151] shadow-sm"
            >
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              {col.label}
              <span className="text-[#9CA3AF]">
                {visibleTasks.filter((t) => t.status === col.id).length}
              </span>
            </div>
          ))}
        </div>

        {/* ---------- Colonnes (défilent de gauche à droite) ---------- */}
        <div className="mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {COLUMNS.map((col, colIndex) => {
            const columnTasks = visibleTasks.filter((t) => t.status === col.id);
            const isOver = overColumn === col.id;

            return (
              <section
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverColumn(col.id);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setOverColumn(null);
                }}
                onDrop={() => handleDrop(col.id)}
                className={`flex h-[calc(100vh-19rem)] min-h-[28rem] w-[85vw] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] transition sm:w-[25rem] ${
                  isOver ? "ring-4 ring-[#CBD5E1]" : ""
                }`}
              >
                <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    {col.label}
                  </div>
                  <span className="rounded-full border border-[#E5E7EB] bg-white px-2 py-0.5 text-xs text-[#6B7280]">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
                  {columnTasks.map((task) => (
                    <article
                      key={task.id}
                      draggable={editingId !== task.id}
                      onDragStart={() => setDraggedId(task.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setOverColumn(null);
                      }}
                      className={`cursor-grab rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] active:cursor-grabbing ${
                        draggedId === task.id ? "opacity-40" : ""
                      }`}
                    >
                      {editingId === task.id ? (
                        <input
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          className="w-full rounded-lg border border-[#94A3B8] bg-[#F8F9FB] px-2 py-1 text-sm outline-none focus:ring-4 focus:ring-[#E2E8F0]"
                        />
                      ) : (
                        <p
                          onDoubleClick={() => startEdit(task)}
                          className="text-sm leading-snug"
                        >
                          {task.title}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`rounded-md px-2 py-0.5 text-xs ${TAG_STYLE}`}>
                          {task.tag}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => shiftTask(task, -1)}
                            disabled={colIndex === 0}
                            aria-label="Colonne précédente"
                            className={actionBtn}
                          >
                            <LeftIcon />
                          </button>
                          <button
                            onClick={() => shiftTask(task, 1)}
                            disabled={colIndex === COLUMNS.length - 1}
                            aria-label="Colonne suivante"
                            className={actionBtn}
                          >
                            <RightIcon />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            aria-label="Supprimer la tâche"
                            className={`${actionBtn} hover:!bg-[#FEE2E2] hover:!text-[#B91C1C]`}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}

                  {columnTasks.length === 0 && (
                    <p className="mt-2 text-center text-xs text-[#9CA3AF]">
                      Glisse une tâche ici
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* ---------- Fenêtre de confirmation de suppression ---------- */}
      {taskToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/30 p-4"
          onClick={() => setTaskToDelete(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold">Supprimer cette tâche ?</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              « {taskToDelete.title} » sera supprimée définitivement.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="rounded-xl bg-[#F3F4F6] px-4 py-2 text-sm text-[#374151] hover:bg-[#E5E7EB]"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-[#DC2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#B91C1C]"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}