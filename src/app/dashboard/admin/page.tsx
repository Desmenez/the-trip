"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { UsersTable } from "./users-table";
import { UserDialog } from "./user-dialog";
import { UserFilter } from "./_components/user-filter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { User } from "./types";
import { AccessDenied } from "@/components/page/access-denied";
import { Loading } from "@/components/page/loading";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const search = searchParams.get("search") || "";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) {
        params.set("search", search);
      }
      const queryString = params.toString();
      const url = queryString ? `/api/users?${queryString}` : "/api/users";
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleUserSaved = () => {
    setIsDialogOpen(false);
    fetchUsers();
  };

  // Show loading state while checking session
  if (status === "loading") {
    return <Loading />;
  }

  // Show unauthorized message if not ADMIN
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Staff</h1>
        <Button onClick={handleCreateUser}>
          <Plus className="mr-2 h-4 w-4" /> Create
        </Button>
      </div>

      {/* Filter & Search form */}
      <UserFilter />

      <UsersTable users={users} loading={loading} onEdit={handleEditUser} />

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser || undefined}
        onSaved={handleUserSaved}
      />
    </div>
  );
}
