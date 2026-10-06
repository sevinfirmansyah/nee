/*
 * Penghubung antara logika (src/todo.js) dan tampilan (index.html).
 * Data disimpan di localStorage browser, jadi tetap ada setelah halaman
 * ditutup — tetapi hanya di browser dan perangkat yang sama.
 */
(function () {
  'use strict';

  const T = window.TodoLogic;
  const STORAGE_KEY = 'nee.daftar-tugas';

  const form = document.getElementById('form-tambah');
  const input = document.getElementById('input-tugas');
  const toolbar = document.getElementById('alat');
  const filterButtons = document.querySelectorAll('[data-filter]');
  const list = document.getElementById('daftar');
  const emptyMessage = document.getElementById('kosong');
  const footer = document.getElementById('kaki');
  const remaining = document.getElementById('sisa');
  const clearButton = document.getElementById('hapus-selesai');

  const EMPTY_MESSAGES = {
    semua: 'Belum ada tugas. Tambahkan tugas pertamamu di atas!',
    aktif: 'Tidak ada tugas aktif. Kerja bagus!',
    selesai: 'Belum ada tugas yang selesai.',
  };

  let todos = load();
  let filter = 'semua';
  let editingId = null;

  // ---------- Penyimpanan ----------

  function load() {
    try {
      return T.deserialize(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, T.serialize(todos));
    } catch (e) {
      // Penyimpanan tidak tersedia (mode privat, penuh, dsb).
      // Aplikasi tetap jalan; data hanya hilang saat halaman ditutup.
    }
  }

  /** Mengganti daftar tugas lalu menyimpan dan menggambar ulang. */
  function commit(next, focusHint) {
    if (next === todos) return false;
    todos = next;
    save();
    render(focusHint);
    return true;
  }

  // ---------- Tampilan ----------

  function el(tag, props, children) {
    const node = document.createElement(tag);
    Object.assign(node, props);
    for (const child of children || []) node.append(child);
    return node;
  }

  function renderItem(todo) {
    const li = el('li', { className: 'tugas' + (todo.done ? ' selesai' : '') });
    li.dataset.id = todo.id;

    if (todo.id === editingId) {
      li.classList.add('sedang-ubah');
      const editInput = el('input', {
        type: 'text',
        className: 'input-ubah',
        value: todo.text,
        maxLength: T.MAX_LENGTH,
        required: true,
      });
      editInput.dataset.role = 'ubah-input';
      editInput.setAttribute('aria-label', 'Ubah teks tugas');

      const cancel = el('button', { type: 'button', className: 'tombol-sekunder', textContent: 'Batal' });
      cancel.dataset.role = 'batal';

      const editForm = el('form', { className: 'form-ubah' }, [
        editInput,
        el('button', { type: 'submit', textContent: 'Simpan' }),
        cancel,
      ]);
      editForm.dataset.role = 'form-ubah';
      li.append(editForm);
      return li;
    }

    const checkboxId = 'cek-' + todo.id;
    const checkbox = el('input', { type: 'checkbox', id: checkboxId, checked: todo.done });
    checkbox.dataset.role = 'toggle';

    const label = el('label', { className: 'teks', htmlFor: checkboxId, textContent: todo.text });

    const editButton = el('button', { type: 'button', className: 'ikon', textContent: '✏️' });
    editButton.dataset.role = 'ubah';
    editButton.title = 'Ubah';
    editButton.setAttribute('aria-label', 'Ubah tugas: ' + todo.text);

    const deleteButton = el('button', { type: 'button', className: 'ikon', textContent: '🗑️' });
    deleteButton.dataset.role = 'hapus';
    deleteButton.title = 'Hapus';
    deleteButton.setAttribute('aria-label', 'Hapus tugas: ' + todo.text);

    li.append(checkbox, label, editButton, deleteButton);
    return li;
  }

  /**
   * Menggambar ulang seluruh daftar. Fokus keyboard dikembalikan ke elemen
   * yang setara supaya pengguna keyboard/pembaca layar tidak "tersesat".
   * `focusHint` bisa dipakai untuk memaksa fokus ke tugas & tombol tertentu.
   */
  function render(focusHint) {
    if (editingId && !todos.some((t) => t.id === editingId)) editingId = null;

    const focus = focusHint || currentFocus();
    const visible = T.filterTodos(todos, filter);

    list.replaceChildren(...visible.map(renderItem));

    const hasTodos = todos.length > 0;
    toolbar.hidden = !hasTodos;
    footer.hidden = !hasTodos;

    emptyMessage.hidden = visible.length > 0;
    emptyMessage.textContent = hasTodos ? EMPTY_MESSAGES[filter] : EMPTY_MESSAGES.semua;

    for (const button of filterButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    }

    const active = T.countActive(todos);
    remaining.textContent = active === 0 ? 'Semua tugas selesai 🎉' : active + ' tugas tersisa';
    clearButton.disabled = T.countDone(todos) === 0;

    restoreFocus(focus);
  }

  function currentFocus() {
    const active = document.activeElement;
    if (!active || !list.contains(active)) return null;
    const item = active.closest('li.tugas');
    if (!item) return null;
    return {
      id: item.dataset.id,
      role: active.dataset.role,
      index: Array.prototype.indexOf.call(list.children, item),
    };
  }

  function restoreFocus(focus) {
    if (!focus) return;
    const items = Array.from(list.children);
    if (items.length === 0) {
      input.focus();
      return;
    }
    // Tugasnya masih ada → fokus ke elemen yang sama. Kalau sudah hilang
    // (dihapus atau tersaring), fokus ke tugas yang kini ada di posisinya.
    const item =
      items.find((li) => li.dataset.id === focus.id) ||
      items[Math.min(focus.index, items.length - 1)];
    const target =
      item.querySelector('[data-role="' + focus.role + '"]') ||
      item.querySelector('input, button');
    if (target) target.focus();
  }

  // ---------- Interaksi ----------

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = T.addTodo(todos, input.value);
    if (next === todos) {
      input.value = '';
      input.focus();
      return;
    }
    // Tugas baru selalu belum selesai, jadi pastikan ia terlihat.
    if (filter === 'selesai') filter = 'semua';
    input.value = '';
    commit(next);
    input.focus();
  });

  for (const button of filterButtons) {
    button.addEventListener('click', () => {
      filter = button.dataset.filter;
      editingId = null;
      render();
    });
  }

  clearButton.addEventListener('click', () => {
    commit(T.clearCompleted(todos));
  });

  list.addEventListener('change', (event) => {
    if (event.target.dataset.role !== 'toggle') return;
    const id = event.target.closest('li.tugas').dataset.id;
    commit(T.toggleTodo(todos, id));
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-role]');
    if (!button) return;
    const id = button.closest('li.tugas').dataset.id;

    if (button.dataset.role === 'hapus') {
      commit(T.removeTodo(todos, id));
    } else if (button.dataset.role === 'ubah') {
      startEditing(id);
    } else if (button.dataset.role === 'batal') {
      stopEditing(id);
    }
  });

  list.addEventListener('submit', (event) => {
    if (event.target.dataset.role !== 'form-ubah') return;
    event.preventDefault();
    const id = event.target.closest('li.tugas').dataset.id;
    const text = event.target.querySelector('[data-role="ubah-input"]').value;
    const focusHint = { id, role: 'ubah', index: 0 };
    editingId = null;
    if (!commit(T.editTodo(todos, id, text), focusHint)) render(focusHint);
  });

  list.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.target.dataset.role !== 'ubah-input') return;
    stopEditing(event.target.closest('li.tugas').dataset.id);
  });

  function startEditing(id) {
    editingId = id;
    render({ id, role: 'ubah-input', index: 0 });
    const editInput = list.querySelector('[data-role="ubah-input"]');
    if (editInput) editInput.select();
  }

  function stopEditing(id) {
    editingId = null;
    render({ id, role: 'ubah', index: 0 });
  }

  // Sinkron dengan tab lain yang membuka aplikasi yang sama.
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    // Jangan buang teks yang sedang diketik di kolom ubah.
    const draft = list.querySelector('[data-role="ubah-input"]');
    const draftValue = draft ? draft.value : null;
    todos = load();
    render();
    const newDraft = list.querySelector('[data-role="ubah-input"]');
    if (newDraft && draftValue !== null) newDraft.value = draftValue;
  });

  render();
})();
