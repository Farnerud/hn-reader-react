import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const mockStory = {
  id: 1,
  title: 'Test HN Story',
  url: 'https://example.com',
  score: 100,
  by: 'testuser',
};

function mockFetch(idsResponse, itemResponse) {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(idsResponse),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(itemResponse),
    });
}

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

test('shows loading state initially', () => {
  mockFetch([1], mockStory);
  render(<App />);
  expect(screen.getByText('Cargando noticias...')).toBeInTheDocument();
});

test('renders stories after fetch resolves', async () => {
  mockFetch([1], mockStory);
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('Test HN Story')).toBeInTheDocument();
  });
  expect(screen.queryByText('Cargando noticias...')).not.toBeInTheDocument();
});

test('shows error message when top stories fetch fails', async () => {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    status: 500,
  });
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });
  expect(screen.getByText('Error del servidor: 500')).toBeInTheDocument();
});

test('theme toggle button switches between sun and moon icons', async () => {
  mockFetch([1], mockStory);
  render(<App />);
  await waitFor(() => screen.getByText('Test HN Story'));

  const toggle = screen.getByRole('button', { name: /toggle theme/i });
  // Default: light mode (matchMedia returns false), moon icon shown
  expect(document.documentElement.classList.contains('dark')).toBe(false);

  await userEvent.click(toggle);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
});

test('respects saved dark theme from localStorage', () => {
  localStorage.setItem('theme', 'dark');
  mockFetch([1], mockStory);
  render(<App />);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
});

test('retry button reloads stories after error', async () => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([1]) })
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockStory) });

  render(<App />);
  await waitFor(() => screen.getByText('Reintentar'));

  await userEvent.click(screen.getByText('Reintentar'));

  await waitFor(() => {
    expect(screen.getByText('Test HN Story')).toBeInTheDocument();
  });
});
