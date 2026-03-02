import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

const mockStory = {
  id: 1,
  title: 'Test HN Story',
  url: 'https://example.com',
  score: 100,
  by: 'testuser',
};

function setupFetchMock() {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({
      json: () => Promise.resolve([1]),
    })
    .mockResolvedValueOnce({
      json: () => Promise.resolve(mockStory),
    });
}

beforeEach(() => {
  setupFetchMock();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('shows loading state initially', () => {
  render(<App />);
  expect(screen.getByText('Cargando noticias...')).toBeInTheDocument();
});

test('renders stories after fetch resolves', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('Test HN Story')).toBeInTheDocument();
  });
  expect(screen.queryByText('Cargando noticias...')).not.toBeInTheDocument();
});
