"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useUpdateTask, useTask } from "../../hooks/use-tasks";
import type { TaskFormValues } from "../../hooks/use-tasks";
import { TaskForm } from "../../_components/task-form";
import { toast } from "sonner";
import { Loading } from "@/components/page/loading";

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: taskId } = use(params);
  const updateTaskMutation = useUpdateTask();

  const { data: task, isLoading, error } = useTask(taskId);

  async function handleSubmit(values: TaskFormValues) {
    try {
      await updateTaskMutation.mutateAsync({ id: taskId, ...values });
      router.push("/dashboard/tasks");
      router.refresh();
    } catch {
      toast.error("Failed to update task");
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error || !task) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load task. Please try again.</p>
        </div>
      </div>
    );
  }

  const initialData: Partial<TaskFormValues> = {
    topic: task.topic,
    description: task.description || "",
    deadline: task.deadline ? new Date(task.deadline) : undefined,
    status: task.status,
    contact: task.contact ?? undefined,
    relatedCustomerId: task.relatedCustomerId ?? undefined,
    userId: task.userId ?? undefined,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Task</h2>
      </div>

      <div className="bg-card rounded-md border p-6">
        <TaskForm
          mode="edit"
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={updateTaskMutation.isPending}
        />
      </div>
    </div>
  );
}
