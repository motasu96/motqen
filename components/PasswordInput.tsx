"use client";

import { InputHTMLAttributes, useState } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  showLabel: string;
  hideLabel: string;
};

// A password <input> with a show/hide toggle. Typos, autocorrect, and stray
// whitespace in a masked field are invisible until it's too late — this lets
// people check exactly what they typed before submitting.
export default function PasswordInput({ showLabel, hideLabel, className, ...rest }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...rest}
        type={visible ? "text" : "password"}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={`${className ?? "input"} pe-16`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute inset-y-0 end-3 flex items-center text-xs font-bold text-gold-dark"
      >
        {visible ? hideLabel : showLabel}
      </button>
    </div>
  );
}
