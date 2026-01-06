import { Button } from "./ui/Button";
import { AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reminder } from "../types/reminder";

interface DeleteReminderDialogProps {
  isOpen: boolean;
  reminder: Reminder | null;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteReminderDialog({
  isOpen,
  reminder,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteReminderDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4"
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="absolute top-4 right-4 hover:bg-gray-200/50"
            >
              <X className="w-5 h-5 text-gray-400" />
            </Button>

            {/* Content */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Reminder?
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to delete "{reminder?.title}"? This action
                  cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

