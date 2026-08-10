import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the CloudNova app', () => {
  render(<App />);
  expect(screen.getByAltText('CLOUDNOVA Premium Logo')).toBeInTheDocument();
});
