import { ForwardedRef, forwardRef, useImperativeHandle, useRef, useState } from "react";

type AddCardFormProps = {
  onAdd: (title: string) => void;
};

type AddCardFormHandle = {
  focus: () => void;
};

const AddCardForm = forwardRef(function AddCardForm(
  { onAdd }: AddCardFormProps,
  ref: ForwardedRef<AddCardFormHandle>
) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus()
  }));

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle("");
  };

  return (
    <div className="mb-3">
      <input
        ref={inputRef}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
          }
        }}
        placeholder="Add card and press Enter"
        className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text placeholder:text-muted focus:border-blue/80 focus:outline-none"
      />
    </div>
  );
});

export type { AddCardFormHandle };
export default AddCardForm;
