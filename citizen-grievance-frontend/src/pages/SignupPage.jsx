import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/authService";

/**
 * SignupPage component.
 * Features grid/flex centering on desktop viewports and full-screen layout on mobile.
 * Implements WCAG accessibility guidelines, client-side validation, password strength bars, and mock redirects.
 */
export const SignupPage = () => {
  const navigate = useNavigate();

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field Errors State
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");

  // Global flow states
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Password Strength Evaluator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "bg-neutral-200" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) {
      return { score, label: "Weak", color: "bg-error", textColor: "text-error" };
    }
    if (score <= 4) {
      return { score, label: "Medium", color: "bg-warning", textColor: "text-warning" };
    }
    return { score, label: "Strong", color: "bg-success", textColor: "text-success" };
  };

  const strength = getPasswordStrength(password);

  // Validators
  const validateName = (val) => {
    if (!val.trim()) {
      setNameError("Full name is required.");
      return false;
    }
    if (val.trim().length < 2) {
      setNameError("Name must be at least 2 characters.");
      return false;
    }
    setNameError("");
    return true;
  };

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

  const validateConfirmPassword = (val, originalPass) => {
    if (!val) {
      setConfirmPasswordError("Please confirm your password.");
      return false;
    }
    if (val !== originalPass) {
      setConfirmPasswordError("Passwords do not match.");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const validateTerms = (checked) => {
    if (!checked) {
      setTermsError("You must accept the Terms and Privacy Policy.");
      return false;
    }
    setTermsError("");
    return true;
  };

  // Field change handlers
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    validateName(val);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    validateEmail(val);
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    validatePassword(val);
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword, val);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    validateConfirmPassword(val, password);
  };

  const handleTermsChange = (e) => {
    const checked = e.target.checked;
    setAgreeTerms(checked);
    validateTerms(checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword, password);
    const isTermsValid = validateTerms(agreeTerms);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid || !isTermsValid) {
      return;
    }

    setSubmitting(true);
    setGlobalError("");
    try {
      await authService.signup({ name, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || "An error occurred during registration. Please try again.";
      setGlobalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormInvalid =
    !name.trim() ||
    !email.trim() ||
    !password ||
    !confirmPassword ||
    !agreeTerms ||
    !!nameError ||
    !!emailError ||
    !!passwordError ||
    !!confirmPasswordError ||
    !!termsError;

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
                Create Account
              </CardTitle>
              <CardDescription className="text-sm text-neutral-500">
                Register to log public concerns and collaborate with resolving officers
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8 sm:px-8 space-y-6">
            {/* Success Banner */}
            {success && (
              <div
                className="flex items-start gap-3 p-3.5 bg-success/10 border border-success/20 rounded-md text-success text-sm font-medium"
                role="alert"
                aria-live="assertive"
              >
                <CheckCircle2 className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Account created successfully!</p>
                  <p className="text-xs text-success/80 mt-0.5">Redirecting to sign-in page in a moment...</p>
                </div>
              </div>
            )}

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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-medium text-neutral-800 text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => validateName(name)}
                  placeholder="Rahul Sharma"
                  error={!!nameError}
                  autoComplete="name"
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? "name-error" : undefined}
                  disabled={submitting || success}
                  className="w-full"
                />
                {nameError && (
                  <p id="name-error" className="text-xs text-error font-medium flex items-center gap-1.5 mt-1" role="alert">
                    {nameError}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-medium text-neutral-800 text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  placeholder="name@gov.in"
                  error={!!emailError}
                  autoComplete="email"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                  disabled={submitting || success}
                  className="w-full"
                />
                {emailError && (
                  <p id="email-error" className="text-xs text-error font-medium flex items-center gap-1.5 mt-1" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-medium text-neutral-800 text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => validatePassword(password)}
                    placeholder="••••••••"
                    error={!!passwordError}
                    autoComplete="new-password"
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : "password-helper"}
                    disabled={submitting || success}
                    className="pr-10 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={submitting || success}
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

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-neutral-500">Password Strength:</span>
                      <span className={strength.textColor}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full rounded-full transition-all flex-1 ${strength.score >= 1 ? strength.color : "bg-neutral-200"}`} />
                      <div className={`h-full rounded-full transition-all flex-1 ${strength.score >= 3 ? strength.color : "bg-neutral-200"}`} />
                      <div className={`h-full rounded-full transition-all flex-1 ${strength.score >= 5 ? strength.color : "bg-neutral-200"}`} />
                    </div>
                  </div>
                )}

                {/* Password Helper Text */}
                <p id="password-helper" className="text-xs text-neutral-500 leading-normal pt-0.5">
                  Must contain at least 6 characters, including letters, numbers, and symbols.
                </p>

                {passwordError && (
                  <p id="password-error" className="text-xs text-error font-medium flex items-center gap-1.5 mt-1" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="font-medium text-neutral-800 text-sm">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onBlur={() => validateConfirmPassword(confirmPassword, password)}
                    placeholder="••••••••"
                    error={!!confirmPasswordError}
                    autoComplete="new-password"
                    aria-invalid={!!confirmPasswordError}
                    aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
                    disabled={submitting || success}
                    className="pr-10 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={submitting || success}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-primary rounded mr-1"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p id="confirm-password-error" className="text-xs text-error font-medium flex items-center gap-1.5 mt-1" role="alert">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-start space-x-2">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={handleTermsChange}
                    disabled={submitting || success}
                    className="size-4 rounded border-neutral-300 text-primary focus:ring-primary focus:ring-offset-2 transition-all mt-0.5 cursor-pointer"
                  />
                  <label
                    htmlFor="agree-terms"
                    className="text-xs font-semibold text-neutral-600 leading-normal select-none cursor-pointer"
                  >
                    I acknowledge and agree to the Terms of Service and Privacy Policy.
                  </label>
                </div>
                {termsError && (
                  <p id="terms-error" className="text-xs text-error font-medium flex items-center gap-1.5" role="alert">
                    {termsError}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-base font-semibold animate-transition"
                  disabled={submitting || success || isFormInvalid}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin mr-2" aria-hidden="true" />
                      Creating Account...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </div>
            </form>

            {/* Back to Login Redirect */}
            <div className="relative flex py-2 items-center text-neutral-300">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-4 text-xs text-neutral-400 font-medium">
                Already registered?
              </span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <div className="text-center text-sm">
              <span className="text-neutral-500 mr-1.5">Have an official account?</span>
              <Link
                to="/login"
                className="text-primary font-bold hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded p-0.5"
              >
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
export default SignupPage;
