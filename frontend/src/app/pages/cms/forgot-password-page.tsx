import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { authApi, ApiError } from '../../services/api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import logoImage from '../../../assets/trekkers-logo.png';

export function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setSent(false);
		try {
			await authApi.forgotPassword(email);
			setSent(true);
			toast.success('If an account exists, a password reset email has been sent.');
		} catch (error) {
			if (error instanceof ApiError) {
				toast.error(error.message || 'Something went wrong. Please try again.');
			} else {
				toast.error('An unexpected error occurred. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

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
							Reset your password
						</h2>
						<p
							className="text-xl md:text-2xl font-normal text-white/95 leading-relaxed tracking-[-0.01em]"
							style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)', fontWeight: 400 }}
						>
							Enter your email and we’ll send you a link to set a new password.
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
							Forgot your password?
						</h1>
						<p className="text-base text-[#6e6e73] leading-relaxed" style={{ fontWeight: 400 }}>
							Enter the email address for your CMS account and we’ll send you a link to reset your
							password.
						</p>
					</div>

					{sent ? (
						<div className="space-y-6">
							<div className="rounded-lg bg-[#e8f5e9] border border-[#c8e6c9] p-4 text-[#1b5e20] text-sm">
								<p className="font-medium mb-1">Check your email</p>
								<p>
									If an account exists for <strong>{email}</strong>, we’ve sent a password reset link.
									Check your inbox and spam folder.
								</p>
							</div>
							<Link to="/cms" className="block">
								<Button
									type="button"
									variant="outline"
									className="w-full h-11 rounded-lg font-medium border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
									style={{ fontSize: '17px', fontWeight: 400 }}
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to sign in
								</Button>
							</Link>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-sm font-medium text-[#1d1d1f]"
									style={{ fontWeight: 500 }}
								>
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
									style={{ fontSize: '17px', fontWeight: 400, borderWidth: '1px' }}
								/>
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
										Sending...
									</>
								) : (
									<>
										<Mail className="mr-2 h-4 w-4" />
										Send reset link
									</>
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
					)}
				</div>
			</div>
		</div>
	);
}
