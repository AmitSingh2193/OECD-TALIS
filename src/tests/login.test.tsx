import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
 import { Provider } from 'react-redux';
 import { BrowserRouter } from 'react-router-dom';
 import { store } from '../state/store';
import Login from '../pages/login';

describe('Login Component', () => {
  it('should validate email correctly', () => {
    const {  } = render(
       <Provider store={store}>
         <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Login');

    // Test invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(loginButton);
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();

    // Test valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(loginButton);
    expect(screen.queryByText(/Please enter a valid email address/i)).not.toBeInTheDocument();
  });
  test('shows error for short password', async () => {
    render(
      <Provider store={store}>
         <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '123' } });
    fireEvent.click(screen.getByText('Login'));

    expect(await screen.findByText('Password must be at least 6 characters long')).toBeInTheDocument();
  });
});
