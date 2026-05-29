import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTaskModal } from '../components/AddTaskModal';
import type { Project } from '../types';

const projects: Project[] = [
  { id: 'p1', name: 'Work', color: '#CC3333', sortOrder: 0 },
  { id: 'p2', name: 'Personal', color: '#3A6B9F', sortOrder: 1 },
];

describe('AddTaskModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <AddTaskModal open={false} projects={projects} onClose={() => {}} onAdd={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders form when open', () => {
    render(<AddTaskModal open={true} projects={projects} onClose={() => {}} onAdd={() => {}} />);
    expect(screen.getByPlaceholderText("What's the wahala?")).toBeInTheDocument();
    expect(screen.getByText('Pin it')).toBeInTheDocument();
  });

  it('calls onAdd and onClose on valid submit', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddTaskModal open={true} projects={projects} onClose={onClose} onAdd={onAdd} />);

    await user.type(screen.getByPlaceholderText("What's the wahala?"), 'Fix the thing');
    await user.click(screen.getByText('Pin it'));

    expect(onAdd).toHaveBeenCalledWith('Fix the thing', undefined, 'now');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not submit empty title', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddTaskModal open={true} projects={projects} onClose={() => {}} onAdd={onAdd} />);

    expect(screen.getByText('Pin it')).toBeDisabled();
    await user.click(screen.getByText('Pin it'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('selects project chip', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddTaskModal open={true} projects={projects} onClose={() => {}} onAdd={onAdd} />);

    await user.click(screen.getByText('Work'));
    await user.type(screen.getByPlaceholderText("What's the wahala?"), 'Task');
    await user.click(screen.getByText('Pin it'));

    expect(onAdd).toHaveBeenCalledWith('Task', 'p1', 'now');
  });

  it('selects column chip', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddTaskModal open={true} projects={projects} onClose={() => {}} onAdd={onAdd} />);

    await user.click(screen.getByText('Later — distant'));
    await user.type(screen.getByPlaceholderText("What's the wahala?"), 'Task');
    await user.click(screen.getByText('Pin it'));

    expect(onAdd).toHaveBeenCalledWith('Task', undefined, 'later');
  });

  it('resets form after submit', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();
    const { rerender } = render(<AddTaskModal open={true} projects={projects} onClose={onClose} onAdd={onAdd} />);

    await user.type(screen.getByPlaceholderText("What's the wahala?"), 'Task');
    await user.click(screen.getByText('Later — distant'));
    await user.click(screen.getByText('Pin it'));

    expect(onAdd).toHaveBeenCalled();
    rerender(<AddTaskModal open={false} projects={projects} onClose={onClose} onAdd={onAdd} />);
    rerender(<AddTaskModal open={true} projects={projects} onClose={onClose} onAdd={onAdd} />);

    expect(screen.getByPlaceholderText("What's the wahala?")).toHaveValue('');
  });
});
