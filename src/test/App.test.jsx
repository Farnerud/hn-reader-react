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
