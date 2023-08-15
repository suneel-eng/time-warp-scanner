import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('Title is rendered', () => {
  render(<App />);
  const linkElement = screen.getByText("TIME WARP SCANNER");
  expect(linkElement).toBeInTheDocument();
});
