import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken, setUser, logoutUser } from '../store/userSlice';
import type { RootState, AppDispatch } from '../store';
import type { LoginPayload, LoginResponse } from '../../../shared/src/types/auth';


export const useAuth = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  const { user, accessToken } = useSelector(
    (state: RootState) => state.user
  );
  // Refresh token only if accessToken is missing
  const initAuth = useQuery({
    queryKey: ['auth'],
    enabled: !accessToken, // ONLY run if no access token
    queryFn: async () => {
      try {
        const refreshRes = await axios.post('/auth/refresh', {}, { withCredentials: true });
        const token = refreshRes.data.accessToken;
        if (token) dispatch(setAccessToken(token));

        const profileRes = await axios.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.data?.user) dispatch(setUser(profileRes.data.user));
        return profileRes.data.user || null;
      } catch (error) {
        console.error(error);
        dispatch(setUser(null));
        dispatch(setAccessToken(null));
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // keep fresh for 5 minutes
  });

  const loading = initAuth.isLoading;

  // LOGIN
  const login = useMutation<LoginResponse, any, LoginPayload>({
    mutationFn: async ({ email, password }) => {
      const res = await axios.post<LoginResponse>(
        '/auth/login',
        { email, password },
        { withCredentials: true }
      );
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(setAccessToken(data.accessToken));
      dispatch(setUser(data.user));
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      console.error(error);
    }
  });



  // LOGOUT
  const logout = useMutation({
    mutationFn: () => axios.post('/auth/logout', {}, { withCredentials: true }),
    onSuccess: () => {
      dispatch(logoutUser());
      queryClient.clear(); // clear all cached queries
    },
  });

  return { user, accessToken, loading, initAuth, login, logout };
};
