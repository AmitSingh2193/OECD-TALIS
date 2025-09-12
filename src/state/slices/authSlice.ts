import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get_req } from '../../network/network';

interface User {
  id: number;  // Changed from string to number to match API response
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string;
  credentials: { email: string; password: string } | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: '',
  credentials: null
};

// Define the expected user data type
interface UserData {
  id: number;
  name: string;
  email: string;
  [key: string]: any; // For any additional fields
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Login attempt with:', credentials);
      // Replace '/users/1' with your actual login endpoint
      const response = await get_req<UserData>('/users/1');
      return { ...response.data, credentials };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = '';
      state.credentials = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.credentials = action.payload.credentials;
        state.loading = false;
        state.error = '';
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
