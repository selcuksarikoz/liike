import { forwardRef, type InputHTMLAttributes } from 'react';

export type FileInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  hidden?: boolean;
};

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ hidden = true, className = '', ...props }, ref) => {
    const classes = [className, hidden ? 'hidden' : '']
      .filter(Boolean)
      .join(' ')
      .trim();

    return (
      <input
        ref={ref}
        type="file"
        className={classes || undefined}
        {...props}
      />
    );
  }
);

FileInput.displayName = 'FileInput';
