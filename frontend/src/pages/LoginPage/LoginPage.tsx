import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { apiClient } from '../../lib/apiClient';
import Button from '../../components/atoms/Button/Button';
import styles from './LoginPage.module.css';

const schema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const body = new URLSearchParams({ username: data.email, password: data.password });
      const tokenRes = await apiClient.post('auth/login', { body }).json<TokenResponse>();
      const userRes = await apiClient
        .get('auth/me', { headers: { Authorization: `Bearer ${tokenRes.access_token}` } })
        .json<UserResponse>();
      setAuth(tokenRes.access_token, userRes);
      navigate('/dashboard');
    } catch {
      setError('root', { message: 'Invalid email or password' });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>LIMS</h1>
        <p className={styles.subtitle}>Sign in to continue</p>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <label className={styles.label}>
            Email
            <input
              type="email"
              className={styles.input}
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </label>
          <label className={styles.label}>
            Password
            <input
              type="password"
              className={styles.input}
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </label>
          {errors.root && <p className={styles.error}>{errors.root.message}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
