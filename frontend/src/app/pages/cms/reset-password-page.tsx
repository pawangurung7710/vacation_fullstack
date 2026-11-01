import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { authApi, ApiError } from '../../services/api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import logoImage from '../../../assets/trekkers-logo.png';

export function ResetPasswordPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const token = searchParams.get('token') || '';

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		if (!token) {
			toast.error('Invalid or missing reset link. Please request a new password reset.');
		}
	}, [token]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error('Passwords do not match.');
			return;
		}
		if (password.length < 6) {
			toast.error('Password must be at least 6 characters.');
			return;
		}
		setLoading(true);
		try {
			await authApi.resetPassword(token, password);
			setSuccess(true);
			toast.success('Password reset successfully. You can now sign in.');
			setTimeout(() => navigate('/cms'), 2000);
		} catch (error) {
			if (error instanceof ApiError) {
				toast.error(error.message || 'Reset failed. The link may have expired.');
			} else {
				toast.error('An unexpected error occurred. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
		return (
			<div
				className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4"
				style={{
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
				}}
			>
				<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
					<h1 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Invalid reset link</h1>
					<p className="text-[#6e6e73] mb-6">
						This link is invalid or has expired. Please request a new password reset from the sign-in
						page.
					</p>
					<Link to="/cms/forgot-password">
						<Button className="bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)] text-white">
							Request new link
						</Button>
					</Link>
					<div className="mt-4">
						<Link to="/cms" className="text-sm text-[#0071e3] hover:underline">
							Back to sign in
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (success) {
		return (
			<div
				className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4"
				style={{
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
				}}
			>
				<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
					<div className="w-14 h-14 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-4">
						<Lock className="h-7 w-7 text-[#2e7d32]" />
					</div>
					<h1 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Password reset successfully</h1>
					<p className="text-[#6e6e73] mb-6">Redirecting you to sign in...</p>
					<Link to="/cms">
						<Button variant="outline">Go to sign in now</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div
			className="min-h-screen flex bg-[#f5f5f7]"
			style={{
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
			}}
		>
			{/* Left Panel */}
			<div
				className="hidden lg:flex lg:w-[55%] relative"
				style={{
					background:
						'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
				}}
			>
				<div className="absolute inset-0 flex items-center justify-center p-16 z-10">
					<div className="max-w-2xl text-white">
						<h2
							className="text-5xl md:text-6xl font-semibold mb-6 leading-[1.1] tracking-tight"
							style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)', fontWeight: 600 }}
						>
							Set a new password
						</h2>
						<p
							className="text-xl md:text-2xl font-normal text-white/95 leading-relaxed tracking-[-0.01em]"
							style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)', fontWeight: 400 }}
						>
							Choose a strong password that you don’t use elsewhere. It must be at least 6 characters.
						</p>
					</div>
				</div>
			</div>

			{/* Right Panel - Form */}
			<div className="w-full lg:w-[45%] flex items-center justify-center bg-white p-8 sm:p-12 md:p-16">
				<div className="w-full max-w-md">
					<div className="flex justify-center mb-12">
						<img src={logoImage} alt="Trekkers Squad Logo" width={64} height={64} className="h-16 w-16" />
					</div>

					<div className="mb-10 text-center lg:text-left">
						<h1
							className="text-4xl font-semibold text-[#1d1d1f] mb-3 tracking-tight"
							style={{ fontWeight: 600 }}
						>
							Reset password
						</h1>
						<p className="text-base text-[#6e6e73] leading-relaxed" style={{ fontWeight: 400 }}>
							Enter your new password below. It must be at least 6 characters.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-sm font-medium text-[#1d1d1f]"
								style={{ fontWeight: 500 }}
							>
								New password
							</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter new password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={6}
									disabled={loading}
									className="h-12 border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] rounded-lg bg-white text-[#1d1d1f] placeholder:text-[#86868b] transition-colors pr-11"
									style={{ fontSize: '17px', fontWeight: 400, borderWidth: '1px' }}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-[#86868b] hover:text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-0 rounded-md transition-colors"
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>
							<p className="text-xs text-[#86868b]">At least 6 characters</p>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="confirmPassword"
								className="text-sm font-medium text-[#1d1d1f]"
								style={{ fontWeight: 500 }}
							>
								Confirm new password
							</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="Confirm new password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									minLength={6}
									disabled={loading}
									className="h-12 border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] rounded-lg bg-white text-[#1d1d1f] placeholder:text-[#86868b] transition-colors pr-11"
									style={{ fontSize: '17px', fontWeight: 400, borderWidth: '1px' }}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((prev) => !prev)}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-[#86868b] hover:text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-0 rounded-md transition-colors"
									aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
								>
									{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full h-11 bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)] text-white rounded-lg font-medium transition-colors"
							disabled={loading}
							style={{ fontSize: '17px', fontWeight: 400, border: 'none' }}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Resetting...
								</>
							) : (
								'Reset password'
							)}
						</Button>

						<div className="text-center">
							<Link
								to="/cms"
								className="text-sm text-[#0071e3] hover:underline inline-flex items-center gap-1"
							>
								<ArrowLeft size={14} />
								Back to sign in
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
