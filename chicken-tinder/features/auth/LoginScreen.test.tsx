import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';
import { useAuth } from '../../providers/auth-provider';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

// Mock the hooks
jest.mock('../../providers/auth-provider');
jest.mock('@react-navigation/native');

describe('LoginScreen', () => {
  // Setup mock functions
  const mockSignIn = jest.fn();
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup useAuth mock
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      loading: false,
    });
    
    // Setup useNavigation mock
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });
  
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    // Check if important elements are rendered
    expect(getByText('Chicken Tinder')).toBeTruthy();
    expect(getByText('Find your next meal together')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Don\'t have an account? Register')).toBeTruthy();
  });
  
  it('shows validation error when fields are empty', () => {
    const { getByText } = render(<LoginScreen />);
    
    // Spy on Alert.alert
    jest.spyOn(Alert, 'alert');
    
    // Click login button without filling fields
    fireEvent.press(getByText('Login'));
    
    // Check if validation error is shown
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter both email and password');
    expect(mockSignIn).not.toHaveBeenCalled();
  });
  
  it('calls signIn with email and password when form is submitted', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    // Mock successful login
    mockSignIn.mockResolvedValueOnce({ error: null });
    
    // Fill in the form
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    // Submit the form
    fireEvent.press(getByText('Login'));
    
    // Check if signIn was called with correct params
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Wait for navigation to happen after successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Pairing');
    });
  });
  
  it('shows error alert when login fails', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    // Spy on Alert.alert
    jest.spyOn(Alert, 'alert');
    
    // Mock failed login
    mockSignIn.mockResolvedValueOnce({ 
      error: { message: 'Invalid credentials' } 
    });
    
    // Fill in the form
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrong-password');
    
    // Submit the form
    fireEvent.press(getByText('Login'));
    
    // Wait for error alert to be shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid credentials');
    });
    
    // Check that navigation didn't happen
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('navigates to Register screen when register link is pressed', () => {
    const { getByText } = render(<LoginScreen />);
    
    // Click on register link
    fireEvent.press(getByText('Don\'t have an account? Register'));
    
    // Check if navigation happened
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
  
  it('shows loading indicator when authentication is in progress', () => {
    // Mock loading state
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      loading: true,
    });
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Check if loading indicator is shown
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
