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

function makeStories(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Story ${i + 1}`,
    url: `https://example.com/${i + 1}`,
    score: 100 - i,
    by: `user${i + 1}`,
  }));
}

function mockFetch(idsResponse, itemResponse) {
  const items = Array.isArray(itemResponse) ? itemResponse : [itemResponse];
  const mock = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(idsResponse),
  });
  items.forEach((item) => {
    mock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(item),
    });
  });
  global.fetch = mock;
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

test('shows only PAGE_SIZE stories per page', async () => {
  const stories = makeStories(8);
  mockFetch(stories.map((s) => s.id), stories);
  render(<App />);

  await waitFor(() => screen.getByText('Story 1'));

  // Should show first 6 stories (PAGE_SIZE = 6)
  for (let i = 1; i <= 6; i++) {
    expect(screen.getByText(`Story ${i}`)).toBeInTheDocument();
  }
  expect(screen.queryByText('Story 7')).not.toBeInTheDocument();
});

test('Previous button is disabled on first page', async () => {
  const stories = makeStories(8);
  mockFetch(stories.map((s) => s.id), stories);
  render(<App />);

  await waitFor(() => screen.getByText('Story 1'));

  expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
});

test('Next button navigates to second page', async () => {
  const stories = makeStories(8);
  mockFetch(stories.map((s) => s.id), stories);
  render(<App />);

  await waitFor(() => screen.getByText('Story 1'));

  await userEvent.click(screen.getByRole('button', { name: /next/i }));

  expect(screen.getByText('Story 7')).toBeInTheDocument();
  expect(screen.queryByText('Story 1')).not.toBeInTheDocument();
});

test('Next button is disabled on last page', async () => {
  const stories = makeStories(8);
  mockFetch(stories.map((s) => s.id), stories);
  render(<App />);

  await waitFor(() => screen.getByText('Story 1'));

  await userEvent.click(screen.getByRole('button', { name: /next/i }));

  expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
});

test('page counter displays correct values', async () => {
  const stories = makeStories(8);
  mockFetch(stories.map((s) => s.id), stories);
  render(<App />);

  await waitFor(() => screen.getByText('Story 1'));

  // 8 stories / 6 per page = 2 pages
  expect(screen.getByText('1 / 2')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  expect(screen.getByText('2 / 2')).toBeInTheDocument();
});

test('Previous button navigates back', async () => {
  const stories = makeStories(8);
  mockFetch(stories.map((s) => s.id), stories);
  render(<App />);

  await waitFor(() => screen.getByText('Story 1'));

  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  expect(screen.queryByText('Story 1')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /previous/i }));
  expect(screen.getByText('Story 1')).toBeInTheDocument();
});
