"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TaskFormValues, useCreateTask } from "../hooks/use-tasks";
import { TaskForm } from "../_components/task-form";
import { toast } from "sonner";

export default function CreateTaskPage() {
  const router = useRouter();
  const createTaskMutation = useCreateTask();

  async function handleSubmit(values: TaskFormValues) {
    try {
      await createTaskMutation.mutateAsync(values);
      router.push("/dashboard/tasks");
      router.refresh();
    } catch {
      toast.error("Failed to create task");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Task</h2>
      </div>

      <div className="bg-card rounded-md border p-6">
        <TaskForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={createTaskMutation.isPending}
        />
      </div>
    </div>
  );
}
