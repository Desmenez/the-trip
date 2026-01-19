"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ROLE_VALUES, ROLE_LABELS } from "@/lib/constants/role";
import { User } from "../types";
import { userFormSchema, UserFormValues } from "../hooks/use-users";
import { useCreateUser, useUpdateUser } from "../hooks/use-users-query";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSaved: () => void;
}

export function UserDialog({ open, onOpenChange, user, onSaved }: UserDialogProps) {
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "STAFF",
      commissionPerHead: "",
      isActive: true,
    },
  });

  const role = useWatch({ control: form.control, name: "role" });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        role: user.role,
        commissionPerHead: user.commissionPerHead ? user.commissionPerHead.toString() : "",
        isActive: user.isActive,
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: undefined,
        commissionPerHead: "",
        isActive: true,
      });
    }
  }, [user, open, form]);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (user) {
        await updateUserMutation.mutateAsync(
          { id: user.id, data: values },
          {
            onError: (error: Error & { field?: string }) => {
              // Map API errors to form fields
              if (error.field === "email") {
                form.setError("email", {
                  type: "server",
                  message: error.message,
                });
              } else if (error.field === "phoneNumber") {
                form.setError("phoneNumber", {
                  type: "server",
                  message: error.message,
                });
              }
            },
          }
        );
      } else {
        await createUserMutation.mutateAsync(values, {
          onError: (error: Error & { field?: string }) => {
            // Map API errors to form fields
            if (error.field === "email") {
              form.setError("email", {
                type: "server",
                message: error.message,
              });
            } else if (error.field === "phoneNumber") {
              form.setError("phoneNumber", {
                type: "server",
                message: error.message,
              });
            }
          },
        });
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in onError callbacks
      // This catch is for any unexpected errors
      if (!(error instanceof Error && (error as Error & { field?: string }).field)) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Staff</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {user && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_VALUES.map((role) => {
                        return (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {role === "SALES" && (
              <FormField
                control={form.control}
                name="commissionPerHead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Per Head (Baht)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || createUserMutation.isPending || updateUserMutation.isPending}
              >
                {(form.formState.isSubmitting || createUserMutation.isPending || updateUserMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
