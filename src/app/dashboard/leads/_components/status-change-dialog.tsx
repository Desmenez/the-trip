"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  currentStatus: string;
  newStatus: string;
  warning?: string;
  requiresReason?: boolean;
  description?: string;
  isChanging?: boolean;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  onConfirm,
  currentStatus,
  newStatus,
  warning,
  requiresReason = false,
  description,
  isChanging = false,
}: StatusChangeDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) {
      return; // Don't allow if reason is required but empty
    }
    onConfirm(requiresReason ? reason.trim() : undefined);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เปลี่ยน Lead Status</DialogTitle>
          <DialogDescription>
            {description || `เปลี่ยน status จาก ${currentStatus} เป็น ${newStatus}`}
          </DialogDescription>
        </DialogHeader>

        {warning && (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        )}

        {requiresReason && (
          <div className="space-y-2">
            <Label htmlFor="reason">เหตุผล *</Label>
            <Textarea
              id="reason"
              placeholder="กรุณาระบุเหตุผลในการเปลี่ยน status..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isChanging}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isChanging || (requiresReason && !reason.trim())}
          >
            {isChanging ? "กำลังเปลี่ยน..." : "ยืนยัน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

