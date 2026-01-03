import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../../shared/src/types/auth';

interface UserState {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  loading: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => { state.user = action.payload; },
    setAccessToken: (state, action: PayloadAction<string | null>) => { state.accessToken = action.payload; },
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
    logoutUser: (state) => { state.user = null; state.accessToken = null; },
  },
});

export const { setUser, setAccessToken, setLoading, logoutUser } = userSlice.actions;
export default userSlice.reducer;
