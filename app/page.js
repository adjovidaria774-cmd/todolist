"use client";

import { useState, useRef } from "react";

// Les 5 colonnes du tableau, dans l'ordre (elles sont fixes)
// Chaque colonne a ses couleurs pastel : fond, bandeau, pastille, bord des cartes
const COLUMNS = [
  { id: "todo", label: "Todo", dot: "bg-[#8FA2E8]", head: "bg-[#DCE3F8]", edge: "border-l-[#8FA2E8]" },
  { id: "pending", label: "Pending", dot: "bg-[#F4B26B]", head: "bg-[#FFE3C7]", edge: "border-l-[#F4B26B]" },
  { id: "review", label: "In review", dot: "bg-[#7CC4EC]", head: "bg-[#CDEAF8]", edge: "border-l-[#7CC4EC]" },
  { id: "done", label: "Done", dot: "bg-[#7FD3A0]", head: "bg-[#D0EEDA]", edge: "border-l-[#7FD3A0]" },
  { id: "archived", label: "Archived", dot: "bg-[#B9A8D2]", head: "bg-[#E5DEEE]", edge: "border-l-[#B9A8D2]" },
];

// Couleur de chaque étiquette
const TAG_COLORS = {
  Design: "bg-[#EADDFB] text-[#5E3A94]",
  Backend: "bg-[#D9E6FB] text-[#2F508F]",
  Frontend: "bg-[#FBDDE8] text-[#93335A]",
  DevOps: "bg-[#D6F1E0] text-[#2A6A44]",
  Général: "bg-[#F3EBDD] text-[#7A6232]",
};

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
const PencilIcon = () => (
  <Icon>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
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
    "rounded-lg p-1 text-[#6B6580] transition hover:bg-[#F1EBFB] hover:text-[#2D2A3E] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="min-h-screen bg-[#FBF9FE] text-[#2D2A3E]">
      {/* ---------- En-tête ---------- */}
      <header className="flex items-center justify-between border-b border-[#ECE6F5] bg-white/70 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#CDBDF2] text-sm font-bold text-[#3F2E73]">
            T
          </div>
          <span className="font-semibold">Tableau</span>
          <span className="text-[#B5AEC8]">/</span>
          <span className="text-sm text-[#6B6580]">Mes tâches</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#F1EBFB] px-3 py-1 text-xs text-[#5B4A78]">
            {tasks.length} tâche{tasks.length > 1 ? "s" : ""}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBDDE8] text-xs font-medium text-[#93335A]">
            ID
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* ---------- Recherche + nouvelle tâche ---------- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-96">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9A93B0]">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full rounded-xl border border-[#E6DFF2] bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-[#A9A2BC] focus:border-[#B9A8D2] focus:ring-4 focus:ring-[#EADDFB]"
            />
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Nouvelle tâche..."
              className="w-full rounded-xl border border-[#E6DFF2] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#A9A2BC] focus:border-[#B9A8D2] focus:ring-4 focus:ring-[#EADDFB] sm:w-96"
            />
            <button
              onClick={addTask}
              disabled={!newTitle.trim()}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#CDBDF2] px-4 py-2.5 text-sm font-medium text-[#3F2E73] transition hover:bg-[#BFAAEE] disabled:cursor-not-allowed disabled:bg-[#EEE9F6] disabled:text-[#A9A2BC]"
            >
              <PlusIcon /> Ajouter
            </button>
          </div>
        </div>

        {/* ---------- Résumé par statut ---------- */}
        <div className="mt-5 flex flex-wrap gap-1.5 rounded-2xl border border-[#ECE6F5] bg-white/60 p-1.5">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className={`flex min-w-[8rem] flex-1 items-center justify-center gap-2 rounded-xl py-1.5 text-sm text-[#2D2A3E] ${col.head}`}
            >
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              {col.label}
              <span className="text-[#6B6580]">
                {visibleTasks.filter((t) => t.status === col.id).length}
              </span>
            </div>
          ))}
        </div>

        {/* ---------- Colonnes (défilent de gauche à droite) ---------- */}
        <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
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
                className={`flex h-[calc(100vh-19rem)] min-h-[28rem] w-[85vw] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#E6DFF2] bg-white transition sm:w-80 ${
                  isOver ? "ring-4 ring-[#CDBDF2]" : ""
                }`}
              >
                <div className={`flex items-center justify-between px-4 py-3 ${col.head}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    {col.label}
                  </div>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-[#6B6580]">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
                  {columnTasks.map((task) => (
                    <article
                      key={task.id}
                      draggable={editingId !== task.id}
                      onDragStart={() => setDraggedId(task.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setOverColumn(null);
                      }}
                      className={`cursor-grab rounded-xl border border-l-4 border-[#ECE6F5] bg-white p-3 shadow-[0_2px_8px_rgba(120,100,170,0.08)] transition hover:shadow-[0_4px_14px_rgba(120,100,170,0.16)] active:cursor-grabbing ${col.edge} ${
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
                          className="w-full rounded-lg border border-[#B9A8D2] bg-[#FBF9FE] px-2 py-1 text-sm font-medium outline-none focus:ring-4 focus:ring-[#EADDFB]"
                        />
                      ) : (
                        <p
                          onDoubleClick={() => startEdit(task)}
                          className="text-sm font-medium leading-snug"
                        >
                          {task.title}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            TAG_COLORS[task.tag] || TAG_COLORS["Général"]
                          }`}
                        >
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
                            onClick={() => startEdit(task)}
                            aria-label="Modifier le nom de la tâche"
                            className={actionBtn}
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            aria-label="Supprimer la tâche"
                            className={`${actionBtn} hover:!bg-[#FDE4EB] hover:!text-[#B0305A]`}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}

                  {columnTasks.length === 0 && (
                    <p className="mt-2 text-center text-xs text-[#9A93B0]">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2A3E]/30 p-4"
          onClick={() => setTaskToDelete(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold">Supprimer cette tâche ?</h2>
            <p className="mt-2 text-sm text-[#6B6580]">
              « {taskToDelete.title} » sera supprimée définitivement.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="rounded-xl bg-[#F1EBFB] px-4 py-2 text-sm text-[#5B4A78] hover:bg-[#E7DEF6]"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-[#F7B8C8] px-4 py-2 text-sm font-medium text-[#7A1F42] hover:bg-[#F3A3B8]"
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