import { render, screen } from '@testing-library/react';
import NewsCard from '../NewsCard';

const baseProps = {
  title: 'Test Story',
  url: 'https://example.com',
  points: 42,
  author: 'testuser',
};

test('renders title as link text', () => {
  render(<NewsCard {...baseProps} />);
  expect(screen.getByRole('link', { name: 'Test Story' })).toBeInTheDocument();
});

test('link href matches url prop', () => {
  render(<NewsCard {...baseProps} />);
  expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com');
});

test('renders points and author', () => {
  render(<NewsCard {...baseProps} />);
  expect(screen.getByText(/42 puntos/)).toBeInTheDocument();
  expect(screen.getByText(/testuser/)).toBeInTheDocument();
});

test('handles missing url without crashing', () => {
  render(<NewsCard title="Ask HN: Test" points={10} author="someone" />);
  expect(screen.getByText('Ask HN: Test')).toBeInTheDocument();
});
