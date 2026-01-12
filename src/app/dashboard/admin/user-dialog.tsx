"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ROLE_VALUES, ROLE_LABELS } from "@/lib/constants/role";
import { User } from "./types";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSaved: () => void;
}

export function UserDialog({ open, onOpenChange, user, onSaved }: UserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "STAFF",
    commissionPerHead: "0.00",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        role: user.role,
        commissionPerHead: user.commissionPerHead ? user.commissionPerHead.toString() : "0.00",
        isActive: user.isActive,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "STAFF",
        commissionPerHead: "0.00",
        isActive: true,
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = user ? `/api/users/${user.id}` : "/api/users";
      const method = user ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.text();
        toast.error(error);
        return;
      }

      toast.success(user ? "User updated" : "User created");
      onSaved();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  console.log({ user });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {user && (
            <div className="grid gap-2">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="firstName" required>
              First Name
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName" required>
              Last Name
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role" required>
              Role
            </Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_VALUES.map((role) => {
                  if (role === "SUPER_ADMIN" && user?.role !== "SUPER_ADMIN") {
                    return null;
                  }
                  return (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {formData.role === "SALES" && (
            <div className="grid gap-2">
              <Label htmlFor="commissionPerHead">Commission Per Head</Label>
              <Input
                id="commissionPerHead"
                type="number"
                step="0.01"
                value={formData.commissionPerHead}
                onChange={(e) => setFormData({ ...formData, commissionPerHead: e.target.value })}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
