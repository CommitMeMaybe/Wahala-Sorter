import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../components/TaskCard';
import type { Task, ColumnId, Project } from '../types';

const baseTask: Task = {
  id: 't1',
  title: 'Test task',
  column: 'now',
  createdAt: Date.now() - 3600000,
  recurrence: 'none',
  subtasks: [],
  tags: [],
  sortOrder: 0,
  notes: '',
};

const columns: ColumnId[] = ['now', 'soon', 'later'];
const projects: Project[] = [
  { id: 'p1', name: 'Work', color: '#CC3333', sortOrder: 0 },
];

function renderTaskCard(overrides: Partial<Parameters<typeof TaskCard>[0]> = {}) {
  const props = {
    task: baseTask,
    now: Date.now(),
    columns,
    projects,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onMove: vi.fn(),
    onUpdate: vi.fn(),
    onDragStart: vi.fn() as (e: React.DragEvent, id: string) => void,
    onDragEnd: vi.fn(),
    ...overrides,
  };
  return { ...render(<TaskCard {...props} />), props };
}

describe('TaskCard expanded panel', () => {
  beforeEach(() => {
    window.innerWidth = 1024;
  });

  it('renders task title', () => {
    renderTaskCard();
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('shows expand button', () => {
    renderTaskCard();
    expect(screen.getByLabelText('Expand')).toBeInTheDocument();
  });

  it('expands details panel on click', async () => {
    const user = userEvent.setup();
    renderTaskCard();
    await user.click(screen.getByLabelText('Expand'));
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Est. minutes')).toBeInTheDocument();
    expect(screen.getByText(/Mark done/)).toBeInTheDocument();
  });

  it('collapses details panel when expand button clicked again', async () => {
    const user = userEvent.setup();
    renderTaskCard();
    await user.click(screen.getByLabelText('Expand'));
    expect(screen.getByText('Notes')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Collapse'));
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  it('shows date picker when expanded', async () => {
    const user = userEvent.setup();
    const { container } = renderTaskCard();
    await user.click(screen.getByLabelText('Expand'));
    expect(screen.getByText('Due')).toBeInTheDocument();
    expect(container.querySelector('input[type="date"]')).toBeInTheDocument();
  });

  it('calls onUpdate when marking done', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    renderTaskCard({ onUpdate });
    await user.click(screen.getByLabelText('Expand'));
    await user.click(screen.getByText(/Mark done/));
    expect(onUpdate).toHaveBeenCalledWith('t1', expect.objectContaining({ completedAt: expect.any(Number) }));
  });

  it('calls onUpdate when notes change', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const task = { ...baseTask, notes: '' };
    renderTaskCard({ task, onUpdate });
    await user.click(screen.getByLabelText('Expand'));
    const notesInput = screen.getByPlaceholderText('Add notes...');
    fireEvent.change(notesInput, { target: { value: 'Some notes' } });
    expect(onUpdate).toHaveBeenCalledWith('t1', { notes: 'Some notes' });
  });

  it('calls onUpdate when estimated minutes change', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    renderTaskCard({ onUpdate });
    await user.click(screen.getByLabelText('Expand'));
    const estInput = screen.getByPlaceholderText('0');
    fireEvent.change(estInput, { target: { value: '30' } });
    expect(onUpdate).toHaveBeenCalledWith('t1', { estimatedMinutes: 30 });
  });

  it('shows subtask list when expanded', async () => {
    const task: Task = {
      ...baseTask,
      subtasks: [
        { id: 's1', title: 'Subtask 1', done: false },
        { id: 's2', title: 'Subtask 2', done: true },
      ],
    };
    const user = userEvent.setup();
    renderTaskCard({ task });
    await user.click(screen.getByLabelText('Expand'));
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 2')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('does not show mark done button for completed tasks', async () => {
    const task = { ...baseTask, completedAt: Date.now() };
    const user = userEvent.setup();
    renderTaskCard({ task });
    await user.click(screen.getByLabelText('Expand'));
    expect(screen.queryByText('Mark done')).not.toBeInTheDocument();
  });

  it('shows overdue indicator', () => {
    const task = { ...baseTask, dueDate: Date.now() - 86400000 };
    const { container } = renderTaskCard({ task });
    expect(container.firstChild).toHaveClass('task--overdue');
  });

  it('shows completed styling', () => {
    const task = { ...baseTask, completedAt: Date.now() };
    const { container } = renderTaskCard({ task });
    expect(container.firstChild).toHaveClass('task--completed');
  });
});
