import React from 'react';
import { Button } from './Button';
import Dialog from './Dialog';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, description }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-[color:var(--ft-muted)]">{description}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmationDialog;