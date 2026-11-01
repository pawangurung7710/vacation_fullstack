import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { authApi, ApiError } from '../../services/api';
import { toast } from 'sonner';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import logoImage from '../../../assets/trekkers-logo.png';

export function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	// Redirect if already logged in as admin
	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		const userStr = localStorage.getItem('user');
		if (token && userStr) {
			try {
				const user = JSON.parse(userStr);
				if (user.role === 'admin') {
					navigate('/cms/dashboard');
				} else {
					// Clear non-admin user data
					localStorage.removeItem('accessToken');
					localStorage.removeItem('refreshToken');
					localStorage.removeItem('user');
				}
			} catch (error) {
				// Invalid user data, clear it
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('user');
			}
		}
	}, [navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await authApi.login(email, password);

			// API request function extracts data.data, so response is { user, accessToken, refreshToken }
			const { user, accessToken, refreshToken } = response;

			// Check if user is admin
			if (user.role !== 'admin') {
				toast.error('Access denied. Only admin users can access the CMS.');
				return;
			}

			// Store tokens
			if (accessToken) {
				localStorage.setItem('accessToken', accessToken);
			}
			if (refreshToken) {
				localStorage.setItem('refreshToken', refreshToken);
			}

			// Store user info
			if (user) {
				localStorage.setItem('user', JSON.stringify(user));
			}

			toast.success('Login successful!');

			// Redirect to dashboard
			navigate('/cms/dashboard');
		} catch (error) {
			if (error instanceof ApiError) {
				toast.error(error.message || 'Login failed. Please check your credentials.');
			} else {
				toast.error('An unexpected error occurred. Please try again.');
			}
			console.error('Login error:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex bg-[#f5f5f7]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
			{/* Left Panel - Mac-style Gradient Background */}
			<div
				className="hidden lg:flex lg:w-[55%] relative"
				style={{
					background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
				}}
			>

				{/* Text Overlay */}
				<div className="absolute inset-0 flex items-center justify-center p-16 z-10">
					<div className="max-w-2xl text-white">
						<h2 className="text-5xl md:text-6xl font-semibold mb-6 leading-[1.1] tracking-tight" style={{
							textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
							fontWeight: 600
						}}>
							Effortlessly manage your trekkerssquad.example and  its operations.
						</h2>
						<p className="text-xl md:text-2xl font-normal text-white/95 leading-relaxed tracking-[-0.01em]" style={{
							textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
							fontWeight: 400
						}}>
							Log in to access your CMS dashboard and manage your website.
						</p>
					</div>
				</div>
			</div>

			{/* Right Panel - Login Form */}
			<div className="w-full lg:w-[45%] flex items-center justify-center bg-white p-8 sm:p-12 md:p-16">
				<div className="w-full max-w-md">
					{/* Logo */}
					<div className="flex justify-center mb-12">
						<img src={logoImage} alt="Trekkers Squad Logo" width={64} height={64} className="h-16 w-16" />
					</div>

					{/* Title and Subtitle */}
					<div className="mb-10 text-center lg:text-left">
						<h1 className="text-4xl font-semibold text-[#1d1d1f] mb-3 tracking-tight" style={{ fontWeight: 600 }}>
							Welcome to the Trekkers Squad CMS
						</h1>
						<p className="text-base text-[#6e6e73] leading-relaxed" style={{ fontWeight: 400 }}>
							Enter your email and password to login to your dashboard.
						</p>
					</div>

					{/* Login Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm font-medium text-[#1d1d1f]" style={{ fontWeight: 500 }}>
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="admin@trekkerssquad.example"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading}
								className="h-12 border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] rounded-lg bg-white text-[#1d1d1f] placeholder:text-[#86868b] transition-colors"
								style={{
									fontSize: '17px',
									fontWeight: 400,
									borderWidth: '1px'
								}}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password" className="text-sm font-medium text-[#1d1d1f]" style={{ fontWeight: 500 }}>
								Password
							</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={loading}
									className="h-12 border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] rounded-lg bg-white text-[#1d1d1f] placeholder:text-[#86868b] transition-colors pr-11"
									style={{
										fontSize: '17px',
										fontWeight: 400,
										borderWidth: '1px'
									}}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-[#86868b] hover:text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-0 rounded-md transition-colors"
									tabIndex={-1}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>
						</div>

						<div className="flex justify-end">
							<Link
								to="/cms/forgot-password"
								className="text-sm text-[#0071e3] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 rounded"
							>
								Forgot your password?
							</Link>
						</div>

						<Button
							type="submit"
							className="w-full h-11 bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)] text-white rounded-lg font-medium transition-colors"
							disabled={loading}
							style={{
								fontSize: '17px',
								fontWeight: 400,
								border: 'none'
							}}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								'Sign In'
							)}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}

