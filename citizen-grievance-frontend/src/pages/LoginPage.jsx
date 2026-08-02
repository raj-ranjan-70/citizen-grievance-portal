import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

/**
 * LoginPage component.
 * Features clean grid/flex centering on desktop and full-screen layouts on mobile viewports.
 * Complies with WCAG guidelines for contrast, keyboard focus, and screen-readers.
 */
export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Field states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Submission states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError, setGlobalError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("expired") === "true"
      ? "Your session has expired. Please sign in again."
      : "";
  });
  const [submitting, setSubmitting] = useState(false);

  // Email format validation helper
  const validateEmail = (val) => {
    if (!val.trim()) {
      setEmailError("Email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Password validation helper
  const validatePassword = (val) => {
    if (!val) {
      setPasswordError("Password is required.");
      return false;
    }
    if (val.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    validateEmail(val);
    setGlobalError("");
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    validatePassword(val);
    setGlobalError("");
  };

  const handleBlurEmail = () => {
    validateEmail(email);
  };

  const handleBlurPassword = () => {
    validatePassword(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setSubmitting(true);
    try {
      // Calls AuthContext login
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Invalid email or password.";
      setGlobalError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormInvalid =
    !email.trim() ||
    !password ||
    !!emailError ||
    !!passwordError;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-0 sm:p-6">
      <Container size="sm" className="w-full sm:max-w-md">
        <Card className="border-0 sm:border border-neutral-200 shadow-none sm:shadow-md bg-white rounded-none sm:rounded-lg min-h-screen sm:min-h-0 flex flex-col justify-center">
          <CardHeader className="space-y-4 pt-8 px-6 sm:px-8">
            {/* Brand Logo & Title */}
            <div className="flex flex-col items-center text-center space-y-2">
              <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Landmark className="size-8 text-primary" aria-hidden="true" />
                <span className="font-heading text-xl font-bold tracking-tight text-neutral-900">
                  Citizen Grievance Portal
                </span>
              </Link>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Official Government Access
              </span>
            </div>

            <div className="text-center space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight font-heading text-neutral-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-sm text-neutral-500">
                Sign in to manage your public concerns and tracking requests
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8 sm:px-8 space-y-6">
            {/* Global Error Banner */}
            {globalError && (
              <div
                className="flex items-start gap-3 p-3.5 bg-error/10 border border-error/20 rounded-md text-error text-sm font-medium"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{globalError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-medium text-neutral-800 text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleBlurEmail}
                  placeholder="name@gov.in"
                  error={!!emailError}
                  autoComplete="email"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                  disabled={submitting}
                  className="w-full"
                />
                {emailError && (
                  <p
                    id="email-error"
                    className="text-xs text-error font-medium flex items-center gap-1.5 mt-1"
                    role="alert"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-medium text-neutral-800 text-sm">
                    Password
                  </Label>
                  {/* Forgot Password Placeholder Link */}
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs text-primary font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded"
                  >
                    Forgot Password?
                  </a>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handleBlurPassword}
                    placeholder="••••••••"
                    error={!!passwordError}
                    autoComplete="current-password"
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                    disabled={submitting}
                    className="pr-10 w-full"
                  />
                  {/* Show/Hide password toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={submitting}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-primary rounded mr-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {passwordError && (
                  <p
                    id="password-error"
                    className="text-xs text-error font-medium flex items-center gap-1.5 mt-1"
                    role="alert"
                  >
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={submitting}
                  className="size-4 rounded border-neutral-300 text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="text-xs font-semibold text-neutral-600 select-none cursor-pointer"
                >
                  Remember my credentials
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-base font-semibold"
                  disabled={submitting || isFormInvalid}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin mr-2" aria-hidden="true" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>

            {/* Footer / Sign Up Navigation Link */}
            <div className="relative flex py-2 items-center text-neutral-300">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-4 text-xs text-neutral-400 font-medium">
                New to the portal?
              </span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <div className="text-center text-sm">
              <span className="text-neutral-500 mr-1.5">Create an account to report issues.</span>
              <Link
                to="/signup"
                className="text-primary font-bold hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded p-0.5"
              >
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
export default LoginPage;
