import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { complaintService } from "@/services/complaintService";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

const CATEGORIES = [
  "Roads & Infrastructure",
  "Water Supply",
  "Electricity",
  "Sanitation",
  "Public Safety",
  "Other"
];

const PRIORITIES = [
  { value: "LOW", label: "Low Priority" },
  { value: "MEDIUM", label: "Medium Priority" },
  { value: "HIGH", label: "High Priority" }
];

export const EditComplaintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await complaintService.getComplaint(id);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setPriority(data.priority);
        setStatus(data.status);
      } catch (err) {
        setSubmitError(err.response?.data?.message || "Failed to load complaint data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required.";
    } else if (title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters.";
    } else if (title.trim().length > 100) {
      newErrors.title = "Title must not exceed 100 characters.";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required.";
    } else if (description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters.";
    } else if (description.trim().length > 5000) {
      newErrors.description = "Description must not exceed 5000 characters.";
    }

    if (!category) {
      newErrors.category = "Category selection is required.";
    }

    if (!priority) {
      newErrors.priority = "Priority selection is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSuccess(false);

    if (status !== "SUBMITTED") {
      setSubmitError("Editing is disabled. This complaint is no longer in SUBMITTED status.");
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      await complaintService.updateComplaint(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/citizen/complaints/${id}`);
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update complaint. Please try again.";
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        setSubmitError("Validation failed. Please correct the fields below.");
      } else {
        setSubmitError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-sm text-neutral-500 font-medium">Loading complaint details...</span>
      </div>
    );
  }

  const isEditable = status === "SUBMITTED";

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/citizen/complaints/${id}`)}
        className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-primary transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Details
      </button>

      <Card className="border border-neutral-200 shadow-md bg-white rounded-lg">
        <CardHeader className="space-y-1 pb-6 border-b border-neutral-100">
          <CardTitle className="text-2xl font-bold tracking-tight font-heading text-neutral-900">
            Edit Grievance Application
          </CardTitle>
          <CardDescription className="text-sm text-neutral-500">
            Modify details of your complaint. Editing is only permitted while status is SUBMITTED.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Success Banner */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-md text-success text-sm font-medium animate-fadeIn">
              <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Complaint Updated Successfully!</p>
                <p className="text-xs mt-0.5 opacity-90">Redirecting to details page...</p>
              </div>
            </div>
          )}

          {/* Locked Status Banner */}
          {!isEditable && (
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-md text-warning-foreground text-sm font-medium">
              <AlertCircle className="size-5 shrink-0 mt-0.5 text-warning" />
              <div>
                <p className="font-semibold">Editing Disabled</p>
                <p className="text-xs mt-0.5 opacity-90">
                  This complaint cannot be modified because its current status is <strong className="uppercase">{status}</strong>. Only complaints in SUBMITTED status can be edited.
                </p>
              </div>
            </div>
          )}

          {/* General Error Banner */}
          {submitError && (
            <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-md text-error text-sm font-medium">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Title Field */}
            <div className="space-y-1.5">
              <Label htmlFor="title" required>
                Complaint Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                }}
                placeholder="Brief summary of the issue"
                error={!!errors.title}
                disabled={submitting || success || !isEditable}
              />
              {errors.title && (
                <p className="text-xs text-error font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Field */}
              <div className="space-y-1.5">
                <Label htmlFor="category" required>
                  Category
                </Label>
                <div className="relative">
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: null }));
                    }}
                    disabled={submitting || success || !isEditable}
                    error={!!errors.category}
                  >
                    <option value="" disabled>Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>
                {errors.category && (
                  <p className="text-xs text-error font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" /> {errors.category}
                  </p>
                )}
              </div>

              {/* Priority Field */}
              <div className="space-y-1.5">
                <Label htmlFor="priority" required>
                  Priority Level
                </Label>
                <div className="relative">
                  <Select
                    id="priority"
                    value={priority}
                    onChange={(e) => {
                      setPriority(e.target.value);
                      if (errors.priority) setErrors((prev) => ({ ...prev, priority: null }));
                    }}
                    disabled={submitting || success || !isEditable}
                    error={!!errors.priority}
                  >
                    <option value="" disabled>Select priority level</option>
                    {PRIORITIES.map((prio) => (
                      <option key={prio.value} value={prio.value}>
                        {prio.label}
                      </option>
                    ))}
                  </Select>
                </div>
                {errors.priority && (
                  <p className="text-xs text-error font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" /> {errors.priority}
                  </p>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <Label htmlFor="description" required>
                Detailed Description
              </Label>
              <Textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                }}
                placeholder="Provide a detailed description of the issue (minimum 20 characters)."
                disabled={submitting || success || !isEditable}
                error={!!errors.description}
              />
              <div className="flex justify-between text-xs text-neutral-500 font-medium">
                <span>Min 20 characters</span>
                <span className={description.length < 20 ? "text-error" : "text-success"}>
                  {description.length} / 5000 chars
                </span>
              </div>
              {errors.description && (
                <p className="text-xs text-error font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.description}
                </p>
              )}
            </div>

            {/* Actions Buttons */}
            <div className="pt-4 flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/citizen/complaints/${id}`)}
                disabled={submitting || success}
              >
                {isEditable ? "Cancel" : "Back"}
              </Button>
              {isEditable && (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || success}
                  className="min-w-32"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditComplaintPage;
